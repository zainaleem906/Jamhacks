"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhotoCompare from "@/components/camera/PhotoCompare";
import AchievementToast from "@/components/gamification/AchievementToast";
import Button from "@/components/ui/Button";
import { Leaf, Zap, AlertCircle, AlertTriangle, Search, Sparkles } from "lucide-react";
import type { DetectedObject } from "@/types";
import confetti from "canvas-confetti";

interface AnalysisResult {
  detections: DetectedObject[];
  count: number;
}

interface CompareResult {
  beforeCount: number;
  afterCount: number;
  removed: number;
  pointsAwarded: number;
  cvOffline: boolean;
  newAchievements: string[];
}

export default function CleanupPage() {
  const router = useRouter();
  const [readyFrames, setReadyFrames] = useState<{ before: string; after: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [beforeResult, setBeforeResult] = useState<AnalysisResult | null>(null);
  const [afterResult, setAfterResult] = useState<AnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleBothReady = useCallback((before: string, after: string) => {
    setReadyFrames({ before, after });
    setCompareResult(null); setBeforeResult(null); setAfterResult(null); setError(null); setAchievements([]);
  }, []);

  const handleReset = useCallback(() => {
    setReadyFrames(null);
    setCompareResult(null); setBeforeResult(null); setAfterResult(null); setError(null); setAchievements([]);
  }, []);

  async function analyze() {
    if (!readyFrames) return;
    setAnalyzing(true); setError(null);
    try {
      const res = await fetch("/api/cleanup/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beforeFrame: readyFrames.before, afterFrame: readyFrames.after }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Analysis failed"); return; }
      const { beforeDetections, afterDetections, ...result } = data.data;
      setBeforeResult({ detections: beforeDetections, count: result.beforeCount });
      setAfterResult({ detections: afterDetections, count: result.afterCount });
      setCompareResult(result);
      if (result.newAchievements?.length > 0) setAchievements(result.newAchievements);
      if (result.pointsAwarded > 0) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#15803d", "#4ade80", "#86efac"] });
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setAnalyzing(false);
    }
  }

  const canAnalyze = !!readyFrames && !analyzing && !compareResult;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AchievementToast achievements={achievements} />

      {/* Title bar */}
      <div className="tk-groove bg-eco-muted px-5 py-3 mb-6 flex items-center gap-3">
        <Leaf size={14} className="text-[#22c55e]" />
        <span className="text-sm text-[#c8c8c8] font-bold">Submit Cleanup</span>
        <span className="text-[#555555] text-xs ml-2">— upload before &amp; after photos</span>
      </div>

      {/* Photo upload LabelFrame */}
      <div className="tk-groove bg-eco-card p-6 mb-6 relative pt-8">
        <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
          Photos
        </span>
        <PhotoCompare
          beforeResult={beforeResult}
          afterResult={afterResult}
          analyzing={analyzing}
          onBothReady={handleBothReady}
          onReset={handleReset}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="tk-sunken bg-[#2a0000] px-4 py-3 mb-5 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results LabelFrame */}
      {compareResult && (
        <div className={`mb-5 tk-groove p-7 text-center relative pt-8 ${compareResult.pointsAwarded > 0 ? "bg-[#1a2e1a]" : "bg-eco-card"}`}>
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            Result
          </span>
          {compareResult.cvOffline ? (
            <>
              <AlertTriangle size={30} className="text-amber-400 mx-auto mb-3" />
              <p className="text-amber-400 font-bold text-sm">CV Service Offline</p>
              <p className="text-[#555555] text-xs mt-2">Start the Python service or enable mock mode</p>
            </>
          ) : compareResult.pointsAwarded > 0 ? (
            <>
              <Sparkles size={22} className="text-[#4ade80] mx-auto mb-3" />
              <p className="text-[#888888] text-xs mb-2">MISSION COMPLETE</p>
              <p className="font-black text-[#4ade80] leading-none" style={{ fontSize: "4rem" }}>
                +{compareResult.pointsAwarded}
              </p>
              <p className="text-[#c8c8c8] font-bold text-base mt-3">
                {compareResult.pointsAwarded === 1 ? "point" : "points"} earned
              </p>
              <p className="text-[#888888] text-xs mt-2">
                {compareResult.removed} item{compareResult.removed !== 1 ? "s" : ""} removed from the environment
              </p>
            </>
          ) : (
            <>
              <Search size={30} className="text-[#555555] mx-auto mb-3" />
              <p className="text-[#c8c8c8] font-bold text-base">No Change Detected</p>
              <p className="text-[#555555] text-xs mt-2">
                AI found the same number of objects in both photos.
              </p>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-5">
        <Button onClick={analyze} disabled={!canAnalyze} loading={analyzing} size="lg" className="flex-1">
          <Zap size={15} />
          {analyzing ? "Analyzing..." : "Analyze Cleanup"}
        </Button>
        {compareResult && (
          <Button variant="secondary" size="lg" onClick={handleReset}>New</Button>
        )}
        <Button variant="secondary" size="lg" onClick={() => router.push("/dashboard")}>
          Dashboard
        </Button>
      </div>

      {/* How it works LabelFrame */}
      {!compareResult && (
        <div className="tk-groove bg-eco-card p-6 relative pt-8">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#888888]">
            How it works
          </span>
          <ol className="flex flex-col gap-4 text-xs text-[#888888]">
            {[
              "Take a Before photo showing litter on the ground",
              "Pick up the trash and put it in a bin",
              "Take an After photo of the same spot",
              "Click Analyze — AI counts removed items",
              "Earn 1 point per item removed",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="bg-[#1a5c32] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {compareResult && compareResult.pointsAwarded > 0 && (
        <Button className="w-full mt-5" onClick={() => router.push("/dashboard")}>
          View Dashboard
        </Button>
      )}
    </div>
  );
}
