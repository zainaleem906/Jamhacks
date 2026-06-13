import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "sessionId required" }, { status: 400 });
  }

  const cleanupSession = await prisma.cleanupSession.findUnique({
    where: { id: sessionId, userId: session.userId },
  });
  if (!cleanupSession) {
    return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
  }

  const updated = await prisma.cleanupSession.update({
    where: { id: sessionId },
    data: { active: false, endTime: new Date() },
  });

  return NextResponse.json({
    ok: true,
    data: {
      itemCount: updated.itemCount,
      pointsEarned: updated.pointsEarned,
    },
  });
}
