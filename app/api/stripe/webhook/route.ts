import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookHash, verifyTransaction } from "@/lib/flutterwave";

const ROLE_MAP: Record<string, string> = {
  pro: "premium_user",
  enterprise: "enterprise_user",
};

function nextPeriodEnd(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

export async function POST(req: Request) {
  // Validate Flutterwave webhook hash
  const hash = req.headers.get("verif-hash");
  if (!validateWebhookHash(hash)) {
    return NextResponse.json({ error: "Invalid webhook hash" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event: string = body.event;
  const data = body.data;

  try {
    // ── Successful charge (initial payment or recurring renewal) ──────────
    if (event === "charge.completed" && data?.status === "successful") {
      const txId: string = String(data.id);
      const meta = data.meta as Record<string, string> | undefined;

      let userId: string | undefined = meta?.userId;
      let planName: string = meta?.planName || "pro";

      // For recurring charges, meta may be absent — look up by email
      if (!userId && data.customer?.email) {
        const user = await prisma.user.findUnique({
          where: { email: data.customer.email },
        });
        if (user) {
          userId = user.id;
          // Infer plan from stored subscription
          const sub = await prisma.subscription.findUnique({
            where: { userId: user.id },
          });
          planName = sub?.stripePriceId || "pro";
        }
      }

      if (!userId) {
        console.error("Webhook: cannot resolve userId", data);
        return NextResponse.json({ received: true });
      }

      const role = ROLE_MAP[planName] || "premium_user";

      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: txId,
          stripePriceId: planName,
          stripeCurrentPeriodEnd: nextPeriodEnd(),
          status: "active",
        },
        update: {
          stripeSubscriptionId: txId,
          stripePriceId: planName,
          stripeCurrentPeriodEnd: nextPeriodEnd(),
          status: "active",
        },
      });
    }

    // ── Subscription cancelled → downgrade to free ─────────────────────────
    if (event === "subscription.cancelled") {
      const email: string | undefined = data?.customer?.email;
      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "free_user" },
          });
          await prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: "canceled" },
          });
        }
      }
    }
  } catch (err: any) {
    console.error("Webhook handler error:", err.message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
