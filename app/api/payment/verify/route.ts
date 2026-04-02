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

/** Resolve userId + planName from our DB using the merchant reference (orderId). */
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

/**
 * Pesapal redirects here after the user completes or cancels payment.
 * Query params: OrderTrackingId, OrderMerchantReference, OrderNotificationType
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackingId = searchParams.get("OrderTrackingId");
  const merchantRef = searchParams.get("OrderMerchantReference") || "";
  const base = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

  if (!trackingId) {
    return NextResponse.redirect(`${base}/pricing?cancelled=1`);
  }

  try {
    // Verify transaction status with Pesapal
    const token = await getToken();
    const status = await getTransactionStatus(token, trackingId);

    if (
      status.payment_status_description !== "Completed" &&
      status.status_code !== 1
    ) {
      console.error("Payment not completed:", JSON.stringify(status));
      return NextResponse.redirect(`${base}/pricing?error=payment_failed`);
    }

    // Look up userId + planName from DB
    const order = await resolveOrder(merchantRef);

    if (!order) {
      console.error("Order not found in DB for ref:", merchantRef);
      return NextResponse.redirect(`${base}/pricing?error=order_not_found`);
    }

    const { userId, planName } = order;
    const role = ROLE_MAP[planName] || "premium_user";

    // Update user role
    await prisma.user.update({ where: { id: userId }, data: { role } });

    // Update subscription record
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

    // Clean up the temporary order record
    await prisma.siteSetting.deleteMany({ where: { key: `order_${merchantRef}` } });

    return NextResponse.redirect(
      `${base}/dashboard?upgrade=success&plan=${planName}`
    );
  } catch (err: any) {
    console.error("Verify route error:", err);
    return NextResponse.redirect(`${base}/pricing?error=server`);
  }
}
