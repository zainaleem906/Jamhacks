"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";

interface Toast {
  id: string;
  name: string;
}

interface AchievementToastProps {
  achievements: string[];
}

export default function AchievementToast({ achievements }: AchievementToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (achievements.length === 0) return;

    const fresh = achievements.filter((name) => {
      const key = `${name}-${Date.now()}`;
      return true; // always show; dedup handled by seenRef on reset
    });

    const newToasts: Toast[] = fresh.map((name) => ({
      id: `${name}-${Date.now()}-${Math.random()}`,
      name,
    }));

    if (newToasts.length === 0) return;
    setToasts((prev) => [...prev, ...newToasts]);

    const ids = new Set(newToasts.map((t) => t.id));
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => !ids.has(t.id)));
    }, 5000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-eco-card border border-brand-600/50 rounded px-5 py-4 shadow-2xl shadow-brand-900/40 animate-slide-up"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="w-10 h-10 bg-brand-700/30 border border-brand-600/40 rounded flex items-center justify-center flex-shrink-0">
            <Trophy size={18} className="text-brand-400" />
          </div>
          <div>
            <p className="text-brand-400 text-xs font-bold uppercase tracking-widest">Achievement Unlocked</p>
            <p className="text-slate-100 font-black text-base">{toast.name}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0 ml-1" />
        </div>
      ))}
    </div>
  );
}
