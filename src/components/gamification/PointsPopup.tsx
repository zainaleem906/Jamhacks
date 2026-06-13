"use client";

import { useEffect, useState } from "react";
import type { ScoredPickup } from "@/types";
import { LITTER_LABELS } from "@/lib/points";

interface FloatingPoint {
  id: string;
  pickup: ScoredPickup;
  x: number;
  y: number;
}

interface PointsPopupProps {
  newPickups: ScoredPickup[];
}

export default function PointsPopup({ newPickups }: PointsPopupProps) {
  const [floaters, setFloaters] = useState<FloatingPoint[]>([]);

  useEffect(() => {
    if (newPickups.length === 0) return;

    const newFloaters = newPickups.map((pickup) => ({
      id: `${pickup.fingerprint}-${Date.now()}-${Math.random()}`,
      pickup,
      x: 30 + Math.random() * 40, // % from left
      y: 40 + Math.random() * 20, // % from top
    }));

    setFloaters((prev) => [...prev, ...newFloaters]);

    const timer = setTimeout(() => {
      setFloaters((prev) =>
        prev.filter((f) => !newFloaters.find((nf) => nf.id === f.id))
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [newPickups]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {floaters.map((f) => (
        <div
          key={f.id}
          className="absolute animate-score-pop"
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black text-brand-400 drop-shadow-lg">
              +{f.pickup.points}
            </span>
            <span className="text-xs font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
              {LITTER_LABELS[f.pickup.class] ?? f.pickup.class}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
