import { Resend } from "resend";

// ── Sender addresses ──────────────────────────────────────────────────────────
export const SENDERS = {
  /** Personal welcome emails from the founder */
  founder: "Mclean Mbaga <mclean@smartlinkpilot.com>",
  /** Transactional / support emails (password reset, alerts) */
  support: "SmartLink Pilot Support <support@smartlinkpilot.com>",
  /** Newsletters, blog posts, automated notifications */
  info: "SmartLink Pilot <info@smartlinkpilot.com>",
} as const;

// Lazily initialised so the module is importable even if the key is not set
// (e.g. during Prisma generate at build time).
let _client: Resend | null = null;
function getClient(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set in environment variables.");
    _client = new Resend(key);
  }
  return _client;
}

// ── Generic send helper ───────────────────────────────────────────────────────
export async function sendEmail(params: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await getClient().emails.send({
      from: params.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) {
      console.error("[Resend] Send error:", error);
      return { success: false, error: error.message };
    }

    console.log("[Resend] Email sent:", data?.id);
    return { success: true };
  } catch (err: any) {
    console.error("[Resend] Unexpected error:", err);
    return { success: false, error: err.message };
  }
}
