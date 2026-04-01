"use client";

import { useState } from "react";
import { X, Upload, Link as LinkIcon, Loader2, Video, Image as ImageIcon } from "lucide-react";

interface MediaModalProps {
  isOpen: boolean;
  type: "image" | "video";
  onClose: () => void;
  onUploadFile: (file: File) => Promise<void>;
  onEmbedLink: (link: string) => void;
}

export default function MediaUploadModal({ isOpen, type, onClose, onUploadFile, onEmbedLink }: MediaModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "embed">("upload");
  const [linkInput, setLinkInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await onUploadFile(e.target.files[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const submitEmbed = () => {
    if (linkInput.trim()) {
      let finalLink = linkInput.trim();
      
      // Auto-format standard and shortened YouTube links for iframe embedding
      if (finalLink.includes("youtube.com/watch?v=")) {
        finalLink = finalLink.replace("youtube.com/watch?v=", "youtube.com/embed/").split("&")[0];
      } else if (finalLink.includes("youtu.be/")) {
        finalLink = finalLink.replace("youtu.be/", "youtube.com/embed/").split("?")[0];
      }
      
      onEmbedLink(finalLink);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Luxury Blurred Background Overlay */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Glassmorphism Modal Frame */}
      <div className="relative w-full max-w-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden transform transition-all">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen"></div>

        <div className="relative z-10 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {type === "video" ? <Video className="text-indigo-500" /> : <ImageIcon className="text-purple-500" />} 
              Add Media
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-gray-100/50 dark:bg-black/20 rounded-xl backdrop-blur-sm">
            <button 
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'upload' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Upload Native File
            </button>
            <button 
              onClick={() => setActiveTab("embed")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'embed' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Embed Link (YouTube/Web)
            </button>
          </div>

          <div className="min-h-[160px] flex flex-col justify-center">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium animate-pulse">Processing high-fidelity upload...</p>
              </div>
            ) : activeTab === "upload" ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 hover:bg-white/40 dark:hover:bg-gray-800/40 hover:border-indigo-500 transition-colors flex flex-col items-center justify-center group cursor-pointer relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept={type === "video" ? "video/mp4,video/webm" : "image/*"}
                  onChange={handleFileSelect}
                />
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white text-center">Click to select or drag & drop</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {type === "video" ? "MP4 or WebM up to 50MB" : "PNG, JPG, or WEBP up to 5MB"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm backdrop-blur-md transition-all"
                    placeholder={`Paste ${type} URL here...`}
                  />
                </div>
                <button 
                  onClick={submitEmbed}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Insert Embed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
