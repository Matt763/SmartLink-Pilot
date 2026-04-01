"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Crown, Users, Link as LinkIcon, Settings, Shield, DollarSign, FileText, PenTool, UserPlus, Mail, Lock, Trash2, Edit, ChevronDown, ChevronRight, Globe, BarChart2, Code, MessageCircle, Bell, Bot, CheckCircle, AlertCircle, Loader2, Smartphone, Save, RefreshCw, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "users" | "links" | "team" | "site" | "content" | "appconfig" | "monetization" | "chats" | "settings";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border animate-in slide-in-from-top-2 ${type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Settings state
  const [accountName, setAccountName] = useState("Mclean Mbaga");
  const [accountEmail, setAccountEmail] = useState("mclean@smartlinkpilot.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [platformApiKey, setPlatformApiKey] = useState("slp_sk_live_xxxxxxxxxxxxxxxxxxxxxxxx");
  const [apiKeys, setApiKeys] = useState<Record<string, { masked: string; source: string }>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // === Page Content Editor State ===
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageContents, setPageContents] = useState<Record<string, string>>({});
  const [contentSaving, setContentSaving] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const pageList = [
    { key: "about",       label: "About Us",        href: "/about" },
    { key: "team",        label: "Our Team",         href: "/team" },
    { key: "contact",     label: "Contact",          href: "/contact" },
    { key: "trust",       label: "Trust & E-E-A-T",  href: "/trust" },
    { key: "privacy",     label: "Privacy Policy",   href: "/privacy" },
    { key: "terms",       label: "Terms of Service", href: "/terms" },
    { key: "cookies",     label: "Cookies Policy",   href: "/cookies" },
    { key: "disclaimer",  label: "Disclaimer",       href: "/disclaimer" },
  ];

  const loadPageContent = useCallback(async (page: string) => {
    setContentLoading(true);
    try {
      const res = await fetch(`/api/admin/content?page=${page}`);
      const data = await res.json();
      const map: Record<string, string> = {};
      (data.entries || []).forEach((e: { section: string; content: string }) => { map[e.section] = e.content; });
      setPageContents(map);
    } finally { setContentLoading(false); }
  }, []);

  const savePageContent = async (section: string, content: string) => {
    if (!selectedPage) return;
    setContentSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: selectedPage, section, content }),
      });
      if (res.ok) setToast({ message: `${section} saved!`, type: "success" });
      else setToast({ message: "Save failed", type: "error" });
    } finally { setContentSaving(false); }
  };

  // === App Config State ===
  const [appConfig, setAppConfig] = useState<Record<string, string>>({
    appName: "SmartLink Pilot", appTagline: "URL shortener for modern marketers",
    supportEmail: "support@smartlinkpilot.com", officeLocation: "Arusha, Tanzania",
    phone: "+254 700 000 000", playStoreUrl: "#", appStoreUrl: "#",
    apkDownloadUrl: "/downloads/smartlink-pilot.apk", appVersion: "1.0.0", apkSize: "18 MB",
    twitterUrl: "https://twitter.com/smartlinkpilot", linkedinUrl: "https://linkedin.com/company/smartlinkpilot",
    githubUrl: "https://github.com/mayobe/smartlink",
  });
  const [appConfigSaving, setAppConfigSaving] = useState(false);

  const loadAppConfig = useCallback(async () => {
    try { const res = await fetch("/api/admin/app-config"); const data = await res.json(); if (data.config) setAppConfig(data.config); } catch {}
  }, []);

  const saveAppConfig = async () => {
    setAppConfigSaving(true);
    try {
      const res = await fetch("/api/admin/app-config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates: appConfig }) });
      if (res.ok) setToast({ message: "App config saved!", type: "success" }); else setToast({ message: "Save failed", type: "error" });
    } finally { setAppConfigSaving(false); }
  };

  useEffect(() => { if (activeTab === "appconfig") loadAppConfig(); }, [activeTab, loadAppConfig]);
  useEffect(() => { if (selectedPage) loadPageContent(selectedPage); }, [selectedPage, loadPageContent]);


  // Load settings from API
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          if (data.account) {
            setAccountName(data.account.name || "");
            setAccountEmail(data.account.email || "");
          }
          if (data.settings) {
            setApiKeys(
              Object.fromEntries(
                Object.entries(data.settings).map(([k, v]: [string, any]) => [
                  k,
                  { masked: v.masked || "", source: v.source || "none" },
                ])
              )
            );
          }
        }
      })
      .catch(() => {});
  }, [activeTab]);

  const adminAction = async (action: string, body: any = {}) => {
    setSaving(action);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.error || "Failed", type: "error" });
      } else {
        setToast({ message: data.message || "Success", type: "success" });
        if (data.apiKey) setPlatformApiKey(data.apiKey);
      }
      return data;
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  // Mock data
  const [users] = useState([
    { id: "1", name: "Mclean Mbaga", email: "mclean@smartlinkpilot.com", role: "admin", links: 245, plan: "Enterprise" },
    { id: "2", name: "Aisha Wanjiru", email: "aisha@gmail.com", role: "premium_user", links: 87, plan: "Pro" },
    { id: "3", name: "John Doe", email: "john@example.com", role: "free_user", links: 12, plan: "Free" },
  ]);

  const [teamMembers] = useState([
    { id: "1", name: "Mclean Mbaga", role: "Founder & CEO", email: "mclean@smartlinkpilot.com" },
    { id: "2", name: "Aisha Wanjiru", role: "Head of Product", email: "aisha@smartlinkpilot.com" },
    { id: "3", name: "Wei Chen", role: "Lead Engineer", email: "wei@smartlinkpilot.com" },
  ]);

  const [adSlots] = useState([
    { id: "1", name: "Landing Hero Banner", page: "Landing", position: "Below Hero", type: "Horizontal", active: true, code: "ca-pub-xxx/hero-banner" },
    { id: "2", name: "Dashboard Sidebar", page: "Dashboard", position: "Sidebar", type: "Vertical", active: false, code: "" },
    { id: "3", name: "Footer Above", page: "All Pages", position: "Above Footer", type: "Horizontal", active: true, code: "ca-pub-xxx/footer-ad" },
    { id: "4", name: "Between Links", page: "Dashboard", position: "In-Feed", type: "In-Feed", active: false, code: "" },
  ]);

  const [chatUsers] = useState([
    { id: "u1", name: "John Doe", username: "@johndoe", email: "john@example.com", lastMsg: "How do I upgrade to Pro?", summary: "User wants to upgrade to Pro plan. Interested in custom aliases and QR codes. Recommend showing pricing page.", unread: 2, messages: [
      { role: "user", content: "Hi, I want to upgrade my plan" },
      { role: "assistant", content: "I can help with that! We have Pro ($6.99/mo) and Enterprise ($12.99/mo). Which interests you?" },
      { role: "user", content: "How do I upgrade to Pro?" },
    ] },
    { id: "u2", name: "Sarah K.", username: "@sarahk", email: "sarah@gmail.com", lastMsg: "I forgot my password", summary: "User needs password reset. Verified phone number. Provided reset link. Issue resolved.", unread: 0, messages: [
      { role: "user", content: "I forgot my password" },
      { role: "assistant", content: "I can help! Please provide your email and recovery phone number." },
      { role: "user", content: "sarah@gmail.com, +254 712 345 678" },
      { role: "assistant", content: "Identity verified! Here's your reset link." },
    ] },
    { id: "u3", name: "Mike R.", username: "@miker", email: "mike@company.co", lastMsg: "API not returning data", summary: "Enterprise user reporting API issues. Possible rate limit hit. Recommend checking API logs and increasing rate limit for this user.", unread: 1, messages: [
      { role: "user", content: "My API calls are failing" },
      { role: "assistant", content: "I see you're on Enterprise. Can you share the error message?" },
      { role: "user", content: "API not returning data, getting 429 errors" },
    ] },
  ]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const tabs: { key: Tab; icon: any; label: string }[] = [
    { key: "overview",   icon: BarChart2,    label: "Overview" },
    { key: "users",      icon: Users,        label: "Users" },
    { key: "links",      icon: LinkIcon,     label: "Links" },
    { key: "team",       icon: UserPlus,     label: "Team" },
    { key: "site",       icon: PenTool,      label: "Site Editor" },
    { key: "content",    icon: FileText,     label: "Page Content" },
    { key: "appconfig",  icon: Smartphone,   label: "App Config" },
    { key: "monetization", icon: DollarSign, label: "Monetization" },
    { key: "chats",      icon: MessageCircle,label: "Chats" },
    { key: "settings",   icon: Settings,     label: "Settings" },
  ];

  const Spinner = () => <Loader2 size={14} className="animate-spin" />;


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/50 flex-shrink-0">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Full control over SmartLink Pilot</p>
          </div>
          <Link href="/admin/blog" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition">
            <Sparkles size={16} /> AI Blog CMS
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black rounded-lg shadow-md border border-amber-300/50 uppercase">
            <Crown size={12} /> CEO
          </span>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 mb-8 scrollbar-hide">
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 min-w-max">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: "1,247", change: "+12%", color: "indigo" },
                { label: "Total Links", value: "34,892", change: "+8%", color: "purple" },
                { label: "Total Clicks", value: "2.4M", change: "+23%", color: "green" },
                { label: "Revenue (MRR)", value: "$847", change: "+15%", color: "amber" },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-green-500 font-medium mt-1">{s.change} this month</p>
                </div>
              ))}
            </div>

            {/* Quick Navigation: Dual Dashboard */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">You also have an Enterprise user dashboard for managing your own links.</p>
              <a href="/dashboard" className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-lg hover:from-amber-600 hover:to-yellow-600 transition shadow-sm whitespace-nowrap">Open My Dashboard →</a>
            </div>

            {/* Income Trend Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Subscription Income Trend</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Monthly recurring revenue from Pro & Enterprise</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">$847</p>
                  <p className="text-xs text-green-500">+15% vs last month</p>
                </div>
              </div>
              {/* SVG Bar Chart */}
              <div className="relative">
                <svg viewBox="0 0 720 200" className="w-full h-48" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={`grid-${i}`} x1="0" y1={i * 50} x2="720" y2={i * 50} stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth="1" />
                  ))}
                  {/* Bars */}
                  {[
                    { month: "Apr", val: 120 }, { month: "May", val: 180 }, { month: "Jun", val: 250 },
                    { month: "Jul", val: 310 }, { month: "Aug", val: 380 }, { month: "Sep", val: 420 },
                    { month: "Oct", val: 470 }, { month: "Nov", val: 530 }, { month: "Dec", val: 590 },
                    { month: "Jan", val: 650 }, { month: "Feb", val: 740 }, { month: "Mar", val: 847 },
                  ].map((item, i) => {
                    const barHeight = (item.val / 900) * 180;
                    const x = i * 60 + 5;
                    const isLast = i === 11;
                    return (
                      <g key={item.month}>
                        <rect x={x} y={200 - barHeight} width="50" height={barHeight} rx="6" fill={isLast ? "url(#goldGrad)" : "url(#indigoGrad)"} opacity={isLast ? 1 : 0.7 + (i * 0.025)} />
                        <text x={x + 25} y="198" textAnchor="middle" className="text-[10px] fill-gray-400 dark:fill-gray-500" fontWeight="600">{item.month}</text>
                      </g>
                    );
                  })}
                  <defs>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex gap-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Pro Revenue</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Enterprise Revenue</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {["New user signup: john@example.com", "Pro upgrade: aisha@gmail.com", "Link created: /promo-2026", "100k clicks milestone reached"].map(a => (
                    <div key={a} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div> {a}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Subscription Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { plan: "Free", count: 980, pct: 78, color: "bg-gray-300 dark:bg-gray-600" },
                    { plan: "Pro ($6.99)", count: 210, pct: 17, color: "bg-indigo-500" },
                    { plan: "Enterprise ($12.99)", count: 57, pct: 5, color: "bg-amber-500" },
                  ].map(p => (
                    <div key={p.plan}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{p.plan}</span>
                        <span className="text-gray-400">{p.count} users ({p.pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${p.color} rounded-full transition-all`} style={{ width: `${p.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Manage Users</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition">Add User</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Links</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="p-4">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <select defaultValue={u.role} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300">
                          <option value="free_user">Free</option>
                          <option value="premium_user">Pro</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${u.plan === "Enterprise" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : u.plan === "Pro" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>{u.plan}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{u.links}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Edit"><Edit size={14} /></button>
                          <button className="p-2 text-gray-400 hover:text-amber-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Reset Password"><Lock size={14} /></button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Change Email"><Mail size={14} /></button>
                          <button className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === "links" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">All Platform Links</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Manage all shortened links across the platform. You can edit, disable, or delete any link.</p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-8 text-center text-gray-400">
              Links management loads here with pagination, search, and bulk actions.
            </div>
          </div>
        )}

        {/* Team Management Tab */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">Team Members</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5">
                  <UserPlus size={14} /> Add Member
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {teamMembers.map(m => (
                  <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.role} · {m.email}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Edit"><Edit size={14} /></button>
                      <button className="p-2 text-gray-400 hover:text-amber-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Change Password"><Lock size={14} /></button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Change Email"><Mail size={14} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Remove"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Site Editor Tab */}
        {activeTab === "site" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Globe size={18} /> Site Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Site Title", value: "SmartLink Pilot", type: "text" },
                  { label: "Site Tagline", value: "URL shortener for modern marketers", type: "text" },
                  { label: "Support Email", value: "support@smartlinkpilot.com", type: "email" },
                  { label: "Contact Phone", value: "+254 700 000 000", type: "tel" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                    <input type={f.type} defaultValue={f.value} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                  </div>
                ))}
              </div>
              <button className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">Save Changes</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={18} /> Page Content Editor</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Edit the content of your legal and informational pages.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["About Us", "Privacy Policy", "Terms of Service", "Cookies Policy", "Disclaimer", "Contact Info", "Team Page", "Trust Page"].map(page => (
                  <button key={page} className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition text-left">
                    {page}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={18} /> Security Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Rate Limiting", desc: "Limit API requests per IP", enabled: true },
                  { label: "Malicious URL Detection", desc: "Auto-block suspicious links", enabled: true },
                  { label: "CAPTCHA on Signup", desc: "Require verification for new accounts", enabled: false },
                  { label: "Force HTTPS", desc: "Redirect all traffic to HTTPS", enabled: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</p>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                    <button className={`w-11 h-6 rounded-full transition-colors relative ${s.enabled ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s.enabled ? "left-[22px]" : "left-0.5"}`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Page Content Editor Tab ─── */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {!selectedPage ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><FileText size={18} /> Page Content Editor</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select a page to edit its content sections. Changes are saved to the database and take effect immediately without redeployment.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pageList.map(page => (
                    <button key={page.key} onClick={() => setSelectedPage(page.key)}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition text-left">
                      {page.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <button onClick={() => setSelectedPage(null)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-1 flex items-center gap-1">← Back to pages</button>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {pageList.find(p => p.key === selectedPage)?.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Add or override content sections. Leave blank to use the default built-in content.</p>
                  </div>
                  <a href={pageList.find(p => p.key === selectedPage)?.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    <ExternalLink size={13} /> Preview page
                  </a>
                </div>

                {contentLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { key: "hero_title",       label: "Hero Title",           type: "input",    placeholder: "e.g. About SmartLink Pilot" },
                      { key: "hero_subtitle",    label: "Hero Subtitle",        type: "input",    placeholder: "Short tagline below the hero title" },
                      { key: "intro_paragraph",  label: "Introduction Paragraph",type: "textarea", placeholder: "Main introductory paragraph..." },
                      { key: "body_text",        label: "Additional Body Text", type: "textarea", placeholder: "Extra paragraphs, details..." },
                      { key: "cta_label",        label: "CTA Button Label",     type: "input",    placeholder: "e.g. Get Started Free" },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                        {field.type === "textarea" ? (
                          <textarea rows={4} value={pageContents[field.key] ?? ""}
                            onChange={e => setPageContents(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition resize-none placeholder-gray-400" />
                        ) : (
                          <input type="text" value={pageContents[field.key] ?? ""}
                            onChange={e => setPageContents(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition placeholder-gray-400" />
                        )}
                        <div className="flex justify-end mt-1.5">
                          <button disabled={contentSaving} onClick={() => savePageContent(field.key, pageContents[field.key] ?? "")}
                            className="text-xs px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1.5">
                            {contentSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── App Config Tab ─── */}
        {activeTab === "appconfig" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-5">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-1"><Smartphone size={18} /> App & Site Configuration</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Edit your app store links, branding, and contact info. Changes are saved to the database and override static defaults immediately.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Mobile App Links</h4>
              <div className="space-y-4">
                {([
                  { key: "playStoreUrl",    label: "Google Play Store URL",   placeholder: "https://play.google.com/store/apps/details?id=..." },
                  { key: "appStoreUrl",     label: "Apple App Store URL",      placeholder: "https://apps.apple.com/app/smartlink-pilot/id..." },
                  { key: "apkDownloadUrl",  label: "Direct APK Download URL",  placeholder: "/downloads/smartlink-pilot.apk" },
                  { key: "appVersion",      label: "App Version",             placeholder: "1.0.0" },
                  { key: "apkSize",         label: "APK File Size",           placeholder: "18 MB" },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type="text" value={appConfig[field.key] ?? ""}
                      onChange={e => setAppConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Branding & Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  { key: "appName",       label: "Site / App Name",     placeholder: "SmartLink Pilot" },
                  { key: "appTagline",    label: "Tagline",             placeholder: "URL shortener for modern marketers" },
                  { key: "supportEmail",  label: "Support Email",       placeholder: "support@smartlinkpilot.com" },
                  { key: "officeLocation",label: "Office Location",     placeholder: "Arusha, Tanzania" },
                  { key: "phone",         label: "Phone Number",        placeholder: "+254 700 000 000" },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type="text" value={appConfig[field.key] ?? ""}
                      onChange={e => setAppConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Social Links</h4>
              <div className="space-y-4">
                {([
                  { key: "twitterUrl",  label: "X / Twitter URL",  placeholder: "https://twitter.com/smartlinkpilot" },
                  { key: "linkedinUrl", label: "LinkedIn URL",      placeholder: "https://linkedin.com/company/smartlinkpilot" },
                  { key: "githubUrl",   label: "GitHub URL",        placeholder: "https://github.com/mayobe/smartlink" },
                ] as const).map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type="text" value={appConfig[field.key] ?? ""}
                      onChange={e => setAppConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button disabled={appConfigSaving} onClick={saveAppConfig}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                {appConfigSaving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save All Changes</>}
              </button>
              <button onClick={loadAppConfig} className="flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                <RefreshCw size={14} /> Reload from DB
              </button>
            </div>
          </div>
        )}

        {/* Monetization Tab */}
        {activeTab === "monetization" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-6">
              <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2"><DollarSign size={18} /> AdSense Monetization</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">Manage ad placements across your site. All placements comply with Google AdSense policies — ads are labeled, non-intrusive, and placed in content-appropriate areas.</p>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AdSense Publisher ID</label>
                <input type="text" placeholder="ca-pub-XXXXXXXXXX" className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/50 outline-none transition" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">Ad Placements</h3>
                <button className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition">Add Placement</button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {adSlots.map(ad => (
                  <div key={ad.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{ad.name}</p>
                      <p className="text-xs text-gray-400">{ad.page} · {ad.position} · {ad.type}</p>
                      {ad.code && <code className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded mt-1 inline-block">{ad.code}</code>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button className={`w-11 h-6 rounded-full transition-colors relative ${ad.active ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ad.active ? "left-[22px]" : "left-0.5"}`}></span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition"><Edit size={14} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 dark:bg-gray-700 rounded-lg transition"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-5">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-2">AdSense Policy Compliance</h4>
              <ul className="space-y-1.5 text-xs text-blue-700 dark:text-blue-300">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Ads clearly labeled as &quot;Advertisement&quot;</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No more than 3 ad units per page</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Ads placed away from interactive elements</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Content meets quality and originality thresholds</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Privacy policy and cookie consent present</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No misleading or deceptive UI patterns</li>
              </ul>
            </div>
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === "chats" && (
          <div className="space-y-6">
            {/* Notification Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">3 conversations need attention</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">AI has summarized user needs and recommended actions below.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">User Conversations</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {chatUsers.map(u => (
                    <button key={u.id} onClick={() => setSelectedChat(u.id)} className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${selectedChat === u.id ? "bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-500" : ""}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{u.name}</span>
                        {u.unread > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{u.unread}</span>}
                      </div>
                      <p className="text-[10px] text-indigo-500 font-medium">{u.username}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{u.lastMsg}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat View + Summary */}
              <div className="lg:col-span-2 space-y-4">
                {selectedChat ? (() => {
                  const user = chatUsers.find(u => u.id === selectedChat);
                  if (!user) return null;
                  return (
                    <>
                      {/* AI Summary Card */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200/50 dark:border-indigo-800/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">AI Summary for {user.username}</h4>
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">{user.summary}</p>
                      </div>

                      {/* Messages */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{user.name} &mdash; {user.email}</h4>
                          <span className="text-xs text-gray-400">{user.messages.length} messages</span>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {user.messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.role === "user" ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"}`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })() : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Select a conversation to view details and AI summary</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">CEO Account Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition" />
                </div>
              </div>
              <button disabled={saving === "update_account"} onClick={() => { adminAction("update_account", { name: accountName, email: accountEmail, newPassword, confirmPassword }).then(() => { setNewPassword(""); setConfirmPassword(""); }); }} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                {saving === "update_account" ? <><Spinner /> Updating...</> : "Update Account"}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Code size={18} /> API & Integrations</h3>
              <p className="text-xs text-gray-400 mb-4">Edit any key below. Changes take effect immediately and persist across deployments.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform API Key</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={platformApiKey} className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-mono" />
                    <button disabled={saving === "regenerate_api_key"} onClick={() => { if (confirm("Regenerate your API key? The old key will stop working.")) adminAction("regenerate_api_key"); }} className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50 flex items-center gap-2 flex-shrink-0">
                      {saving === "regenerate_api_key" ? <Spinner /> : "Regenerate"}
                    </button>
                  </div>
                </div>

                {[
                  { key: "OPENAI_API_KEY", label: "OpenAI API Key", hint: "Powers the Pilot Assistant chatbot" },
                  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", hint: "For payment processing" },
                  { key: "STRIPE_PUBLISHABLE_KEY", label: "Stripe Publishable Key", hint: "Client-side Stripe integration" },
                  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe Webhook Secret", hint: "Verifies Stripe webhook events" },
                  { key: "GOOGLE_ANALYTICS_ID", label: "Google Analytics ID", hint: "Track site traffic" },
                ].map(({ key, label, hint }) => {
                  const info = apiKeys[key];
                  const isConfigured = info && info.source !== "none" && info.masked;
                  const isEditing = editingKey === key;

                  return (
                    <div key={key} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          {label}
                          {isConfigured && <span className="text-[10px] text-green-500 font-bold">✓ Configured</span>}
                          {info?.source && info.source !== "none" && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${info.source === "db" ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                              {info.source === "db" ? "Custom" : "ENV"}
                            </span>
                          )}
                        </label>
                        <button onClick={() => { if (isEditing) { setEditingKey(null); setEditValue(""); } else { setEditingKey(key); setEditValue(""); } }} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-semibold flex items-center gap-1">
                          <Edit size={11} /> {isEditing ? "Cancel" : "Edit"}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mb-2">{hint}</p>

                      {isEditing ? (
                        <div className="flex gap-2">
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={`Enter new ${label}...`} className="flex-1 px-3 py-2.5 border border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500/50 outline-none transition" autoFocus />
                          <button disabled={!editValue.trim() || saving === `key_${key}`} onClick={async () => { setSaving(`key_${key}`); const res = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_key", key, value: editValue }) }); const data = await res.json(); if (res.ok) { setToast({ message: data.message, type: "success" }); setEditingKey(null); setEditValue(""); setApiKeys(prev => ({ ...prev, [key]: { masked: editValue.slice(0, 7) + "•".repeat(Math.min(20, editValue.length - 11)) + editValue.slice(-4), source: "db" } })); } else { setToast({ message: data.error, type: "error" }); } setSaving(null); }} className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0">
                            {saving === `key_${key}` ? <Spinner /> : "Save"}
                          </button>
                        </div>
                      ) : (
                        <input type="text" readOnly value={info?.masked || "Not configured"} className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-mono" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-6">
              <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">These actions are irreversible. Proceed with extreme caution.</p>
              <div className="flex flex-wrap gap-3">
                <button disabled={saving === "reset_all_links"} onClick={() => { if (confirm("⚠️ This will permanently delete ALL links for ALL users. Are you absolutely sure?")) adminAction("reset_all_links"); }} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5">
                  {saving === "reset_all_links" ? <Spinner /> : <Trash2 size={12} />} Reset All Links
                </button>
                <button disabled={saving === "purge_analytics"} onClick={() => { if (confirm("⚠️ This will permanently delete ALL analytics data. Are you absolutely sure?")) adminAction("purge_analytics"); }} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-1.5">
                  {saving === "purge_analytics" ? <Spinner /> : <Trash2 size={12} />} Purge Analytics
                </button>
                <button disabled={saving === "export_data"} onClick={async () => { const data = await adminAction("export_data"); if (data?.users) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `smartlink-export-${new Date().toISOString().split("T")[0]}.json`; a.click(); } }} className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition disabled:opacity-50 flex items-center gap-1.5">
                  {saving === "export_data" ? <Spinner /> : <FileText size={12} />} Export All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
