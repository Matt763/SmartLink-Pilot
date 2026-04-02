/**
 * Pesapal IPN (Instant Payment Notification) endpoint.
 * Pesapal calls this server-to-server whenever a payment status changes.
 * Must always return HTTP 200 — Pesapal retries on any non-200.
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

// Pesapal sends a POST with JSON body when payment status changes
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { OrderTrackingId, OrderMerchantReference } = body;

    if (!OrderTrackingId) {
      // Always 200 to Pesapal — log the issue but don't error
      console.warn("[Pesapal IPN] No OrderTrackingId in payload:", body);
      return NextResponse.json({ status: 200 });
    }

    const token = await getToken();
    const status = await getTransactionStatus(token, OrderTrackingId);

    if (
      status.payment_status_description === "Completed" ||
      status.status_code === 1
    ) {
      const setting = await prisma.siteSetting.findUnique({
        where: { key: `order_${OrderMerchantReference}` },
      });

      if (setting) {
        const [userId, planName] = setting.value.split("|");
        const role = ROLE_MAP[planName] || "premium_user";

        await prisma.user.update({ where: { id: userId }, data: { role } });
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeSubscriptionId: OrderTrackingId,
            stripePriceId: planName,
            stripeCurrentPeriodEnd: nextPeriodEnd(),
            status: "active",
          },
          update: {
            stripeSubscriptionId: OrderTrackingId,
            stripePriceId: planName,
            stripeCurrentPeriodEnd: nextPeriodEnd(),
            status: "active",
          },
        });

        // Clean up the order record
        await prisma.siteSetting
          .deleteMany({ where: { key: `order_${OrderMerchantReference}` } })
          .catch(() => {});

        console.log(`[Pesapal IPN] Upgraded user ${userId} to ${role} via plan ${planName}`);
      }
    }

    // Pesapal requires this exact response shape
    return NextResponse.json({
      orderNotificationType: body.OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200,
    });
  } catch (err: any) {
    console.error("[Pesapal IPN] Error:", err);
    // Still return 200 — Pesapal will retry on failure which would re-process
    return NextResponse.json({ status: 200 });
  }
}

// Pesapal GET-validates the IPN URL during registration — must return 200
export async function GET() {
  return NextResponse.json({ status: 200, endpoint: "pesapal-ipn" });
}
