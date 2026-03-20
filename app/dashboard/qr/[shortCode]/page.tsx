"use client";

import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export default function QRCodePage() {
  const { shortCode } = useParams();
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
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">QR Code for /{shortCode as string}</h1>
        </div>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <QRCodeSVG
            id="qr-code"
            value={url}
            size={256}
            level={"H"}
            includeMargin={true}
          />
        </div>
        <p className="mt-6 text-gray-500 text-lg font-medium">{url}</p>
        
        <button
          onClick={downloadQR}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          <Download size={20} />
          Download Fast PNG
        </button>
      </div>
    </div>
  );
}
