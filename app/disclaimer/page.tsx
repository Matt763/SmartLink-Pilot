import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Disclaimer</h1>
          <p className="text-blue-100">Last updated: March 20, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300">The information provided by SmartLink Pilot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) on our platform is for general informational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, or completeness of any information on the platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">External Links Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300">SmartLink Pilot may contain links (shortened or otherwise) to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites. The inclusion of any links does not imply endorsement or recommendation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User-Generated Content</h2>
            <p className="text-gray-600 dark:text-gray-300">Users create shortened links to external destinations. SmartLink Pilot does not control and is not responsible for the content, privacy policies, or practices of any third-party websites linked through our service. We actively monitor for malicious content and reserve the right to disable any link that violates our Acceptable Use Policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Accuracy</h2>
            <p className="text-gray-600 dark:text-gray-300">While we strive to provide accurate analytics data, click counts, geographic data, and device information are approximations. Factors such as VPN usage, browser privacy settings, and bot traffic may affect the accuracy of reported metrics.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Availability</h2>
            <p className="text-gray-600 dark:text-gray-300">We aim for maximum uptime but cannot guarantee uninterrupted service. Scheduled maintenance, unexpected outages, or force majeure events may temporarily affect service availability.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Professional Advice</h2>
            <p className="text-gray-600 dark:text-gray-300">Nothing on this platform constitutes professional legal, financial, or technical advice. For specific concerns, consult a qualified professional.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">If you have questions about this Disclaimer, please <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact us</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
