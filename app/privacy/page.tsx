import Link from "next/link";
import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Privacy Policy — How We Collect, Use & Protect Your Data",
  description: "Read SmartLink Pilot's comprehensive Privacy Policy. We are GDPR, CCPA, and COPPA compliant. We never sell your data. Full transparency on data collection and usage.",
};

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: [
      `SmartLink Pilot ("we," "our," or "us"), operated by Mayobe Bros, is committed to protecting your privacy and being transparent about how we handle your personal information. This Privacy Policy explains what data we collect, why we collect it, how we use it, who we share it with, and what rights you have over your data.`,
      `This policy applies to all users of SmartLink Pilot, including visitors to our website (smartlinkpilot.com), registered account holders, API users, and anyone who clicks a SmartLink Pilot shortened link. By using our service, you acknowledge that you have read and understood this policy.`,
      `If you do not agree with any part of this policy, please discontinue use of our services. You may contact us at privacy@smartlinkpilot.com with any questions before deciding whether to continue.`,
    ],
  },
  {
    id: "what-we-collect",
    title: "2. Information We Collect",
    subsections: [
      {
        title: "2.1 Account Registration Data",
        content: "When you create a SmartLink Pilot account, we collect your full name, email address, and a securely hashed password. If you register using Google OAuth, we receive your public Google profile (name, email, profile image) as authorized by you during the OAuth flow. We also collect an optional username and an optional recovery phone number, which is used solely for account recovery purposes and is never shared with third parties or used for marketing.",
      },
      {
        title: "2.2 Link Analytics Data",
        content: "When someone clicks one of your shortened links, we automatically collect the following analytics data for your reporting: the country of the click (not city or specific location), the device type (Mobile or Desktop), the browser type (Chrome, Safari, Firefox, etc.), the referring website or 'Direct' if no referrer, and the timestamp. We do not collect the personal IP address of link visitors in a way that can identify them individually. IP addresses are used only to derive country information and are not stored.",
      },
      {
        title: "2.3 Usage & Technical Data",
        content: "We collect certain technical information when you interact with our platform: your browser type and version, your device type and operating system, pages you visit within our platform, feature interactions (without recording keystrokes or form contents), and error logs that help us improve reliability. This data is used solely for platform improvement and is never used to profile individual users for advertising.",
      },
      {
        title: "2.4 Payment Information",
        content: "SmartLink Pilot uses Pesapal for payment processing. We do not store your credit card numbers, CVV codes, mobile money PINs, or banking information on our servers. All payment data is handled directly by Pesapal under their own PCI-DSS compliant systems. We only receive a confirmation of payment status, your subscription tier, and a transaction reference ID for billing purposes.",
      },
      {
        title: "2.5 Visitor Session Analytics",
        content: "We collect anonymous visitor session data to understand how our platform is used. This includes: device type (mobile, tablet, desktop), browser type and operating system, country and city (derived from IP address — the IP itself is not stored), the page or website that referred you to us (referrer/traffic source), pages visited within SmartLink Pilot, and time spent on each page. This data is stored against a random session ID (slp_vsid) generated per browser session and contains no personally identifiable information. It cannot be used to identify you individually.",
      },
      {
        title: "2.6 Device Identifiers for Free Trial",
        content: "For unauthenticated users using our free trial (up to 3 shortened links), we generate a random device identifier stored in an HTTP-only cookie. This identifier is a random UUID and is not linked to any personal information. It is used solely to enforce the 3-link trial limit and expires after one year. You can clear this by clearing your browser cookies.",
      },
      {
        title: "2.7 Advertising — Free Users",
        content: "Free account users may see advertisements served by Google AdSense. These ads help us keep the free tier available at no cost. Google AdSense may use cookies to serve ads relevant to your browsing interests. Paid subscribers (Pro and Enterprise) do not see any advertisements. You can opt out of personalized Google advertising at g.co/adsettings or by visiting optout.aboutads.info.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    list: [
      "To provide, operate, maintain, and improve our URL shortening and analytics services",
      "To authenticate your identity and manage your account securely",
      "To process payments and manage your subscription through Pesapal",
      "To generate link analytics reports available in your dashboard",
      "To communicate with you about service updates, security alerts, and support responses",
      "To detect and prevent fraud, abuse, spam, and other malicious activity",
      "To enforce our Terms of Service and Acceptable Use Policy",
      "To comply with applicable laws, regulations, and legal obligations",
      "To analyze aggregate usage patterns (never individual behavior) to improve the platform",
      "To display relevant ads to free-tier users via Google AdSense (paid subscribers are exempt from all advertising)",
      "We do NOT use your data to build personal advertising profiles",
      "We do NOT use your data to train third-party AI systems without consent",
      "We do NOT sell your email or contact information to any third parties",
    ],
  },
  {
    id: "data-sharing",
    title: "4. Data Sharing & Third Parties",
    content: [
      `We do not sell, rent, lease, or trade your personal data to any third parties. We share your information only in the following limited circumstances:`,
    ],
    list: [
      "Pesapal (payment processing): Your payment information is processed by Pesapal. See Pesapal's Privacy Policy at pesapal.com/privacy",
      "Google AdSense (advertising): Free-tier users may see ads served by Google. Google may use cookies for ad personalization. Paid subscribers are not served ads. See Google's Privacy Policy at policies.google.com/privacy",
      "Vercel (hosting infrastructure): Our platform is hosted on Vercel, which processes traffic to deliver our service. Vercel is GDPR compliant",
      "Prisma / Database providers: Your data is stored in a secure SQLite/PostgreSQL database instance. Only authorized internal staff have access",
      "Legal requirements: If required by law, court order, or governmental authority, we may disclose data. We will notify affected users where legally permitted",
      "Business transfers: In the event of a merger, acquisition, or asset sale, your data may transfer to the acquiring entity. We will provide 30 days notice",
      "Protection of rights: To protect the safety, rights, or property of SmartLink Pilot, our users, or the public",
    ],
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: [
      "We retain your account data (name, email, preferences) for as long as your account is active, plus a 30-day grace period following account deletion requests.",
      "Analytics data (click records associated with your links) is retained for 24 months by default, after which it is automatically purged. Pro users can configure extended retention.",
      "Payment records are retained for 7 years to comply with financial regulations.",
      "Device identifier cookies expire after 12 months and contain no personally identifiable information.",
      "You may request immediate deletion of all your personal data by emailing privacy@smartlinkpilot.com.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Privacy Rights",
    content: [
      "Depending on your jurisdiction, you have the following rights regarding your personal data:",
    ],
    list: [
      "Right of Access: Request a copy of all personal data we hold about you",
      "Right of Rectification: Request correction of inaccurate or incomplete data",
      "Right of Erasure ('Right to be Forgotten'): Request deletion of your personal data",
      "Right to Data Portability: Receive your data in a structured, machine-readable format (JSON/CSV)",
      "Right to Restrict Processing: Request that we limit how we use your data",
      "Right to Object: Object to processing of your data for marketing purposes",
      "Right to Withdraw Consent: Withdraw any consent you have given at any time",
      "CCPA Rights (California residents): Right to know, delete, and opt-out of sale of personal information",
      "COPPA (Children): Our service is not directed to children under 13. We do not knowingly collect data from children",
    ],
    footer: "To exercise any of these rights, contact us at privacy@smartlinkpilot.com. We will respond within 30 days.",
  },
  {
    id: "security",
    title: "7. Security Measures",
    content: [
      "We implement industry-standard security measures to protect your personal information:",
      "All data is encrypted in transit using TLS 1.3 (HTTPS). Passwords are hashed using bcrypt with a cost factor of 12 — they are never stored in plaintext. API keys and sensitive settings are stored encrypted in our database. We use HTTP-only, Secure, SameSite cookies to prevent cross-site attacks. Our servers are protected by firewalls and monitored 24/7 for anomalies. We undergo regular security reviews and address vulnerabilities promptly.",
      "No method of internet transmission or electronic storage is 100% secure. While we implement best practices, we cannot guarantee absolute security. In the event of a data breach affecting your personal information, we will notify you within 72 hours as required by GDPR.",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies & Tracking",
    content: [
      "We use cookies and similar technologies to provide our service. For full details, please see our Cookies Policy at smartlinkpilot.com/cookies.",
      "Essential cookies (required): Authentication session tokens to keep you logged in. Security tokens to prevent CSRF attacks. Device identifier for free trial enforcement.",
      "Visitor analytics (functional): A random session ID (slp_vsid) stored in sessionStorage to track anonymous visitor sessions for platform analytics. Contains no personally identifiable information.",
      "Advertising cookies (free users only): Google AdSense may place cookies on your device if you use a free SmartLink Pilot account to serve relevant advertisements. These cookies are not placed for paid subscribers.",
      "Functional cookies (optional): Theme preference (dark/light mode) stored in localStorage.",
      "You can control cookie settings through your browser preferences. See our full Cookies Policy for details.",
    ],
  },
  {
    id: "international",
    title: "9. International Data Transfers",
    content: [
      "SmartLink Pilot is operated from Arusha, Tanzania, with infrastructure hosted through Vercel (United States). If you are accessing our service from the European Economic Area (EEA), your data may be transferred to and processed in countries outside the EEA.",
      "We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses (SCCs) where required by GDPR. By using our service, you consent to the transfer of your information as described in this policy.",
    ],
  },
  {
    id: "changes",
    title: "10. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or service offerings. We will notify you of material changes by email (to the address associated with your account) and by posting a prominent notice on our website at least 14 days before changes take effect.",
      "The date at the top of this policy indicates when it was last updated. Continued use of our service after the effective date of any changes constitutes your acceptance of the updated policy.",
    ],
  },
  {
    id: "contact",
    title: "11. Contact & Data Protection Officer",
    content: [
      "For privacy-related inquiries, data subject requests, or questions about this policy, contact us at:",
      "Email: privacy@smartlinkpilot.com | Subject line: 'Privacy Request'",
      "Postal Address: SmartLink Pilot / Mayobe Bros, Arusha, Tanzania",
      "Response time: We aim to respond to all privacy requests within 30 days.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  const sectionIds = sections.map((s) => ({ id: s.id, title: s.title }));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-blue-100 mb-2">Last updated: April 2, 2026</p>
          <p className="text-blue-200 text-sm max-w-xl mx-auto">We believe in radical transparency. This policy tells you exactly what data we collect, why, and what you can do about it — in plain English.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Table of Contents Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Table of Contents</h2>
              <nav>
                <ul className="space-y-1">
                  {sectionIds.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition truncate">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 mb-3">Questions?</p>
                <a href="mailto:privacy@smartlinkpilot.com" className="block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">privacy@smartlinkpilot.com</a>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 max-w-3xl">
            <div className="space-y-12">
              {sections.map((section, idx) => (
                <ScrollReveal key={section.id} delay={idx * 100}>
                <section id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">{section.title}</h2>

                  {section.content && (
                    <div className="space-y-4">
                      {section.content.map((p, i) => (
                        <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  )}

                  {section.subsections && (
                    <div className="space-y-6 mt-4">
                      {section.subsections.map((sub) => (
                        <div key={sub.title} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{sub.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.list && (
                    <ul className="mt-4 space-y-2">
                      {section.list.map((item, i) => (
                        <li key={i} className={`flex items-start gap-2.5 text-sm leading-relaxed ${item.startsWith("We do NOT") ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-300"}`}>
                          <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.startsWith("We do NOT") ? "bg-red-400" : "bg-blue-400"}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {(section as any).footer && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{(section as any).footer}</p>
                    </div>
                  )}
                </section>
                </ScrollReveal>
              ))}

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-400 text-center">
                  See also:{" "}
                  <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>
                  {" · "}
                  <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">Cookies Policy</Link>
                  {" · "}
                  <Link href="/trust" className="text-blue-600 dark:text-blue-400 hover:underline">Trust & E-E-A-T</Link>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
