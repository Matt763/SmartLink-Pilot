/**
 * Pesapal API 3.0 wrapper — REST/JSON
 * Docs: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json
 */

const BASE =
  process.env.PESAPAL_ENV === "live"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Get a short-lived bearer token (valid ~5 min). */
export async function getToken(): Promise<string> {
  const res = await fetch(`${BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Pesapal auth failed: ${JSON.stringify(data)}`);
  return data.token as string;
}

// ── IPN registration ──────────────────────────────────────────────────────────

/** Register (or re-use) the IPN URL and return the notification_id. */
export async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${BASE}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "POST",
    }),
  });
  const data = await res.json();
  if (!data.ipn_id) throw new Error(`Pesapal IPN registration failed: ${JSON.stringify(data)}`);
  return data.ipn_id as string;
}

// ── Submit order ──────────────────────────────────────────────────────────────

export interface PesapalOrderPayload {
  orderId: string;       // e.g. "slp-{userId}-pro"
  amount: number;
  currency: string;      // "USD"
  description: string;
  callbackUrl: string;
  notificationId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function submitOrder(token: string, payload: PesapalOrderPayload) {
  const res = await fetch(`${BASE}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: payload.orderId,
      currency: payload.currency,
      amount: payload.amount,
      description: payload.description,
      callback_url: payload.callbackUrl,
      notification_id: payload.notificationId,
      billing_address: {
        email_address: payload.email,
        first_name: payload.firstName || "User",
        last_name: payload.lastName || ".",
      },
    }),
  });
  return res.json();
}

// ── Transaction verification ──────────────────────────────────────────────────

export async function getTransactionStatus(
  token: string,
  orderTrackingId: string
) {
  const res = await fetch(
    `${BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.json();
}
