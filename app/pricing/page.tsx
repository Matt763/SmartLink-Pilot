"use client";

import { useState } from "react";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { useSession } from "next-auth/react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Perfect for personal projects and getting started.",
    icon: Zap,
    featured: false,
    badge: null,
    cta: "Current Plan",
    ctaDisabled: true,
    features: [
      "Up to 15 links/month",
      "Basic click analytics",
      "Standard short URLs",
      "Community support",
      "7-day analytics history",
    ],
    excluded: [
      "Custom URL aliases",
      "QR code generator",
      "Password-protected links",
      "Link expiration",
      "API access",
    ],
  },
  {
    name: "Pro",
    price: "$6.99",
    period: "/mo",
    description: "For creators and marketers who need more power.",
    icon: Sparkles,
    featured: true,
    badge: "Most Popular",
    cta: "Upgrade to Pro",
    ctaDisabled: false,
    priceId: "price_pro_monthly",
    features: [
      "Unlimited short links",
      "Custom URL aliases",
      "Advanced analytics (geo, device, referrer)",
      "QR code generator",
      "Password-protected links",
      "Link expiration controls",
      "90-day analytics history",
      "Priority email support",
    ],
    excluded: [
      "API access",
      "Team workspaces",
      "Dedicated account manager",
    ],
  },
  {
    name: "Enterprise",
    price: "$12.99",
    period: "/mo",
    description: "For teams and businesses that need the full suite.",
    icon: Crown,
    featured: false,
    badge: "Best Value",
    cta: "Go Enterprise",
    ctaDisabled: false,
    priceId: "price_enterprise_monthly",
    features: [
      "Everything in Pro",
      "Full API access (10,000 req/day)",
      "Team workspaces (up to 10 members)",
      "Branded link domains",
      "Bulk link creation",
      "Webhook integrations",
      "Unlimited analytics history",
      "Advanced fraud protection",
      "Dedicated account manager",
      "24/7 priority support",
    ],
    excluded: [],
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const subscribe = async (priceId: string) => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setLoading(priceId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error initiating checkout");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Start free, upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                  plan.featured
                    ? "bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-700 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/5 md:scale-105 z-10"
                    : "bg-white/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:shadow-lg"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`text-center py-2 text-xs font-bold tracking-wider uppercase ${
                    plan.featured
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.featured
                        ? "bg-indigo-100 dark:bg-indigo-900/30"
                        : plan.name === "Enterprise"
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        plan.featured
                          ? "text-indigo-600 dark:text-indigo-400"
                          : plan.name === "Enterprise"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-600 dark:text-gray-400"
                      }`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{plan.description}</p>

                  {/* CTA */}
                  <button
                    onClick={() => plan.priceId && subscribe(plan.priceId)}
                    disabled={plan.ctaDisabled || loading === plan.priceId}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all mb-8 ${
                      plan.featured
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
                        : plan.name === "Enterprise"
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading === plan.priceId ? "Processing..." : plan.cta}
                  </button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          plan.featured
                            ? "text-indigo-600 dark:text-indigo-400"
                            : plan.name === "Enterprise"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-green-500"
                        }`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                    {plan.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-3 opacity-40">
                        <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center text-gray-400 text-xs">—</span>
                        <span className="text-sm text-gray-400 line-through">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Note */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            All plans include SSL encryption, 99.99% uptime SLA, and GDPR compliance.
            <br />
            Questions? <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Contact our team</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
