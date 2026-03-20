"use client";

import { useState } from "react";
import { CreditCard, CheckCircle, ShieldCheck, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MockCheckout() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const res = await fetch("/api/stripe/mock-webhook", {
      method: "POST"
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?upgrade=success");
      }, 2000);
    } else {
      setLoading(false);
      alert("Payment simulation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700">
        {!success ? (
          <>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Checkout</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Local Development Simulation Mode</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-300 font-medium">SmartLink PRO</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">$10.00</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-bold">Total Due</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">$10.00</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm p-4 rounded-lg flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p>This is a simulated payment gateway for local testing. No actual charges will be made.</p>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-400"
              >
                {loading ? "Processing..." : (
                  <>
                    <Lock size={18} /> Simulate Payment
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-500 dark:text-gray-400">Your account has been upgraded to PRO. Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
