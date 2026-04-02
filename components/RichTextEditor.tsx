"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const TOOLBAR_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ align: [] }],
    ["clean"],
  ],
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export default function RichTextEditor({ value, onChange, className }: Props) {
  return (
    <div className={`quill-wrapper ${className || ""}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={TOOLBAR_MODULES}
        placeholder="Write your article content here..."
      />
      <style jsx global>{`
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #e5e7eb;
          background: #f9fafb;
        }
        .dark .quill-wrapper .ql-toolbar {
          border-color: #374151;
          background: #1f2937;
        }
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e5e7eb;
          min-height: 420px;
          font-size: 15px;
          line-height: 1.7;
        }
        .dark .quill-wrapper .ql-container {
          border-color: #374151;
          background: #111827;
          color: #e5e7eb;
        }
        .dark .quill-wrapper .ql-editor {
          color: #e5e7eb;
        }
        .dark .quill-wrapper .ql-editor.ql-blank::before {
          color: #6b7280;
        }
        .dark .quill-wrapper .ql-toolbar .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .quill-wrapper .ql-toolbar .ql-fill {
          fill: #9ca3af;
        }
        .dark .quill-wrapper .ql-toolbar .ql-picker {
          color: #9ca3af;
        }
        .dark .quill-wrapper .ql-toolbar button:hover .ql-stroke,
        .dark .quill-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #ffffff;
        }
        .dark .quill-wrapper .ql-toolbar button:hover .ql-fill,
        .dark .quill-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #ffffff;
        }
        .quill-wrapper .ql-editor h1,
        .quill-wrapper .ql-editor h2,
        .quill-wrapper .ql-editor h3 {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
