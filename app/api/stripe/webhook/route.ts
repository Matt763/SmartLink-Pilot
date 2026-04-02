/**
 * Pesapal IPN (Instant Payment Notification) handler.
 * Pesapal POSTs here when a transaction status changes.
 * Params: OrderNotificationType, OrderTrackingId, OrderMerchantReference
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken, getTransactionStatus } from "@/lib/pesapal";

const ROLE_MAP: Record<string, string> = {
  pro: "premium_user",
  enterprise: "enterprise_user",
};

function nextPeriodEnd(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

async function resolveOrder(
  merchantRef: string
): Promise<{ userId: string; planName: string } | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: `order_${merchantRef}` },
  });
  if (!setting) return null;
  const [userId, planName] = setting.value.split("|");
  if (!userId || !planName) return null;
  return { userId, planName };
}

export async function POST(req: Request) {
  let body: Record<string, string> = {};
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      new URLSearchParams(text).forEach((v, k) => { body[k] = v; });
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const trackingId: string =
    body.OrderTrackingId || body.orderTrackingId || "";
  const merchantRef: string =
    body.OrderMerchantReference || body.orderMerchantReference || "";

  if (!trackingId) {
    return NextResponse.json({ received: true });
  }

  try {
    const token = await getToken();
    const status = await getTransactionStatus(token, trackingId);

    if (status.status_code !== 1 && status.payment_status_description !== "Completed") {
      return NextResponse.json({ received: true });
    }

    // Try DB lookup first (initial payment)
    const order = await resolveOrder(merchantRef);

    if (order) {
      const { userId, planName } = order;
      const role = ROLE_MAP[planName] || "premium_user";

      await prisma.user.update({ where: { id: userId }, data: { role } });
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: trackingId,
          stripePriceId: planName,
          stripeCurrentPeriodEnd: nextPeriodEnd(),
          status: "active",
        },
        update: {
          stripeSubscriptionId: trackingId,
          stripePriceId: planName,
          stripeCurrentPeriodEnd: nextPeriodEnd(),
          status: "active",
        },
      });

      // Clean up temporary order record
      await prisma.siteSetting.deleteMany({ where: { key: `order_${merchantRef}` } });
    } else {
      // Recurring renewal: no order in DB, look up user by existing subscription record
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: { not: null } },
        orderBy: { updatedAt: "desc" },
      });

      if (sub) {
        const planName = sub.stripePriceId || "pro";
        const role = ROLE_MAP[planName] || "premium_user";

        await prisma.user.update({ where: { id: sub.userId }, data: { role } });
        await prisma.subscription.update({
          where: { userId: sub.userId },
          data: {
            stripeSubscriptionId: trackingId,
            stripeCurrentPeriodEnd: nextPeriodEnd(),
            status: "active",
          },
        });
      }
    }
  } catch (err: any) {
    console.error("IPN handler error:", err.message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
