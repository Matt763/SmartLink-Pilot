"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Loader2, Save, Trash2, Settings, ArrowLeft, Zap, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [activePost, setActivePost] = useState<Partial<BlogPost>>({ title: "", content: "", excerpt: "", slug: "", published: true });
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [topicPrompt, setTopicPrompt] = useState("");
  
  // Mass Generator State
  const [massGenCount, setMassGenCount] = useState(5);
  const [massGenActive, setMassGenActive] = useState(false);
  const [massGenProgress, setMassGenProgress] = useState(0);

  // AI Key Integration
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/blog");
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey) return;
    try {
        await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "set_setting", key: "OPENAI_API_KEY", value: apiKey })
        });
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 3000);
        setApiKey("");
    } catch(e) {
        console.error("Failed saving API key");
    }
  };

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Slug Automation: Real-time synchronization
  useEffect(() => {
    if (!isEditing || !activePost.title) return;
    
    // Only auto-generate if slug is currently empty or was previously auto-generated from an empty state
    // We check if the trimmed slug is empty to trigger the automation
    if (!activePost.slug || activePost.slug.trim() === "") {
        const generatedSlug = activePost.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setActivePost(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [activePost.title, isEditing]);

  // Auto-Save Mechanism
  useEffect(() => {
    if (!isEditing || !activePost.title || !activePost.content) return;

    const timer = setTimeout(async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...activePost, published: activePost.published ?? false })
            });
            const savedPost = await res.json();
            
            // If it's a new post, we capture the ID to ensure future updates upsert correctly
            if (!activePost.id && savedPost.id) {
                setActivePost(prev => ({ ...prev, id: savedPost.id }));
            }
            setLastSaved(new Date());
        } catch (e) {
            console.error("Auto-sync failed", e);
        } finally {
            setSaving(false);
        }
    }, 4000); // Debounce for 4 seconds of idle time

    return () => clearTimeout(timer);
  }, [activePost.title, activePost.content, activePost.id, isEditing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activePost, published: true }) // Force Live Publish
      });
      if (res.ok) {
        alert("Post Successfully Deployed to Live Architecture.");
        setIsEditing(false);
        fetchPosts();
      } else {
        alert("Failed to save post");
      }
    } catch (e) {
      alert("Error saving post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this blog post?")) return;
    try {
      await fetch("/api/admin/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchPosts();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const handleAIGenerate = async (targetTopic: string, autoSave: boolean = false) => {
    if (!targetTopic.trim()) return;
    if (!autoSave) setAiLoading(true);
    
    try {
      const res = await fetch("/api/admin/ai-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic })
      });
      
      if (!res.ok) throw new Error("AI Generation failed");
      
      const { title, excerpt, content } = await res.json();
      
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      
      // Structural Transformer: Convert MD headers to HTML for the Quill editor
      const processedContent = content
        .split('\n')
        .map(line => {
          const headerMatch = line.match(/^(#{1,4})\s+(.*)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            return `<h${level}>${headerMatch[2]}</h${level}>`;
          }
          if (line.trim() === "") return "<p><br></p>"; // Quill newline
          return `<p>${line}</p>`;
        })
        .join("");

      const newPostData = {
        title, slug, excerpt, content: processedContent, published: true
      };

      if (autoSave) {
        await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPostData)
        });
      } else {
        setActivePost(newPostData);
      }
    } catch (e: any) {
      console.error(e);
      if (!autoSave) alert("Error generating post: " + e.message);
    } finally {
      if (!autoSave) setAiLoading(false);
    }
  };

  const runMassGenerator = async () => {
    if (!confirm(`Are you sure you want to trigger OpenAI ${massGenCount} times? This will consume API credits.`)) return;
    setMassGenActive(true);
    setMassGenProgress(0);

    // List of broad SaaS/marketing topics
    const genericTopics = [
      "URL shortening basics", "Marketing ROI optimization", "Social media link tracking",
      "QR code strategies for retail", "Email marketing deep linking", "Affiliate link cloaking guide",
      "UTM parameters tutorial", "Custom domains branding", "Link retargeting strategies", "Metrics & Click Analytics"
    ];

    for (let i = 0; i < massGenCount; i++) {
        const selectedTopic = genericTopics[i % genericTopics.length] + " " + Math.floor(Math.random() * 1000);
        await handleAIGenerate("How to master " + selectedTopic, true);
        setMassGenProgress(i + 1);
    }

    setMassGenActive(false);
    fetchPosts();
    alert("Mass Generation Complete!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-6">
                <Link href="/admin" className="group p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                    <ArrowLeft size={20} className="text-gray-400 group-hover:text-white" />
                </Link>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <span className="text-indigo-500">AI</span> CONTENT COMMAND
                    </h1>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.3em] mt-1">Autonomous Content Generation Engine</p>
                </div>
            </div>
          </div>
          <button 
            onClick={() => { setActivePost({ title: "", content: "", excerpt: "", slug: "", published: true }); setIsEditing(true); }}
            className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Plus size={20} /> <span className="relative z-10 uppercase tracking-tighter">Initialize New Post</span>
          </button>
        </div>

        {/* Command Center: Mass Generator */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-3xl overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Settings size={120} className="text-white animate-spin-slow" />
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                <Sparkles size={20} className="text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Automated Fleet Generator</h2>
                        </div>
                        <p className="max-w-2xl text-gray-400 font-medium leading-relaxed">
                            Deploy high-performance AI sub-agents to synthesize and publish SEO-optimized technical articles. 
                            Each generation utilizes advanced LLM chains to ensure 1500+ words of unique, high-value value.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative">
                            <input 
                                type="number" 
                                min={1} max={100}
                                value={massGenCount}
                                onChange={(e) => setMassGenCount(Number(e.target.value))}
                                className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl w-full sm:w-32 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-center shadow-inner"
                            />
                            <span className="absolute -top-3 left-4 px-2 bg-[#0a0a0a] text-[10px] font-bold text-gray-500 uppercase">Payload Count</span>
                        </div>
                        <button 
                            onClick={runMassGenerator}
                            disabled={massGenActive}
                            className={`group px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 font-black uppercase tracking-tight disabled:opacity-50 ${massGenActive ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}`}
                        >
                            {massGenActive ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-current"/>}
                            {massGenActive ? `GENERATING ${massGenProgress}/${massGenCount}` : "Execute Hyper-Batch"}
                        </button>
                    </div>
                </div>
                
                {massGenActive && (
                    <div className="mt-10 space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                            <span>Fleet Progress</span>
                            <span>{Math.round((massGenProgress/massGenCount)*100)}% Complete</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-3 p-1">
                            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${(massGenProgress/massGenCount)*100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Core Editor / Draft View */}
        {isEditing && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-white/10 shadow-4xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Syndication Architect</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        {lastSaved && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 rounded-full border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-in fade-in zoom-in">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                Last Encrypted Sync: {lastSaved.toLocaleTimeString()}
                            </div>
                        )}
                        <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-400 font-bold bg-white/5 hover:bg-white/10 rounded-2xl transition tracking-tight">Abort Session</button>
                        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 shadow-2xl transition transform uppercase tracking-tighter group overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {saving ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} className="fill-current" />} Deploy to Live
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-10">
                    <div className="flex-1 space-y-8 relative z-10">
                        <div className="group space-y-2">
                             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Primary Title Element</label>
                             <input 
                                className="w-full text-4xl font-black p-4 bg-transparent text-white border-b-2 border-white/10 focus:border-indigo-500 focus:outline-none transition-colors placeholder-white/20 tracking-tighter" 
                                placeholder="Article Headline..." 
                                value={activePost.title} 
                                onChange={e => setActivePost({...activePost, title: e.target.value})} 
                            />
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 group space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Secure Routing Path</label>
                                <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono text-indigo-400 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" placeholder="slug-url-path" value={activePost.slug} onChange={e => setActivePost({...activePost, slug: e.target.value})} />
                            </div>
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Traffic Status</label>
                                <label className="flex items-center gap-3 h-[54px] px-8 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition group">
                                    <input type="checkbox" className="w-5 h-5 rounded-lg border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500 transition cursor-pointer" checked={activePost.published} onChange={e => setActivePost({...activePost, published: e.target.checked})} /> 
                                    <span className="font-black text-sm uppercase tracking-tighter text-white">Live Broadcast</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Executive Summary</label>
                             <textarea 
                                className="w-full h-28 p-6 bg-white/5 border border-white/10 rounded-2xl resize-none text-gray-300 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner leading-relaxed" 
                                placeholder="Brief architectural overview of the content..." 
                                value={activePost.excerpt} 
                                onChange={e => setActivePost({...activePost, excerpt: e.target.value})} 
                            />
                        </div>
                        
                        <div className="space-y-4">
                             <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                                 Main Content Matrix <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                             </label>
                             <div className="min-h-[600px] bg-white/5 border border-white/10 rounded-3xl p-4 shadow-inner ring-1 ring-white/5">
                                <RichTextEditor 
                                    value={activePost.content || ""} 
                                    onChange={v => setActivePost({...activePost, content: v})} 
                                />
                             </div>
                        </div>
                    </div>

                    {/* AI Intelligence Sidebar */}
                    <div className="w-full xl:w-96 flex flex-col gap-6 sticky top-8 h-fit">
                        <div className="relative group overflow-hidden bg-indigo-600 rounded-[2rem] p-8 shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <Sparkles size={24} className="text-white fill-current"/>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Neuro-Scribe</h3>
                                </div>
                                <p className="text-xs font-bold text-indigo-100 leading-relaxed uppercase tracking-widest opacity-80">
                                    Input your operational parameters and the AI will synthesize a complete technical dossier.
                                </p>
                                <textarea 
                                    className="w-full h-40 p-4 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/40 focus:bg-white/20 outline-none transition resize-none font-medium" 
                                    placeholder="Operational objective (e.g. Masterclass on Link Infrastructure)..."
                                    value={topicPrompt}
                                    onChange={e => setTopicPrompt(e.target.value)}
                                />
                                <button 
                                    onClick={() => handleAIGenerate(topicPrompt)}
                                    disabled={aiLoading}
                                    className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition shadow-2xl uppercase tracking-tighter text-sm"
                                >
                                    {aiLoading ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18}/>} 
                                    {aiLoading ? "Synthesizing..." : "Initiate Protocol"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Lock size={18} className="text-indigo-400" />
                                <h3 className="font-black text-white uppercase tracking-tighter text-sm">Security Gateway</h3>
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OpenAI Command Authorization</p>
                            <input 
                                type="password"
                                placeholder="sk-proj-••••••••"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-mono text-indigo-400 focus:bg-white/10 outline-none transition shadow-inner"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button 
                                onClick={saveApiKey}
                                className={`w-full py-4 rounded-xl font-black transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${keySaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                                {keySaved ? "Access Granted ✓" : "Commit Access Key"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Operational Records Table */}
        {!isEditing && (
            <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-4xl relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Knowledge Repository</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">Archived Publications & Telemetry</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="px-5 py-2 bg-white/5 rounded-full text-[10px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                             {posts.length} RECORDS
                         </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={48}/>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accessing Secure Vault...</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="max-w-md mx-auto space-y-6">
                            <Sparkles size={64} className="mx-auto text-gray-700 opacity-20" />
                            <p className="text-gray-500 font-black text-lg tracking-tight uppercase">Archive is currently empty.</p>
                            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest">Initialize First Record</button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-8 font-black text-[10px] text-gray-500 uppercase tracking-[0.2em]">Publication Descriptor</th>
                                <th className="p-8 font-black text-[10px] text-gray-500 uppercase tracking-[0.2em] w-48 text-center">Operational Status</th>
                                <th className="p-8 font-black text-[10px] text-gray-500 uppercase tracking-[0.2em] w-48 text-center">Staged Time</th>
                                <th className="p-8 w-48"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {posts.map(post => (
                            <tr key={post.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="p-8">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-lg font-black text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase leading-tight">{post.title}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                                            <span className="text-[10px] text-gray-500 font-mono tracking-tighter">SOURCE: /blog/{post.slug}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 text-center">
                                    <div className="inline-flex">
                                        {post.published ? (
                                            <span className="px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">Live</span>
                                        ) : (
                                            <span className="px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">Offline</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-8 text-center">
                                    <span className="text-sm font-black text-gray-500 uppercase tabular-nums">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <button 
                                            onClick={() => { setActivePost(post); setIsEditing(true); }} 
                                            className="px-6 py-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-2xl"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(post.id)} 
                                            className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl transition-all group/del"
                                        >
                                            <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
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
    </div>
  );
}
