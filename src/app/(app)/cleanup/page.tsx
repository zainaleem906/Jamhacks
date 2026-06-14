"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhotoCompare from "@/components/camera/PhotoCompare";
import AchievementToast from "@/components/gamification/AchievementToast";
import Button from "@/components/ui/Button";
import { Leaf, Zap, AlertCircle, AlertTriangle, Search, Sparkles, Clock, ShieldCheck, ShieldAlert } from "lucide-react";
import type { DetectedObject } from "@/types";
import confetti from "canvas-confetti";

interface AnalysisResult {
  detections: DetectedObject[];
  count: number;
}

interface Verification {
  available: boolean;
  matched: boolean;
  sameLocation: boolean;
  yoloRemoved: number;
  claudeRemoved: number | null;
  finalRemoved: number;
  claudeError?: string;
}

interface CompareResult {
  beforeCount: number;
  afterCount: number;
  removed: number;
  pointsAwarded: number;
  cvOffline: boolean;
  newAchievements: string[];
  verification?: Verification;
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
  const [beforeTs, setBeforeTs] = useState<Date | null>(null);
  const [afterTs, setAfterTs] = useState<Date | null>(null);

  const handleBothReady = useCallback((before: string, after: string) => {
    setReadyFrames({ before, after });
    setCompareResult(null); setBeforeResult(null); setAfterResult(null); setError(null); setAchievements([]);
  }, []);

  const handleReset = useCallback(() => {
    setReadyFrames(null);
    setCompareResult(null); setBeforeResult(null); setAfterResult(null); setError(null); setAchievements([]);
    setBeforeTs(null); setAfterTs(null);
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

  // Soft warning: both timestamps present but order is wrong
  const tsWarning = beforeTs && afterTs && afterTs.getTime() <= beforeTs.getTime()
    ? `Photo timestamps suggest your "after" (${afterTs.toLocaleTimeString()}) was taken before your "before" (${beforeTs.toLocaleTimeString()}).`
    : null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <AchievementToast achievements={achievements} />

      {/* Toolbar */}
      <div className="tk-groove bg-[#dcfce7] px-5 py-3 mb-6 flex items-center gap-3 border-[#bbf7d0]">
        <Leaf size={14} className="text-[#15803d]" />
        <span className="text-sm text-[#15803d] font-bold">Submit Cleanup</span>
        <span className="text-[#16a34a] text-xs ml-2">— upload before &amp; after photos</span>
      </div>

      {/* Photo upload */}
      <div className="tk-groove bg-eco-card p-6 mb-6 relative pt-8 border-[#bbf7d0]">
        <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#16a34a] font-semibold">
          Photos
        </span>
        <PhotoCompare
          beforeResult={beforeResult}
          afterResult={afterResult}
          analyzing={analyzing}
          onBothReady={handleBothReady}
          onReset={handleReset}
          onBeforeTimestamp={setBeforeTs}
          onAfterTimestamp={setAfterTs}
        />
      </div>

      {/* Timestamp warning (soft — doesn't block submission) */}
      {tsWarning && !compareResult && (
        <div className="tk-groove bg-[#fffbeb] px-4 py-3 mb-5 flex items-start gap-3 border-[#fde68a]">
          <Clock size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-700 font-semibold text-xs">Timestamp order warning</p>
            <p className="text-amber-600 text-xs mt-0.5">{tsWarning} You can still submit — timestamps may be missing or incorrect on some devices.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="tk-sunken bg-[#fff0f0] px-4 py-3 mb-5 flex items-center gap-3 text-red-600 text-xs">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {compareResult && (
        <div className={`mb-5 tk-groove p-7 text-center relative pt-8 border-[#bbf7d0] ${compareResult.pointsAwarded > 0 ? "bg-[#f0fdf4]" : "bg-eco-card"}`}>
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#16a34a] font-semibold">
            Result
          </span>
          {compareResult.cvOffline ? (
            <>
              <AlertTriangle size={30} className="text-amber-500 mx-auto mb-3" />
              <p className="text-amber-600 font-bold text-sm">CV Service Offline</p>
              <p className="text-[#8e8e8e] text-xs mt-2">Start the Python service or enable mock mode</p>
            </>
          ) : compareResult.pointsAwarded > 0 ? (
            <>
              <Sparkles size={22} className="text-[#16a34a] mx-auto mb-3" />
              <p className="text-[#8e8e8e] text-xs mb-2">MISSION COMPLETE</p>
              <p className="font-black text-[#15803d] leading-none" style={{ fontSize: "4rem" }}>
                +{compareResult.pointsAwarded}
              </p>
              <p className="text-[#262626] font-bold text-base mt-3">
                {compareResult.pointsAwarded === 1 ? "point" : "points"} earned
              </p>
              <p className="text-[#8e8e8e] text-xs mt-2">
                {compareResult.removed} item{compareResult.removed !== 1 ? "s" : ""} removed from the environment
              </p>
              <VerificationBadge v={compareResult.verification} />
            </>
          ) : (
            <>
              <Search size={30} className="text-[#b0b0b0] mx-auto mb-3" />
              <p className="text-[#262626] font-bold text-base">No Change Detected</p>
              <p className="text-[#8e8e8e] text-xs mt-2">AI found the same number of objects in both photos.</p>
              <VerificationBadge v={compareResult.verification} />
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

      {/* How it works */}
      {!compareResult && (
        <div className="tk-groove bg-[#f0fdf4] p-6 relative pt-8 border-[#bbf7d0]">
          <span className="absolute top-0 left-4 -translate-y-1/2 bg-[#f0fdf4] px-2 text-[11px] text-[#16a34a] font-semibold">
            How it works
          </span>
          <ol className="flex flex-col gap-4 text-xs text-[#8e8e8e]">
            {[
              "Take a Before photo showing litter on the ground",
              "Pick up the trash and put it in a bin",
              "Take an After photo of the same spot",
              "Click Analyze — AI counts removed items",
              "Earn 1 point per item removed",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="tk-btn-primary text-white text-[10px] font-black w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  );
}

function VerificationBadge({ v }: { v?: Verification }) {
  if (!v) return null;

  if (v.available && !v.sameLocation) {
    return (
      <div className="mt-4 text-left bg-[#fff0f0] border border-red-200 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-red-700 mb-1">
          <ShieldAlert size={13} />
          Location Mismatch — no points awarded
        </div>
        <p className="text-red-600">
          Claude detected that the before and after photos appear to be from different locations.
          Please retake photos of the same spot.
        </p>
      </div>
    );
  }

  if (!v.available) {
    return (
      <div className="mt-4 inline-flex items-center gap-2 bg-[#fff0f0] border border-red-200 px-3 py-1.5 text-xs text-red-600">
        <ShieldAlert size={13} />
        Claude unavailable: {v.claudeError ?? "unknown error"}
      </div>
    );
  }

  if (v.matched) {
    return (
      <div className="mt-4 inline-flex items-center gap-2 bg-[#dcfce7] border border-[#86efac] px-3 py-1.5 text-xs font-bold text-[#15803d]">
        <ShieldCheck size={13} />
        Verified by Claude — both AIs agree ({v.yoloRemoved} items)
      </div>
    );
  }

  return (
    <div className="mt-4 text-left bg-[#fffbeb] border border-[#fde68a] px-4 py-3 text-xs">
      <div className="flex items-center gap-2 font-bold text-amber-700 mb-1">
        <ShieldAlert size={13} />
        AI Disagreement — result adjusted
      </div>
      <div className="text-amber-600 space-y-0.5">
        <p>YOLOv8 detected <span className="font-bold">{v.yoloRemoved}</span> items removed</p>
        <p>Claude detected <span className="font-bold">{v.claudeRemoved}</span> items removed</p>
        <p className="font-bold mt-1">Used conservative count: {v.finalRemoved} items</p>
      </div>
    </div>
  );
}
