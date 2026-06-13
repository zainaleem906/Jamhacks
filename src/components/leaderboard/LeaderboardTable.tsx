"use client";

import Image from "next/image";
import { avatarUrl, formatPoints } from "@/lib/utils";
import { getLevelInfo } from "@/lib/points";
import { Flame, Globe2 } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const RANK_COLORS = [
  { text: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-900/15", label: "1st" },
  { text: "text-slate-300", border: "border-slate-500/40", bg: "bg-slate-800/30", label: "2nd" },
  { text: "text-orange-600", border: "border-orange-700/40", bg: "bg-orange-900/15", label: "3rd" },
];

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-col gap-3">
      {/* Top 3 podium */}
      {top3.length > 0 && (
        <div className="flex gap-3 mb-1">
          {top3.map((entry) => {
            const isMe = entry.id === currentUserId;
            const rank = RANK_COLORS[entry.rank - 1];
            return (
              <div key={entry.id} className={`flex-1 rounded border-2 p-4 text-center ${
                isMe ? "border-brand-600 bg-brand-900/20" : `${rank.border} ${rank.bg}`
              }`}>
                <p className={`text-lg font-black mb-2 ${rank.text}`}>{rank.label}</p>
                <Image
                  src={avatarUrl(entry.username, entry.avatar)}
                  alt={entry.displayName}
                  width={40}
                  height={40}
                  className="rounded mx-auto mb-2 border border-eco-border"
                />
                <p className={`text-sm font-bold truncate ${isMe ? "text-brand-400" : "text-slate-200"}`}>
                  {entry.displayName.split(" ")[0]}
                </p>
                <p className={`font-black text-lg mt-1 ${isMe ? "text-brand-400" : rank.text}`}>
                  {formatPoints(entry.points)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest */}
      {rest.map((entry) => {
        const isMe = entry.id === currentUserId;
        const levelInfo = getLevelInfo(entry.level * 100);
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 rounded border transition-all ${
              isMe ? "bg-brand-900/20 border-brand-600/50" : "bg-eco-card border-eco-border hover:border-slate-500"
            }`}
          >
            <span className="text-slate-500 font-black w-6 text-center text-sm">{entry.rank}</span>
            <Image
              src={avatarUrl(entry.username, entry.avatar)}
              alt={entry.displayName}
              width={36}
              height={36}
              className="rounded flex-shrink-0 border border-eco-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm truncate ${isMe ? "text-brand-400" : "text-slate-200"}`}>
                  {entry.displayName}
                </span>
                {isMe && (
                  <span className="text-xs bg-brand-700/30 text-brand-400 border border-brand-600/30 px-1.5 py-0.5 rounded font-bold">you</span>
                )}
              </div>
              <span className="text-sm text-slate-500">{levelInfo.emoji} Lv.{entry.level}</span>
            </div>
            {entry.streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400 text-sm font-bold">
                <Flame size={13} />{entry.streak}
              </div>
            )}
            <div className="text-right flex-shrink-0">
              <div className="text-slate-100 font-black text-base">{formatPoints(entry.points)}</div>
              <div className="text-sm text-slate-500">{entry.totalItems} cleared</div>
            </div>
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center py-14 bg-eco-card rounded border border-eco-border">
          <Globe2 size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="font-black text-slate-300 text-base">No players yet</p>
          <p className="text-sm text-slate-500 mt-1">Complete a cleanup to be first!</p>
        </div>
      )}
    </div>
  );
}
