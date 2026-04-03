"use client";

import { useState, useEffect } from "react";
import {
  Sparkles, Plus, Loader2, Save, Trash2, ArrowLeft, Zap,
  Eye, EyeOff, RotateCcw, Check, Image as ImageIcon, Youtube, Upload
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import MediaUploadModal from "@/components/MediaUploadModal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  youtubeId?: string;
  published: boolean;
  createdAt: string;
}

const EMPTY_POST: Partial<BlogPost> = {
  title: "", content: "", excerpt: "", slug: "",
  featuredImage: "", youtubeId: "", published: false,
};

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activePost, setActivePost] = useState<Partial<BlogPost>>(EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [topicPrompt, setTopicPrompt] = useState("");
  const [massGenCount, setMassGenCount] = useState(5);
  const [massGenActive, setMassGenActive] = useState(false);
  const [massGenProgress, setMassGenProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const handleFeaturedImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    setActivePost(prev => ({ ...prev, featuredImage: url }));
    setImageModalOpen(false);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing || !activePost.title) return;
    if (!activePost.slug || activePost.slug.trim() === "") {
      const slug = activePost.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      setActivePost(prev => ({ ...prev, slug }));
    }
  }, [activePost.title, isEditing]);

  // Auto-save after 4 seconds of inactivity
  useEffect(() => {
    if (!isEditing || !activePost.title || !activePost.content) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...activePost, published: activePost.published ?? false }),
        });
        const savedPost = await res.json();
        if (!activePost.id && savedPost.id) {
          setActivePost(prev => ({ ...prev, id: savedPost.id }));
        }
        setLastSaved(new Date());
      } catch (e) {
        console.error("Auto-save failed", e);
      } finally {
        setSaving(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [activePost.title, activePost.content, activePost.id, isEditing]);

  const handleSave = async (publish = true) => {
    if (!activePost.title || !activePost.content) {
      alert("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activePost, published: publish }),
      });
      if (res.ok) {
        const savedPost = await res.json();
        if (!activePost.id && savedPost.id) setActivePost(prev => ({ ...prev, id: savedPost.id }));
        setLastSaved(new Date());
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        if (publish) {
          setIsEditing(false);
          fetchPosts();
        }
      } else {
        alert("Failed to save post.");
      }
    } catch (e) {
      alert("Error saving post.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchPosts();
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  const handleAIGenerate = async (targetTopic: string, autoSave = false) => {
    if (!targetTopic.trim()) return;
    if (!autoSave) setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic }),
      });
      if (!res.ok) throw new Error("AI generation failed");
      const { title, excerpt, content } = await res.json();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const processedContent = content.split("\n").map((line: string) => {
        const headerMatch = line.match(/^(#{1,4})\s+(.*)$/);
        if (headerMatch) return `<h${headerMatch[1].length}>${headerMatch[2]}</h${headerMatch[1].length}>`;
        if (line.trim() === "") return "<p><br></p>";
        return `<p>${line}</p>`;
      }).join("");
      const newPostData = { title, slug, excerpt, content: processedContent, published: false };
      if (autoSave) {
        await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPostData),
        });
      } else {
        setActivePost(newPostData);
      }
    } catch (e: any) {
      if (!autoSave) alert("Error: " + e.message);
    } finally {
      if (!autoSave) setAiLoading(false);
    }
  };

  const runMassGenerator = async () => {
    if (!confirm(`This will use OpenAI API ${massGenCount} times. Continue?`)) return;
    setMassGenActive(true);
    setMassGenProgress(0);
    const topics = [
      "URL shortening basics", "Marketing ROI optimization", "Social media link tracking",
      "QR code strategies", "Email marketing deep linking", "Affiliate link cloaking",
      "UTM parameters tutorial", "Custom domains branding", "Link retargeting strategies", "Click analytics mastery",
    ];
    for (let i = 0; i < massGenCount; i++) {
      const topic = topics[i % topics.length] + " " + Math.floor(Math.random() * 1000);
      await handleAIGenerate("How to master " + topic, true);
      setMassGenProgress(i + 1);
    }
    setMassGenActive(false);
    fetchPosts();
    alert("Batch generation complete!");
  };

  const openEditor = (post?: BlogPost) => {
    setActivePost(post ? { ...post } : { ...EMPTY_POST });
    setLastSaved(null);
    setSaved(false);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition shadow-sm">
              <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Manager</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{posts.length} article{posts.length !== 1 ? "s" : ""} total</p>
            </div>
          </div>
          <button
            onClick={() => openEditor()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} /> New Post
          </button>
        </div>

        {/* AI Batch Generator */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">AI Batch Post Generator</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Auto-generate and publish multiple SEO-optimized articles at once using AI.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <input
                  type="number" min={1} max={50}
                  value={massGenCount}
                  onChange={e => setMassGenCount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute -top-2.5 left-2 text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-900 px-1">Count</span>
              </div>
              <button
                onClick={runMassGenerator}
                disabled={massGenActive}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-sm"
              >
                {massGenActive
                  ? <><Loader2 size={16} className="animate-spin" /> {massGenProgress}/{massGenCount}</>
                  : <><Zap size={16} /> Generate</>
                }
              </button>
            </div>
          </div>
          {massGenActive && (
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Generating articles…</span>
                <span>{Math.round((massGenProgress / massGenCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(massGenProgress / massGenCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        {isEditing && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">

            {/* Editor header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  {activePost.id ? "Edit Post" : "New Post"}
                </h2>
                {lastSaved && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {saving && (
                  <span className="text-xs text-indigo-500 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Saving…
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <Save size={15} /> Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {saved ? <><Check size={15} /> Published!</> : <><Eye size={15} /> Publish</>}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-0">

              {/* Main form fields */}
              <div className="flex-1 p-6 space-y-6">

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Title *</label>
                  <input
                    className="w-full text-2xl font-bold px-0 py-1 bg-transparent text-gray-900 dark:text-white border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition placeholder-gray-300 dark:placeholder-gray-600"
                    placeholder="Article title…"
                    value={activePost.title || ""}
                    onChange={e => setActivePost({ ...activePost, title: e.target.value })}
                  />
                </div>

                {/* Slug + Published */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">URL Slug *</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <span className="text-gray-400 text-sm">/blog/</span>
                      <input
                        className="flex-1 bg-transparent text-sm font-mono text-indigo-600 dark:text-indigo-400 focus:outline-none"
                        placeholder="url-slug"
                        value={activePost.slug || ""}
                        onChange={e => setActivePost({ ...activePost, slug: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Visibility</label>
                    <label className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition h-[46px]">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={activePost.published ?? false}
                        onChange={e => setActivePost({ ...activePost, published: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {activePost.published ? "Published" : "Draft"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Excerpt / Summary</label>
                  <textarea
                    className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition leading-relaxed"
                    placeholder="Brief description shown on the blog listing page…"
                    value={activePost.excerpt || ""}
                    onChange={e => setActivePost({ ...activePost, excerpt: e.target.value })}
                  />
                </div>

                {/* Featured Image + YouTube */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      <ImageIcon size={13} /> Featured Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="https://example.com/image.jpg"
                        value={activePost.featuredImage || ""}
                        onChange={e => setActivePost({ ...activePost, featuredImage: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setImageModalOpen(true)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm font-semibold transition"
                        title="Upload image"
                      >
                        <Upload size={15} /> Upload
                      </button>
                    </div>
                    {activePost.featuredImage && (
                      <img src={activePost.featuredImage} alt="Preview" className="mt-2 h-20 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                  </div>
                  <div className="sm:w-56">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      <Youtube size={13} /> YouTube Video ID
                    </label>
                    <input
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      placeholder="dQw4w9WgXcQ"
                      value={activePost.youtubeId || ""}
                      onChange={e => setActivePost({ ...activePost, youtubeId: e.target.value })}
                    />
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Content *</label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <RichTextEditor
                      value={activePost.content || ""}
                      onChange={v => setActivePost({ ...activePost, content: v })}
                    />
                  </div>
                </div>
              </div>

              {/* AI sidebar */}
              <div className="xl:w-80 flex-shrink-0 p-6 border-t xl:border-t-0 xl:border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="fill-current" />
                    <h3 className="font-bold">AI Writer</h3>
                  </div>
                  <p className="text-xs text-indigo-100 mb-4 leading-relaxed">
                    Enter a topic and the AI will generate a full article for you.
                  </p>
                  <textarea
                    className="w-full h-28 p-3 bg-white/15 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:bg-white/20 outline-none transition resize-none"
                    placeholder="e.g. How to use UTM parameters for marketing campaigns"
                    value={topicPrompt}
                    onChange={e => setTopicPrompt(e.target.value)}
                  />
                  <button
                    onClick={() => handleAIGenerate(topicPrompt)}
                    disabled={aiLoading || !topicPrompt.trim()}
                    className="w-full mt-3 py-2.5 bg-white text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition text-sm disabled:opacity-60"
                  >
                    {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Zap size={16} /> Generate Article</>}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Publishing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                      <span>Status</span>
                      <span className={`font-semibold ${activePost.published ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {activePost.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    {activePost.id && (
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span>URL</span>
                        <a href={`/blog/${activePost.slug}`} target="_blank" rel="noopener" className="text-indigo-600 dark:text-indigo-400 text-xs font-mono hover:underline truncate max-w-[130px]">
                          /blog/{activePost.slug}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts list */}
        {!isEditing && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">All Posts</h3>
            </div>

            {loading ? (
              <div className="py-16 flex items-center justify-center gap-3 text-gray-400">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
                <span className="text-sm">Loading posts…</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center">
                <Sparkles size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">No posts yet</p>
                <button
                  onClick={() => openEditor()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm"
                >
                  Create your first post
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-36">Date</th>
                      <th className="px-6 py-3 w-28" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {posts.map(post => (
                      <tr key={post.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">/blog/{post.slug}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {post.published ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditor(post)}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <MediaUploadModal
        isOpen={imageModalOpen}
        type="image"
        onClose={() => setImageModalOpen(false)}
        onUploadFile={handleFeaturedImageUpload}
        onEmbedLink={(link) => {
          setActivePost(prev => ({ ...prev, featuredImage: link }));
          setImageModalOpen(false);
        }}
      />
    </div>
  );
}
