import Link from "next/link";
import { Globe, Shield, Zap, Users, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6bTAtNHYySDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">About SmartLink Pilot</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            We&apos;re on a mission to make link management effortless, intelligent, and beautifully simple for businesses of every size.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            SmartLink Pilot was born from a simple frustration: link management tools were either too complex for small teams or too limited for growing businesses. We set out to build a platform that combines enterprise-grade analytics with the simplicity of a consumer product.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Founded in 2024, we&apos;ve grown from a side project into a full-featured SaaS platform trusted by marketers, developers, and content creators worldwide. Our focus has always been on delivering clean, actionable data that helps our users make smarter decisions about their digital presence.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Today, SmartLink Pilot processes millions of link redirects monthly, providing real-time analytics across geographies, devices, and referral sources — all while maintaining sub-100ms redirect speeds.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gray-50 dark:bg-gray-900 py-20 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-16">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Zap, title: "Speed First", desc: "Every redirect completes in under 100ms. Performance is non-negotiable." },
              { icon: Shield, title: "Privacy Focused", desc: "We never sell user data. Analytics are for our users, not advertisers." },
              { icon: Globe, title: "Global Reach", desc: "Built on edge infrastructure for consistent speed worldwide." },
              { icon: Users, title: "Team Friendly", desc: "Collaborative workspaces designed for teams of all sizes." },
              { icon: Award, title: "Quality Obsessed", desc: "Every feature is polished until it feels effortless to use." },
              { icon: TrendingUp, title: "Data Driven", desc: "Real-time insights that actually help you grow your traffic." },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Join thousands of professionals who trust SmartLink Pilot for their link management needs.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/25">
          Start Free Today
        </Link>
      </div>
    </div>
  );
}
