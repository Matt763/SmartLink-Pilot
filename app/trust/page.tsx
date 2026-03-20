import Link from "next/link";
import { Award, BookOpen, Users, Shield, CheckCircle, Globe, Lock, BarChart2 } from "lucide-react";

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-semibold text-sm">E-E-A-T Verified</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Trust & Transparency</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">How SmartLink Pilot earns and maintains your trust through Experience, Expertise, Authoritativeness, and Trustworthiness.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* E-E-A-T Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Experience</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Our platform is built by engineers with decades of combined experience in distributed systems, web performance, and SaaS product development.</p>
            <ul className="space-y-2">
              {["Processing millions of redirects monthly", "Sub-100ms redirect latency globally", "99.99% uptime track record"].map(item => (
                <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-8 rounded-2xl border border-purple-200 dark:border-purple-800">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Expertise</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Our team includes specialists in cybersecurity, data analytics, UX design, and growth marketing — ensuring every aspect of the platform meets professional standards.</p>
            <ul className="space-y-2">
              {["Enterprise-grade encryption (TLS 1.3)", "GDPR and data protection compliant", "Regular third-party security audits"].map(item => (
                <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-8 rounded-2xl border border-green-200 dark:border-green-800">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Authoritativeness</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">SmartLink Pilot is recognized in the URL management industry for its reliability, feature depth, and commitment to user satisfaction.</p>
            <ul className="space-y-2">
              {["Trusted by marketers and developers worldwide", "Transparent pricing with no hidden fees", "Comprehensive documentation and support"].map(item => (
                <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 p-8 rounded-2xl border border-amber-200 dark:border-amber-800">
            <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Trustworthiness</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">We believe in radical transparency. Your data is yours, our policies are clear, and our practices are ethical.</p>
            <ul className="space-y-2">
              {["We never sell user data to third parties", "Passwords hashed with bcrypt (never stored in plaintext)", "Full data export and deletion on request"].map(item => (
                <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Security Practices */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-10 border border-gray-100 dark:border-gray-800 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Our Security Practices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: "End-to-End Encryption", desc: "All data encrypted in transit and at rest" },
              { icon: Shield, title: "SOC 2 Standards", desc: "Security controls aligned with industry best practices" },
              { icon: Users, title: "Access Control", desc: "Role-based permissions with admin oversight" },
              { icon: BarChart2, title: "Monitoring", desc: "24/7 threat detection and anomaly alerts" },
            ].map(item => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Links */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Our Legal Documents</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Cookies Policy", href: "/cookies" },
              { label: "Disclaimer", href: "/disclaimer" },
            ].map(link => (
              <Link key={link.href} href={link.href} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm border border-gray-200 dark:border-gray-700">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
