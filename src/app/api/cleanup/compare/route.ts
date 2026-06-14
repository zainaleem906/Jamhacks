import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import type { DetectedObject } from "@/types";

const CV_URL = process.env.CV_SERVICE_URL ?? "http://localhost:8000";
const MOCK_MODE = process.env.CV_MOCK_MODE === "true";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ─── Scoring constants ────────────────────────────────────────────────────────
const THRESHOLD = 0.75;
const YOLO_WEIGHT = 0.6;
const LLM_WEIGHT = 0.4;
const LLM_NEUTRAL_CONFIDENCE = 0.5; // used when LLM is unavailable

// ─── Per-item point values ────────────────────────────────────────────────────
const ITEM_POINTS: Record<string, number> = {
  bottle: 10, can: 12, bag: 15, cup: 8,
  cardboard: 10, wrapper: 7, litter: 5,
};
function pointsFor(cls: string): number {
  return ITEM_POINTS[cls] ?? 5;
}

// ─── YOLO detection via CV service ───────────────────────────────────────────
async function detectInFrame(frame: string): Promise<DetectedObject[]> {
  if (MOCK_MODE) {
    return [
      { class: "bottle", confidence: 0.91, bbox: [80, 120, 200, 380],  points: 10, fingerprint: "mock-a" },
      { class: "cup",    confidence: 0.83, bbox: [280, 200, 380, 340], points: 8,  fingerprint: "mock-b" },
      { class: "bag",    confidence: 0.76, bbox: [420, 300, 560, 460], points: 15, fingerprint: "mock-c" },
    ];
  }
  try {
    const res = await fetch(`${CV_URL}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frame, session_id: "photo-compare" }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.detections ?? []) as DetectedObject[];
  } catch {
    return [];
  }
}

// ─── LLM vision validation ────────────────────────────────────────────────────
interface LLMResult {
  cleanup_detected: boolean;
  confidence: number;
  explanation: string;
}

async function callVisionLLM(beforeB64: string, afterB64: string): Promise<LLMResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: beforeB64 },
          },
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: afterB64 },
          },
          {
            type: "text",
            text: `You are a cleanup verification system. The FIRST image is BEFORE cleanup, the SECOND is AFTER cleanup.

Judge whether environmental cleanup (trash/litter removal) likely occurred between these two photos.
Focus on overall scene change — look for reduced clutter, cleaner ground, fewer objects on the floor/street.
Do NOT focus on individual object labels. Judge the scene holistically.

Respond with ONLY valid JSON, no explanation outside the JSON:
{"cleanup_detected": true, "confidence": 0.85, "explanation": "brief reason"}

confidence must be 0.0–1.0. Higher = more certain cleanup occurred.`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text.trim() : "{}";

  // Extract the JSON object (LLM may wrap it in markdown fences)
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`LLM returned no JSON: ${text.slice(0, 120)}`);

  const parsed = JSON.parse(match[0]) as LLMResult;

  // Validate and clamp
  if (typeof parsed.confidence !== "number") parsed.confidence = 0.5;
  parsed.confidence = Math.min(1, Math.max(0, parsed.confidence));
  if (typeof parsed.cleanup_detected !== "boolean")
    parsed.cleanup_detected = parsed.confidence >= 0.5;
  if (!parsed.explanation) parsed.explanation = "";

  return parsed;
}

// ─── Score fusion ─────────────────────────────────────────────────────────────
function computeYoloScore(beforeCount: number, afterCount: number): number {
  const raw = (beforeCount - afterCount) / Math.max(beforeCount, 1);
  return Math.min(1, Math.max(0, raw));
}

function fuseScores(yoloScore: number, llmConfidence: number): number {
  return yoloScore * YOLO_WEIGHT + llmConfidence * LLM_WEIGHT;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { beforeFrame, afterFrame } = await req.json();
  if (!beforeFrame || !afterFrame) {
    return NextResponse.json({ ok: false, error: "Both photos required" }, { status: 400 });
  }

  // ── Step 1: YOLO detection (both images in parallel) ──────────────────────
  const [beforeDetections, afterDetections] = await Promise.all([
    detectInFrame(beforeFrame),
    detectInFrame(afterFrame),
  ]);

  const beforeCount = beforeDetections.length;
  const afterCount  = afterDetections.length;
  const cvOffline   = !MOCK_MODE && beforeCount === 0 && afterCount === 0;

  // ── Step 2: YOLO score ────────────────────────────────────────────────────
  const yoloScore = computeYoloScore(beforeCount, afterCount);

  // ── Step 3: LLM validation ────────────────────────────────────────────────
  let llmResult: LLMResult = {
    cleanup_detected: false,
    confidence: LLM_NEUTRAL_CONFIDENCE,
    explanation: "LLM validation skipped",
  };
  let llmAvailable = false;

  try {
    llmResult = await callVisionLLM(beforeFrame, afterFrame);
    llmAvailable = true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    llmResult.explanation = `LLM fallback (${msg.slice(0, 80)})`;
    // Use neutral confidence so YOLO is still the deciding factor
    llmResult.confidence = LLM_NEUTRAL_CONFIDENCE;
  }

  // ── Step 4: Score fusion ──────────────────────────────────────────────────
  const finalScore     = fuseScores(yoloScore, llmResult.confidence);
  const cleanupVerified = finalScore >= THRESHOLD;

  // ── Step 5: Points (only if threshold passed) ─────────────────────────────
  // Per-class differential (positive only)
  const classDiff = (cls: string) =>
    Math.max(
      0,
      beforeDetections.filter((d) => d.class === cls).length -
        afterDetections.filter((d) => d.class === cls).length
    );

  const removedBottles  = classDiff("bottle");
  const removedCans     = classDiff("can");
  const removedBags     = classDiff("bag");
  const removedCups     = classDiff("cup");
  const removedOther    = Math.max(0, beforeCount - afterCount)
    - removedBottles - removedCans - removedBags - removedCups;

  const totalRemoved = Math.max(0, beforeCount - afterCount);

  // Sum item-weighted points from before→after class differentials
  const rawItemPoints =
    removedBottles * pointsFor("bottle") +
    removedCans    * pointsFor("can")    +
    removedBags    * pointsFor("bag")    +
    removedCups    * pointsFor("cup")    +
    Math.max(0, removedOther) * pointsFor("litter");

  const pointsAwarded = cleanupVerified ? rawItemPoints : 0;
  const removed       = cleanupVerified ? totalRemoved : 0;

  // ── Step 6: Persist to DB if points were awarded ──────────────────────────
  if (pointsAwarded > 0) {
    const newXP = pointsAwarded * 2;

    await prisma.cleanupSession.create({
      data: {
        userId:       session.userId,
        itemCount:    removed,
        pointsEarned: pointsAwarded,
        active:       false,
        endTime:      new Date(),
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        points:           { increment: pointsAwarded },
        totalItems:       { increment: removed },
        xp:               { increment: newXP },
        lastCleanup:      new Date(),
        bottlesCollected: { increment: removedBottles },
        cansCollected:    { increment: removedCans },
        bagsCollected:    { increment: removedBags },
        cupsCollected:    { increment: removedCups },
        otherCollected:   { increment: Math.max(0, removedOther) },
      },
    });

    const { getLevelFromXP } = await import("@/lib/points");
    const newLevel = getLevelFromXP(updatedUser.xp);
    if (newLevel !== updatedUser.level) {
      await prisma.user.update({ where: { id: session.userId }, data: { level: newLevel } });
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      // Detection results
      beforeDetections,
      afterDetections,
      beforeCount,
      afterCount,
      removed,
      pointsAwarded,
      cvOffline,

      // Scoring breakdown (useful for UI transparency)
      scoring: {
        yoloScore:      Math.round(yoloScore * 100) / 100,
        llmConfidence:  Math.round(llmResult.confidence * 100) / 100,
        finalScore:     Math.round(finalScore * 100) / 100,
        threshold:      THRESHOLD,
        cleanupVerified,
        llmAvailable,
        llmExplanation: llmResult.explanation,
        llmCleanupDetected: llmResult.cleanup_detected,
      },
    },
  });
}
