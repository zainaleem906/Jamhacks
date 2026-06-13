"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import VideoFeed from "@/components/camera/VideoFeed";
import PointsPopup from "@/components/gamification/PointsPopup";
import AchievementToast from "@/components/gamification/AchievementToast";
import XPBar from "@/components/gamification/XPBar";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Play, Square, Trash2, Package, Zap } from "lucide-react";
import type { ScoredPickup } from "@/types";
import confetti from "canvas-confetti";

export default function CleanupPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [newPickups, setNewPickups] = useState<ScoredPickup[]>([]);
  const [newAchievements] = useState<string[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  async function startSession() {
    setLoading(true);
    try {
      const res = await fetch("/api/cleanup/start", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setSessionId(data.data.sessionId);
        setActive(true);
        setTotalPoints(0);
        setItemCount(0);
        setElapsed(0);
        setSessionXP(0);
      }
    } finally {
      setLoading(false);
    }
  }

  async function endSession() {
    if (!sessionId) return;
    setLoading(true);
    setActive(false);
    try {
      await fetch("/api/cleanup/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (totalPoints > 0) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#22c55e", "#4ade80", "#f59e0b"] });
      }
    } finally {
      setLoading(false);
    }
  }

  const handlePickup = useCallback((pickups: ScoredPickup[]) => {
    setNewPickups(pickups);
    const pts = pickups.reduce((s, p) => s + p.points, 0);
    setSessionXP((prev) => prev + pts * 2);
    confetti({ particleCount: 25, spread: 50, origin: { x: 0.5, y: 0.5 }, ticks: 60 });
    setTimeout(() => setNewPickups([]), 100);
  }, []);

  const handlePointsUpdate = useCallback((pts: number, count: number) => {
    setTotalPoints(pts);
    setItemCount(count);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <AchievementToast achievements={newAchievements} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trash2 size={22} className="text-brand-400" />
          Submit Cleanup
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {active ? "AI is analyzing your video — points awarded for each detected item!" : "Upload a video of you putting trash in a bin"}
        </p>
      </div>

      {/* Live stats */}
      {active && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="text-center py-3">
            <p className="text-brand-400 font-black text-2xl">{totalPoints}</p>
            <p className="text-gray-500 text-xs mt-0.5">Points</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-white font-black text-2xl">{itemCount}</p>
            <p className="text-gray-500 text-xs mt-0.5">Items</p>
          </Card>
          <Card className="text-center py-3">
            <p className="text-brand-400 font-mono font-black text-2xl">{formatTime(elapsed)}</p>
            <p className="text-gray-500 text-xs mt-0.5">Time</p>
          </Card>
        </div>
      )}

      {/* Video + points overlay */}
      <div className="relative mb-4">
        <VideoFeed
          sessionId={sessionId}
          active={active}
          onPickup={handlePickup}
          onPointsUpdate={handlePointsUpdate}
        />
        {active && <PointsPopup newPickups={newPickups} />}
      </div>

      {/* XP progress */}
      {active && sessionXP > 0 && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-brand-400" />
            <span className="text-sm text-white font-semibold">Session XP: +{sessionXP}</span>
          </div>
          <XPBar xp={sessionXP} showLabel={false} />
        </Card>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!active ? (
          <Button onClick={startSession} loading={loading} size="lg" className="flex-1">
            <Play size={18} />
            Analyze Video
          </Button>
        ) : (
          <Button onClick={endSession} loading={loading} variant="danger" size="lg" className="flex-1">
            <Square size={18} />
            Stop Analysis
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={() => router.push("/dashboard")}>
          Dashboard
        </Button>
      </div>

      {/* Instructions */}
      {!active && (
        <Card className="mt-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Package size={16} className="text-brand-400" />
            How It Works
          </h3>
          <ol className="flex flex-col gap-2 text-sm text-gray-400">
            {[
              "Record a video of yourself picking up litter and putting it in a bin",
              "Upload the video using the box above",
              "Click \"Analyze Video\" to start the AI analysis",
              "The AI detects trash items and awards points when they disappear",
              "Click \"Stop Analysis\" when done to save your score",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 bg-brand-500/15 text-brand-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Post-session summary */}
      {!active && sessionId && totalPoints > 0 && (
        <Card glow className="mt-4 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-white font-bold text-xl">Nice cleanup!</p>
          <p className="text-gray-400 text-sm mt-1">
            You collected {itemCount} item{itemCount !== 1 ? "s" : ""} and earned{" "}
            <span className="text-brand-400 font-bold">{totalPoints} points</span>
          </p>
          <Button className="mt-4 w-full" onClick={() => router.push("/dashboard")}>
            View Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
}
