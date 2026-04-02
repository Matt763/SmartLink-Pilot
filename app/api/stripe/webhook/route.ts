/**
 * Pesapal IPN (Instant Payment Notification) handler
 * Pesapal POSTs to this URL when a transaction status changes.
 * Payload params: OrderNotificationType, OrderTrackingId, OrderMerchantReference
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

export async function POST(req: Request) {
  let body: Record<string, string> = {};

  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Pesapal may send form-encoded or query-string params
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((v, k) => { body[k] = v; });
    }
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const trackingId: string =
    body.OrderTrackingId || body.orderTrackingId || "";
  const merchantRef: string =
    body.OrderMerchantReference || body.orderMerchantReference || "";

  if (!trackingId) {
    return NextResponse.json({ received: true }); // ignore non-payment events
  }

  try {
    const token = await getToken();
    const status = await getTransactionStatus(token, trackingId);

    // status_code 1 = Completed
    if (status.status_code !== 1 && status.payment_status_description !== "Completed") {
      // Not completed yet — could be pending, failed, etc.
      return NextResponse.json({ received: true });
    }

    // Decode: "slp-{planName}-{userId}"
    const parts = merchantRef.split("-");
    const planName = parts[1] || "pro";
    const userId = parts.slice(2).join("-");

    if (!userId) {
      console.error("IPN: cannot extract userId from ref:", merchantRef);
      return NextResponse.json({ received: true });
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
  } catch (err: any) {
    console.error("IPN handler error:", err.message);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
