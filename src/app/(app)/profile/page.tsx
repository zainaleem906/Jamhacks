import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LevelBadge from "@/components/gamification/LevelBadge";
import StreakBadge from "@/components/gamification/StreakBadge";
import Image from "next/image";
import { avatarUrl, formatPoints, formatDate } from "@/lib/utils";
import { getLevelInfo } from "@/lib/points";
import { Zap, Package, Calendar, Flame, User } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      achievements: { include: { achievement: true }, orderBy: { earnedAt: "asc" } },
      sessions: { where: { active: false }, orderBy: { startTime: "desc" }, take: 10 },
    },
  });
  if (!user) redirect("/login");

  const allAchievements = await prisma.achievement.findMany();
  const earnedIds = new Set(user.achievements.map((ua) => ua.achievementId));
  const levelInfo = getLevelInfo(user.xp);
  const rangeXP = levelInfo.maxXP === Infinity ? 100 : levelInfo.maxXP - levelInfo.minXP + 1;
  const pct = Math.min(100, ((user.xp - levelInfo.minXP) / rangeXP) * 100);

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <div className="tk-groove bg-[#dcfce7] px-5 py-3 mb-6 flex items-center gap-3 border-[#bbf7d0]">
        <User size={14} className="text-[#15803d]" />
        <span className="text-sm text-[#15803d] font-bold">Profile — {user.displayName}</span>
      </div>

      {/* Profile header */}
      <div className="tk-groove bg-[#f0fdf4] p-6 mb-5 relative pt-8 border-[#bbf7d0]">
        <span className="absolute top-0 left-4 -translate-y-1/2 bg-[#f0fdf4] px-2 text-[11px] text-[#16a34a] font-semibold">
          User Info
        </span>
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarUrl(user.username, user.avatar)}
              alt={user.displayName}
              width={72}
              height={72}
              className="border-2 border-[#bbf7d0]"
            />
            <LevelBadge xp={user.xp} size="sm" className="absolute -bottom-1 -right-1" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#166534] font-bold text-lg">{user.displayName}</p>
            <p className="text-[#8e8e8e] text-xs mt-1">@{user.username}</p>
            <p className="text-[#262626] text-xs mt-2">{levelInfo.emoji} {levelInfo.title}</p>
            <div className="flex items-center gap-4 mt-3">
              <StreakBadge streak={user.streak} size="sm" />
              <span className="text-[#8e8e8e] text-xs">since {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-[10px] text-[#8e8e8e] w-6">0</span>
          <div className="flex-1 tk-sunken h-4 bg-[#dcfce7] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#15803d]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-[#8e8e8e] w-20 text-right">{user.xp} XP total</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { icon: Zap,      label: "Total Points",  value: formatPoints(user.points),  color: "text-amber-500"  },
          { icon: Package,  label: "Items Cleared", value: user.totalItems,             color: "text-[#15803d]"  },
          { icon: Flame,    label: "Streak",        value: `${user.streak} days`,       color: "text-orange-500" },
          { icon: Calendar, label: "Missions",      value: user.sessions.length,        color: "text-[#16a34a]"  },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="tk-raised bg-[#f0fdf4] p-5 flex items-center gap-4 border-[#bbf7d0]">
            <Icon size={18} className={color} />
            <div>
              <p className={`font-black text-xl ${color}`}>{value}</p>
              <p className="text-[#8e8e8e] text-xs mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="tk-groove bg-eco-card p-6 relative pt-8 border-[#bbf7d0]">
        <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#16a34a] font-semibold">
          Achievements ({user.achievements.length}/{allAchievements.length})
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allAchievements.map((ach) => {
            const earned = earnedIds.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center text-center p-4 border text-xs ${
                  earned
                    ? "tk-raised bg-[#f0fdf4] border-[#bbf7d0]"
                    : "tk-sunken bg-eco-bg border-eco-border opacity-50"
                }`}
              >
                <span className="text-2xl mb-2">{ach.icon}</span>
                <p className={`font-bold ${earned ? "text-[#166534]" : "text-[#8e8e8e]"}`}>{ach.name}</p>
                <p className="text-[#8e8e8e] text-[10px] leading-tight mt-1">{ach.description}</p>
                {earned && (
                  <span className="mt-2 text-[#15803d] font-black text-xs bg-[#dcfce7] px-1.5 py-0.5">
                    +{ach.xpReward} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
