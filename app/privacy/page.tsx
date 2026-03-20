import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: March 20, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300">SmartLink Pilot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our URL shortening and analytics platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4">2.1 Account Information</h3>
            <p className="text-gray-600 dark:text-gray-300">When you create an account, we collect your email address, name, and authentication credentials. If you sign in via Google OAuth, we receive your public profile information.</p>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4">2.2 Usage Data</h3>
            <p className="text-gray-600 dark:text-gray-300">We automatically collect information about how shortened links are accessed, including IP addresses (anonymized), browser type, device type, operating system, referrer URLs, and geographic location (country-level only).</p>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4">2.3 Device Identifiers</h3>
            <p className="text-gray-600 dark:text-gray-300">For anonymous users on our free trial, we generate a random device identifier stored in an HTTP-only cookie to enforce usage limits. This identifier is not linked to any personally identifiable information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>To provide, operate, and maintain our services</li>
              <li>To generate analytics and reports for link creators</li>
              <li>To process payments and manage subscriptions</li>
              <li>To communicate with you about service updates</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">4. Data Sharing</h2>
            <p className="text-gray-600 dark:text-gray-300">We do not sell your personal data. We may share information with:</p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Service providers:</strong> Stripe for payment processing, hosting providers for infrastructure</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">5. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300">We implement industry-standard security measures including encryption in transit (TLS/SSL), encrypted storage for sensitive data (bcrypt for passwords), secure HTTP-only cookies, and regular security audits.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">6. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300">Depending on your jurisdiction, you may have the right to: access your personal data, request correction or deletion, object to processing, data portability, and withdraw consent. Contact us at <strong>privacy@smartlinkpilot.com</strong> to exercise your rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">7. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300">We retain your account data for as long as your account is active. Analytics data is retained for 24 months. You may request deletion of your data at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">8. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300">For privacy-related inquiries, contact us at <strong>privacy@smartlinkpilot.com</strong> or visit our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
