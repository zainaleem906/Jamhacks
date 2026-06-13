"use client";

import Image from "next/image";
import { avatarUrl, formatPoints } from "@/lib/utils";
import { getLevelInfo } from "@/lib/points";
import { Flame, Crown } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#b45309"];

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const isMe = entry.id === currentUserId;
        const levelInfo = getLevelInfo(entry.level * 100);
        const rankColor = RANK_COLORS[entry.rank - 1];

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              isMe
                ? "bg-brand-500/10 border-brand-500/40"
                : "bg-eco-card border-eco-border hover:border-eco-border/80"
            }`}
          >
            {/* Rank */}
            <div className="w-7 flex-shrink-0 text-center">
              {entry.rank <= 3 ? (
                <Crown size={18} style={{ color: rankColor }} className="mx-auto" />
              ) : (
                <span className="text-sm font-bold text-gray-500">{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <Image
              src={avatarUrl(entry.username, entry.avatar)}
              alt={entry.displayName}
              width={36}
              height={36}
              className="rounded-full flex-shrink-0"
            />

            {/* Name + level */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm truncate ${isMe ? "text-brand-300" : "text-white"}`}>
                  {entry.displayName}
                </span>
                {isMe && (
                  <span className="text-xs bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    you
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">@{entry.username}</span>
            </div>

            {/* Streak */}
            {entry.streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400 text-xs flex-shrink-0">
                <Flame size={12} />
                {entry.streak}
              </div>
            )}

            {/* Points */}
            <div className="text-right flex-shrink-0">
              <div className="text-white font-bold text-sm">{formatPoints(entry.points)}</div>
              <div className="text-xs text-gray-500">{entry.totalItems} items</div>
            </div>
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No entries yet — be the first to clean up!
        </div>
      )}
    </div>
  );
}
