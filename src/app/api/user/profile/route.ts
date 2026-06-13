import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("id") ?? session.userId;

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      points: true,
      totalItems: true,
      level: true,
      xp: true,
      streak: true,
      bottlesCollected: true,
      cansCollected: true,
      bagsCollected: true,
      cupsCollected: true,
      otherCollected: true,
      createdAt: true,
      lastCleanup: true,
      achievements: {
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      },
      sessions: {
        where: { active: false },
        orderBy: { startTime: "desc" },
        take: 10,
        select: {
          id: true,
          startTime: true,
          endTime: true,
          itemCount: true,
          pointsEarned: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: user });
}
