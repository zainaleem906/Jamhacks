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

    const newToasts: Toast[] = achievements.map((name) => ({
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
          className="flex items-center gap-3 tk-raised bg-eco-card px-4 py-3"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="tk-raised bg-[#1a5c32] w-9 h-9 flex items-center justify-center flex-shrink-0">
            <Trophy size={16} className="text-[#4ade80]" />
          </div>
          <div>
            <p className="text-[#22c55e] text-[10px] font-bold uppercase tracking-widest">Achievement Unlocked</p>
            <p className="text-[#c8c8c8] font-bold text-sm">{toast.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
