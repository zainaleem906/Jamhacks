import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Close any lingering active sessions
  await prisma.cleanupSession.updateMany({
    where: { userId: session.userId, active: true },
    data: { active: false, endTime: new Date() },
  });

  const cleanupSession = await prisma.cleanupSession.create({
    data: { userId: session.userId },
  });

  return NextResponse.json({ ok: true, data: { sessionId: cleanupSession.id } });
}
