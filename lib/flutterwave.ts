const FLW_BASE = "https://api.flutterwave.com/v3";

const SECRET_KEY = () => process.env.FLUTTERWAVE_SECRET_KEY || "";

export interface FlwPaymentPayload {
  txRef: string;
  amount: number;
  currency: string;
  email: string;
  name: string;
  planId?: string;
  redirectUrl: string;
  meta: Record<string, string>;
  description: string;
}

/** Create a Flutterwave hosted checkout link */
export async function initializePayment(data: FlwPaymentPayload) {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: data.txRef,
      amount: data.amount,
      currency: data.currency,
      redirect_url: data.redirectUrl,
      // Accept cards + Tanzania mobile money methods
      payment_options:
        "card,mobilemoneytanzania,airtelmoneytzana,gtmpesa",
      payment_plan: data.planId || undefined,
      customer: { email: data.email, name: data.name },
      meta: data.meta,
      customizations: {
        title: "SmartLink Pilot",
        description: data.description,
        logo: `${process.env.NEXTAUTH_URL}/icon-192.png`,
      },
    }),
  });
  return res.json();
}

/** Verify a transaction by its Flutterwave transaction ID */
export async function verifyTransaction(transactionId: string) {
  const res = await fetch(
    `${FLW_BASE}/transactions/${transactionId}/verify`,
    {
      headers: { Authorization: `Bearer ${SECRET_KEY()}` },
    }
  );
  return res.json();
}

/** Validate that a webhook request is from Flutterwave */
export function validateWebhookHash(hash: string | null): boolean {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH || "";
  if (!expected) return true; // skip validation in dev when not set
  return hash === expected;
}
