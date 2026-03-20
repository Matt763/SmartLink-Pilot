"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const { shortCode } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics/${shortCode}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shortCode]);

  if (loading) return <div className="p-12 text-center text-gray-500 text-lg">Loading analytics...</div>;
  if (!data || data.error) return <div className="p-12 text-center text-red-500 font-medium">{data?.error || "Error loading analytics"}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics for /{shortCode as string}</h1>
          <p className="text-gray-500 mt-1">{data.url.originalUrl}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Clicks</h3>
          <p className="text-5xl font-extrabold text-blue-600">{data.totalClicks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Created On</h3>
          <p className="text-3xl font-bold text-gray-900">
            {new Date(data.url.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Clicks (Last 7 Days)</h2>
        <div className="h-80 w-full text-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#6b7280'}} dy={10} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{fill: '#6b7280'}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Devices</h2>
          <div className="h-64 text-sm">
            {data.devices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.devices} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.devices.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No device data yet</div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Countries</h2>
          <div className="h-64 text-sm">
            {data.countries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.countries} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.countries.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No country data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
