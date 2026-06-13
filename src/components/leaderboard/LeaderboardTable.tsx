"use client";

import Image from "next/image";
import { avatarUrl, formatPoints } from "@/lib/utils";
import { Flame } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const MEDALS: Record<number, { color: string; glow: string; label: string; bg: string }> = {
  1: { color: "#ffb347", glow: "rgba(255,179,71,0.25)", label: "🥇", bg: "rgba(255,179,71,0.06)" },
  2: { color: "#c0d8f0", glow: "rgba(192,216,240,0.15)", label: "🥈", bg: "rgba(192,216,240,0.04)" },
  3: { color: "#e07840", glow: "rgba(224,120,64,0.15)", label: "🥉", bg: "rgba(224,120,64,0.04)" },
};

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isMe = entry.id === currentUserId;
        const medal = MEDALS[entry.rank];

        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:scale-[1.005]"
            style={{
              background: isMe
                ? "rgba(0,212,232,0.06)"
                : medal
                ? medal.bg
                : "rgba(5,14,35,0.72)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${isMe ? "rgba(0,212,232,0.25)" : medal ? medal.glow.replace("0.25", "0.2").replace("0.15", "0.15") : "rgba(80,160,220,0.1)"}`,
              boxShadow: medal ? `0 0 20px ${medal.glow}` : undefined,
            }}
          >
            {/* Rank */}
            <div className="w-8 flex-shrink-0 text-center">
              {medal ? (
                <span className="text-lg">{medal.label}</span>
              ) : (
                <span
                  className="text-sm font-black tabular-nums"
                  style={{ color: "#2e4a68", fontFamily: "'Space Grotesk', monospace" }}
                >
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <Image
              src={avatarUrl(entry.username, entry.avatar)}
              alt={entry.displayName}
              width={34}
              height={34}
              className="rounded-full flex-shrink-0"
              style={{ border: `1.5px solid ${isMe ? "rgba(0,212,232,0.4)" : "rgba(80,160,220,0.15)"}` }}
            />

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm truncate"
                  style={{ color: isMe ? "#00d4e8" : medal ? medal.color : "#d8f0ff" }}
                >
                  {entry.displayName}
                </span>
                {isMe && (
                  <span
                    className="px-1.5 py-0.5 rounded font-black flex-shrink-0"
                    style={{
                      background: "rgba(0,212,232,0.15)",
                      color: "#00d4e8",
                      fontSize: "9px",
                      letterSpacing: "0.08em",
                      border: "1px solid rgba(0,212,232,0.25)",
                    }}
                  >
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: "#2e4a68" }}>
                @{entry.username}
              </span>
            </div>

            {/* Streak */}
            {entry.streak > 0 && (
              <div
                className="flex items-center gap-1 text-xs flex-shrink-0 font-bold"
                style={{ color: "#ff6b3a" }}
              >
                <Flame size={11} />
                {entry.streak}
              </div>
            )}

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <div
                className="font-black text-sm tabular-nums"
                style={{
                  color: medal ? medal.color : "#d8f0ff",
                  fontFamily: "'Space Grotesk', monospace",
                  textShadow: medal ? `0 0 12px ${medal.glow}` : undefined,
                }}
              >
                {formatPoints(entry.points)}
              </div>
              <div className="text-xs" style={{ color: "#2e4a68" }}>
                {entry.totalItems} items
              </div>
            </div>
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm uppercase tracking-widest font-bold" style={{ color: "#2e4a68" }}>
            No entries yet
          </p>
          <p className="text-xs mt-1" style={{ color: "#1a3050" }}>
            Be the first to clean up
          </p>
        </div>
      )}
    </div>
  );
}
