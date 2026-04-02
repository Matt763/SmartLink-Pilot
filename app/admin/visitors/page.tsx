"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Users, Eye, Clock, Globe, Monitor, Smartphone, Tablet, RefreshCw, ChevronLeft, ChevronRight, Wifi } from "lucide-react";
import Link from "next/link";

type Period = "now" | "today" | "yesterday" | "week" | "2weeks" | "month" | "year" | "2years" | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "now",     label: "Live (5 min)" },
  { key: "today",   label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week",    label: "7 Days" },
  { key: "2weeks",  label: "14 Days" },
  { key: "month",   label: "30 Days" },
  { key: "year",    label: "1 Year" },
  { key: "2years",  label: "2 Years" },
  { key: "all",     label: "All Time" },
];

interface VisitorData {
  totalSessions: number;
  totalPageViews: number;
  avgDuration: number;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  countries: Record<string, number>;
  sources: Record<string, number>;
  topPages: { path: string; views: number }[];
  chartData: { label: string; sessions: number; pageViews: number }[];
  sessions: {
    id: string;
    sessionId: string;
    country: string;
    city: string;
    device: string;
    browser: string;
    os: string;
    source: string;
    referrer: string;
    duration: number;
    pages: string[];
    pageCount: number;
    createdAt: string;
  }[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

function fmtDuration(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); const sec = s % 60;
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone size={14} className="text-indigo-500" />;
  if (device === "tablet") return <Tablet size={14} className="text-purple-500" />;
  return <Monitor size={14} className="text-gray-500" />;
}

function BarList({ data, limit = 8 }: { data: Record<string, number>; limit?: number }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, limit);
  const max = sorted[0]?.[1] || 1;
  return (
    <div className="space-y-2">
      {sorted.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3">
          <div className="w-24 sm:w-32 text-xs text-gray-600 dark:text-gray-300 truncate flex-shrink-0">{k}</div>
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-right flex-shrink-0">{v}</div>
        </div>
      ))}
      {sorted.length === 0 && <p className="text-xs text-gray-400 py-2">No data yet</p>}
    </div>
  );
}

export default function VisitorAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/visitors?period=${period}&page=${page}`);
      if (res.ok) setData(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, [period, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30s for "now" or when enabled
  useEffect(() => {
    if (!autoRefresh && period !== "now") return;
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [autoRefresh, period, fetchData]);

  const maxChart = Math.max(...(data?.chartData.map(d => d.sessions) || [1]), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
              <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={22} className="text-indigo-500" /> Visitor Analytics
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time website traffic & audience insights</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAutoRefresh(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${autoRefresh ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
            >
              <Wifi size={13} /> {autoRefresh ? "Live" : "Auto-refresh"}
            </button>
            <button onClick={fetchData} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 min-w-max">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => { setPeriod(p.key); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${period === p.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Visitors", value: data?.totalSessions ?? "—", color: "indigo" },
            { icon: Eye, label: "Page Views", value: data?.totalPageViews ?? "—", color: "purple" },
            { icon: Clock, label: "Avg. Time", value: data ? fmtDuration(data.avgDuration) : "—", color: "green" },
            { icon: Globe, label: "Countries", value: data ? Object.keys(data.countries).length : "—", color: "amber" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className={`w-8 h-8 rounded-lg bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center mb-2`}>
                <s.icon size={16} className={`text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? "…" : s.value.toLocaleString?.() ?? s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {data && data.chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Traffic Over Time</h3>
            <div className="overflow-x-auto">
              <div className="flex items-end gap-1 h-32 min-w-[400px]">
                {data.chartData.map((d, i) => {
                  const h = maxChart > 0 ? Math.max(4, Math.round((d.sessions / maxChart) * 112)) : 4;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.label}: ${d.sessions} visitors`}>
                      <div className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t-sm transition-all hover:bg-indigo-600" style={{ height: h }} />
                      <span className="text-[9px] text-gray-400 rotate-45 origin-left translate-x-2">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Breakdown grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Traffic Sources</h4>
            <BarList data={data?.sources || {}} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Devices</h4>
            <BarList data={data?.devices || {}} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Browsers</h4>
            <BarList data={data?.browsers || {}} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Countries</h4>
            <BarList data={data?.countries || {}} />
          </div>
        </div>

        {/* Top Pages */}
        {data && data.topPages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">Top Pages</h3>
            <div className="space-y-2">
              {data.topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 font-mono truncate">{p.path}</span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{p.views.toLocaleString()} views</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Visitor Sessions
              {data && <span className="ml-2 text-xs text-gray-400 font-normal">({data.pagination.total.toLocaleString()} total)</span>}
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">Loading sessions…</div>
          ) : !data || data.sessions.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No visitors recorded yet for this period.</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {data.sessions.map(s => (
                <div key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <button
                    className="w-full text-left px-5 py-3"
                    onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <DeviceIcon device={s.device} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>{s.country}</span>
                        {s.city && <span className="text-gray-400 font-normal text-xs">{s.city}</span>}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{s.source}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{s.browser}</span>
                      <span className="text-xs text-gray-400">{s.pageCount} page{s.pageCount !== 1 ? "s" : ""}</span>
                      <span className="text-xs text-gray-400">{fmtDuration(s.duration)}</span>
                      <span className="ml-auto text-xs text-gray-400">{new Date(s.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </button>
                  {expandedSession === s.id && (
                    <div className="px-5 pb-4 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-gray-400">Device:</span> <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">{s.device}</span></div>
                        <div><span className="text-gray-400">OS:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{s.os}</span></div>
                        <div><span className="text-gray-400">Browser:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{s.browser}</span></div>
                        <div><span className="text-gray-400">Time spent:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{fmtDuration(s.duration)}</span></div>
                        <div><span className="text-gray-400">Source:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{s.source}</span></div>
                        {s.referrer && <div className="col-span-2"><span className="text-gray-400">Referrer:</span> <span className="font-medium text-gray-700 dark:text-gray-200 break-all">{s.referrer}</span></div>}
                        <div><span className="text-gray-400">Visited:</span> <span className="font-medium text-gray-700 dark:text-gray-200">{new Date(s.createdAt).toLocaleString()}</span></div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">Pages visited:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.pages.map((p, i) => (
                            <span key={i} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-mono">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-400">Page {data.pagination.page} of {data.pagination.pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
