import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/flutterwave";

const ROLE_MAP: Record<string, string> = {
  pro: "premium_user",
  enterprise: "enterprise_user",
};

function nextPeriodEnd(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const txId = searchParams.get("transaction_id");
  const txRef = searchParams.get("tx_ref");

  const base = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

  // Cancelled by user
  if (status === "cancelled" || !txId) {
    return NextResponse.redirect(`${base}/pricing?cancelled=1`);
  }

  try {
    const result = await verifyTransaction(txId);

    if (
      result.status !== "success" ||
      result.data?.status !== "successful"
    ) {
      console.error("Payment verification failed:", result);
      return NextResponse.redirect(`${base}/pricing?error=payment_failed`);
    }

    const meta = result.data?.meta as Record<string, string> | undefined;
    const userId = meta?.userId;
    const planName = meta?.planName || "pro";

    if (!userId) {
      console.error("No userId in Flutterwave meta:", meta);
      return NextResponse.redirect(`${base}/pricing?error=no_user`);
    }

    const role = ROLE_MAP[planName] || "premium_user";

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Update subscription record
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeSubscriptionId: txId, // store Flutterwave tx ID
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

    return NextResponse.redirect(
      `${base}/dashboard?upgrade=success&plan=${planName}`
    );
  } catch (err: any) {
    console.error("Verify route error:", err);
    return NextResponse.redirect(`${base}/pricing?error=server`);
  }
}
