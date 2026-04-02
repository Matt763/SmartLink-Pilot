// ─────────────────────────────────────────────────────────────────────────────
// SmartLink Pilot — Luxury Email Templates
// Brand: Dark navy (#0a0f1e) · Indigo (#6366f1) · Purple (#a855f7)
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";

// ── Shared layout wrapper ─────────────────────────────────────────────────────
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartLink Pilot</title>
</head>
<body style="margin:0;padding:0;background-color:#06091a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#06091a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px 32px;">

        <!-- HEADER / LOGO -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%);border-radius:16px;padding:12px 24px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                      &#x26A1; SmartLink<span style="color:#c4b5fd;">Pilot</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CARD -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:linear-gradient(145deg,#0d1230 0%,#0f172a 100%);border-radius:24px;overflow:hidden;border:1px solid #1e2d5a;">
          <!-- Top gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#6366f1 0%,#a855f7 50%,#06b6d4 100%);"></td>
          </tr>
          <tr>
            <td style="padding:48px 48px 40px;">
              ${content}
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;margin-top:32px;">
          <tr>
            <td align="center" style="padding:0 24px;">
              <p style="margin:0 0 8px;color:#475569;font-size:12px;line-height:1.6;">
                You are receiving this email because you have an account at
                <a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">SmartLink Pilot</a>.
              </p>
              <p style="margin:0;color:#334155;font-size:11px;">
                &copy; ${new Date().getFullYear()} SmartLink Pilot &mdash; Intelligent Link Management
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Helper: gradient CTA button ───────────────────────────────────────────────
function ctaButton(text: string, href: string): string {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%);border-radius:12px;padding:1px;">
        <a href="${href}"
          style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1 0%,#a855f7 100%);
                 border-radius:12px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;
                 letter-spacing:0.3px;white-space:nowrap;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

// ── Helper: info box ──────────────────────────────────────────────────────────
function infoBox(items: { label: string; value: string }[]): string {
  const rows = items
    .map(
      ({ label, value }) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e2d5a;">
          <span style="color:#64748b;font-size:13px;">${label}</span>
          <br/>
          <span style="color:#e2e8f0;font-size:14px;font-weight:600;">${value}</span>
        </td>
      </tr>`
    )
    .join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#0a0f28;border-radius:12px;border:1px solid #1e2d5a;margin:24px 0;">
    <tr>
      <td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${rows}
        </table>
      </td>
    </tr>
  </table>`;
}

// ── Helper: feature highlight ─────────────────────────────────────────────────
function featureList(items: { icon: string; title: string; desc: string }[]): string {
  const rows = items
    .map(
      ({ icon, title, desc }) => `
      <tr>
        <td style="padding:8px 0;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:top;padding-right:14px;font-size:22px;line-height:1;">${icon}</td>
              <td style="vertical-align:top;">
                <p style="margin:0 0 2px;color:#e2e8f0;font-size:14px;font-weight:600;">${title}</p>
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">${desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    ${rows}
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WELCOME EMAIL
// Sender: mclean@smartlinkpilot.com
// ─────────────────────────────────────────────────────────────────────────────
export function welcomeEmailTemplate(name: string, username: string): { subject: string; html: string } {
  const displayName = name || username;
  const dashboardUrl = `${BASE_URL}/dashboard`;

  const content = `
    <!-- Greeting badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td>
          <span style="display:inline-block;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.3);
                       color:#a5b4fc;font-size:12px;font-weight:600;letter-spacing:1px;
                       padding:5px 14px;border-radius:99px;text-transform:uppercase;">
            Welcome aboard
          </span>
        </td>
      </tr>
    </table>

    <!-- Headline -->
    <h1 style="margin:16px 0 8px;color:#f8fafc;font-size:30px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">
      Hello, ${displayName}! &#x1F44B;
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:16px;line-height:1.6;">
      Your SmartLink Pilot account is ready. You now have access to powerful,
      intelligent link management tools trusted by professionals worldwide.
    </p>

    <!-- Account info -->
    ${infoBox([
      { label: "Your Username", value: `@${username}` },
      { label: "Dashboard", value: dashboardUrl },
      { label: "Plan", value: "Free — Upgrade anytime for unlimited links" },
    ])}

    <!-- Features -->
    <p style="margin:0 0 12px;color:#cbd5e1;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
      What you can do
    </p>
    ${featureList([
      { icon: "&#x1F517;", title: "Shorten & Brand Links", desc: "Create clean, trackable short links with custom slugs." },
      { icon: "&#x1F4CA;", title: "Real-Time Analytics", desc: "See clicks, countries, devices, and referrers live." },
      { icon: "&#x1F4F1;", title: "QR Code Generator", desc: "Instantly generate branded QR codes for any link." },
      { icon: "&#x1F916;", title: "AI Assistant", desc: "Ask SmartLink AI anything about link management & strategy." },
    ])}

    <!-- CTA -->
    <div style="text-align:center;margin-top:32px;">
      ${ctaButton("Open My Dashboard &rarr;", dashboardUrl)}
    </div>

    <!-- Sign-off -->
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1e2d5a;">
      <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">With gratitude,</p>
      <p style="margin:0 0 2px;color:#e2e8f0;font-size:15px;font-weight:700;">Mclean Mbaga</p>
      <p style="margin:0;color:#6366f1;font-size:13px;">Founder &amp; CEO, SmartLink Pilot</p>
    </div>
  `;

  return {
    subject: `Welcome to SmartLink Pilot, ${displayName}! Your account is ready ⚡`,
    html: layout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PASSWORD RESET EMAIL
// Sender: support@smartlinkpilot.com
// ─────────────────────────────────────────────────────────────────────────────
export function passwordResetEmailTemplate(email: string, resetUrl: string): { subject: string; html: string } {
  const content = `
    <!-- Security badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td>
          <span style="display:inline-block;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);
                       color:#fca5a5;font-size:12px;font-weight:600;letter-spacing:1px;
                       padding:5px 14px;border-radius:99px;text-transform:uppercase;">
            Security Alert
          </span>
        </td>
      </tr>
    </table>

    <!-- Headline -->
    <h1 style="margin:16px 0 8px;color:#f8fafc;font-size:28px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">
      Reset your password &#x1F512;
    </h1>
    <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
      We received a request to reset the password for your SmartLink Pilot account
      associated with <strong style="color:#e2e8f0;">${email}</strong>.<br/><br/>
      Click the button below to create a new password. This link expires in <strong style="color:#fbbf24;">1 hour</strong>.
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin:32px 0;">
      ${ctaButton("&#x1F511;  Reset My Password", resetUrl)}
    </div>

    <!-- Warning box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;margin-top:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;color:#fbbf24;font-size:13px;font-weight:700;">&#x26A0; Didn&apos;t request this?</p>
          <p style="margin:0;color:#78716c;font-size:13px;line-height:1.5;">
            If you didn&apos;t request a password reset, you can safely ignore this email.
            Your password will remain unchanged. If you&apos;re concerned, contact us at
            <a href="mailto:support@smartlinkpilot.com" style="color:#6366f1;text-decoration:none;">support@smartlinkpilot.com</a>.
          </p>
        </td>
      </tr>
    </table>

    <!-- Sign-off -->
    <div style="margin-top:36px;padding-top:24px;border-top:1px solid #1e2d5a;">
      <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">Stay secure,</p>
      <p style="margin:0 0 2px;color:#e2e8f0;font-size:15px;font-weight:700;">SmartLink Pilot Support</p>
      <p style="margin:0;color:#6366f1;font-size:13px;">
        <a href="mailto:support@smartlinkpilot.com" style="color:#6366f1;text-decoration:none;">support@smartlinkpilot.com</a>
      </p>
    </div>
  `;

  return {
    subject: "Reset your SmartLink Pilot password",
    html: layout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. NEWSLETTER — NEW BLOG POST
// Sender: info@smartlinkpilot.com
// ─────────────────────────────────────────────────────────────────────────────
export function newsletterPostEmailTemplate(params: {
  subscriberName?: string;
  postTitle: string;
  postExcerpt: string;
  postSlug: string;
  featuredImage?: string | null;
  readTime?: number;
  unsubscribeToken: string;
}): { subject: string; html: string } {
  const { subscriberName, postTitle, postExcerpt, postSlug, featuredImage, readTime, unsubscribeToken } = params;
  const postUrl = `${BASE_URL}/blog/${postSlug}`;
  const unsubscribeUrl = `${BASE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const greeting = subscriberName ? `Hi ${subscriberName},` : "Hi there,";

  const imageSection = featuredImage
    ? `<tr>
        <td style="padding-bottom:32px;">
          <img src="${featuredImage}" alt="${postTitle}"
            style="width:100%;max-width:504px;height:240px;object-fit:cover;border-radius:16px;display:block;" />
        </td>
      </tr>`
    : "";

  const content = `
    <!-- Newsletter badge -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
      <tr>
        <td>
          <span style="display:inline-block;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.3);
                       color:#a5b4fc;font-size:12px;font-weight:600;letter-spacing:1px;
                       padding:5px 14px;border-radius:99px;text-transform:uppercase;">
            New Article &bull; SmartLink Pilot Blog
          </span>
        </td>
      </tr>
    </table>

    <!-- Greeting -->
    <p style="margin:16px 0 28px;color:#94a3b8;font-size:16px;line-height:1.6;">
      ${greeting}<br/>
      A new article has just been published on the SmartLink Pilot blog.
    </p>

    <!-- Featured image -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${imageSection}
    </table>

    <!-- Post title -->
    <h1 style="margin:0 0 16px;color:#f8fafc;font-size:26px;font-weight:800;line-height:1.3;letter-spacing:-0.3px;">
      ${postTitle}
    </h1>

    <!-- Excerpt -->
    <p style="margin:0 0 8px;color:#94a3b8;font-size:15px;line-height:1.7;">
      ${postExcerpt}
    </p>

    <!-- Read time chip -->
    ${
      readTime
        ? `<p style="margin:0 0 28px;">
            <span style="display:inline-block;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.25);
                         color:#c084fc;font-size:12px;font-weight:600;padding:4px 12px;border-radius:99px;">
              &#x23F1; ${readTime} min read
            </span>
          </p>`
        : '<div style="margin-bottom:28px;"></div>'
    }

    <!-- CTA -->
    <div style="text-align:center;margin:8px 0 36px;">
      ${ctaButton("Read the Full Article &rarr;", postUrl)}
    </div>

    <!-- Divider -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:0 0 24px;border-bottom:1px solid #1e2d5a;"></td>
      </tr>
    </table>

    <!-- Unsubscribe footer -->
    <p style="margin:20px 0 0;color:#475569;font-size:12px;line-height:1.6;text-align:center;">
      You&apos;re receiving this because you subscribed to SmartLink Pilot updates.<br/>
      <a href="${unsubscribeUrl}" style="color:#6366f1;text-decoration:none;">Unsubscribe</a> &bull;
      <a href="${BASE_URL}" style="color:#6366f1;text-decoration:none;">Visit Website</a>
    </p>
  `;

  return {
    subject: `New Post: ${postTitle} ⚡ SmartLink Pilot`,
    html: layout(content),
  };
}
