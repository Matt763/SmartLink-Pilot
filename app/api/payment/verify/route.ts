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

/**
 * Pesapal redirects here after payment with query params:
 *   OrderTrackingId, OrderMerchantReference, OrderNotificationType
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackingId = searchParams.get("OrderTrackingId");
  const merchantRef = searchParams.get("OrderMerchantReference"); // our orderId
  const base = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

  if (!trackingId) {
    return NextResponse.redirect(`${base}/pricing?cancelled=1`);
  }

  try {
    const token = await getToken();
    const status = await getTransactionStatus(token, trackingId);

    // Pesapal payment_status_description: "Completed" on success
    if (
      status.payment_status_description !== "Completed" &&
      status.status_code !== 1
    ) {
      console.error("Payment not completed:", status);
      return NextResponse.redirect(`${base}/pricing?error=payment_failed`);
    }

    // Decode planName and userId from merchantRef: "slp-{plan}-{userId}"
    const parts = (merchantRef || "").split("-");
    // Format: slp - pro - cuid (cuid has no hyphens in the middle for our format)
    // parts[0] = "slp", parts[1] = planName, parts[2..] = userId
    const planName = parts[1] || "pro";
    const userId = parts.slice(2).join("-"); // rejoin in case userId had hyphens

    if (!userId) {
      console.error("Could not extract userId from ref:", merchantRef);
      return NextResponse.redirect(`${base}/pricing?error=no_user`);
    }

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

    return NextResponse.redirect(
      `${base}/dashboard?upgrade=success&plan=${planName}`
    );
  } catch (err: any) {
    console.error("Verify route error:", err);
    return NextResponse.redirect(`${base}/pricing?error=server`);
  }
}
