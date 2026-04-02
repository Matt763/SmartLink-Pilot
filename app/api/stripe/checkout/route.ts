import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getToken, registerIPN, submitOrder } from "@/lib/pesapal";

const PLAN_CONFIG: Record<string, { amount: number; description: string }> = {
  pro: {
    amount: 6.99,
    description: "SmartLink Pilot Pro - Unlimited links, analytics and QR codes",
  },
  enterprise: {
    amount: 12.99,
    description: "SmartLink Pilot Enterprise - Full API access and team workspaces",
  },
};

const CORRECT_IPN_URL = `${process.env.NEXTAUTH_URL}/api/pesapal/ipn`;

/** Get or register the Pesapal IPN notification ID (cached in DB). */
async function getNotificationId(token: string): Promise<string> {
  // Check cached value — but also verify it was registered with the correct URL.
  // We store "ipnId|ipnUrl" so we can detect when the URL has changed.
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "pesapal_ipn_id" },
  });

  if (setting?.value) {
    const [cachedId, cachedUrl] = setting.value.split("|");
    // Re-register only if the URL changed (e.g. old code used /api/stripe/webhook)
    if (cachedId && cachedUrl === CORRECT_IPN_URL) return cachedId;
  }

  const ipnId = await registerIPN(token, CORRECT_IPN_URL);

  await prisma.siteSetting.upsert({
    where: { key: "pesapal_ipn_id" },
    create: { key: "pesapal_ipn_id", value: `${ipnId}|${CORRECT_IPN_URL}` },
    update: { value: `${ipnId}|${CORRECT_IPN_URL}` },
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
      return NextResponse.json({ url: `/mock-checkout?plan=${resolvedPlan}` });
    }

    const token = await getToken();
    const notificationId = await getNotificationId(token);

    // Generate a unique order ID every time using base36 timestamp.
    // This prevents Pesapal from rejecting duplicate order IDs on retries.
    const orderId = `slp${Date.now().toString(36)}`;

    // Store userId + planName in DB keyed by orderId so we can recover it
    // in the callback without embedding it in the order ID.
    await prisma.siteSetting.upsert({
      where: { key: `order_${orderId}` },
      create: { key: `order_${orderId}`, value: `${session.user.id}|${resolvedPlan}` },
      update: { value: `${session.user.id}|${resolvedPlan}` },
    });

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
      // Clean up the stored order if Pesapal rejected it
      await prisma.siteSetting.deleteMany({ where: { key: `order_${orderId}` } });
      console.error("Pesapal order error:", JSON.stringify(result));
      return NextResponse.json(
        { error: result.error?.message || result.message || "Could not create payment link" },
        { status: 500 }
      );
    }

    // Save pending subscription record
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
