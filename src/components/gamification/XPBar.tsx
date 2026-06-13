"use client";

import { getLevelInfo } from "@/lib/points";
import { cn } from "@/lib/utils";

interface XPBarProps {
  xp: number;
  className?: string;
  showLabel?: boolean;
}

export default function XPBar({ xp, className, showLabel = true }: XPBarProps) {
  const info = getLevelInfo(xp);
  const rangeXP = info.maxXP === Infinity ? xp - info.minXP + 100 : info.maxXP - info.minXP + 1;
  const currentXP = xp - info.minXP;
  const pct = Math.min(100, (currentXP / rangeXP) * 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold" style={{ color: info.color }}>
            {info.emoji} {info.title}
          </span>
          <span className="text-xs text-gray-500">
            {currentXP} / {info.maxXP === Infinity ? "∞" : rangeXP} XP
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-300 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-700 ease-out relative"
          style={{ width: `${pct}%`, backgroundColor: info.color }}
        >
          <div className="absolute inset-0 rounded-full opacity-50 animate-pulse" style={{ backgroundColor: info.color }} />
        </div>
      </div>
    </div>
  );
}
