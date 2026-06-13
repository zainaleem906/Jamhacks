import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const allAchievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.userId },
    include: { achievement: true },
  });

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  const result = allAchievements.map((ach) => ({
    ...ach,
    earnedAt: earnedIds.has(ach.id)
      ? userAchievements.find((ua) => ua.achievementId === ach.id)!.earnedAt
      : null,
  }));

  return NextResponse.json({ ok: true, data: result });
}
