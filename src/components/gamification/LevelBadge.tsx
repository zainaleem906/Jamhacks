import { getLevelInfo } from "@/lib/points";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LevelBadge({ xp, size = "md", className }: LevelBadgeProps) {
  const info = getLevelInfo(xp);

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-black border-2",
        sizes[size],
        className
      )}
      style={{
        backgroundColor: info.color + "22",
        borderColor: info.color,
        color: info.color,
      }}
      title={`Level ${info.level} — ${info.title}`}
    >
      {info.level}
    </div>
  );
}
