"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, Send, CheckCircle, Phone, MessageCircle, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const faqs = [
  { q: "How do I upgrade from Free to Pro?", a: "Simply go to Pricing in your navigation, click 'Get Pro', and complete the checkout. Your account upgrades instantly. You keep all your existing links." },
  { q: "Can I use a custom domain with my short links?", a: "Yes! Custom domains are available on the Pro and Enterprise plans. After upgrading, you can connect your own domain through the Dashboard → Settings → Custom Domain section." },
  { q: "How does the free trial work?", a: "You can shorten up to 3 links without creating an account. After that, you'll be prompted to sign up for a free account, which gives you 15 links per month with 7-day analytics history." },
  { q: "Is there a refund policy?", a: "Yes. If you're not satisfied within 14 days of your first subscription payment, contact us and we'll issue a full refund — no questions asked." },
  { q: "Do you have an API for developers?", a: "Yes! We provide a RESTful API. Generate your API key from Dashboard → Settings → API Access. Full documentation is available in the Dev section of our dashboard." },
  { q: "What happens to my links if I cancel my subscription?", a: "Your links remain active. You'll simply lose access to Pro features (custom aliases, QR codes, etc.). Links created with custom aliases continue to redirect. You can downgrade, pause, or delete at any time." },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "general", message: "" });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const update = (field: string, val: string) => {
    setForm({ ...form, [field]: val });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 py-24 relative overflow-hidden" aria-label="Contact SmartLink Pilot">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
            <MessageCircle className="w-4 h-4 text-blue-200" />
            <span className="text-white/90 text-sm font-semibold">We respond within 24 hours</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Whether you have a question about features, pricing, need a demo, or just want to say hello — our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Cards + Form */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
            {[
              { icon: Mail, title: "Email Support", detail: "support@smartlinkpilot.com", sub: "General enquiries & help", href: "mailto:support@smartlinkpilot.com" },
              { icon: Mail, title: "Business & Sales", detail: "sales@smartlinkpilot.com", sub: "Enterprise plans & partnerships", href: "mailto:sales@smartlinkpilot.com" },
              { icon: Mail, title: "Privacy & Legal", detail: "legal@smartlinkpilot.com", sub: "Data requests & legal matters", href: "mailto:legal@smartlinkpilot.com" },
              { icon: MapPin, title: "Our Office", detail: "Arusha, Tanzania", sub: "East Africa Technology Hub", href: "#" },
              { icon: Clock, title: "Support Hours", detail: "Mon–Fri, 9AM–6PM EAT", sub: "Weekends: Priority tickets only", href: "#" },
              { icon: Zap, title: "Average Response Time", detail: "Under 4 hours", sub: "During business hours", href: "#" },
            ].map((item, idx) => (
              <ScrollReveal key={item.title} delay={idx * 150}>
              <a href={item.href} className="block bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all group h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{item.detail}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </div>
              </a>
              </ScrollReveal>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-3xl p-16 text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Message Received!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-2 max-w-sm">Thank you for reaching out. A member of our team will reply within 24 hours.</p>
                <p className="text-sm text-gray-400">Check your spam folder if you don&apos;t hear back.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", category: "general", message: "" }); }} className="mt-8 px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Send Us a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input id="contact-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-600"} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-sm`} placeholder="John Doe" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input id="contact-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.email ? "border-red-400" : "border-gray-200 dark:border-gray-600"} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-sm`} placeholder="name@company.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select id="contact-category" value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-sm">
                    <option value="general">General Enquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="enterprise">Enterprise / Sales</option>
                    <option value="privacy">Privacy & Data</option>
                    <option value="abuse">Report Abuse</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Subject <span className="text-red-500">*</span></label>
                  <input id="contact-subject" type="text" value={form.subject} onChange={(e) => update("subject", e.target.value)} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.subject ? "border-red-400" : "border-gray-200 dark:border-gray-600"} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-sm`} placeholder="How can we help you?" />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message <span className="text-red-500">*</span></label>
                  <textarea id="contact-message" rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border ${errors.message ? "border-red-400" : "border-gray-200 dark:border-gray-600"} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition text-sm resize-none`} placeholder="Please describe your question or issue in detail. The more context you give us, the faster we can help." />
                  <div className="flex justify-between mt-1">
                    {errors.message ? <p className="text-red-500 text-xs">{errors.message}</p> : <span />}
                    <p className="text-xs text-gray-400">{form.message.length}/2000</p>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-60">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </button>
                <p className="text-xs text-gray-400">By submitting this form, you agree to our <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>. We never share your information with third parties.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-20" aria-labelledby="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 id="faq" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400">Can&apos;t find your answer here? Contact us directly above.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 50}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                  aria-expanded={expandedFaq === i}
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
