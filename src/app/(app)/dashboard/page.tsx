import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import StreakBadge from "@/components/gamification/StreakBadge";
import LevelBadge from "@/components/gamification/LevelBadge";
import Link from "next/link";
import { formatPoints } from "@/lib/utils";
import { getLevelInfo, LEVELS } from "@/lib/points";
import { Zap, Package, Leaf, ArrowRight, Trophy } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      sessions: { where: { active: false }, orderBy: { startTime: "desc" }, take: 5 },
      achievements: { include: { achievement: true }, orderBy: { earnedAt: "desc" }, take: 4 },
    },
  });
  if (!user) redirect("/login");

  const levelInfo = getLevelInfo(user.xp);
  const nextLevel = LEVELS.find((l) => l.level === user.level + 1);
  const rangeXP = levelInfo.maxXP === Infinity ? 100 : levelInfo.maxXP - levelInfo.minXP + 1;
  const pct = Math.min(100, ((user.xp - levelInfo.minXP) / rangeXP) * 100);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-brand-400 text-sm font-semibold mb-1">Welcome back</p>
          <h1 className="text-3xl font-black text-slate-100">{user.displayName.split(" ")[0]}</h1>
        </div>
        <StreakBadge streak={user.streak} />
      </div>

      {/* Level banner */}
      <div className="mb-5 bg-brand-700 rounded p-5 border border-brand-600">
        <div className="flex items-center gap-4 mb-3">
          <LevelBadge xp={user.xp} size="lg" />
          <div>
            <p className="text-white font-black text-xl leading-tight">{levelInfo.title}</p>
            <p className="text-brand-200 text-sm">Level {user.level} · {user.xp} XP</p>
          </div>
          <div className="ml-auto text-3xl">{levelInfo.emoji}</div>
        </div>
        <div className="bg-brand-900/50 rounded h-2.5 overflow-hidden">
          <div className="h-full bg-brand-300 rounded transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {nextLevel && (
          <p className="text-brand-200 text-sm mt-2 text-right">
            {nextLevel.minXP - user.xp} XP to {nextLevel.emoji} {nextLevel.title}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Zap, label: "Score", value: formatPoints(user.points), color: "text-amber-400", border: "border-amber-700/30", bg: "bg-amber-900/10" },
          { icon: Package, label: "Cleared", value: user.totalItems.toString(), color: "text-brand-400", border: "border-brand-700/30", bg: "bg-brand-900/10" },
          { icon: Leaf, label: "Streak", value: `${user.streak}d`, color: "text-slate-300", border: "border-eco-border", bg: "bg-eco-muted" },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`rounded border ${border} ${bg} p-4`}>
            <Icon size={16} className={`${color} mb-2`} />
            <p className={`font-black text-2xl ${color}`}>{value}</p>
            <p className="text-slate-500 text-sm font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Start cleanup CTA */}
      <Link href="/cleanup">
        <div className="w-full bg-eco-card border border-eco-border hover:border-brand-600 hover:bg-eco-muted rounded p-5 flex items-center justify-between mb-5 transition-all group cursor-pointer">
          <div>
            <p className="text-slate-100 font-black text-lg">Start a Cleanup</p>
            <p className="text-slate-500 text-sm mt-1">Upload before &amp; after — AI counts what you removed</p>
          </div>
          <div className="w-11 h-11 bg-brand-700 rounded flex items-center justify-center group-hover:bg-brand-600 transition-colors flex-shrink-0">
            <Leaf size={20} className="text-white" />
          </div>
        </div>
      </Link>

      {/* Achievements + Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-slate-100 font-black mb-4 text-base flex items-center gap-2">
            <Trophy size={17} className="text-brand-400" />
            Achievements
          </h3>
          {user.achievements.length === 0 ? (
            <p className="text-slate-500 text-sm">Complete your first cleanup to unlock achievements!</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {user.achievements.map(({ achievement }) => (
                <div key={achievement.id} className="flex items-center gap-3 bg-eco-muted rounded p-3 border border-eco-border">
                  <span className="text-xl w-8 text-center">{achievement.icon}</span>
                  <div>
                    <p className="text-slate-200 text-sm font-bold">{achievement.name}</p>
                    <p className="text-slate-500 text-sm">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/profile" className="text-brand-400 hover:text-brand-300 text-sm mt-3 flex items-center gap-1 font-semibold">
            View all <ArrowRight size={13} />
          </Link>
        </Card>

        <Card>
          <h3 className="text-slate-100 font-black mb-4 text-base">Recent Cleanups</h3>
          {user.sessions.length === 0 ? (
            <p className="text-slate-500 text-sm">No cleanups yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded bg-eco-muted border border-eco-border">
                  <div>
                    <p className="text-slate-200 text-sm font-bold">{s.itemCount} items removed</p>
                    <p className="text-slate-500 text-sm">{new Date(s.startTime).toLocaleDateString()}</p>
                  </div>
                  <span className="text-brand-400 font-black text-base">+{s.pointsEarned}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
