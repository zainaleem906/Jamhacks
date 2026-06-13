import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import XPBar from "@/components/gamification/XPBar";
import StreakBadge from "@/components/gamification/StreakBadge";
import LevelBadge from "@/components/gamification/LevelBadge";
import Link from "next/link";
import { formatPoints, co2Saved } from "@/lib/utils";
import { getLevelInfo, LEVELS, CO2_SAVINGS } from "@/lib/points";
import { Leaf, Zap, Package, Flame, Play, ArrowRight } from "lucide-react";
import type { LitterType } from "@/types";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      sessions: {
        where: { active: false },
        orderBy: { startTime: "desc" },
        take: 5,
        include: { detections: { take: 3 } },
      },
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
        take: 4,
      },
    },
  });
  if (!user) redirect("/login");

  const levelInfo = getLevelInfo(user.xp);
  const nextLevel = LEVELS.find((l) => l.level === user.level + 1);

  // CO2 saved calculation
  const co2 = (
    user.bottlesCollected * CO2_SAVINGS.bottle +
    user.cansCollected * CO2_SAVINGS.can +
    user.bagsCollected * CO2_SAVINGS.bag +
    user.cupsCollected * CO2_SAVINGS.cup +
    user.otherCollected * CO2_SAVINGS.litter
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Hey, {user.displayName.split(" ")[0]} {levelInfo.emoji}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Ready to make a difference today?</p>
      </div>

      {/* Level + XP card */}
      <Card glow className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LevelBadge xp={user.xp} size="lg" />
            <div>
              <p className="text-white font-bold">{levelInfo.title}</p>
              <p className="text-gray-500 text-xs">Level {user.level}</p>
            </div>
          </div>
          <StreakBadge streak={user.streak} />
        </div>
        <XPBar xp={user.xp} />
        {nextLevel && (
          <p className="text-xs text-gray-600 mt-2 text-right">
            {nextLevel.minXP - user.xp} XP to {nextLevel.emoji} {nextLevel.title}
          </p>
        )}
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { icon: Zap, label: "Total Points", value: formatPoints(user.points), color: "#f59e0b" },
          { icon: Package, label: "Items Collected", value: user.totalItems.toString(), color: "#22c55e" },
          { icon: Leaf, label: "CO₂ Saved", value: co2Saved(co2), color: "#0ea5e9" },
          { icon: Flame, label: "Streak", value: `${user.streak}d`, color: "#f97316" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="flex flex-col gap-1">
            <Icon size={16} style={{ color }} />
            <p className="text-white font-bold text-lg mt-1">{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </Card>
        ))}
      </div>

      {/* Start cleanup CTA */}
      <Link href="/cleanup">
        <div className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 rounded-2xl p-5 flex items-center justify-between mb-6 transition-all group shadow-xl shadow-brand-500/20 cursor-pointer">
          <div>
            <p className="text-white font-bold text-lg">Start Cleanup Session</p>
            <p className="text-brand-200 text-sm">AI verifies every pickup</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={22} className="text-white ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Item breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Package size={16} className="text-brand-400" />
            Items Breakdown
          </h3>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Plastic Bottles", count: user.bottlesCollected, color: "#22c55e" },
              { label: "Aluminum Cans", count: user.cansCollected, color: "#0ea5e9" },
              { label: "Plastic Bags", count: user.bagsCollected, color: "#f59e0b" },
              { label: "Cups", count: user.cupsCollected, color: "#a78bfa" },
              { label: "Other", count: user.otherCollected, color: "#94a3b8" },
            ].map(({ label, count, color }) => {
              const pct = user.totalItems > 0 ? (count / user.totalItems) * 100 : 0;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-28 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 bg-eco-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-gray-500 text-xs w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            🏆 Recent Achievements
          </h3>
          {user.achievements.length === 0 ? (
            <p className="text-gray-600 text-sm">Complete your first pickup to earn achievements!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.achievements.map(({ achievement }) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <span className="text-xl w-8">{achievement.icon}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{achievement.name}</p>
                    <p className="text-gray-600 text-xs">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/profile" className="text-brand-400 hover:text-brand-300 text-xs mt-3 flex items-center gap-1 transition-colors">
            View all achievements <ArrowRight size={12} />
          </Link>
        </Card>
      </div>

      {/* Recent sessions */}
      {user.sessions.length > 0 && (
        <Card>
          <h3 className="text-white font-bold mb-4">Recent Sessions</h3>
          <div className="flex flex-col gap-2">
            {user.sessions.map((s) => {
              const duration = s.endTime
                ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000)
                : null;
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-eco-border last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{s.itemCount} items collected</p>
                    <p className="text-gray-600 text-xs">
                      {new Date(s.startTime).toLocaleDateString()}
                      {duration != null && ` · ${duration} min`}
                    </p>
                  </div>
                  <span className="text-brand-400 font-bold text-sm">+{s.pointsEarned} pts</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
