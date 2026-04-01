"use client";

import { useState, useEffect } from "react";
import { Copy, Trash2, BarChart2, ExternalLink, LinkIcon, Crown, Sparkles, Zap, Lock, Clock, QrCode, Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function SubscriptionBadge({ role }: { role?: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black rounded-lg tracking-wide shadow-md shadow-amber-500/25 border border-amber-300/50 uppercase">
        <Crown size={12} /> CEO
      </span>
    );
  }
  if (role === "premium_user") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-lg tracking-wide shadow-md shadow-indigo-500/25">
        <Sparkles size={12} /> Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-lg">
      <Zap size={12} /> Free
    </span>
  );
}

// Tier feature limits
const tierFeatures = {
  free_user: {
    customAliases: false,
    qrCode: false,
    passwordProtection: false,
    linkExpiration: false,
    apiAccess: false,
    maxLinks: 15,
    analyticsHistory: "7 days",
  },
  premium_user: {
    customAliases: true,
    qrCode: true,
    passwordProtection: true,
    linkExpiration: true,
    apiAccess: false,
    maxLinks: Infinity,
    analyticsHistory: "90 days",
  },
  admin: {
    customAliases: true,
    qrCode: true,
    passwordProtection: true,
    linkExpiration: true,
    apiAccess: true,
    maxLinks: Infinity,
    analyticsHistory: "Unlimited",
  },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user?.role as string) || "free_user";
  const features = tierFeatures[role as keyof typeof tierFeatures] || tierFeatures.free_user;
  const isEnterprise = role === "admin";
  const isPro = role === "premium_user" || role === "admin";

  const [urls, setUrls] = useState<any[]>([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { fetchUrls(); }, []);

  const fetchUrls = async () => {
    const res = await fetch("/api/urls");
    if (res.ok) setUrls(await res.json());
  };

  const shortenUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl, customUrl: features.customAliases ? customUrl : undefined }),
    });
    if (res.ok) {
      setOriginalUrl(""); setCustomUrl(""); setLinkPassword(""); setLinkExpiry("");
      fetchUrls();
    } else {
      const data = await res.json();
      alert(data.error || "Something went wrong");
    }
    setLoading(false);
  };

  const deleteUrl = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    if ((await fetch(`/api/urls/${id}`, { method: "DELETE" })).ok) fetchUrls();
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isEnterprise ? "bg-amber-50/20 dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-950"}`}>
      {/* Animated Deep Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      {isEnterprise && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[180px] pointer-events-none"></div>}

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 ${isEnterprise ? "bg-amber-500" : "bg-indigo-500"}`}></div>
              {isEnterprise ? (
                <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              ) : isPro ? (
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="relative w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-xl">
                  <LinkIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className={`text-3xl font-black tracking-tight ${isEnterprise ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500" : "text-gray-900 dark:text-white"}`}>
                {isEnterprise ? "Enterprise Dashboard" : isPro ? "Pro Dashboard" : "Dashboard"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-1 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/20 shadow-sm flex items-center">
              <SubscriptionBadge role={role} />
            </div>
            {!isPro && (
              <Link href="/pricing" className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl transition hover:scale-105 active:scale-95 shadow-xl">
                <Zap size={14} className="group-hover:animate-bounce" />
                Upgrade Now
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Glassmorphism Shell */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Links", value: urls.length, max: features.maxLinks === Infinity ? "∞" : features.maxLinks, icon: LinkIcon },
              { label: "Total Clicks", value: urls.reduce((sum: number, u: any) => sum + (u._count?.clicks || 0), 0), max: null, icon: Zap },
              { label: "Analytics", value: features.analyticsHistory, max: null, icon: BarChart2 },
              { label: "Current Plan", value: isEnterprise ? "Enterprise" : isPro ? "Pro" : "Free", max: null, icon: Crown },
            ].map(s => (
              <div key={s.label} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${isEnterprise ? "bg-white/80 dark:bg-amber-900/5 border-amber-200/40 dark:border-amber-800/20" : "bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{s.label}</p>
                    <s.icon size={14} className="text-gray-300 dark:text-gray-700" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {s.value}{s.max ? <span className="text-sm font-normal text-gray-400 dark:text-gray-600">/{s.max}</span> : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Create Link Form */}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${isEnterprise ? "from-amber-500 to-yellow-500" : "from-indigo-500 to-purple-600"} rounded-[2rem] blur opacity-[0.07] group-hover:opacity-[0.12] transition duration-1000`}></div>
            <div className={`relative p-8 rounded-[2rem] border backdrop-blur-2xl shadow-2xl ${isEnterprise ? "bg-white/90 dark:bg-gray-900/80 border-amber-200/50 dark:border-amber-900/30" : "bg-white/90 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800"}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-2 h-8 rounded-full ${isEnterprise ? "bg-amber-500" : "bg-indigo-600"}`}></div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Generate Short Link</h2>
              </div>
              <form onSubmit={shortenUrl} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Destination URL</label>
                    <input type="url" required className="w-full px-5 py-4 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm font-medium shadow-inner" placeholder="https://example.com/long-url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                      Custom Alias {!features.customAliases && <span className="text-[10px] bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full ml-1">PRO ONLY</span>}
                    </label>
                    <div className="relative">
                      <input type="text" disabled={!features.customAliases} className="w-full px-5 py-4 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-inner" placeholder="my-brand" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                      {!features.customAliases && <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700" />}
                    </div>
                  </div>
                </div>

                {isPro && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Lock size={12} /> Password Protection
                      </label>
                      <input type="text" disabled={!features.passwordProtection} className="w-full px-5 py-4 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm font-medium disabled:opacity-40 shadow-inner" placeholder="Optional security" value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Clock size={12} /> Expiration Date
                      </label>
                      <input type="date" disabled={!features.linkExpiration} className="w-full px-5 py-4 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl bg-gray-50/50 dark:bg-black/20 text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition text-sm font-medium disabled:opacity-40 shadow-inner" value={linkExpiry} onChange={(e) => setLinkExpiry(e.target.value)} />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className={`group w-full sm:w-auto px-10 py-4 text-white font-black rounded-2xl transition-all disabled:opacity-50 text-sm tracking-wide shadow-2xl flex items-center justify-center gap-3 active:scale-95 ${isEnterprise ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:shadow-amber-500/40" : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:shadow-indigo-500/40"}`}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Shortening...</>
                  ) : (
                    <>Create Premium Link <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Feature Access (Free Users Only) */}
          {!isPro && (
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-4">Level up your link game</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: LinkIcon, label: "Custom Aliases" },
                    { icon: QrCode, label: "QR Codes" },
                    { icon: Lock, label: "Password Links" },
                    { icon: Clock, label: "Link Expiration" },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 text-sm font-bold text-white/80">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                        <f.icon size={14} />
                      </div>
                      {f.label}
                    </div>
                  ))}
                </div>
                <Link href="/pricing" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-sm hover:bg-gray-100 transition shadow-xl uppercase tracking-tighter">
                  Unlock Pro Now
                </Link>
              </div>
            </div>
          )}

          {/* Links Table */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">Global Links Archive</h3>
              <div className="px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">{urls.length} TOTAL</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="p-6 font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Short Code</th>
                    <th className="p-6 font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Destination</th>
                    <th className="p-6 font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 text-center">Engagement</th>
                    <th className="p-6 font-bold text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1 text-right">Operational Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {urls.map((url) => (
                    <tr key={url.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all duration-300">
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className={`${isEnterprise ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"} font-black text-base group-hover:underline cursor-pointer transition-all`}>/{url.shortCode}</span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-mono mt-1 uppercase tracking-tighter">ID: {url.id.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="max-w-[300px]">
                           <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate" title={url.originalUrl}>{url.originalUrl}</p>
                           <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                             <ExternalLink size={10} /> Directly redirected
                           </p>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-gray-900 dark:text-white">{url._count?.clicks || 0}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Clicks</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => copyLink(url.shortCode)} className="p-3 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95" title="Copy URL">
                            {copied === url.shortCode ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                          </button>
                          <Link href={`/dashboard/analytics/${url.shortCode}`} className="p-3 text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95" title="Analytics Intelligence">
                            <BarChart2 size={18} />
                          </Link>
                          <Link href={`/dashboard/qr/${url.shortCode}`} className="p-3 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95" title="QR Strategy Asset">
                            <QrCode size={18} />
                          </Link>
                          <a href={`/${url.shortCode}`} target="_blank" className="p-3 text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95" title="Visit Live Link">
                            <ExternalLink size={18} />
                          </a>
                          <button onClick={() => deleteUrl(url.id)} className="p-3 text-gray-400 hover:text-red-500 dark:hover:text-red-400 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95" title="Decommission Link">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {urls.length === 0 && (
                    <tr><td colSpan={4} className="p-24 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <LinkIcon size={48} className="mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold tracking-tight">No link assets found in your archive.</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
