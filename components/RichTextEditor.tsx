"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import "react-quill/dist/quill.snow.css";
import MediaUploadModal from "./MediaUploadModal";

// Prevent SSR crashing `document is not defined`
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    
    // We can inject video handler configurations globally here if needed
    // But mostly Quill has default handlers we just override.
    return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false, loading: () => <div className="h-64 bg-gray-50 animate-pulse border rounded-lg"></div> }
);

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: EditorProps) {
  const quillRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Customize Quill Icons on Mount
    const initializeIcons = async () => {
        const { default: Quill } = await import("quill");
        const icons = Quill.import("ui/icons");
        const BlockEmbed = Quill.import('blots/block/embed');

        // Define Smart Video Blot (Modified for stability)
        class VideoBlot extends BlockEmbed {
          static create(value: string) {
            const isExternal = value.includes('youtube.com') || value.includes('youtu.be') || value.includes('vimeo.com');
            const wrapper = super.create();
            wrapper.setAttribute('class', 'ql-video-wrapper');
            wrapper.setAttribute('style', 'width: 100%; margin: 2rem 0;');

            if (isExternal) {
                const node = document.createElement('iframe');
                node.setAttribute('src', value);
                node.setAttribute('frameborder', '0');
                node.setAttribute('allowfullscreen', 'true');
                node.setAttribute('class', 'ql-video ql-video-external');
                node.setAttribute('style', 'width: 100%; aspect-ratio: 16/9; border-radius: 1.5rem;');
                wrapper.appendChild(node);
            } else {
                const node = document.createElement('video');
                node.setAttribute('src', value);
                node.setAttribute('controls', '');
                node.setAttribute('playsinline', '');
                node.setAttribute('class', 'ql-video ql-video-native');
                node.setAttribute('style', 'width: 100%; aspect-ratio: 16/9; border-radius: 1.5rem; background: #000;');
                wrapper.appendChild(node);
            }
            return wrapper;
          }
          static value(node: HTMLElement) {
            const media = node.querySelector('iframe, video');
            return media ? media.getAttribute('src') : null;
          }
        }
        VideoBlot.blotName = 'video';
        VideoBlot.tagName = 'div'; 
        Quill.register(VideoBlot);
        
        // Premium Lucide-style Icon Overwrites
        icons["bold"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bold"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/></svg>';
        icons["italic"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>';
        icons["underline"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-underline"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>';
        icons["strike"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-strikethrough"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>';
        icons["list"]["ordered"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-ordered"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>';
        icons["list"]["bullet"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>';
        icons["link"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
        icons["image"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
        icons["video"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>';
        icons["blockquote"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>';
        icons["code-block"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>';
        icons["clean"] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>';
    };
    initializeIcons();
  }, []);

  const uploadMediaNode = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  };

  const [modalState, setModalState] = useState<{isOpen: boolean, type: "image"|"video"}>({isOpen: false, type: "image"});

  const handleMediaUpload = async (file: File) => {
    try {
      const url = await uploadMediaNode(file);
      insertMediaToEditor(url, modalState.type);
      setModalState({ ...modalState, isOpen: false });
    } catch (e) {
      alert("Media upload failed.");
    }
  };

  const handleMediaEmbed = (link: string) => {
    insertMediaToEditor(link, modalState.type);
    setModalState({ ...modalState, isOpen: false });
  };

  const insertMediaToEditor = (url: string, type: "image"|"video") => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, type, url);
      quill.setSelection(range.index + 1);
    }
  };

  const imageHandler = useCallback(() => {
    setModalState({ isOpen: true, type: "image" });
  }, []);

  const videoHandler = useCallback(() => {
    setModalState({ isOpen: true, type: "video" });
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }, { size: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler, videoHandler]
  );

  const formats = [
    "header", "font", "size",
    "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent",
    "link", "image", "video",
    "color", "background", "align",
    "script", "code-block"
  ];

  if (!mounted) return <div className="h-64 bg-gray-50 border rounded-lg"></div>;

  return (
    <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl text-gray-900 dark:text-gray-100 rounded-[2rem] overflow-hidden border border-gray-200/50 dark:border-white/10 shadow-2xl quill-custom-editor flex flex-col relative z-0 transition-all duration-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/50">
      <style>{`
        .quill-custom-editor .ql-toolbar {
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(20px);
            border: none !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
            padding: 1.25rem 2rem !important;
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            align-items: center;
        }
        .dark .quill-custom-editor .ql-toolbar {
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .quill-custom-editor .ql-toolbar .ql-formats {
            margin-right: 1.5rem !important;
            padding-right: 1rem !important;
            border-right: 1px solid rgba(0, 0, 0, 0.05) !important;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        .dark .quill-custom-editor .ql-toolbar .ql-formats {
            border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        .quill-custom-editor .ql-toolbar .ql-formats:last-child {
            border-right: none !important;
            margin-right: 0 !important;
            padding-right: 0 !important;
        }
        .quill-custom-editor .ql-container {
            border: none !important;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 1.1rem;
            line-height: 1.8;
            padding: 1rem;
            min-height: 500px;
        }
        .quill-custom-editor .ql-editor {
            padding: 3rem !important;
        }
        .quill-custom-editor .ql-editor.ql-blank::before {
            color: rgba(156, 163, 175, 0.4);
            font-style: normal;
        }
        .quill-custom-editor .ql-video {
            width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: 2rem;
            margin: 3rem 0;
            box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.4);
            display: block;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        /* Buttons and Icons */
        .quill-custom-editor .ql-toolbar button {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 7px !important;
        }
        .quill-custom-editor .ql-toolbar button:hover {
            background-color: rgba(99, 102, 241, 0.1) !important;
            transform: translateY(-2px);
            color: #6366f1 !important;
        }
        .quill-custom-editor .ql-toolbar button:active {
            transform: translateY(0) scale(0.92);
        }
        .quill-custom-editor .ql-toolbar button.ql-active {
            background-color: #6366f1 !important;
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4) !important;
        }
        .quill-custom-editor .ql-toolbar button.ql-active svg {
            color: white !important;
            stroke: white !important;
        }
        .quill-custom-editor .ql-toolbar button svg {
            width: 100% !important;
            height: 100% !important;
            stroke: #6366f1;
            transition: all 0.3s;
        }
        /* Dropdowns / Pickers */
        .quill-custom-editor .ql-picker {
            color: #444 !important;
            font-weight: 800 !important;
            font-size: 0.85rem !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
        }
        .dark .quill-custom-editor .ql-picker {
            color: #ccc !important;
        }
        .quill-custom-editor .ql-picker-label {
            border-radius: 10px !important;
            transition: all 0.3s !important;
            padding: 0 12px !important;
            border: 1px solid transparent !important;
        }
        .quill-custom-editor .ql-picker-label:hover {
            background-color: rgba(99, 102, 241, 0.1) !important;
            color: #6366f1 !important;
        }
        .quill-custom-editor .ql-picker-label.ql-active {
            color: #6366f1 !important;
            background-color: rgba(99, 102, 241, 0.05) !important;
        }
        .quill-custom-editor .ql-picker-options {
            background-color: white !important;
            border-radius: 16px !important;
            border: 1px solid rgba(0, 0, 0, 0.05) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
            padding: 12px !important;
            margin-top: 8px !important;
            backdrop-filter: blur(20px);
        }
        .dark .quill-custom-editor .ql-picker-options {
            background-color: rgba(20, 20, 20, 0.9) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        }
        .quill-custom-editor .ql-picker-item {
            border-radius: 8px !important;
            padding: 6px 12px !important;
            transition: all 0.2s !important;
        }
        .quill-custom-editor .ql-picker-item:hover {
            color: #6366f1 !important;
            background-color: rgba(99, 102, 241, 0.05) !important;
        }
        .quill-custom-editor .ql-action {
            color: #6366f1 !important;
        }
      `}</style>
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Unleash your creative intelligence here..."
      />

      <MediaUploadModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onUploadFile={handleMediaUpload}
        onEmbedLink={handleMediaEmbed}
      />
    </div>
  );
}
