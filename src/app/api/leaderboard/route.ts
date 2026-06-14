import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "all";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  let users;

  if (period === "weekly") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await prisma.cleanupSession.groupBy({
      by: ["userId"],
      where: { startTime: { gte: weekAgo } },
      _sum: { pointsEarned: true, itemCount: true },
      orderBy: { _sum: { pointsEarned: "desc" } },
      take: limit,
    });

    const userIds = sessions.map((s) => s.userId);
    const userMap = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        level: true,
        streak: true,
        achievements: {
          select: { achievement: { select: { icon: true } }, earnedAt: true },
          orderBy: { earnedAt: "desc" },
          take: 1,
        },
      },
    });
    const userById = Object.fromEntries(userMap.map((u) => [u.id, u]));

    users = sessions.map((s, i) => ({
      rank: i + 1,
      id: s.userId,
      username: userById[s.userId]?.username ?? "unknown",
      displayName: userById[s.userId]?.displayName ?? "Unknown",
      avatar: userById[s.userId]?.avatar ?? null,
      profileIcon: userById[s.userId]?.achievements[0]?.achievement.icon ?? "🌱",
      level: userById[s.userId]?.level ?? 1,
      streak: userById[s.userId]?.streak ?? 0,
      points: s._sum.pointsEarned ?? 0,
      totalItems: s._sum.itemCount ?? 0,
    }));
  } else {
    const raw = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: limit,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        points: true,
        totalItems: true,
        level: true,
        streak: true,
        achievements: {
          select: { achievement: { select: { icon: true } }, earnedAt: true },
          orderBy: { earnedAt: "desc" },
          take: 1,
        },
      },
    });
    users = raw.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      profileIcon: u.achievements[0]?.achievement.icon ?? "🌱",
      points: u.points,
      totalItems: u.totalItems,
      level: u.level,
      streak: u.streak,
    }));
  }

  return NextResponse.json({ ok: true, data: users });
}
