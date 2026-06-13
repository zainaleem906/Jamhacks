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
const RANK_COLORS = ["text-amber-400", "text-[#aaaaaa]", "text-orange-600"];

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-col p-5 gap-3">

      {/* Top 3 — raised boxes */}
      {top3.length > 0 && (
        <div className="flex gap-3 mb-3">
          {top3.map((entry) => {
            const isMe = entry.id === currentUserId;
            return (
              <div
                key={entry.id}
                className={`flex-1 p-5 text-center text-xs ${isMe ? "tk-btn-primary" : "tk-raised bg-eco-muted"}`}
              >
                <p className={`text-base font-black mb-2 ${isMe ? "text-white" : RANK_COLORS[entry.rank - 1]}`}>
                  {RANK_LABELS[entry.rank - 1]}
                </p>
                <Image
                  src={avatarUrl(entry.username, entry.avatar)}
                  alt={entry.displayName}
                  width={36}
                  height={36}
                  className="border border-eco-border mx-auto mb-1"
                />
                <p className={`font-bold truncate ${isMe ? "text-white" : "text-[#c8c8c8]"}`}>
                  {entry.displayName.split(" ")[0]}
                </p>
                <p className={`font-black text-base mt-1 ${isMe ? "text-[#86efac]" : RANK_COLORS[entry.rank - 1]}`}>
                  {formatPoints(entry.points)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest — listbox rows */}
      {rest.map((entry, i) => {
        const isMe = entry.id === currentUserId;
        const levelInfo = getLevelInfo(entry.level * 100);
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-4 px-5 py-4 border-b border-[#1a1a1a] text-xs ${
              isMe ? "bg-[#1a5c32] text-white" : "bg-eco-card text-[#c8c8c8] hover:bg-eco-muted"
            }`}
          >
            <span className={`font-black w-6 text-center text-sm ${isMe ? "text-white" : "text-[#888888]"}`}>
              {entry.rank}
            </span>
            <Image
              src={avatarUrl(entry.username, entry.avatar)}
              alt={entry.displayName}
              width={28}
              height={28}
              className="border border-[#4a4a4a] flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold truncate">{entry.displayName}</span>
                {isMe && (
                  <span className="text-[10px] bg-[#0a2e19] px-1.5 py-0.5 font-bold text-[#86efac]">you</span>
                )}
              </div>
              <span className={`text-[10px] ${isMe ? "text-[#86efac]" : "text-[#888888]"}`}>
                {levelInfo.emoji} Lv.{entry.level}
              </span>
            </div>
            {entry.streak > 0 && (
              <div className={`flex items-center gap-1 font-bold ${isMe ? "text-white" : "text-orange-400"}`}>
                <Flame size={11} />{entry.streak}
              </div>
            )}
            <div className="text-right flex-shrink-0">
              <div className={`font-black text-sm ${isMe ? "text-white" : "text-[#c8c8c8]"}`}>
                {formatPoints(entry.points)}
              </div>
              <div className={`text-[10px] ${isMe ? "text-[#86efac]" : "text-[#555555]"}`}>
                {entry.totalItems} cleared
              </div>
            </div>
          </div>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center py-12 bg-eco-card">
          <Globe2 size={32} className="text-[#555555] mx-auto mb-3" />
          <p className="font-bold text-[#888888] text-sm">No players yet</p>
          <p className="text-xs text-[#555555] mt-1">Complete a cleanup to appear here!</p>
        </div>
      )}

    </div>
  );
}
