import Link from "next/link";
import { Cookie, Settings, BarChart2, Shield } from "lucide-react";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Cookies Policy</h1>
          <p className="text-blue-100">Last updated: March 20, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Cookie Types Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {[
            { icon: Shield, title: "Essential Cookies", desc: "Required for authentication, security, and core functionality. Cannot be disabled.", color: "blue" },
            { icon: Settings, title: "Functional Cookies", desc: "Remember your preferences like theme mode (dark/light) and language settings.", color: "purple" },
            { icon: BarChart2, title: "Analytics Cookies", desc: "Help us understand how visitors interact with our platform to improve the experience.", color: "green" },
            { icon: Cookie, title: "Device Cookies", desc: "Anonymous device identifiers used to enforce free trial limits for non-authenticated users.", color: "amber" },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400 mb-4`} />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What Are Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-300">Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 pr-4 text-gray-900 dark:text-white font-bold">Cookie Name</th>
                    <th className="py-3 pr-4 text-gray-900 dark:text-white font-bold">Purpose</th>
                    <th className="py-3 pr-4 text-gray-900 dark:text-white font-bold">Duration</th>
                    <th className="py-3 text-gray-900 dark:text-white font-bold">Type</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300">
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-4 font-mono text-xs">next-auth.session-token</td>
                    <td className="py-3 pr-4">User authentication session</td>
                    <td className="py-3 pr-4">30 days</td>
                    <td className="py-3"><span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">Essential</span></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-4 font-mono text-xs">device_id</td>
                    <td className="py-3 pr-4">Anonymous trial limit tracking</td>
                    <td className="py-3 pr-4">1 year</td>
                    <td className="py-3"><span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-medium">Device</span></td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-4 font-mono text-xs">smartlink-theme</td>
                    <td className="py-3 pr-4">Theme preference (localStorage)</td>
                    <td className="py-3 pr-4">Persistent</td>
                    <td className="py-3"><span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">Functional</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Managing Cookies</h2>
            <p className="text-gray-600 dark:text-gray-300">You can control cookies through your browser settings. Disabling essential cookies may prevent certain features from working correctly. For more information, visit <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">our Privacy Policy</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
