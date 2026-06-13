import { prisma } from "@/lib/prisma";
import { getLevelFromXP, xpForPickup, LITTER_POINTS } from "@/lib/points";
import type { LitterType } from "@/types";

interface PickupResult {
  pointsAwarded: number;
  xpAwarded: number;
  newLevel: number | null;
  newAchievements: string[];
  streakUpdated: boolean;
}

export async function processPickup(
  userId: string,
  sessionId: string,
  itemType: LitterType,
  confidence: number,
  fingerprint: string
): Promise<PickupResult> {
  const points = LITTER_POINTS[itemType];
  const xp = xpForPickup(itemType);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const oldLevel = user.level;
  const newXP = user.xp + xp;
  const newLevel = getLevelFromXP(newXP);

  // Update item-type counters
  const itemCountField = itemTypeToField(itemType);

  // Streak logic: if lastCleanup was yesterday, increment; else reset
  const now = new Date();
  const lastCleanup = user.lastCleanup;
  let newStreak = user.streak;
  let streakUpdated = false;

  if (lastCleanup) {
    const diffDays = Math.floor(
      (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      newStreak += 1;
      streakUpdated = true;
    } else if (diffDays > 1) {
      newStreak = 1;
      streakUpdated = true;
    }
  } else {
    newStreak = 1;
    streakUpdated = true;
  }

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: points },
        totalItems: { increment: 1 },
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastCleanup: now,
        [itemCountField]: { increment: 1 },
      },
    }),
    prisma.detection.create({
      data: {
        sessionId,
        itemType,
        points,
        confidence,
        fingerprint,
      },
    }),
    prisma.cleanupSession.update({
      where: { id: sessionId },
      data: {
        itemCount: { increment: 1 },
        pointsEarned: { increment: points },
      },
    }),
  ]);

  const newAchievements = await checkAndAwardAchievements(userId, updatedUser);

  return {
    pointsAwarded: points,
    xpAwarded: xp,
    newLevel: newLevel > oldLevel ? newLevel : null,
    newAchievements,
    streakUpdated,
  };
}

function itemTypeToField(type: LitterType): string {
  const map: Record<LitterType, string> = {
    bottle: "bottlesCollected",
    can: "cansCollected",
    bag: "bagsCollected",
    cup: "cupsCollected",
    cardboard: "otherCollected",
    wrapper: "otherCollected",
    litter: "otherCollected",
  };
  return map[type];
}

export async function checkAndAwardAchievements(
  userId: string,
  user: {
    totalItems: number;
    streak: number;
    bottlesCollected: number;
    bagsCollected: number;
    points: number;
  }
): Promise<string[]> {
  const allAchievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const earned = new Set(userAchievements.map((ua) => ua.achievementId));

  const toAward: string[] = [];

  for (const ach of allAchievements) {
    if (earned.has(ach.id)) continue;

    let qualifies = false;
    switch (ach.slug) {
      case "first-pickup":       qualifies = user.totalItems >= 1; break;
      case "ten-items":          qualifies = user.totalItems >= 10; break;
      case "fifty-items":        qualifies = user.totalItems >= 50; break;
      case "hundred-items":      qualifies = user.totalItems >= 100; break;
      case "five-hundred-items": qualifies = user.totalItems >= 500; break;
      case "three-day-streak":   qualifies = user.streak >= 3; break;
      case "seven-day-streak":   qualifies = user.streak >= 7; break;
      case "thirty-day-streak":  qualifies = user.streak >= 30; break;
      case "bottle-collector":   qualifies = user.bottlesCollected >= 25; break;
      case "bag-buster":         qualifies = user.bagsCollected >= 10; break;
    }

    if (qualifies) {
      toAward.push(ach.id);
    }
  }

  if (toAward.length > 0) {
    await prisma.$transaction([
      ...toAward.map((achievementId) =>
        prisma.userAchievement.create({
          data: { userId, achievementId },
        })
      ),
      ...toAward.map((achievementId) => {
        const ach = allAchievements.find((a) => a.id === achievementId)!;
        return prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: ach.xpReward },
            points: { increment: ach.pointReward },
          },
        });
      }),
    ]);
  }

  return allAchievements
    .filter((a) => toAward.includes(a.id))
    .map((a) => a.name);
}
