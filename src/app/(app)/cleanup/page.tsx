"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhotoCompare from "@/components/camera/PhotoCompare";
import AchievementToast from "@/components/gamification/AchievementToast";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Trash2, Zap, Package, AlertCircle } from "lucide-react";
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
}

export default function CleanupPage() {
  const router = useRouter();
  const [readyFrames, setReadyFrames] = useState<{ before: string; after: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [beforeResult, setBeforeResult] = useState<AnalysisResult | null>(null);
  const [afterResult, setAfterResult] = useState<AnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBothReady = useCallback((before: string, after: string) => {
    setReadyFrames({ before, after });
    setCompareResult(null);
    setBeforeResult(null);
    setAfterResult(null);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    setReadyFrames(null);
    setCompareResult(null);
    setBeforeResult(null);
    setAfterResult(null);
    setError(null);
  }, []);

  async function analyze() {
    if (!readyFrames) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/cleanup/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beforeFrame: readyFrames.before,
          afterFrame: readyFrames.after,
        }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Analysis failed"); return; }

      const { beforeDetections, afterDetections, ...result } = data.data;
      setBeforeResult({ detections: beforeDetections, count: result.beforeCount });
      setAfterResult({ detections: afterDetections, count: result.afterCount });
      setCompareResult(result);

      if (result.pointsAwarded > 0) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#22c55e", "#4ade80", "#f59e0b"] });
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setAnalyzing(false);
    }
  }

  const canAnalyze = !!readyFrames && !analyzing && !compareResult;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <AchievementToast achievements={[]} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trash2 size={22} className="text-brand-400" />
          Submit Cleanup
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Upload a before &amp; after photo — AI counts how much trash you removed
        </p>
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
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results card */}
      {compareResult && (
        <Card glow className="mb-4">
          {compareResult.cvOffline ? (
            <p className="text-yellow-400 text-sm text-center">CV service offline — start the Python service or enable mock mode</p>
          ) : compareResult.removed === 0 ? (
            <div className="text-center py-2">
              <p className="text-2xl mb-2">🤔</p>
              <p className="text-white font-bold">No difference detected</p>
              <p className="text-gray-500 text-sm mt-1">
                The AI found the same number of items in both photos ({compareResult.beforeCount}).
                Try clearer photos with better lighting.
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-5xl font-black text-brand-400 mb-1">+{compareResult.pointsAwarded}</p>
              <p className="text-white font-bold text-lg">point{compareResult.pointsAwarded !== 1 ? "s" : ""} earned!</p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Before</p>
                  <p className="text-white font-bold text-xl">{compareResult.beforeCount}</p>
                  <p className="text-gray-600 text-xs">items</p>
                </div>
                <div className="text-center text-2xl self-center">→</div>
                <div className="text-center">
                  <p className="text-gray-500">After</p>
                  <p className="text-white font-bold text-xl">{compareResult.afterCount}</p>
                  <p className="text-gray-600 text-xs">items</p>
                </div>
                <div className="text-center text-2xl self-center">=</div>
                <div className="text-center">
                  <p className="text-brand-400 font-bold text-xl">{compareResult.removed}</p>
                  <p className="text-brand-400 text-xs">removed</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={analyze}
          disabled={!canAnalyze}
          loading={analyzing}
          size="lg"
          className="flex-1"
        >
          <Zap size={18} />
          {analyzing ? "Analyzing…" : "Analyze Cleanup"}
        </Button>
        {compareResult && (
          <Button variant="secondary" size="lg" onClick={handleReset}>
            New Cleanup
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={() => router.push("/dashboard")}>
          Dashboard
        </Button>
      </div>

      {/* Instructions */}
      {!compareResult && (
        <Card className="mt-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Package size={16} className="text-brand-400" />
            How It Works
          </h3>
          <ol className="flex flex-col gap-2 text-sm text-gray-400">
            {[
              "Take a \"Before\" photo showing the litter on the ground",
              "Pick up all the trash and put it in a bin",
              "Take an \"After\" photo of the same area",
              "Upload both photos above",
              "Click Analyze — AI counts the difference and awards 1 point per item removed",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 bg-brand-500/15 text-brand-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="text-gray-600 text-xs mt-4 border-t border-eco-border pt-3">
            Tip: good lighting and a clear view of the ground gives the most accurate detection.
          </p>
        </Card>
      )}

      {/* View dashboard after earning points */}
      {compareResult && compareResult.pointsAwarded > 0 && (
        <Button className="w-full mt-4" onClick={() => router.push("/dashboard")}>
          View Dashboard
        </Button>
      )}
    </div>
  );
}
