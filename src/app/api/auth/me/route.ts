import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatar: true,
      points: true,
      level: true,
      xp: true,
      streak: true,
      totalItems: true,
      bottlesCollected: true,
      cansCollected: true,
      bagsCollected: true,
      cupsCollected: true,
      otherCollected: true,
      lastCleanup: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: user });
}
