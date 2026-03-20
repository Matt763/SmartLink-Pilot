"use client";

import Link from 'next/link';
import { ArrowRight, LinkIcon, BarChart2, ShieldCheck, Copy, Check, AlertCircle, Sparkles, Globe, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SpiderWeb } from '@/components/SpiderWeb';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [history, setHistory] = useState<{original: string, short: string}[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('smartlink_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: url })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.code === 'LIMIT_REACHED') {
          setLimitReached(true);
        } else {
          setError(data.error || 'Failed to shorten URL');
        }
      } else {
        const newHistory = [{ original: url, short: data.shortUrl }, ...history].slice(0, 3);
        setHistory(newHistory);
        localStorage.setItem('smartlink_history', JSON.stringify(newHistory));
        setUrl('');
      }
    } catch (err) {
      setError('A network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero with Spider Web */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-blue-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Spider Web Canvas */}
        <div className="absolute inset-0">
          <SpiderWeb />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Trusted by 10,000+ marketers</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 dark:text-white">
            Shorten. Share.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
              Analyze.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            The ultimate SaaS platform to manage your branded links, track global analytics, and boost your marketing campaigns to the next level.
          </p>
          
          {/* URL Shortener Widget */}
          <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-200/50 dark:border-gray-700/50 mb-12">
            {!limitReached ? (
              <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste your long link here..."
                    className="block w-full pl-11 pr-4 py-4 text-base border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base rounded-xl transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                >
                  {loading ? 'Shortening...' : 'Shorten Free'}
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">Free Trial Limit Reached!</h3>
                <p className="text-amber-700 dark:text-amber-300 mb-6">You have used your 3 free short links on this device. Create an account to continue.</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition shadow-sm">
                  Create Free Account <ArrowRight size={18} />
                </Link>
              </div>
            )}
            
            {error && <p className="text-red-500 dark:text-red-400 mt-4 text-left font-medium">{error}</p>}
            
            {history.length > 0 && (
              <div className="mt-6 text-left border-t border-gray-100 dark:border-gray-700 pt-6">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Your Recent Links</h4>
                <ul className="space-y-2">
                  {history.map((item, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition">
                      <span className="truncate text-gray-500 dark:text-gray-400 text-sm w-full sm:max-w-xs">{item.original}</span>
                      <div className="flex items-center justify-end gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
                        <a href={item.short} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-purple-600 dark:hover:text-purple-400 truncate flex-1 text-right transition text-sm">
                          {item.short}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.short)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg shadow-sm transition flex-shrink-0"
                          title="Copy Link"
                        >
                          {copied === item.short ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 sm:gap-16 flex-wrap text-center">
            {[
              { value: "10M+", label: "Links Shortened" },
              { value: "99.99%", label: "Uptime" },
              { value: "< 100ms", label: "Redirect Speed" },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything you need</h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Discover why thousands of marketers trust SmartLink Pilot for their critical campaigns.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: LinkIcon, title: "Custom Aliases", desc: "Create recognizable, branded short links that drive higher click-through rates and build brand trust.", color: "blue" },
              { icon: BarChart2, title: "Deep Analytics", desc: "Track clicks, geographic locations, browsers, and referring sources in real time with beautiful charts.", color: "purple" },
              { icon: ShieldCheck, title: "Enterprise Security", desc: "Password protection, link expiration, and intelligent malicious URL routing blocks built into the core.", color: "green" },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 bg-${f.color}-100 dark:bg-${f.color}-900/20 rounded-2xl flex items-center justify-center mb-6`}>
                  <f.icon className={`w-7 h-7 text-${f.color}-600 dark:text-${f.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 block">Trusted by 12,000+ professionals</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Loved by marketers worldwide</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">See why top brands, creators, and marketers choose SmartLink Pilot to power their link strategy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Mitchell", role: "Marketing Director, ScaleUp Inc.", text: "SmartLink Pilot transformed our campaign tracking. We saw a 340% increase in click-through rates just by using branded short links. The analytics are incredibly detailed and actionable.", stars: 5, avatar: "SM" },
              { name: "David Chen", role: "Growth Lead, TechNova", text: "We switched from Bitly and never looked back. The API is lightning fast, the dashboard is gorgeous, and the pricing is unbeatable. Our team processes 50K+ links monthly with zero issues.", stars: 5, avatar: "DC" },
              { name: "Amara Okafor", role: "Content Creator, 2.1M followers", text: "As a content creator, every link matters. SmartLink Pilot gives me custom branded URLs that look professional and build trust with my audience. My link engagement went up by 280%!", stars: 5, avatar: "AO" },
              { name: "James Rodriguez", role: "CEO, E-Commerce Solutions", text: "The Enterprise plan pays for itself within a week. Team workspaces, branded domains, and webhook integrations made our workflow seamless. Customer support is also world-class.", stars: 5, avatar: "JR" },
              { name: "Priya Sharma", role: "Digital Strategist, AdAgency360", text: "I've tried every URL shortener on the market. SmartLink Pilot stands out for its speed, reliability, and the sheer depth of analytics. It's become indispensable to our client campaigns.", stars: 5, avatar: "PS" },
              { name: "Alex Thompson", role: "Freelance Developer", text: "The free tier is genuinely useful — no hidden limitations that force you to upgrade. When I did upgrade to Pro, the custom aliases and QR codes took my portfolio links to the next level.", stars: 5, avatar: "AT" },
            ].map((t) => (
              <div key={t.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof Stats */}
      <div className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "12K+", label: "Active Users", sub: "Growing 40% monthly" },
              { num: "8.2M", label: "Links Created", sub: "And counting..." },
              { num: "99.99%", label: "Uptime SLA", sub: "Enterprise-grade reliability" },
              { num: "<47ms", label: "Redirect Speed", sub: "Faster than any competitor" },
            ].map((s) => (
              <div key={s.label} className="group">
                <p className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">{s.num}</p>
                <p className="text-sm font-semibold text-white/90">{s.label}</p>
                <p className="text-xs text-white/60 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why SmartLink Pilot */}
      <div className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-3 block">Why professionals choose us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Built for performance. Designed for scale.</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Every click matters. SmartLink Pilot is engineered from the ground up to deliver the fastest, most reliable, and most intelligent link management experience on the market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: "⚡", title: "Blazing Fast Redirects", desc: "Our global CDN ensures sub-50ms redirects from 200+ edge locations. Your audience never waits, no matter where they are in the world." },
              { icon: "🔒", title: "Enterprise-Grade Security", desc: "SSL encryption, GDPR compliance, SOC 2 readiness, and built-in malicious URL detection keep your brand safe and your data protected." },
              { icon: "📊", title: "Deep, Actionable Analytics", desc: "Go beyond basic click counts. Track geographic data, device types, referral sources, and conversion patterns — all in real-time." },
              { icon: "🎨", title: "Fully Branded Experience", desc: "Custom domains, branded aliases, and white-label QR codes ensure every touchpoint reflects your brand identity perfectly." },
              { icon: "🔗", title: "Powerful API & Integrations", desc: "RESTful API with comprehensive documentation. Integrate with Zapier, Slack, Salesforce, HubSpot, and 1,000+ other tools effortlessly." },
              { icon: "💎", title: "Transparent, Fair Pricing", desc: "No hidden fees, no surprise charges. Our generous free tier gives you real value, and paid plans scale with your business growth." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition group">
                <div className="text-2xl flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 text-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Ready to supercharge your links?</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-3">Join 12,000+ marketers, developers, and creators who trust SmartLink Pilot to grow their business.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Start free • No credit card required • Upgrade anytime</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-105">
              Get Started Free →
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              Compare Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 dark:bg-black text-white border-t border-gray-800">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </div>
                <span className="text-xl font-extrabold tracking-tight">SmartLink <span className="text-sm font-bold text-gray-500">Pilot</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                The most trusted URL shortener for marketers, developers, and content creators worldwide.
              </p>
              <div className="flex gap-3">
                {["twitter", "github", "linkedin"].map(social => (
                  <button key={social} className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition">
                    <span className="text-xs font-bold uppercase">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sm text-gray-200 uppercase tracking-wider mb-5">Product</h4>
              <ul className="space-y-3">
                {[
                  { label: "Pricing", href: "/pricing" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Features", href: "/features" },
                  { label: "Analytics", href: "/features" },
                ].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-gray-400 hover:text-white text-sm transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm text-gray-200 uppercase tracking-wider mb-5">Company</h4>
              <ul className="space-y-3">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Our Team", href: "/team" },
                  { label: "Contact", href: "/contact" },
                  { label: "Trust & E-E-A-T", href: "/trust" },
                ].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-gray-400 hover:text-white text-sm transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm text-gray-200 uppercase tracking-wider mb-5">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookies Policy", href: "/cookies" },
                  { label: "Disclaimer", href: "/disclaimer" },
                ].map(l => (
                  <li key={l.label}><Link href={l.href} className="text-gray-400 hover:text-white text-sm transition">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">© 2026 SmartLink Pilot. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-xs">All systems operational</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Globe className="w-3.5 h-3.5" />
                <span>Global CDN</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Zap className="w-3.5 h-3.5" />
                <span>&lt;100ms</span>
              </div>
            </div>
          </div>
          <div className="text-center pb-4">
            <p className="text-gray-500 text-xs">Made With ❤️ By Mayobe Bros</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
