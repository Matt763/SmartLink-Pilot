import { LinkIcon, BarChart2, ShieldCheck, QrCode, Clock, Lock, Globe, Zap, Users, Code, Webhook, Palette } from "lucide-react";

const features = [
  {
    category: "Link Management",
    items: [
      { icon: LinkIcon, title: "Custom Short URLs", desc: "Create branded, memorable short links with custom aliases that boost click-through rates." },
      { icon: QrCode, title: "QR Code Generator", desc: "Generate QR codes for any shortened link — perfect for print media and offline campaigns." },
      { icon: Clock, title: "Link Expiration", desc: "Set auto-expiry dates on links so they stop working after your campaign ends." },
      { icon: Lock, title: "Password Protection", desc: "Secure sensitive links behind a password so only authorized users can access them." },
    ],
  },
  {
    category: "Analytics & Insights",
    items: [
      { icon: BarChart2, title: "Real-Time Analytics", desc: "Track clicks, geographic data, device types, browsers, and referral sources as they happen." },
      { icon: Globe, title: "Geographic Tracking", desc: "See exactly where your audience is clicking from with country-level location data." },
      { icon: Zap, title: "Performance Metrics", desc: "Monitor link performance trends over time with historical data and visual charts." },
      { icon: Users, title: "Audience Insights", desc: "Understand your audience demographics through device and browser analytics." },
    ],
  },
  {
    category: "Developer & Team",
    items: [
      { icon: Code, title: "REST API Access", desc: "Programmatically create and manage short links with our comprehensive API." },
      { icon: Webhook, title: "Webhook Integrations", desc: "Get real-time notifications when links are clicked via webhook callbacks." },
      { icon: ShieldCheck, title: "Enterprise Security", desc: "SOC 2 aligned controls, malicious URL detection, and advanced fraud protection." },
      { icon: Palette, title: "Branded Domains", desc: "Use your own custom domain for short links to maintain consistent branding." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Powerful Features</h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">Everything you need to shorten, manage, and analyze your links — all in one platform.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 space-y-20">
        {features.map((section) => (
          <div key={section.category}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">{section.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item) => (
                <div key={item.title} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-700/40 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
