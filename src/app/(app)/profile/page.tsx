import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import LevelBadge from "@/components/gamification/LevelBadge";
import StreakBadge from "@/components/gamification/StreakBadge";
import Image from "next/image";
import { avatarUrl, formatPoints, formatDate } from "@/lib/utils";
import { getLevelInfo } from "@/lib/points";
import { Zap, Package, Calendar, Flame, Trophy } from "lucide-react";

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
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="mb-5 bg-brand-700 rounded border border-brand-600 p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarUrl(user.username, user.avatar)}
              alt={user.displayName}
              width={68}
              height={68}
              className="rounded border-2 border-brand-400"
            />
            <LevelBadge xp={user.xp} size="sm" className="absolute -bottom-1 -right-1" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white">{user.displayName}</h1>
            <p className="text-brand-200 text-sm">@{user.username}</p>
            <p className="text-brand-100 text-sm font-semibold mt-1">{levelInfo.emoji} {levelInfo.title}</p>
            <div className="flex items-center gap-3 mt-2">
              <StreakBadge streak={user.streak} size="sm" />
              <span className="text-brand-200 text-sm">since {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-brand-900/40 rounded h-2.5 overflow-hidden">
          <div className="h-full bg-brand-300 rounded transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-brand-200 text-sm mt-1.5 text-right">{user.xp} XP total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: Zap, label: "Total Points", value: formatPoints(user.points), color: "text-amber-400" },
          { icon: Package, label: "Items Cleared", value: user.totalItems, color: "text-brand-400" },
          { icon: Flame, label: "Streak", value: `${user.streak} days`, color: "text-orange-400" },
          { icon: Calendar, label: "Missions", value: user.sessions.length, color: "text-slate-300" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded border border-eco-border bg-eco-card p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className={`font-black text-xl ${color}`}>{value}</p>
              <p className="text-slate-500 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <Card>
        <h2 className="text-slate-100 font-black mb-4 text-base flex items-center gap-2">
          <Trophy size={17} className="text-brand-400" />
          Achievements
          <span className="text-sm text-slate-500 font-normal ml-1">
            {user.achievements.length}/{allAchievements.length}
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allAchievements.map((ach) => {
            const earned = earnedIds.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center text-center p-4 rounded border transition-all ${
                  earned ? "bg-brand-900/20 border-brand-600/40" : "bg-eco-muted border-eco-border opacity-40 grayscale"
                }`}
              >
                <span className="text-2xl mb-2">{ach.icon}</span>
                <p className={`text-sm font-bold ${earned ? "text-slate-200" : "text-slate-500"}`}>{ach.name}</p>
                <p className="text-sm text-slate-500 leading-tight mt-0.5">{ach.description}</p>
                {earned && <span className="mt-2 text-brand-400 text-sm font-black">+{ach.xpReward} XP</span>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
