import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Map plan names to env-var price IDs
const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, planName } = await req.json();

    // Resolve the actual Stripe price ID
    const resolvedPriceId =
      (planName && PRICE_IDS[planName as string]) || priceId;

    // Fall back to mock checkout if Stripe is not configured
    const stripeKey = process.env.STRIPE_SECRET_KEY || "";
    if (
      !stripeKey ||
      stripeKey === "sk_test_dummy" ||
      !resolvedPriceId ||
      resolvedPriceId.startsWith("price_pro") ||
      resolvedPriceId.startsWith("price_enterprise")
    ) {
      return NextResponse.json({ url: `/mock-checkout?plan=${planName || "pro"}` });
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      // card includes Google Pay & Apple Pay automatically in Stripe Checkout
      payment_method_types: ["card"],
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success&plan=${planName || "pro"}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planName: planName || "pro",
        },
      },
      metadata: {
        userId: session.user.id,
        planName: planName || "pro",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
