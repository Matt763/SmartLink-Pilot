import Link from "next/link";
import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Terms of Service — SmartLink Pilot User Agreement",
  description: "Read SmartLink Pilot's Terms of Service. Understand your rights and responsibilities as a user of our URL shortening platform. Plain English, no legal jargon walls.",
};

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using SmartLink Pilot (the \"Service\"), you agree to be bound by these Terms of Service (\"Terms\") and all policies referenced herein, including our Privacy Policy and Acceptable Use Policy. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. If you do not agree to these Terms in their entirety, you must not use the Service." },
  { id: "service-description", title: "2. Description of Service", content: "SmartLink Pilot provides URL shortening, link management, link analytics, QR code generation, and related services (collectively, the \"Service\") through our web platform at smartlinkpilot.com and through our mobile applications and API. We offer both free and paid subscription tiers with varying feature sets as described on our Pricing page. We reserve the right to modify, discontinue, or limit the Service at any time with reasonable notice." },
  { id: "accounts", title: "3. User Accounts & Eligibility", content: "You must be at least 16 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at security@smartlinkpilot.com of any unauthorized access to your account. You must not create accounts using false information or impersonate any person or entity. One person or organization may not maintain multiple free accounts. We reserve the right to terminate accounts that violate these requirements." },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use Policy",
    intro: "You agree not to use SmartLink Pilot to create, distribute, or link to:",
    list: [
      "Malware, ransomware, spyware, or any malicious software",
      "Phishing sites, scam pages, or deceptive content designed to steal personal information",
      "Content that infringes intellectual property rights, copyrights, or trademarks",
      "Spam campaigns, unsolicited bulk emails, or mass automated link creation",
      "Illegal content including child sexual abuse material (CSAM) — reported to law enforcement immediately",
      "Content that promotes violence, hatred, or discrimination based on protected characteristics",
      "Misinformation or deliberately false health or safety information",
      "Content that violates the laws of Tanzania, the United States, or the user's jurisdiction",
      "Any attempts to bypass our rate limiting, trial limits, or access controls",
      "Competitor crawling, scraping, or automated access without API authorization",
    ],
    footer: "We actively scan shortened URLs for malicious content and will disable any link that violates this policy without prior notice. Severe violations may result in permanent account termination and reporting to relevant authorities.",
  },
  { id: "subscriptions", title: "5. Subscriptions & Billing", content: "Premium subscriptions (Pro and Enterprise) are billed monthly or annually via Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis. Subscriptions auto-renew until cancelled. You may cancel at any time through your account settings; access continues until the end of the current billing period. No partial refunds are issued for unused time within a billing period, except where required by law. We offer a 14-day money-back guarantee for first-time subscribers. Price changes take effect at the start of the next billing cycle with 30 days advance notice." },
  { id: "intellectual-property", title: "6. Intellectual Property", content: "The SmartLink Pilot platform, branding, logos, interface design, underlying code, and all proprietary features are owned by Mayobe Bros and protected by international copyright, trademark, and intellectual property laws. You retain full ownership of all content you create, including the URLs you shorten and any custom aliases you create. By using our service, you grant us a limited, non-exclusive license to process your URLs solely to provide the Service. We claim no ownership over your links or their destinations." },
  { id: "privacy", title: "7. Privacy & Data", content: "Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference. We are committed to handling your data with transparency and care. By using our Service, you consent to the data practices described in our Privacy Policy including the collection of analytics data when links are clicked." },
  { id: "disclaimer", title: "8. Disclaimer of Warranties", content: "The Service is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of security vulnerabilities. We do not warrant the accuracy, completeness, or usefulness of any analytics data. SmartLink Pilot disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement to the fullest extent permitted by applicable law." },
  { id: "liability", title: "9. Limitation of Liability", content: "To the maximum extent permitted by law, SmartLink Pilot and Mayobe Bros shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages arising from your use of the Service, including but not limited to loss of profits, data, goodwill, or business opportunities. Our total aggregate liability for any direct damages shall not exceed the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) $100 USD." },
  { id: "termination", title: "10. Termination", content: "We reserve the right to suspend or terminate your account and access to the Service at any time, with or without notice, for violations of these Terms, non-payment, fraud, or any behavior we determine to be harmful to our platform or other users. You may terminate your account at any time by contacting support@smartlinkpilot.com. Upon termination, your links remain active if you have pending redirects, but new link creation will be disabled. Upon request, we will delete all personal data within 30 days." },
  { id: "governing-law", title: "11. Governing Law & Jurisdiction", content: "These Terms are governed by the laws of Tanzania. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Arusha, Tanzania. Users in the European Union have the right to submit complaints to their local Data Protection Authority. For users in the United States, California users may have additional rights under CCPA." },
  { id: "changes", title: "12. Changes to Terms", content: "We may modify these Terms at any time. Material changes will be communicated via email to your registered address and through a prominent notice on our platform at least 14 days before taking effect. Your continued use of the Service after the effective date of any changes constitutes acceptance. If you do not agree to the updated Terms, you must stop using the Service." },
  { id: "contact", title: "13. Contact", content: "For questions about these Terms, contact us at legal@smartlinkpilot.com. Our registered office: Mayobe Bros, Arusha, Tanzania. This document was last updated on March 31, 2026." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Terms of Service</h1>
          <p className="text-blue-100 mb-2">Last updated: March 31, 2026 · Effective: March 31, 2026</p>
          <p className="text-blue-200 text-sm max-w-xl mx-auto">These terms govern your use of SmartLink Pilot. We&apos;ve written them in plain English wherever possible.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sections</h2>
              <nav>
                <ul className="space-y-1">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition truncate">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Legal questions?</p>
                <a href="mailto:legal@smartlinkpilot.com" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline block">legal@smartlinkpilot.com</a>
              </div>
            </div>
          </aside>

          <main className="flex-1 max-w-3xl">
            <div className="space-y-10">
              {sections.map((s, idx) => (
                <ScrollReveal key={s.id} delay={idx * 100}>
                <section id={s.id} className="scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">{s.title}</h2>
                  {s.content && <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{s.content}</p>}
                  {(s as any).intro && <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm mb-4">{(s as any).intro}</p>}
                  {(s as any).list && (
                    <ul className="space-y-2 ml-1">
                      {(s as any).list.map((item: string) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                          <span className="mt-2 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {(s as any).footer && <p className="mt-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">{(s as any).footer}</p>}
                </section>
                </ScrollReveal>
              ))}

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-400 text-center">
                  See also:{" "}
                  <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
                  {" · "}
                  <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">Cookies Policy</Link>
                  {" · "}
                  <Link href="/disclaimer" className="text-blue-600 dark:text-blue-400 hover:underline">Disclaimer</Link>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
