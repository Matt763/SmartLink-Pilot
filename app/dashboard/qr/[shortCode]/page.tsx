"use client";

import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft, Download, QrCode, LinkIcon } from "lucide-react";

export default function QRCodePage() {
  const params = useParams();
  const shortCode = params?.shortCode as string;
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${shortCode}`;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${shortCode}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all w-fit"
          >
            <div className="p-2.5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10 group-hover:-translate-x-1 transition-all">
              <ArrowLeft size={18} />
            </div>
            Back to Dashboard
          </Link>
          
          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              QR Code <span className="text-indigo-600 dark:text-indigo-400">Assets</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">/{shortCode as string}</p>
          </div>
        </div>

        <div className="relative group">
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          
          <div className="relative bg-white dark:bg-gray-900/80 backdrop-blur-xl p-8 sm:p-16 rounded-[2rem] border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <QrCode size={200} />
            </div>

            <div className="relative bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700">
              <QRCodeSVG
                id="qr-code"
                value={url}
                size={220}
                level={"H"}
                includeMargin={true}
                className="w-full h-auto"
              />
            </div>
            
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm font-bold border border-gray-200/50 dark:border-gray-700/50 mb-4">
                 <LinkIcon size={14} className="text-indigo-500" />
                 {url}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Scan this code to visit the link directly. High resolution assets generated instantly.
              </p>
            </div>
            
            <button
              onClick={downloadQR}
              className="mt-10 flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 active:scale-95"
            >
              <Download size={20} />
              Download HQ Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
