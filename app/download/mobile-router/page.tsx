"use client";

import { useOsDetect } from "@/hooks/useOsDetect";
import { APP_CONFIG } from "@/lib/app-config";
import { useEffect, useState } from "react";
import { Loader2, Smartphone, Download, AlertCircle } from "lucide-react";

export default function MobileRouterPage() {
  const os = useOsDetect();
  const [redirecting, setRedirecting] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    // We delay slightly so the animation is visible, providing feedback that their scan worked
    const timer = setTimeout(() => {
      if (os === "android") {
        if (APP_CONFIG.playStoreUrl && APP_CONFIG.playStoreUrl !== "#") {
          window.location.href = APP_CONFIG.playStoreUrl;
        } else {
          // Fallback directly to APK direct download if Play Store link is missing
          const link = document.createElement("a");
          link.href = APP_CONFIG.apkDownloadUrl;
          link.setAttribute("download", "SmartLinkPilot.apk");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setRedirecting(false);
        }
      } else if (os === "ios") {
        if (APP_CONFIG.appStoreUrl && APP_CONFIG.appStoreUrl !== "#") {
          window.location.href = APP_CONFIG.appStoreUrl;
        } else {
          setErrorStatus("iOS App is still under review by Apple. Please check back later.");
          setRedirecting(false);
        }
      } else {
        // Fallback for desktops scanning the QR or unknown OS
        window.location.href = "/download";
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [os]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
        {redirecting ? (
          <>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyzing Device...</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please wait while we route you to the correct app store for your OS.</p>
          </>
        ) : errorStatus ? (
          <>
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notice</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{errorStatus}</p>
            <a href="/download" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition text-sm">
              Return to Downloads
            </a>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Download Started</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Your download should begin automatically. If not, click below.</p>
            <a href={APP_CONFIG.apkDownloadUrl} download="SmartLinkPilot.apk" className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm">
              <Download size={16} /> Force Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}
