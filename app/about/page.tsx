"use client";

import Link from "next/link";
import { useRef } from "react";
import { Globe, Shield, Zap, Users, Award, TrendingUp, ArrowRight, CheckCircle, Sparkles, Star } from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";


function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

const milestones = [
  { year: "2024", title: "Founded in Nairobi", desc: "SmartLink Pilot was born from a simple frustration — existing link tools were either too complex or too limited. We set out to build something better." },
  { year: "Q2 2024", title: "First 1,000 Users", desc: "Word spread quickly. Within 3 months of launch, over 1,000 marketers and developers were trusting SmartLink Pilot for their campaigns." },
  { year: "Q3 2024", title: "Analytics Engine Launched", desc: "We shipped our real-time analytics dashboard, giving users country-level click data, device breakdowns, and referral tracking." },
  { year: "Q4 2024", title: "Pro & Enterprise Plans", desc: "Custom aliases, password-protected links, QR code generation, and team workspaces became available to Pro and Enterprise subscribers." },
  { year: "2025", title: "10,000+ Active Users", desc: "Processing over 8 million link redirects monthly with sub-100ms speed, trusted by teams across Africa, Europe, and the Americas." },
  { year: "2026", title: "Mobile App Launch", desc: "Our Android and iOS apps bring the full SmartLink Pilot experience to mobile — including our unique clipboard URL detection feature." },
];

const values = [
  { icon: Zap, title: "Speed Without Compromise", desc: "Every redirect must complete in under 100ms. We obsess over performance because every millisecond impacts your audience's experience. Our global edge network ensures consistent speeds from 200+ locations worldwide.", color: "from-amber-500 to-yellow-500" },
  { icon: Shield, title: "Privacy & Security First", desc: "We never sell user data to advertisers or third parties. Your analytics belong to you. We encrypt all data in transit and at rest, conduct regular security audits, and maintain GDPR-compliant data practices.", color: "from-blue-500 to-indigo-600" },
  { icon: Globe, title: "Built for Global Reach", desc: "SmartLink Pilot powers link sharing across every continent. Our infrastructure is designed to handle millions of concurrent redirects with zero degradation, no matter where your audience is located.", color: "from-green-500 to-emerald-600" },
  { icon: Users, title: "Teams at the Core", desc: "Great products are built by teams, and so are great campaigns. Our collaborative workspace is designed for agencies, marketing teams, and enterprise organizations to manage thousands of links together.", color: "from-purple-500 to-indigo-600" },
  { icon: Award, title: "Uncompromising Quality", desc: "Every feature we ship is tested, polished, and documented before it reaches your dashboard. We believe in doing fewer things better — not shipping half-baked features just to hit a roadmap deadline.", color: "from-rose-500 to-pink-600" },
  { icon: TrendingUp, title: "Data That Drives Decisions", desc: "We provide analytics that actually help you grow — not vanity metrics. Country data, device breakdowns, browser analytics, and referral sources give you a real picture of your audience's behavior.", color: "from-cyan-500 to-blue-600" },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { ref: valuesRef, visibleCount } = useStaggeredAnimation(values.length, 120);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-900 py-28 overflow-hidden" aria-label="About SmartLink Pilot">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
        {/* Animated blobs */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

        <div ref={heroRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-semibold">Est. 2024 — Arusha, Tanzania</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
            Building the Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-300">Link Intelligence</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
            We&apos;re on a mission to make link management effortless, intelligent, and beautifully simple for businesses and creators of every size — anywhere in the world.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "12K+", label: "Active Users" },
              { value: "8.2M", label: "Links Created" },
              { value: "99.99%", label: "Uptime SLA" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-sm text-blue-200 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20" aria-labelledby="our-story">
        <AnimatedSection>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 id="our-story" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-lg">
              SmartLink Pilot was born from a simple frustration: the best marketing tools were either reserved for enterprise companies with six-figure budgets, or too basic to provide real value. Link management — something every marketer, developer, and content creator does every single day — deserved a better solution.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Founded in Arusha, Tanzania in 2024 by Mclean Mbaga and the Mayobe Bros team, SmartLink Pilot started as a weekend project. The goal was simple: build a URL shortener that was fast by default, honest about its data, and priced fairly for creators and growing businesses.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              What we didn&apos;t expect was how quickly it would resonate. Within three months of launching, over 1,000 users had signed up — not because of a viral marketing campaign, but because the product worked. It was fast, it was clean, and it gave people actual data about their audience without hiding key features behind expensive enterprise gates.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Today, SmartLink Pilot processes millions of link redirects monthly, providing real-time analytics across geographies, devices, and referral sources — all while maintaining sub-100ms redirect speeds on our global edge network. We serve marketers managing billion-dollar campaigns alongside individual creators sharing their latest projects.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We believe great tools should be accessible to everyone. That&apos;s why our free tier is genuinely useful, our paid plans are priced for real businesses, and our support team actually responds. We&apos;re not a VC-backed startup optimizing for growth-at-all-costs. We&apos;re a product-focused team that believes in building things that last.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20" aria-labelledby="timeline">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <h2 id="timeline" className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-16">Our Journey</h2>
          </AnimatedSection>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 transform sm:-translate-x-0.5" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <AnimatedSection key={m.year}>
                  <div className={`relative flex items-start sm:items-center gap-6 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                    <div className="flex-1 pl-12 sm:pl-0">
                      <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${i % 2 === 0 ? "sm:mr-8" : "sm:ml-8"}`}>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{m.year}</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">{m.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                    <div className="absolute left-0 sm:relative sm:left-auto flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 border-2 border-white dark:border-gray-900">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="hidden sm:block flex-1" />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20" aria-labelledby="our-values">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 id="our-values" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Drives Everything We Do</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Our values aren&apos;t just words on a wall — they&apos;re decisions we make every day when we choose what to build, how to price it, and how to treat our users.</p>
            </div>
          </AnimatedSection>
          <div ref={valuesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${i < visibleCount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${v.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{v.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20" aria-labelledby="our-promise">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 id="our-promise" className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Promise to You</h2>
              <p className="text-blue-100 max-w-2xl mx-auto">We hold ourselves to a high standard. Here&apos;s what you can always expect from SmartLink Pilot:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Our free tier will always be genuinely useful — not a bait-and-switch",
                "We will never sell your data to advertisers or third parties",
                "We will be transparent about outages and service disruptions",
                "Our analytics data belongs to you — exportable at any time",
                "We will respond to every support ticket within 24 hours",
                "We will give 30 days notice before any significant price changes",
              ].map((p) => (
                <div key={p} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white/90 text-sm leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" aria-labelledby="about-cta">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto px-4">
            <h2 id="about-cta" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to join us?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Start free — no credit card required. Join 12,000+ professionals who trust SmartLink Pilot every day.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link href="/team" className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                Meet the Team
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
