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
    <div className={`min-h-screen ${isEnterprise ? "bg-gradient-to-b from-amber-50/30 to-white dark:from-gray-950 dark:to-gray-900" : "bg-gray-50 dark:bg-gray-950"}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {isEnterprise ? (
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/50">
                <Crown className="w-7 h-7 text-white" />
              </div>
            ) : isPro ? (
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <LinkIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div>
              <h1 className={`text-2xl font-bold ${isEnterprise ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500" : "text-gray-900 dark:text-white"}`}>
                {isEnterprise ? "Enterprise Dashboard" : isPro ? "Pro Dashboard" : "Dashboard"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SubscriptionBadge role={role} />
            {!isPro && (
              <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-sm">
                Upgrade <ArrowUpRight size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Links", value: urls.length, max: features.maxLinks === Infinity ? "∞" : features.maxLinks },
            { label: "Total Clicks", value: urls.reduce((sum: number, u: any) => sum + (u._count?.clicks || 0), 0), max: null },
            { label: "Analytics", value: features.analyticsHistory, max: null },
            { label: "Plan", value: isEnterprise ? "Enterprise" : isPro ? "Pro" : "Free", max: null },
          ].map(s => (
            <div key={s.label} className={`p-4 rounded-xl border ${isEnterprise ? "bg-white/80 dark:bg-gray-800/60 border-amber-200/50 dark:border-amber-800/30" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {s.value}{s.max ? <span className="text-sm font-normal text-gray-400">/{s.max}</span> : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Create Link Form */}
        <div className={`p-6 rounded-2xl border mb-8 ${isEnterprise ? "bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-900/10 dark:to-gray-800 border-amber-200/50 dark:border-amber-800/30" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Link</h2>
          <form onSubmit={shortenUrl} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination URL</label>
                <input type="url" required className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-sm" placeholder="https://example.com/long-url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Alias {!features.customAliases && <span className="text-xs text-amber-500 ml-1">(Pro)</span>}
                </label>
                <input type="text" disabled={!features.customAliases} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-sm disabled:opacity-40 disabled:cursor-not-allowed" placeholder="my-brand" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                {!features.customAliases && <Lock size={14} className="absolute right-3 top-[38px] text-gray-300" />}
              </div>
            </div>

            {isPro && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password Protection {!features.passwordProtection && <span className="text-xs text-amber-500 ml-1">(Pro)</span>}
                  </label>
                  <input type="text" disabled={!features.passwordProtection} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-sm disabled:opacity-40" placeholder="Optional password" value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiration Date {!features.linkExpiration && <span className="text-xs text-amber-500 ml-1">(Pro)</span>}
                  </label>
                  <input type="date" disabled={!features.linkExpiration} className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition text-sm disabled:opacity-40" value={linkExpiry} onChange={(e) => setLinkExpiry(e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className={`px-6 py-3 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm ${isEnterprise ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-lg shadow-amber-500/20" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20"}`}>
              {loading ? "Shortening..." : "Create Short Link"}
            </button>
          </form>
        </div>

        {/* Feature Access */}
        {!isPro && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-3">Unlock Pro Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: LinkIcon, label: "Custom Aliases" },
                { icon: QrCode, label: "QR Codes" },
                { icon: Lock, label: "Password Links" },
                { icon: Clock, label: "Link Expiration" },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                  <f.icon size={14} /> {f.label}
                </div>
              ))}
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition">
              Upgrade to Pro <ArrowUpRight size={14} />
            </Link>
          </div>
        )}

        {/* Links Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Your Links</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="p-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Link</th>
                  <th className="p-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original URL</th>
                  <th className="p-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
                  <th className="p-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="p-4"><span className="font-medium text-indigo-600 dark:text-indigo-400 text-sm">/{url.shortCode}</span></td>
                    <td className="p-4 text-gray-500 dark:text-gray-400 truncate max-w-[250px] text-sm" title={url.originalUrl}>{url.originalUrl}</td>
                    <td className="p-4 text-gray-700 dark:text-gray-300 font-semibold text-sm">{url._count?.clicks || 0}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => copyLink(url.shortCode)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Copy">
                          {copied === url.shortCode ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <Link href={`/dashboard/analytics/${url.shortCode}`} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Analytics">
                          <BarChart2 size={16} />
                        </Link>
                        <a href={`/${url.shortCode}`} target="_blank" className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Visit">
                          <ExternalLink size={16} />
                        </a>
                        <button onClick={() => deleteUrl(url.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-700 rounded-lg transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {urls.length === 0 && (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-400 dark:text-gray-500">No links created yet. Create your first one above!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
