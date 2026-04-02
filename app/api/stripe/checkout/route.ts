import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToken, registerIPN, submitOrder } from "@/lib/pesapal";

const PLAN_CONFIG: Record<string, { amount: number; description: string }> = {
  pro: {
    amount: 6.99,
    description: "SmartLink Pilot Pro — Unlimited links, analytics & QR codes",
  },
  enterprise: {
    amount: 12.99,
    description: "SmartLink Pilot Enterprise — Full API, team workspaces & more",
  },
};

/** Get or create the Pesapal IPN notification ID (stored in DB to avoid re-registering). */
async function getNotificationId(token: string): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "pesapal_ipn_id" },
  });
  if (setting?.value) return setting.value;

  const ipnUrl = `${process.env.NEXTAUTH_URL}/api/stripe/webhook`;
  const ipnId = await registerIPN(token, ipnUrl);

  await prisma.siteSetting.upsert({
    where: { key: "pesapal_ipn_id" },
    create: { key: "pesapal_ipn_id", value: ipnId },
    update: { value: ipnId },
  });

  return ipnId;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planName } = await req.json();
    const resolvedPlan = planName in PLAN_CONFIG ? planName : "pro";
    const plan = PLAN_CONFIG[resolvedPlan];

    // Fall back to mock checkout when Pesapal is not configured
    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      return NextResponse.json({
        url: `/mock-checkout?plan=${resolvedPlan}`,
      });
    }

    const token = await getToken();
    const notificationId = await getNotificationId(token);

    // Encode userId + planName into the order ID so we can recover it on callback
    // Format: slp-{planName}-{userId} (Pesapal accepts alphanumeric + hyphens)
    const orderId = `slp-${resolvedPlan}-${session.user.id}`;

    const nameParts = (session.user.name || "User").trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || ".";

    const result = await submitOrder(token, {
      orderId,
      amount: plan.amount,
      currency: "USD",
      description: plan.description,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/verify`,
      notificationId,
      email: session.user.email,
      firstName,
      lastName,
    });

    if (!result.redirect_url) {
      console.error("Pesapal order error:", result);
      return NextResponse.json(
        { error: result.error?.message || "Could not create payment link" },
        { status: 500 }
      );
    }

    // Save pending subscription
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, status: "pending" },
      update: { status: "pending" },
    });

    return NextResponse.json({ url: result.redirect_url });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
