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

/**
 * Currency trial order — most-to-least likely for Pesapal East Africa.
 *
 * The checkout will try each entry in sequence until Pesapal accepts the order.
 * PESAPAL_CURRENCY / PESAPAL_CURRENCY_RATE env vars override the first entry
 * so operators can pin a currency without changing code.
 */
function buildCurrencyTrials(usdAmount: number) {
  const envCurrency = (process.env.PESAPAL_CURRENCY || "").trim().toUpperCase();
  const envRate = parseFloat(process.env.PESAPAL_CURRENCY_RATE || "0");

  const trials: { currency: string; amount: number }[] = [];

  // Operator-configured currency goes first
  if (envCurrency && envRate > 0) {
    trials.push({
      currency: envCurrency,
      amount: Math.round(usdAmount * envRate * 100) / 100,
    });
  }

  // Fallback chain — in order of Pesapal acceptance likelihood
  const defaults: { currency: string; rate: number }[] = [
    { currency: "KES", rate: 130 },   // Kenya Shilling  — most widely supported
    { currency: "USD", rate: 1 },      // US Dollar       — universal but low limit
    { currency: "EUR", rate: 0.92 },   // Euro
    { currency: "GBP", rate: 0.79 },   // British Pound
  ];

  for (const d of defaults) {
    // Skip if it's the same as the operator-configured currency
    if (d.currency === envCurrency) continue;
    trials.push({
      currency: d.currency,
      amount: Math.round(usdAmount * d.rate * 100) / 100,
    });
  }

  return trials;
}

const CORRECT_IPN_URL = `${process.env.NEXTAUTH_URL}/api/pesapal/ipn`;

async function getNotificationId(token: string): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "pesapal_ipn_id" },
  });

  if (setting?.value) {
    const [cachedId, cachedUrl] = setting.value.split("|");
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

/** Returns true when the Pesapal error is a currency-rejection (safe to retry) */
function isCurrencyError(result: any): boolean {
  const msg = (result?.error?.message || result?.message || "").toLowerCase();
  return msg.includes("invalid currency") || msg.includes("currency code");
}

/** Returns true when the amount exceeds the per-transaction limit */
function isLimitError(result: any): boolean {
  const msg = (result?.error?.message || result?.message || "").toLowerCase();
  return msg.includes("exceeds limit") || msg.includes("amount limit");
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

    // No Pesapal credentials → use mock checkout
    if (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET) {
      return NextResponse.json({ url: `/mock-checkout?plan=${resolvedPlan}` });
    }

    const pesapalToken = await getToken();
    const notificationId = await getNotificationId(pesapalToken);

    const orderId = `slp${Date.now().toString(36)}`;

    await prisma.siteSetting.upsert({
      where: { key: `order_${orderId}` },
      create: { key: `order_${orderId}`, value: `${session.user.id}|${resolvedPlan}` },
      update: { value: `${session.user.id}|${resolvedPlan}` },
    });

    const nameParts = (session.user.name || "User").trim().split(" ");
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || ".";

    const trials = buildCurrencyTrials(plan.amount);
    let lastResult: any = null;

    for (const trial of trials) {
      console.log(
        `[Pesapal] Trying ${trial.currency} ${trial.amount} for plan=${resolvedPlan} order=${orderId}`
      );

      const result = await submitOrder(pesapalToken, {
        orderId,
        amount: trial.amount,
        currency: trial.currency,
        description: plan.description,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/verify`,
        notificationId,
        email: session.user.email,
        firstName,
        lastName,
      });

      // ── Success ──────────────────────────────────────────────────────────
      if (result.redirect_url) {
        console.log(
          `[Pesapal] Order accepted — currency=${trial.currency} amount=${trial.amount} url=${result.redirect_url}`
        );

        await prisma.subscription.upsert({
          where: { userId: session.user.id },
          create: { userId: session.user.id, status: "pending" },
          update: { status: "pending" },
        });

        return NextResponse.json({ url: result.redirect_url });
      }

      // ── Log full Pesapal response for debugging ───────────────────────────
      console.error(
        `[Pesapal] Rejected — currency=${trial.currency} amount=${trial.amount}`,
        JSON.stringify(result)
      );

      lastResult = result;

      // Only retry on currency errors — stop immediately on other errors
      if (!isCurrencyError(result)) break;
    }

    // All trials exhausted
    await prisma.siteSetting.deleteMany({ where: { key: `order_${orderId}` } });

    const errMsg = lastResult?.error?.message || lastResult?.message || "Could not create payment link";

    if (isLimitError(lastResult)) {
      return NextResponse.json(
        {
          error:
            "Payment limit reached on this account. Please contact support at support@smartlinkpilot.com to complete your Enterprise upgrade.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: errMsg }, { status: 500 });
  } catch (error: any) {
    console.error("[Pesapal] Checkout exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
