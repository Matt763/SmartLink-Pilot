"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, ArrowLeft, Search, Trash2, KeyRound, CheckCircle,
  AlertCircle, Loader2, ShieldCheck, Crown, User, Mail,
  Link as LinkIcon, Calendar, RefreshCw, Eye, EyeOff, X,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Account {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  role: string;
  image: string | null;
  createdAt: string;
  emailVerified: string | null;
  subscription: { status: string | null; stripePriceId: string | null } | null;
  _count: { urls: number };
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border animate-in slide-in-from-top-2 ${type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ── Role badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; className: string; icon: any }> = {
    admin:           { label: "Admin",      className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",    icon: Crown },
    enterprise_user: { label: "Enterprise", className: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800", icon: ShieldCheck },
    premium_user:    { label: "Pro",        className: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",  icon: ShieldCheck },
    free_user:       { label: "Free",       className: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600",               icon: User },
  };
  const cfg = map[role] ?? map.free_user;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ── Avatar initials ────────────────────────────────────────────────────────────
function Avatar({ name, email, size = "md" }: { name?: string | null; email?: string | null; size?: "sm" | "md" }) {
  const initials = (name || email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = ["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-amber-500", "bg-teal-500", "bg-emerald-500"];
  const color = colors[(name || email || "").charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── Password modal ─────────────────────────────────────────────────────────────
function ChangePasswordModal({
  account,
  onClose,
  onSuccess,
}: {
  account: Account;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: account.id, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      onSuccess("Password updated & email sent to user.");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <KeyRound size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Change Password</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px]">{account.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
            <Avatar name={account.name} email={account.email} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{account.name || "Unnamed"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{account.username}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
              {loading ? "Updating…" : "Update & Email User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────────
function DeleteModal({
  account,
  onClose,
  onSuccess,
}: {
  account: Account;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [notify, setNotify] = useState(true);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: account.id, sendNotification: notify }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to delete account."); return; }
      onSuccess(notify ? "Account deleted & user notified." : "Account deleted.");
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Trash2 size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Delete Account</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
            <Avatar name={account.name} email={account.email} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{account.name || "Unnamed"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.email}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            This will <strong className="text-gray-900 dark:text-white">permanently delete</strong> this account, all their shortened links, analytics data, and subscription. This action cannot be undone.
          </p>

          {/* Notify toggle */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer select-none">
            <div
              onClick={() => setNotify((v) => !v)}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${notify ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notify ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Send notification email</p>
              <p className="text-xs text-gray-400">User will receive an account removal notice</p>
            </div>
          </label>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition">
              Cancel
            </button>
            <button onClick={confirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl transition">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {loading ? "Deleting…" : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
const CEO_EMAIL = "mclean@smartlinkpilot.com";

export default function AccountsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pwModal, setPwModal] = useState<Account | null>(null);
  const [delModal, setDelModal] = useState<Account | null>(null);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
  }, [status, session, router]);

  // ── Fetch accounts ───────────────────────────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts");
      if (res.ok) setAccounts(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const nonCeo = accounts.filter((a) => a.email !== CEO_EMAIL);
  const totalFree = nonCeo.filter((a) => a.role === "free_user").length;
  const totalPro = nonCeo.filter((a) => a.role === "premium_user").length;
  const totalEnterprise = nonCeo.filter((a) => a.role === "enterprise_user").length;
  const recentCount = nonCeo.filter((a) => {
    const diff = Date.now() - new Date(a.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.username?.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isCeo = (a: Account) => a.email === CEO_EMAIL;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {pwModal && (
        <ChangePasswordModal
          account={pwModal}
          onClose={() => setPwModal(null)}
          onSuccess={(m) => { showToast(m, "success"); fetchAccounts(); }}
        />
      )}
      {delModal && (
        <DeleteModal
          account={delModal}
          onClose={() => setDelModal(null)}
          onSuccess={(m) => { showToast(m, "success"); fetchAccounts(); }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin"
              className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition shadow-sm">
              <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {nonCeo.length} registered {nonCeo.length === 1 ? "account" : "accounts"} · CEO account protected
              </p>
            </div>
          </div>
          <button
            onClick={fetchAccounts}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition text-sm">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Accounts", value: nonCeo.length, sub: "Excluding CEO",         icon: Users,      color: "indigo" },
            { label: "Free Users",     value: totalFree,     sub: "On free plan",           icon: User,       color: "gray"   },
            { label: "Pro / Premium",  value: totalPro,      sub: "Active paid subscribers",icon: ShieldCheck,color: "purple" },
            { label: "New This Week",  value: recentCount,   sub: "Last 7 days",            icon: Calendar,   color: "green"  },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className={`w-8 h-8 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-3`}>
                <Icon size={16} className={`text-${color}-600 dark:text-${color}-400`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or username…"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
            {[
              { key: "all",            label: "All" },
              { key: "free_user",      label: "Free" },
              { key: "premium_user",   label: "Pro" },
              { key: "enterprise_user",label: "Enterprise" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${roleFilter === key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {filtered.length === accounts.length
                ? `All Accounts (${filtered.length})`
                : `${filtered.length} of ${accounts.length} accounts`}
            </h3>
            {totalEnterprise > 0 && (
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                {totalEnterprise} Enterprise
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" /> Loading accounts…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <Users size={36} className="opacity-30" />
              <p className="text-sm font-medium">No accounts found</p>
              {search && <p className="text-xs">Try a different search term</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Username</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Links</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filtered.map((account) => {
                    const ceo = isCeo(account);
                    return (
                      <tr key={account.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/20 transition ${ceo ? "bg-amber-50/30 dark:bg-amber-900/5" : ""}`}>

                        {/* User column */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={account.name} email={account.email} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">
                                  {account.name || "Unnamed"}
                                </p>
                                {ceo && <Crown size={12} className="text-amber-500 flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">{account.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Username */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            @{account.username || "—"}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <RoleBadge role={account.role} />
                        </td>

                        {/* Links count */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                            <LinkIcon size={13} className="text-gray-400" />
                            {account._count.urls.toLocaleString()}
                          </div>
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Calendar size={12} />
                            {new Date(account.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          {ceo ? (
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-end gap-1">
                              <Crown size={11} /> Protected
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPwModal(account)}
                                title="Change Password"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-100 dark:border-indigo-800/40 transition">
                                <KeyRound size={12} />
                                <span className="hidden sm:inline">Password</span>
                              </button>
                              <button
                                onClick={() => setDelModal(account)}
                                title="Delete Account"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-100 dark:border-red-800/40 transition">
                                <Trash2 size={12} />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Legend ───────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1.5"><Crown size={12} className="text-amber-500" /> CEO account — protected from all modifications</span>
          <span className="flex items-center gap-1.5"><Mail size={12} className="text-indigo-400" /> Password change automatically emails the user</span>
          <span className="flex items-center gap-1.5"><Trash2 size={12} className="text-red-400" /> Deletion can optionally notify the user by email</span>
        </div>

      </div>
    </div>
  );
}
