import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowLeft, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Link Expired — SmartLink Pilot",
  description: "This shortened link has expired and is no longer active.",
  robots: { index: false },
};

export default function ExpiredPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30">
          <Clock className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">This Link Has Expired</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
          The SmartLink Pilot short link you followed had an expiry date set by its creator, and that date has now passed. The link is no longer active.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
          If you need access to the destination, please contact the person who shared this link with you.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5 mb-8 text-left">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Create your own links with expiry control</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">With SmartLink Pilot Pro, you can set expiry dates, passwords, and more. Take full control of your shared links.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/login" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg">
            Get Started Free
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Home size={15} /> Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
