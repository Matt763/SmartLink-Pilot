"use client";

import { useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { Download, ExternalLink, QrCode as QrCodeIcon } from "lucide-react";

interface AdvancedQRCodeProps {
  url: string;
  size?: number;
  showActions?: boolean;
}

export function AdvancedQRCode({ url, size = 180, showActions = true }: AdvancedQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadQR = () => {
    setDownloading(true);
    setTimeout(() => {
      const canvas = qrRef.current?.querySelector("canvas");
      if (canvas) {
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `smartlink-qr-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      setDownloading(false);
    }, 100); // small delay to ensure rendering
  };

  const openQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>SmartLink QR Code</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f3f4f6; font-family: sans-serif; }
                .card { background: white; padding: 2rem; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); text-align: center; }
                img { max-width: 100%; height: auto; border-radius: 0.5rem; }
                h1 { margin-top: 1.5rem; font-size: 1.25rem; color: #111827; }
                p { color: #6b7280; word-break: break-all; margin-top: 0.5rem; max-width: 300px; }
              </style>
            </head>
            <body>
              <div class="card">
                <img src="${pngUrl}" alt="QR Code for ${url}" />
                <h1>Your SmartLink QR Code</h1>
                <p>${url}</p>
              </div>
            </body>
          </html>
        `);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={qrRef} 
        className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center relative overflow-hidden group"
      >
        <QRCode
          value={url}
          size={size}
          quietZone={5}
          logoImage="/logo.svg"
          logoWidth={size * 0.25}
          logoHeight={size * 0.25}
          logoPadding={2}
          logoPaddingStyle="circle"
          qrStyle="dots"
          eyeRadius={[
            { outer: 8, inner: 4 }, // top/left
            { outer: 8, inner: 4 }, // top/right
            { outer: 8, inner: 4 }, // bottom/left
          ]}
          fgColor="#1e1b4b" // Deep indigo to match branding
          bgColor="#ffffff"
        />
        
        {/* Overlay hover effect optional */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
      </div>

      {showActions && (
        <div className="flex w-full gap-2 mt-4">
          <button
            onClick={downloadQR}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
          >
            {downloading ? <span className="animate-pulse">Saving...</span> : <><Download size={14} /> Download</>}
          </button>
          <button
            onClick={openQR}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-xs font-semibold rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
          >
            <ExternalLink size={14} /> Open
          </button>
        </div>
      )}
    </div>
  );
}
