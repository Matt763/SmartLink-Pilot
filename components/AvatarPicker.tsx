"use client";

/**
 * AvatarPicker — shown once after a credential-based sign-up (or when a user
 * has no profile image set).  Lets the user choose one of 9 movie-character
 * avatars.  On save, the chosen avatar URL is persisted to User.image and the
 * NextAuth session is updated so AppShell sees the image and proceeds.
 */

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Check, Loader2 } from "lucide-react";

const AVATARS = [
  { id: 1, src: "/avatars/avatar-1.svg", name: "Dark Lord"     },
  { id: 2, src: "/avatars/avatar-2.svg", name: "Iron Warrior"  },
  { id: 3, src: "/avatars/avatar-3.svg", name: "Dark Knight"   },
  { id: 4, src: "/avatars/avatar-4.svg", name: "Web Slinger"   },
  { id: 5, src: "/avatars/avatar-5.svg", name: "Elder Wizard"  },
  { id: 6, src: "/avatars/avatar-6.svg", name: "Shadow Agent"  },
  { id: 7, src: "/avatars/avatar-7.svg", name: "Cyber Unit"    },
  { id: 8, src: "/avatars/avatar-8.svg", name: "Forest Guard"  },
  { id: 9, src: "/avatars/avatar-9.svg", name: "Speed Force"   },
] as const;

export default function AvatarPicker({ onComplete }: { onComplete: () => void }) {
  const { update } = useSession();
  const [selected, setSelected] = useState<number | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");

    const avatar = AVATARS.find((a) => a.id === selected)!;

    try {
      const res = await fetch("/api/user/avatar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ avatarUrl: avatar.src }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save. Please try again.");
        setSaving(false);
        return;
      }

      // Refresh the NextAuth JWT so session.user.image is updated
      await update({ image: avatar.src });
      onComplete();
    } catch {
      setError("Network error. Please try again.");
    }

    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#080812]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative px-6 pt-12 pb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <span className="text-2xl">🎭</span>
        </div>
        <h2 className="text-[22px] font-extrabold text-white tracking-tight">
          Pick your avatar
        </h2>
        <p className="text-[13px] text-gray-400 mt-1.5">
          Choose a character that represents you. You can change it later.
        </p>
      </div>

      {/* 3 × 3 avatar grid */}
      <div className="relative flex-1 overflow-y-auto px-5">
        <div className="grid grid-cols-3 gap-3.5 pb-4">
          {AVATARS.map((av) => {
            const isActive = selected === av.id;
            return (
              <button
                key={av.id}
                onClick={() => setSelected(av.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "border-indigo-500 bg-indigo-500/12 shadow-lg shadow-indigo-500/25"
                    : "border-white/8 bg-white/4 hover:border-white/20"
                }`}
                aria-label={av.name}
                aria-pressed={isActive}
              >
                {/* Avatar image */}
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden transition-all duration-200 ${
                      isActive ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#080812]" : ""
                    }`}
                  >
                    <Image
                      src={av.src}
                      alt={av.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  {/* Checkmark overlay */}
                  {isActive && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-md border-2 border-[#080812]">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Name */}
                <span
                  className={`text-[11px] font-semibold leading-tight text-center transition-colors ${
                    isActive ? "text-indigo-300" : "text-gray-400"
                  }`}
                >
                  {av.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer action */}
      <div
        className="relative px-6 pt-4 pb-8 space-y-3"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {error && (
          <p className="text-[12px] text-red-400 text-center">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[15px] font-bold rounded-2xl shadow-lg shadow-indigo-500/35 active:scale-[0.98] transition-all disabled:opacity-40"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>Continue →</>
          )}
        </button>

        {/* Skip — lets advanced users bypass (avatar will be null until set from web) */}
        <button
          onClick={onComplete}
          className="w-full text-[13px] text-gray-500 hover:text-gray-300 py-2 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
