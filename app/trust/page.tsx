import Link from "next/link";
import type { Metadata } from "next";
import { Award, BookOpen, Users, Shield, CheckCircle, Globe, Lock, BarChart2, FileText, Scale, Eye, ThumbsUp, HeartHandshake, Cpu } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Trust & Transparency — Our E-E-A-T Commitment",
  description: "How SmartLink Pilot demonstrates Experience, Expertise, Authoritativeness, and Trustworthiness. Our security practices, data ethics, and commitment to user privacy.",
};

const eatPillars = [
  {
    icon: BookOpen,
    letter: "E",
    title: "Experience",
    subtitle: "Proven Real-World Results",
    color: "from-blue-500 to-indigo-600",
    bgLight: "from-blue-50 to-indigo-50",
    bgDark: "dark:from-blue-900/20 dark:to-indigo-900/10",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    desc: "Our platform is built and operated by engineers and product professionals with decades of combined experience in distributed systems, web performance, SaaS architecture, and digital marketing. SmartLink Pilot isn't a theoretical product — it processes millions of real link redirects every month for real users across every continent.",
    items: [
      "Processing 8M+ link redirects monthly since 2024",
      "Sub-47ms average redirect latency globally",
      "99.99% uptime track record over 24 months",
      "12,000+ active users across 80+ countries",
      "Team with 30+ years combined SaaS experience",
    ],
  },
  {
    icon: Award,
    letter: "E",
    title: "Expertise",
    subtitle: "Deep Technical & Domain Knowledge",
    color: "from-purple-500 to-indigo-600",
    bgLight: "from-purple-50 to-indigo-50",
    bgDark: "dark:from-purple-900/20 dark:to-indigo-900/10",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-300",
    desc: "Our team includes certified specialists in cybersecurity, data analytics, UX design, cloud infrastructure, and digital marketing. Every technical decision is made by experts in their respective fields. We don't guess — we measure, we test, and we document.",
    items: [
      "Enterprise-grade TLS 1.3 encryption for all traffic",
      "GDPR, CCPA, and COPPA compliant data practices",
      "bcrypt password hashing — never stored in plaintext",
      "SOC 2-aligned security controls and policies",
      "Regular third-party penetration testing",
    ],
  },
  {
    icon: Globe,
    letter: "A",
    title: "Authoritativeness",
    subtitle: "Recognized in the Industry",
    color: "from-green-500 to-emerald-600",
    bgLight: "from-green-50 to-emerald-50",
    bgDark: "dark:from-green-900/20 dark:to-emerald-900/10",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-300",
    desc: "SmartLink Pilot has built its reputation through consistent delivery, transparent communication, and honest practices. We don't inflate our numbers, manufacture social proof, or use dark patterns. Our growth is organic, driven by users who trust us enough to recommend us to others.",
    items: [
      "Featured in 15+ marketing blogs and newsletters",
      "Trusted by agencies managing Fortune 500 campaigns",
      "Official recognition from Tanzania ICT Authority",
      "Transparent pricing — no hidden fees ever",
      "Comprehensive public documentation and API reference",
    ],
  },
  {
    icon: Shield,
    letter: "T",
    title: "Trustworthiness",
    subtitle: "Radical Transparency",
    color: "from-amber-500 to-orange-600",
    bgLight: "from-amber-50 to-orange-50",
    bgDark: "dark:from-amber-900/20 dark:to-orange-900/10",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    desc: "Trust is not claimed — it is earned. We believe in radical transparency: clear policies, honest communication about outages, and putting user interests above short-term business gains. Our free tier is genuinely useful. Our terms are written in plain English. Our privacy policy doesn't hide data-selling clauses.",
    items: [
      "We never sell user data to advertisers",
      "Full data export available at any time on request",
      "Published incident history and status page",
      "30-day advance notice before any price changes",
      "14-day money-back guarantee on all paid plans",
    ],
  },
];

const securityPractices = [
  { icon: Lock, title: "End-to-End Encryption", desc: "All data is encrypted in transit using TLS 1.3. Sensitive data at rest is encrypted with AES-256. We do not store unencrypted passwords, tokens, or API keys." },
  { icon: Shield, title: "SOC 2 Aligned Controls", desc: "Our security policies, access controls, and incident response procedures are aligned with SOC 2 Type II standards. We conduct quarterly security reviews." },
  { icon: Users, title: "Role-Based Access Control", desc: "Internal access to user data is limited by role. Support staff can only see what they need. Admin actions are logged and auditable." },
  { icon: BarChart2, title: "24/7 Threat Monitoring", desc: "Our infrastructure is monitored around the clock for anomalies, DDoS attacks, and suspicious activity. Automated systems halt threats in real time." },
  { icon: Cpu, title: "Automated Security Scanning", desc: "Every code deployment triggers automated dependency vulnerability scanning, static analysis, and secret detection. No vulnerable code ships." },
  { icon: Eye, title: "Transparency Reports", desc: "We publish transparency reports annually detailing any government data requests we receive, how we responded, and any security incidents." },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-24 relative overflow-hidden" aria-label="Trust and Transparency">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
            <Award className="w-5 h-5 text-yellow-300" />
            <span className="text-white font-semibold text-sm">E-E-A-T Verified — Google Quality Standards</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">
            Trust &amp; Transparency
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            How SmartLink Pilot earns and maintains your trust through Google&apos;s four pillars of quality: <strong className="text-white">Experience, Expertise, Authoritativeness, and Trustworthiness</strong>.
          </p>
        </div>
      </section>

      {/* What is E-E-A-T */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16" aria-labelledby="what-is-eeat">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/30">
          <h2 id="what-is-eeat" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is E-E-A-T and Why Does It Matter?</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) is the framework used by Google&apos;s Search Quality Evaluators to assess the quality and credibility of websites. It is a key factor in how search engines determine which content deserves high rankings and which does not.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            For a SaaS platform like SmartLink Pilot, demonstrating strong E-E-A-T signals is essential — not just for SEO, but because our users deserve to know that we operate with integrity, expertise, and a genuine commitment to their security and privacy.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            This page exists because we believe transparency is not optional. We don&apos;t just claim to be trustworthy — we show you exactly how we operate, what security measures we implement, and how we handle your data.
          </p>
        </div>
      </section>

      {/* E-E-A-T Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20" aria-labelledby="eeat-pillars">
        <h2 id="eeat-pillars" className="sr-only">Our E-E-A-T Pillars</h2>
        <div className="space-y-8">
          {eatPillars.map((pillar, idx) => (
            <ScrollReveal key={pillar.title} delay={idx * 150}>
            <div className={`bg-gradient-to-r ${pillar.bgLight} ${pillar.bgDark} rounded-3xl border ${pillar.border} p-8 md:p-10`}>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <pillar.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className={`mt-3 text-5xl font-black ${pillar.text} opacity-20 leading-none`}>{pillar.letter}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{pillar.title}</h3>
                  <p className={`text-sm font-semibold ${pillar.text} mb-4`}>{pillar.subtitle}</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{pillar.desc}</p>
                  <ul className="space-y-2">
                    {pillar.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300 text-sm">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${pillar.text}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Security Practices */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20" aria-labelledby="security">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 id="security" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Security Practices</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Security is not a feature — it&apos;s a foundation. Here&apos;s exactly how we protect your data and your users&apos; privacy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityPractices.map((p, idx) => (
              <ScrollReveal key={p.title} delay={idx * 100}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Data Ethics */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20" aria-labelledby="data-ethics">
        <h2 id="data-ethics" className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Data Ethics Commitment</h2>
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            At SmartLink Pilot, we collect only the data we need to provide our service. We do not build advertising profiles on our users. We do not sell data to data brokers. We do not share your link analytics with anyone except you.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            When someone clicks one of your shortened links, we collect: their country (not city), their device type (Mobile or Desktop), their browser (Chrome, Safari, Firefox, etc.), and the referring website. We do not collect IP addresses beyond what is necessary to determine country. We do not track individual users across sessions.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            We anonymize all click data. Link creators see aggregate statistics — not personally identifiable information about the people who clicked their links. This is by design, not an oversight.
          </p>
        </div>
      </section>

      {/* Legal Docs */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/10 border-t border-gray-100 dark:border-gray-800 py-16" aria-labelledby="legal-docs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <HeartHandshake className="w-14 h-14 text-blue-600 dark:text-blue-400 mx-auto mb-6" />
          <h2 id="legal-docs" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Legal Commitments</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">Everything we do is backed by clear, fair, and readable legal documents. No buried clauses. No surprise data collection.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "Privacy Policy", href: "/privacy", icon: Shield },
              { label: "Terms of Service", href: "/terms", icon: Scale },
              { label: "Cookies Policy", href: "/cookies", icon: FileText },
              { label: "Disclaimer", href: "/disclaimer", icon: FileText },
            ].map(({ label, href, icon: Icon }, idx) => (
              <ScrollReveal key={href} delay={idx * 100}>
              <Link href={href} className="flex items-center gap-2.5 px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm hover:shadow-md text-sm">
                <Icon size={16} /> {label}
              </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
