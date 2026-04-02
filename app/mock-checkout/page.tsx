"use client";

import { Suspense, useState } from "react";
import { CreditCard, CheckCircle, ShieldCheck, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const PLANS: Record<string, { label: string; price: string }> = {
  pro: { label: "SmartLink Pro", price: "$6.99" },
  enterprise: { label: "SmartLink Enterprise", price: "$12.99" },
};

function CheckoutContent() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan") || "pro";
  const plan = PLANS[planKey] || PLANS.pro;

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    const res = await fetch("/api/stripe/mock-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planName: planKey }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard?upgrade=success&plan=${planKey}`);
      }, 2000);
    } else {
      setLoading(false);
      alert("Payment simulation failed.");
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
      {!success ? (
        <>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Checkout</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Test Mode — No real charges</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-300 font-medium">{plan.label}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{plan.price}/mo</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 flex justify-between items-center">
              <span className="text-gray-900 dark:text-white font-bold">Total Due</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{plan.price}</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm p-4 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p>This is a simulated payment for testing. No actual charges will be made.</p>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none disabled:opacity-60 transition-all"
            >
              {loading ? "Processing..." : <><Lock size={18} /> Simulate Payment</>}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-500 dark:text-gray-400">Your account has been upgraded to <strong>{plan.label}</strong>. Redirecting...</p>
        </div>
      )}
    </div>
  );
}

export default function MockCheckout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center py-12 px-4">
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
