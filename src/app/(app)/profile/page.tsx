import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import XPBar from "@/components/gamification/XPBar";
import LevelBadge from "@/components/gamification/LevelBadge";
import StreakBadge from "@/components/gamification/StreakBadge";
import Image from "next/image";
import { avatarUrl, formatPoints, formatDate, co2Saved } from "@/lib/utils";
import { getLevelInfo, CO2_SAVINGS } from "@/lib/points";
import { Zap, Package, Leaf, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: "asc" },
      },
      sessions: {
        where: { active: false },
        orderBy: { startTime: "desc" },
        take: 10,
      },
    },
  });
  if (!user) redirect("/login");

  const allAchievements = await prisma.achievement.findMany();
  const earnedIds = new Set(user.achievements.map((ua) => ua.achievementId));

  const levelInfo = getLevelInfo(user.xp);
  const totalCO2 =
    user.bottlesCollected * CO2_SAVINGS.bottle +
    user.cansCollected * CO2_SAVINGS.can +
    user.bagsCollected * CO2_SAVINGS.bag +
    user.cupsCollected * CO2_SAVINGS.cup +
    user.otherCollected * CO2_SAVINGS.litter;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Profile header */}
      <Card glow className="mb-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarUrl(user.username, user.avatar)}
              alt={user.displayName}
              width={72}
              height={72}
              className="rounded-2xl"
            />
            <LevelBadge xp={user.xp} size="sm" className="absolute -bottom-1 -right-1" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
            <p className="text-gray-500 text-sm">@{user.username}</p>
            <div className="flex items-center gap-2 mt-2">
              <StreakBadge streak={user.streak} size="sm" />
              <span className="text-xs text-gray-600">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <XPBar xp={user.xp} />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Zap, label: "Total Points", value: formatPoints(user.points), color: "#f59e0b" },
          { icon: Package, label: "Items Collected", value: user.totalItems, color: "#22c55e" },
          { icon: Leaf, label: "CO₂ Saved", value: co2Saved(totalCO2), color: "#0ea5e9" },
          { icon: Calendar, label: "Sessions", value: user.sessions.length, color: "#a78bfa" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p className="text-white font-bold">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card className="mb-4">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          🏆 Achievements
          <span className="text-xs text-gray-600 font-normal ml-1">
            {user.achievements.length}/{allAchievements.length}
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allAchievements.map((ach) => {
            const earned = earnedIds.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                  earned
                    ? "bg-brand-500/10 border-brand-500/30"
                    : "bg-eco-bg border-eco-border opacity-40 grayscale"
                }`}
              >
                <span className="text-2xl mb-1.5">{ach.icon}</span>
                <p className={`text-xs font-semibold ${earned ? "text-white" : "text-gray-500"}`}>
                  {ach.name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 leading-tight">{ach.description}</p>
                {earned && (
                  <span className="mt-1.5 text-brand-400 text-xs font-bold">+{ach.xpReward} XP</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Environmental impact */}
      <Card>
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Leaf size={16} className="text-brand-400" />
          Environmental Impact
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { emoji: "🍾", label: "Plastic bottles removed", count: user.bottlesCollected },
            { emoji: "🥤", label: "Cans removed", count: user.cansCollected },
            { emoji: "🛍️", label: "Plastic bags removed", count: user.bagsCollected },
            { emoji: "☕", label: "Cups removed", count: user.cupsCollected },
          ].map(({ emoji, label, count }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <span>{emoji}</span> {label}
              </span>
              <span className="text-white font-semibold text-sm">{count}</span>
            </div>
          ))}
          <div className="mt-2 pt-3 border-t border-eco-border flex items-center justify-between">
            <span className="text-brand-400 font-semibold text-sm">Total CO₂ prevented</span>
            <span className="text-brand-400 font-bold">{co2Saved(totalCO2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
