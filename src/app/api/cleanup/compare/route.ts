import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DetectedObject } from "@/types";

const CV_URL = process.env.CV_SERVICE_URL ?? "http://localhost:8000";
const MOCK_MODE = process.env.CV_MOCK_MODE === "true";

async function detectInFrame(frame: string): Promise<{ detections: DetectedObject[]; reachable: boolean }> {
  if (MOCK_MODE) {
    return {
      reachable: true,
      detections: [
        { class: "bottle", confidence: 0.91, bbox: [80, 120, 200, 380], points: 1, fingerprint: "mock-a" },
        { class: "cup",    confidence: 0.83, bbox: [280, 200, 380, 340], points: 1, fingerprint: "mock-b" },
        { class: "bag",    confidence: 0.76, bbox: [420, 300, 560, 460], points: 1, fingerprint: "mock-c" },
      ],
    };
  }

  try {
    const res = await fetch(`${CV_URL}/detect-static`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame, session_id: "photo-compare" }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return { detections: [], reachable: false };
    const data = await res.json();
    return { detections: (data.detections ?? []) as DetectedObject[], reachable: true };
  } catch {
    return { detections: [], reachable: false };
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { beforeFrame, afterFrame } = await req.json();
  if (!beforeFrame || !afterFrame) {
    return NextResponse.json({ ok: false, error: "Both photos required" }, { status: 400 });
  }

  // Run detection on both photos in parallel
  const [beforeResult, afterResult] = await Promise.all([
    detectInFrame(beforeFrame),
    detectInFrame(afterFrame),
  ]);

  const beforeDetections = beforeResult.detections;
  const afterDetections = afterResult.detections;
  const cvOffline = !beforeResult.reachable && !afterResult.reachable;

  const beforeCount = beforeDetections.length;
  const afterCount = afterDetections.length;
  const removed = Math.max(0, beforeCount - afterCount);
  const pointsAwarded = removed; // 1 point per item removed

  // Only save to DB if something was actually removed
  if (removed > 0) {
    await prisma.cleanupSession.create({
      data: {
        userId: session.userId,
        itemCount: removed,
        pointsEarned: pointsAwarded,
        active: false,
        endTime: new Date(),
      },
    });

    // Calculate streak
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { lastCleanup: true, streak: true } });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    if (currentUser?.lastCleanup) {
      const lastDate = new Date(currentUser.lastCleanup);
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      if (lastDay.getTime() === today.getTime()) {
        newStreak = currentUser.streak; // already cleaned up today, keep streak
      } else if (lastDay.getTime() === yesterday.getTime()) {
        newStreak = currentUser.streak + 1; // cleaned up yesterday, extend streak
      } else {
        newStreak = 1; // missed a day, reset
      }
    }

    // Award points + XP to user
    const newXP = pointsAwarded * 2;
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        points: { increment: pointsAwarded },
        totalItems: { increment: removed },
        xp: { increment: newXP },
        streak: newStreak,
        lastCleanup: now,
        bottlesCollected: {
          increment: Math.max(0,
            beforeDetections.filter((d) => d.class === "bottle").length -
            afterDetections.filter((d) => d.class === "bottle").length
          ),
        },
        cansCollected: {
          increment: Math.max(0,
            beforeDetections.filter((d) => d.class === "can").length -
            afterDetections.filter((d) => d.class === "can").length
          ),
        },
        bagsCollected: {
          increment: Math.max(0,
            beforeDetections.filter((d) => d.class === "bag").length -
            afterDetections.filter((d) => d.class === "bag").length
          ),
        },
        cupsCollected: {
          increment: Math.max(0,
            beforeDetections.filter((d) => d.class === "cup").length -
            afterDetections.filter((d) => d.class === "cup").length
          ),
        },
      },
    });

    // Update level
    const { getLevelFromXP } = await import("@/lib/points");
    const newLevel = getLevelFromXP(updatedUser.xp);
    if (newLevel !== updatedUser.level) {
      await prisma.user.update({ where: { id: session.userId }, data: { level: newLevel } });
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      beforeDetections,
      afterDetections,
      beforeCount,
      afterCount,
      removed,
      pointsAwarded,
      cvOffline,
    },
  });
}
