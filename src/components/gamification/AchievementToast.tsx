"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  name: string;
  icon: string;
}

interface AchievementToastProps {
  achievements: string[];
}

export default function AchievementToast({ achievements }: AchievementToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (achievements.length === 0) return;

    const newToasts = achievements.map((name) => ({
      id: `${name}-${Date.now()}`,
      name,
      icon: "🏆",
    }));

    setToasts((prev) => [...prev, ...newToasts]);

    const timer = setTimeout(() => {
      setToasts((prev) =>
        prev.filter((t) => !newToasts.find((nt) => nt.id === t.id))
      );
    }, 4000);

    return () => clearTimeout(timer);
  }, [achievements]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 bg-eco-card border border-brand-500/40 rounded-2xl px-4 py-3 shadow-xl",
            "animate-slide-up"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {toast.icon}
          </div>
          <div>
            <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide">Achievement Unlocked!</p>
            <p className="text-white font-bold text-sm">{toast.name}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
