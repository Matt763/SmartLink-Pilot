import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Terms and Conditions</h1>
          <p className="text-blue-100">Last updated: March 20, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">By accessing or using SmartLink Pilot (&quot;Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-gray-300">SmartLink Pilot provides URL shortening, link management, and analytics services. We offer both free and premium subscription tiers with varying feature sets.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. User Accounts</h2>
            <p className="text-gray-600 dark:text-gray-300">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. You must be at least 16 years old to create an account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Acceptable Use</h2>
            <p className="text-gray-600 dark:text-gray-300">You agree not to use SmartLink Pilot to:</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Create links to malware, phishing sites, or other malicious content</li>
              <li>Distribute spam or engage in unsolicited advertising</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to bypass usage limits or access controls</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Subscriptions and Payments</h2>
            <p className="text-gray-600 dark:text-gray-300">Premium subscriptions are billed monthly via Stripe. You may cancel at any time; access continues until the end of the billing period. Refunds are handled on a case-by-case basis within 14 days of purchase.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300">All content, features, and functionality of SmartLink Pilot are owned by us and protected by international copyright, trademark, and other intellectual property laws. You retain ownership of the URLs you shorten.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300">SmartLink Pilot is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Termination</h2>
            <p className="text-gray-600 dark:text-gray-300">We reserve the right to suspend or terminate your account if you violate these Terms. Upon termination, your right to use the Service ceases immediately, though we may retain certain data as required by law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">9. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. We will notify users of material changes via email.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">10. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">For questions about these Terms, contact us at <strong>legal@smartlinkpilot.com</strong> or visit our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
