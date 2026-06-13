import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md";
  className?: string;
}

export default function StreakBadge({ streak, size = "md", className }: StreakBadgeProps) {
  const active = streak > 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded font-bold",
        active ? "text-orange-400" : "text-slate-600",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        active && "bg-orange-500/10 border border-orange-500/25",
        !active && "bg-eco-card border border-eco-border",
        className
      )}
    >
      <Flame size={size === "sm" ? 12 : 14} className={active ? "text-orange-400" : "text-slate-600"} />
      {streak} day{streak !== 1 ? "s" : ""}
    </div>
  );
}
