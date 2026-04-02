import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Map planName metadata → user role
function roleForPlan(planName?: string | null): string {
  if (planName === "enterprise") return "enterprise_user";
  return "premium_user"; // pro and any unknown paid plan
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error: any) {
    console.error("Webhook signature error:", error.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  try {
    // ── Subscription created or payment completed ──────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planName = session.metadata?.planName;

      if (!userId) {
        return NextResponse.json({ error: "No userId in metadata" }, { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status,
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          status: subscription.status,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { role: roleForPlan(planName) },
      });
    }

    // ── Renewal payment succeeded ──────────────────────────────────────────
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) return NextResponse.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const planName = subscription.metadata?.planName;

      // Find user via subscription record
      const subRecord = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (subRecord) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            status: "active",
          },
        });

        await prisma.user.update({
          where: { id: subRecord.userId },
          data: { role: roleForPlan(planName) },
        });
      }
    }

    // ── Subscription cancelled / expired → downgrade to free ──────────────
    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "invoice.payment_failed"
    ) {
      const subscription =
        event.type === "customer.subscription.deleted"
          ? (event.data.object as Stripe.Subscription)
          : null;

      const subscriptionId =
        subscription?.id ||
        ((event.data.object as Stripe.Invoice).subscription as string);

      if (!subscriptionId) return NextResponse.json({ received: true });

      const subRecord = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (subRecord) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: event.type === "customer.subscription.deleted" ? "canceled" : "past_due" },
        });

        // Only downgrade if subscription is truly cancelled (not just past_due)
        if (event.type === "customer.subscription.deleted") {
          await prisma.user.update({
            where: { id: subRecord.userId },
            data: { role: "free_user" },
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
