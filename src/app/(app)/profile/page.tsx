import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLevelInfo, LEVELS, CO2_SAVINGS } from "@/lib/points";
const LEVEL_THRESHOLDS = LEVELS;
import { co2Saved, formatPoints, formatDate } from "@/lib/utils";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      achievements: { include: { achievement: true }, orderBy: { earnedAt: "asc" } },
      sessions: { where: { active: false }, orderBy: { startTime: "desc" }, take: 8 },
    },
  });
  if (!user) redirect("/login");

  const allAchievements = await prisma.achievement.findMany();
  const earnedIds = new Set(user.achievements.map(ua => ua.achievementId));
  const levelInfo = getLevelInfo(user.xp);
  const nextLevelIdx = levelInfo.level;
  const nextLevel = nextLevelIdx < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[nextLevelIdx] : null;
  const currentLevelXP = LEVEL_THRESHOLDS[levelInfo.level - 1]?.minXP ?? 0;
  const xpInLevel = user.xp - currentLevelXP;
  const xpToNext = nextLevel ? nextLevel.minXP - currentLevelXP : 1;

  const totalCO2 =
    user.bottlesCollected * CO2_SAVINGS.bottle +
    user.cansCollected * CO2_SAVINGS.can +
    user.bagsCollected * CO2_SAVINGS.bag +
    user.cupsCollected * CO2_SAVINGS.cup +
    user.otherCollected * CO2_SAVINGS.litter;

  return (
    <ProfileClient
      user={{
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        level: levelInfo.level,
        xp: user.xp,
        points: user.points,
        totalItems: user.totalItems,
        streak: user.streak,
        bottlesCollected: user.bottlesCollected,
        cansCollected: user.cansCollected,
        bagsCollected: user.bagsCollected,
        cupsCollected: user.cupsCollected,
        otherCollected: user.otherCollected,
        createdAt: user.createdAt.toISOString(),
      }}
      levelInfo={levelInfo}
      nextLevel={nextLevel ? { level: nextLevel.level, minXP: nextLevel.minXP, emoji: nextLevel.emoji, title: nextLevel.title } : null}
      xpInLevel={xpInLevel}
      xpToNext={xpToNext}
      co2={totalCO2}
      allAchievements={allAchievements.map(a => ({
        id: a.id, name: a.name, description: a.description, icon: a.icon, xpReward: a.xpReward,
      }))}
      earnedIds={[...earnedIds]}
      sessions={user.sessions.map(s => ({
        id: s.id, itemCount: s.itemCount, pointsEarned: s.pointsEarned,
        startTime: s.startTime.toISOString(), endTime: s.endTime?.toISOString() ?? null,
      }))}
    />
  );
}
