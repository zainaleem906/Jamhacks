"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhotoCompare from "@/components/camera/PhotoCompare";
import AchievementToast from "@/components/gamification/AchievementToast";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <AchievementToast achievements={achievements} />

      {/* Header */}
      <div className="mb-5">
        <p className="text-brand-400 text-sm font-semibold mb-1 flex items-center gap-1.5">
          <Leaf size={14} /> Make an Impact
        </p>
        <h1 className="text-3xl font-black text-slate-100">Submit Cleanup</h1>
        <p className="text-slate-500 text-sm mt-1">Upload before &amp; after photos — AI counts what you removed</p>
      </div>

      {/* Photo upload */}
      <Card className="mb-4">
        <PhotoCompare
          beforeResult={beforeResult}
          afterResult={afterResult}
          analyzing={analyzing}
          onBothReady={handleBothReady}
          onReset={handleReset}
        />
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded px-4 py-3 mb-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {compareResult && (
        <div className={`mb-4 rounded border-2 text-center p-7 ${
          compareResult.pointsAwarded > 0
            ? "border-brand-600 bg-brand-900/20"
            : "border-eco-border bg-eco-card"
        }`}>
          {compareResult.cvOffline ? (
            <>
              <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
              <p className="text-amber-400 font-bold text-lg">CV Service Offline</p>
              <p className="text-slate-500 text-sm mt-1">Start the Python service or enable mock mode</p>
            </>
          ) : compareResult.pointsAwarded > 0 ? (
            <>
              <div className="flex justify-center mb-2">
                <Sparkles size={24} className="text-brand-400" />
              </div>
              <p className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-2">Mission Complete</p>
              <p className="font-black text-brand-400 leading-none" style={{ fontSize: "5rem" }}>
                +{compareResult.pointsAwarded}
              </p>
              <p className="text-slate-200 font-bold text-xl mt-2">
                {compareResult.pointsAwarded === 1 ? "point" : "points"} earned
              </p>
              <p className="text-slate-500 text-sm mt-2">
                {compareResult.removed} item{compareResult.removed !== 1 ? "s" : ""} removed from the environment
              </p>
            </>
          ) : (
            <>
              <Search size={32} className="text-slate-500 mx-auto mb-3" />
              <p className="text-slate-200 font-black text-xl">No Change Detected</p>
              <p className="text-slate-500 text-sm mt-2">
                AI found the same number of objects in both photos. Try better lighting or a clearer view.
              </p>
            </>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mb-5">
        <Button onClick={analyze} disabled={!canAnalyze} loading={analyzing} size="lg" className="flex-1">
          <Zap size={17} />
          {analyzing ? "Analyzing…" : "Analyze Cleanup"}
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
        <Card>
          <h3 className="text-slate-100 font-black mb-4 text-base flex items-center gap-2">
            <Leaf size={16} className="text-brand-400" /> How It Works
          </h3>
          <ol className="flex flex-col gap-3 text-sm text-slate-400">
            {[
              "Take a Before photo showing the litter on the ground",
              "Pick up the trash and put it in a bin",
              "Take an After photo of the same spot",
              "Click Analyze — AI counts removed items",
              "Earn 1 point per item removed",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-700 text-white rounded flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {compareResult && compareResult.pointsAwarded > 0 && (
        <Button className="w-full mt-4" onClick={() => router.push("/dashboard")}>
          View Dashboard →
        </Button>
      )}
    </div>
  );
}
