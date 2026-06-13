import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StreakBadge from "@/components/gamification/StreakBadge";
import LevelBadge from "@/components/gamification/LevelBadge";
import Link from "next/link";
import { formatPoints } from "@/lib/utils";
import { getLevelInfo, LEVELS } from "@/lib/points";
import { Zap, Leaf, ArrowRight, Trophy } from "lucide-react";

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
    <div className="p-6 max-w-5xl mx-auto">

      {/* App toolbar */}
      <div className="tk-groove bg-eco-muted px-5 py-3 mb-6 flex items-center justify-between">
        <span className="text-sm text-[#c8c8c8] font-bold">
          Dashboard — {user.displayName.split(" ")[0]}
        </span>
        <StreakBadge streak={user.streak} />
      </div>

      {/* Top row: Level + Score */}
      <div className="flex gap-5 mb-6">

        {/* Level LabelFrame */}
        <div className="flex-1 tk-groove bg-eco-card p-6 relative pt-7">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            Level
          </span>
          <div className="flex items-center gap-5 mb-5">
            <LevelBadge xp={user.xp} size="lg" />
            <div>
              <p className="text-[#c8c8c8] font-bold text-base">{levelInfo.title}</p>
              <p className="text-[#888888] text-xs mt-1">Level {user.level} · {user.xp} XP</p>
            </div>
            <span className="ml-auto text-3xl">{levelInfo.emoji}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#888888] w-6">0</span>
            <div className="flex-1 tk-sunken h-5 bg-[#1a1a1a] overflow-hidden">
              <div className="h-full bg-[#1a5c32]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-[#888888] w-16 text-right">
              {levelInfo.maxXP === Infinity ? "MAX" : `${levelInfo.maxXP} XP`}
            </span>
          </div>
          {nextLevel && (
            <p className="text-[#888888] text-xs mt-3">
              &gt;&gt; {nextLevel.minXP - user.xp} XP until {nextLevel.title} {nextLevel.emoji}
            </p>
          )}
        </div>

        {/* Score LabelFrame */}
        <div className="w-44 tk-groove bg-eco-card p-6 relative pt-7 flex flex-col">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            Score
          </span>
          <p className="text-[#888888] text-xs">points:</p>
          <p className="font-black text-amber-400 text-4xl leading-tight mt-2">
            {formatPoints(user.points)}
          </p>
          <Zap size={14} className="text-amber-600 mt-auto" />
        </div>

      </div>

      {/* Middle row: Stats + Start Cleanup */}
      <div className="flex gap-5 mb-6">

        {/* Stats LabelFrame */}
        <div className="tk-groove bg-eco-card p-6 relative pt-7 flex gap-10">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            Stats
          </span>
          <div>
            <p className="text-[#888888] text-xs mb-1">items cleared:</p>
            <p className="font-black text-[#4ade80] text-4xl">{user.totalItems}</p>
          </div>
          <div>
            <p className="text-[#888888] text-xs mb-1">day streak:</p>
            <p className="font-black text-[#c8c8c8] text-4xl">{user.streak}</p>
          </div>
        </div>

        {/* Start Cleanup */}
        <Link href="/cleanup" className="flex-1">
          <div className="tk-btn-primary h-full flex items-center justify-center gap-4 min-h-[100px]">
            <Leaf size={24} className="text-[#4ade80]" />
            <div>
              <p className="font-bold text-white text-base">Start a Cleanup</p>
              <p className="text-[#86efac] text-xs mt-1">AI counts removed items</p>
            </div>
          </div>
        </Link>

      </div>

      {/* Bottom row: Achievements + Recent Sessions */}
      <div className="flex gap-5">

        {/* Achievements LabelFrame */}
        <div className="flex-[3] tk-groove bg-eco-card p-6 relative pt-7">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            Achievements
          </span>
          {user.achievements.length === 0 ? (
            <p className="text-[#555555] text-xs mt-2">
              No achievements yet. Complete a cleanup!
            </p>
          ) : (
            <div className="flex flex-col">
              {user.achievements.map(({ achievement }, i) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-4 py-3 text-sm ${i !== 0 ? "border-t border-[#1a1a1a]" : ""}`}
                >
                  <span className="text-lg w-7 text-center">{achievement.icon}</span>
                  <div>
                    <p className="text-[#c8c8c8] text-xs font-bold">{achievement.name}</p>
                    <p className="text-[#666666] text-xs mt-0.5">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/profile"
            className="text-[#22c55e] text-xs mt-5 flex items-center gap-1 hover:underline"
          >
            view all <ArrowRight size={10} />
          </Link>
        </div>

        {/* Recent Sessions LabelFrame */}
        <div className="flex-[2] tk-groove bg-eco-card p-6 relative pt-7">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            Recent Cleanups
          </span>
          {user.sessions.length === 0 ? (
            <p className="text-[#555555] text-xs mt-2">No cleanups yet.</p>
          ) : (
            <div className="flex flex-col">
              {user.sessions.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between py-3.5 text-xs ${i !== 0 ? "border-t border-[#1a1a1a]" : ""}`}
                >
                  <div>
                    <p className="text-[#c8c8c8]">{s.itemCount} item{s.itemCount !== 1 ? "s" : ""} removed</p>
                    <p className="text-[#555555] mt-0.5">{new Date(s.startTime).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[#4ade80] font-bold">+{s.pointsEarned}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
