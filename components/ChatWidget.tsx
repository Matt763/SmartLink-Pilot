"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, User } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING_MSGS = [
  "Welcome back, Boss! Ready to pilot smarter links today?",
  "Great to see you, CEO! SmartLink Pilot is all yours.",
  "Hello, Boss! Everything's running smoothly — let's build something great.",
  "You're in command. How can I help you today, Boss?",
];

function TypingText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const i = useRef(0);

  useEffect(() => {
    i.current = 0;
    setDisplayed("");
    const iv = setInterval(() => {
      if (i.current >= text.length) {
        clearInterval(iv);
        onDone?.();
        return;
      }
      setDisplayed(text.slice(0, i.current + 1));
      i.current++;
    }, 35);
    return () => clearInterval(iv);
  }, [text, onDone]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingDone, setGreetingDone] = useState(false);
  const [greetingText] = useState(() => GREETING_MSGS[Math.floor(Math.random() * GREETING_MSGS.length)]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: isAdmin
        ? `Welcome back, Boss! I'm **Paulina**. Everything is running smoothly today.\n\n• Platform overview\n• Link management\n• Support escalation\n• Account settings`
        : `Hi there! 👋 I'm **Paulina**, your SmartLink Pilot assistant. How can I help you today?\n\n• Link shortening & management\n• Account & billing help\n• Password reset\n• Plan upgrades`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputActive, setInputActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const greeterShownRef = useRef(false);

  // CEO greeting — show once per session
  useEffect(() => {
    if (!isAdmin || greeterShownRef.current) return;
    const shown = sessionStorage.getItem("slp_greeted");
    if (shown) return;
    greeterShownRef.current = true;
    const t = setTimeout(() => {
      setShowGreeting(true);
      sessionStorage.setItem("slp_greeted", "1");
    }, 1200);
    return () => clearTimeout(t);
  }, [isAdmin]);

  // Auto-dismiss greeting after it finishes typing + 3s
  useEffect(() => {
    if (!greetingDone) return;
    const t = setTimeout(() => setShowGreeting(false), 3500);
    return () => clearTimeout(t);
  }, [greetingDone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Do NOT auto-focus input — let the user tap it to trigger the keyboard
  // This prevents the keyboard popping immediately on mobile when panel opens

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages.slice(-8) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
    setLoading(false);
  };

  const formatMessage = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 underline hover:text-blue-300">$1</a>')
      .replace(/\n/g, "<br/>");

  return (
    <>
      {/* CEO Greeting popup above button */}
      {isAdmin && showGreeting && (
        <div className="fixed bottom-24 right-4 z-[60] max-w-[260px] animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-2xl shadow-indigo-500/30 text-sm font-medium leading-relaxed">
            <TypingText text={greetingText} onDone={() => setGreetingDone(true)} />
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-purple-700 rotate-45 rounded-sm" />
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { setOpen(v => !v); setShowGreeting(false); }}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          open
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/40"
        }`}
        aria-label="Chat with Paulina"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30">
            <Image src="/paulina-assistant.jpg" alt="Paulina" fill className="object-cover" sizes="40px" />
          </div>
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-2 sm:right-6 z-50 w-[min(320px,calc(100vw-16px))] sm:w-[360px] max-h-[calc(100dvh-120px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/30 flex-shrink-0">
              <Image src="/paulina-assistant.jpg" alt="Paulina" fill className="object-cover" sizes="36px" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm font-bold leading-tight">Paulina</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/70 text-[10px] truncate">Online · SmartLink Pilot Support</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition p-1 flex-shrink-0" aria-label="Close">
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[160px] bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                    <Image src="/paulina-assistant.jpg" alt="Paulina" fill className="object-cover" sizes="24px" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm"
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <Image src="/paulina-assistant.jpg" alt="Paulina" fill className="object-cover" sizes="24px" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-3 py-2.5 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <div key={d} className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask Paulina anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onFocus={() => setInputActive(true)}
                onBlur={() => setInputActive(false)}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition min-w-0"
                disabled={loading}
                autoComplete="off"
                autoCorrect="off"
              />
              <button type="submit" disabled={!input.trim() || loading} className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                <Send size={14} />
              </button>
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-1.5">Powered by SmartLink Pilot</p>
          </form>
        </div>
      )}
    </>
  );
}
