"use client";

import Link from "next/link";
import { Linkedin, Twitter, ArrowRight, Star, Briefcase, Users } from "lucide-react";
import { useStaggeredAnimation } from "@/hooks/useScrollAnimation";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = { ref: null as any, isVisible: true }; // SSR compat — replaced by hook on client
  return <div className={className}>{children}</div>;
}

const team = [
  {
    name: "Mclean Mbaga",
    role: "Founder & CEO",
    initials: "MM",
    image: "/team/mclean.png",
    gradient: "from-blue-500 to-purple-600",
    bio: "Visionary full-stack engineer and serial entrepreneur based in Arusha, Tanzania. Mclean built SmartLink Pilot after years of working with marketing teams who needed better link intelligence tools. He leads product strategy, engineering architecture, and business development.",
    expertise: ["Full-Stack Engineering", "SaaS Architecture", "Product Strategy", "Business Development"],
    social: { linkedin: "#", twitter: "#" },
    fact: "Built the first SmartLink prototype in a single weekend.",
  },
  {
    name: "Aisha Wanjiru",
    role: "Head of Product",
    initials: "AW",
    image: "/team/amina.png",
    gradient: "from-pink-500 to-rose-600",
    bio: "Product strategist with 8+ years of experience shipping delightful user experiences at scale across FinTech, EdTech, and SaaS companies. Aisha owns the product roadmap and ensures every feature we ship solves a real user problem — not just a cool engineering challenge.",
    expertise: ["Product Management", "User Research", "Data Analysis", "Roadmap Strategy"],
    social: { linkedin: "#", twitter: "#" },
    fact: "Reduced user churn by 40% by redesigning the onboarding flow.",
  },
  {
    name: "Wei Chen",
    role: "Lead Engineer",
    initials: "WC",
    image: "/team/james.png",
    gradient: "from-cyan-500 to-blue-600",
    bio: "Systems architect with deep expertise in high-performance distributed systems, real-time data pipelines, and edge computing. Wei designed SmartLink Pilot's sub-100ms redirect infrastructure and oversees all backend engineering.",
    expertise: ["Distributed Systems", "Edge Computing", "Real-Time Analytics", "Database Architecture"],
    social: { linkedin: "#", twitter: "#" },
    fact: "Reduced average redirect latency from 250ms to under 47ms.",
  },
  {
    name: "Fatima Al-Rashid",
    role: "Head of Design",
    initials: "FA",
    image: "/team/grace.png",
    gradient: "from-amber-500 to-orange-600",
    bio: "Award-winning product designer creating beautiful, accessible interfaces that users genuinely love. Fatima leads all UX/UI decisions — from the information architecture of our dashboard to the micro-animations that make interactions feel alive.",
    expertise: ["UX/UI Design", "Design Systems", "Accessibility", "Motion Design"],
    social: { linkedin: "#", twitter: "#" },
    fact: "Our design system has reduced new feature dev time by 35%.",
  },
  {
    name: "Carlos Rivera",
    role: "DevOps & Infrastructure Lead",
    initials: "CR",
    image: "/team/david.png",
    gradient: "from-green-500 to-emerald-600",
    bio: "Infrastructure expert with a decade of experience maintaining 99.99%+ uptime for high-traffic web applications. Carlos manages our global edge network, CI/CD pipelines, security monitoring, and disaster recovery systems.",
    expertise: ["Cloud Infrastructure", "Kubernetes", "Security Operations", "Performance Monitoring"],
    social: { linkedin: "#", twitter: "#" },
    fact: "Set up our alerting system that catches issues before users notice.",
  },
  {
    name: "Emma Lindström",
    role: "Marketing Director",
    initials: "EL",
    image: "/team/sarah.png",
    gradient: "from-purple-500 to-indigo-600",
    bio: "Growth specialist and data-driven marketer who has scaled SaaS products from zero to tens of thousands of users. Emma leads all growth experiments, content strategy, SEO, and partnership development for SmartLink Pilot.",
    expertise: ["Growth Marketing", "SEO & Content", "Paid Acquisition", "Partnership Development"],
    social: { linkedin: "#", twitter: "#" },
    fact: "Grew organic traffic 380% in 6 months through content strategy.",
  },
];

export default function TeamPage() {
  const { ref: gridRef, visibleCount } = useStaggeredAnimation(team.length, 150);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden" aria-label="Our Team">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 dark:from-indigo-800 dark:via-purple-900 dark:to-indigo-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
            <Users className="w-4 h-4 text-indigo-200" />
            <span className="text-white/90 text-sm font-semibold">{team.length} people. 1 mission.</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
            The Team Behind<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">SmartLink Pilot</span>
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            We&apos;re a diverse team of engineers, designers, and marketers united by a single mission: making link management smarter, faster, and more accessible for everyone.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20" aria-labelledby="team-members">
        <h2 id="team-members" className="sr-only">Team Members</h2>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <article
              key={member.name}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 ${i < visibleCount ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 bg-gradient-to-r ${member.gradient}`} />

              <div className="p-8">
                {/* Avatar */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-xl font-black shadow-lg flex-shrink-0`}>
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.initials
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${member.gradient}`}>{member.role}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{member.bio}</p>

                {/* Expertise */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase size={11} /> Expertise
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.expertise.map((e) => (
                      <span key={e} className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fun fact */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-3 mb-5 border border-indigo-100 dark:border-indigo-800/30">
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    <span className="font-bold">Fun fact:</span> {member.fact}
                  </p>
                </div>

                {/* Social */}
                <div className="flex gap-2">
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-xs font-medium">
                    <Linkedin size={13} /> LinkedIn
                  </a>
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-xs font-medium">
                    <Twitter size={13} /> Twitter
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20" aria-labelledby="join-team">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 id="join-team" className="text-3xl font-bold text-white mb-4">Want to join the team?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">We&apos;re a small, ambitious team that moves fast and ships quality. If you love building things that matter, we&apos;d love to hear from you.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition shadow-xl shadow-indigo-900/20 hover:scale-105">
            Get in Touch <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
