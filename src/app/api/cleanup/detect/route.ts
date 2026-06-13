import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processPickup } from "@/lib/gamification";
import type { LitterType, DetectedObject, ScoredPickup } from "@/types";

const CV_URL = process.env.CV_SERVICE_URL ?? "http://localhost:8000";
const MOCK_MODE = process.env.CV_MOCK_MODE === "true";

// Per-session rate limiting (in-memory, good enough for hackathon)
const lastRequestTime = new Map<string, number>();

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { frame, sessionId } = await req.json();
  if (!frame || !sessionId) {
    return NextResponse.json({ ok: false, error: "frame and sessionId required" }, { status: 400 });
  }

  // Rate limit: 1 request per second per session
  const now = Date.now();
  const last = lastRequestTime.get(sessionId) ?? 0;
  if (now - last < 900) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }
  lastRequestTime.set(sessionId, now);

  // Verify session belongs to user
  const dbSession = await prisma.cleanupSession.findUnique({
    where: { id: sessionId, userId: session.userId, active: true },
  });
  if (!dbSession) {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 400 });
  }

  // Get detections from CV service (or mock)
  let detections: DetectedObject[] = [];
  let scored: ScoredPickup[] = [];

  if (MOCK_MODE) {
    const mockResult = mockDetection(sessionId);
    detections = mockResult.detections;
    scored = mockResult.scored;
  } else {
    try {
      const cvRes = await fetch(`${CV_URL}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame, session_id: sessionId }),
        signal: AbortSignal.timeout(3000),
      });
      if (cvRes.ok) {
        const cvData = await cvRes.json();
        detections = cvData.detections ?? [];
        scored = cvData.scored ?? [];
      }
    } catch {
      // CV service unavailable — return empty detections, don't crash
      return NextResponse.json({
        ok: true,
        data: { detections: [], scored: [], cvOffline: true },
      });
    }
  }

  // Process any scored pickups (awarded by anti-cheat when item disappears)
  const results = [];
  for (const pickup of scored) {
    try {
      const result = await processPickup(
        session.userId,
        sessionId,
        pickup.class as LitterType,
        0.9,
        pickup.fingerprint
      );
      results.push({ pickup, result });
    } catch (e) {
      console.error("Error processing pickup:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    data: { detections, scored, results },
  });
}

// ─── Mock mode for demos without Python ──────────────────────────────────────

const mockSessionState = new Map<string, { frames: number; detectionActive: boolean; lastScored: number }>();

function mockDetection(sessionId: string) {
  const state = mockSessionState.get(sessionId) ?? { frames: 0, detectionActive: false, lastScored: 0 };
  state.frames += 1;

  const detections: DetectedObject[] = [];
  const scored: ScoredPickup[] = [];
  const now = Date.now();

  // Simulate: bottle appears at frame 5, disappears at frame 12, cooldown 10s
  if (state.frames >= 5 && state.frames < 12) {
    state.detectionActive = true;
    detections.push({
      class: "bottle",
      confidence: 0.87,
      bbox: [100, 80, 250, 350],
      points: 10,
      fingerprint: `mock-bottle-${sessionId}`,
    });
  }

  if (state.frames === 12 && now - state.lastScored > 10000) {
    state.detectionActive = false;
    state.lastScored = now;
    state.frames = 0; // restart cycle
    scored.push({
      fingerprint: `mock-bottle-${sessionId}`,
      class: "bottle",
      points: 10,
      timestamp: now,
    });
  }

  mockSessionState.set(sessionId, state);
  return { detections, scored };
}
