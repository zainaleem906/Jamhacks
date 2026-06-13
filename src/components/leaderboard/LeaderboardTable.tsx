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

const RANK_LABELS = ["1st", "2nd", "3rd"];
const RANK_COLORS = ["text-[#15803d]", "text-[#22c55e]", "text-[#86efac]"];
const RANK_BG = [
  "bg-[#dcfce7] border border-[#86efac]",
  "bg-[#f0fdf4] border border-[#bbf7d0]",
  "bg-eco-muted border border-eco-border",
];

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-col p-5 gap-3">

      {top3.length > 0 && (
        <div className="flex gap-3 mb-3">
          {top3.map((entry) => {
            const isMe = entry.id === currentUserId;
            return (
              <div key={entry.id} className={`flex-1 p-5 text-center text-xs ${isMe ? "tk-btn-primary" : RANK_BG[entry.rank - 1]}`}>
                <p className={`text-base font-black mb-2 ${isMe ? "text-white" : RANK_COLORS[entry.rank - 1]}`}>
                  {RANK_LABELS[entry.rank - 1]}
                </p>
                <Image
                  src={avatarUrl(entry.username, entry.avatar)}
                  alt={entry.displayName}
                  width={36}
                  height={36}
                  className="border border-[#bbf7d0] mx-auto mb-1"
                />
                <p className={`font-bold truncate ${isMe ? "text-white" : "text-[#262626]"}`}>
                  {entry.displayName.split(" ")[0]}
                </p>
                <p className={`font-black text-base mt-1 ${isMe ? "text-[#dcfce7]" : RANK_COLORS[entry.rank - 1]}`}>
                  {formatPoints(entry.points)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {rest.map((entry, i) => {
        const isMe = entry.id === currentUserId;
        const levelInfo = getLevelInfo(entry.level * 100);
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-4 px-5 py-4 border-b border-[#bbf7d0] text-xs ${
              isMe ? "bg-[#dcfce7] text-[#166534]" : "bg-eco-card text-[#262626] hover:bg-[#f0fdf4]"
            }`}
          >
            <span className={`font-black w-6 text-center text-sm ${isMe ? "text-[#15803d]" : "text-[#8e8e8e]"}`}>
              {entry.rank}
            </span>
            <Image
              src={avatarUrl(entry.username, entry.avatar)}
              alt={entry.displayName}
              width={28}
              height={28}
              className="border border-[#bbf7d0] flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold truncate">{entry.displayName}</span>
                {isMe && (
                  <span className="text-[10px] bg-[#bbf7d0] px-1.5 py-0.5 font-bold text-[#166534]">you</span>
                )}
              </div>
              <span className={`text-[10px] ${isMe ? "text-[#16a34a]" : "text-[#8e8e8e]"}`}>
                {levelInfo.emoji} Lv.{entry.level}
              </span>
            </div>
            {entry.streak > 0 && (
              <div className={`flex items-center gap-1 font-bold ${isMe ? "text-[#15803d]" : "text-orange-500"}`}>
                <Flame size={11} />{entry.streak}
              </div>
            )}
            <div className="text-right flex-shrink-0">
              <div className={`font-black text-sm ${isMe ? "text-[#166534]" : "text-[#262626]"}`}>
                {formatPoints(entry.points)}
              </div>
              <div className={`text-[10px] ${isMe ? "text-[#16a34a]" : "text-[#22c55e]"}`}>
                {entry.totalItems} cleared
              </div>
            </div>
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center py-12 bg-eco-card">
          <Globe2 size={32} className="text-[#bbf7d0] mx-auto mb-3" />
          <p className="font-bold text-[#8e8e8e] text-sm">No players yet</p>
          <p className="text-xs text-[#b0b0b0] mt-1">Complete a cleanup to appear here!</p>
        </div>
      )}

    </div>
  );
}
