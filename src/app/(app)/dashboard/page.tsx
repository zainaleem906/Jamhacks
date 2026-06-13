import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import XPBar from "@/components/gamification/XPBar";
import StreakBadge from "@/components/gamification/StreakBadge";
import LevelBadge from "@/components/gamification/LevelBadge";
import Link from "next/link";
import { formatPoints, co2Saved } from "@/lib/utils";
import { getLevelInfo, LEVELS, CO2_SAVINGS } from "@/lib/points";
import DashboardClient from "./DashboardClient";

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

  const co2 =
    user.bottlesCollected * CO2_SAVINGS.bottle +
    user.cansCollected * CO2_SAVINGS.can +
    user.bagsCollected * CO2_SAVINGS.bag +
    user.cupsCollected * CO2_SAVINGS.cup +
    user.otherCollected * CO2_SAVINGS.litter;

  return (
    <DashboardClient
      user={{
        id: user.id,
        displayName: user.displayName,
        level: user.level,
        xp: user.xp,
        points: user.points,
        totalItems: user.totalItems,
        streak: user.streak,
        bottlesCollected: user.bottlesCollected,
        cansCollected: user.cansCollected,
        bagsCollected: user.bagsCollected,
        cupsCollected: user.cupsCollected,
        otherCollected: user.otherCollected,
      }}
      levelInfo={levelInfo}
      nextLevel={nextLevel ?? null}
      co2={co2}
      sessions={user.sessions.map(s => ({
        id: s.id,
        itemCount: s.itemCount,
        pointsEarned: s.pointsEarned,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime ? s.endTime.toISOString() : null,
      }))}
      achievements={user.achievements.map(({ achievement }) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      }))}
    />
  );
}
