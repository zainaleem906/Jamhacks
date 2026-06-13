"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PhotoCompare from "@/components/camera/PhotoCompare";
import AchievementToast from "@/components/gamification/AchievementToast";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Zap, Package, AlertCircle, ArrowRight } from "lucide-react";
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
        body: JSON.stringify({ beforeFrame: readyFrames.before, afterFrame: readyFrames.after }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Analysis failed"); return; }

      const { beforeDetections, afterDetections, ...result } = data.data;
      setBeforeResult({ detections: beforeDetections, count: result.beforeCount });
      setAfterResult({ detections: afterDetections, count: result.afterCount });
      setCompareResult(result);

      if (result.pointsAwarded > 0) {
        confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 }, colors: ["#00d4e8", "#ff6b3a", "#ffb347", "#9b7fe8"] });
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setAnalyzing(false);
    }
  }

  const canAnalyze = !!readyFrames && !analyzing && !compareResult;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto relative">
      <AchievementToast achievements={[]} />

      {/* Decorative orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-100px", right: "-80px",
          width: "350px", height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 36% 30%, #b0f8ff 0%, #30d8f0 35%, #0098b0 65%, #003848 100%)",
          boxShadow: "0 0 120px rgba(0,180,210,0.2)",
          opacity: 0.35, zIndex: 0,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#00d4e8", boxShadow: "0 0 8px #00d4e8" }}
            />
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "#6a9abf" }}>
              Mission Active
            </span>
          </div>
          <h1
            className="font-black text-white uppercase"
            style={{
              fontFamily: "'Space Grotesk', Inter, sans-serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              letterSpacing: "-0.03em",
            }}
          >
            Submit Cleanup
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6a9abf" }}>
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
          <div
            className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4"
            style={{
              background: "rgba(255,60,60,0.08)",
              border: "1px solid rgba(255,60,60,0.2)",
              color: "#ff7a7a",
            }}
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {compareResult && (
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              background: "rgba(5,14,35,0.82)",
              backdropFilter: "blur(16px)",
              border: compareResult.pointsAwarded > 0
                ? "1px solid rgba(0,212,232,0.3)"
                : "1px solid rgba(80,160,220,0.13)",
              boxShadow: compareResult.pointsAwarded > 0
                ? "0 0 50px rgba(0,212,232,0.1), 0 8px 32px rgba(0,0,0,0.4)"
                : "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            {compareResult.cvOffline ? (
              <p className="text-sm text-center font-bold" style={{ color: "#ffb347" }}>
                ⚠ CV service offline — start the Python service or enable mock mode
              </p>
            ) : compareResult.removed === 0 ? (
              <div className="text-center py-2">
                <p className="text-4xl mb-3">🤔</p>
                <p className="font-black text-lg uppercase tracking-wide" style={{ color: "#d8f0ff" }}>
                  No Difference Detected
                </p>
                <p className="text-sm mt-2" style={{ color: "#6a9abf" }}>
                  The AI found the same number of items in both photos ({compareResult.beforeCount}).
                  Try clearer photos with better lighting.
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#00d4e8", boxShadow: "0 0 6px #00d4e8" }}
                  />
                  <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "#6a9abf" }}>
                    Mission Complete
                  </span>
                </div>
                <p
                  className="font-black leading-none mb-2"
                  style={{
                    fontSize: "72px",
                    color: "#00d4e8",
                    fontFamily: "'Space Grotesk', monospace",
                    textShadow: "0 0 40px rgba(0,212,232,0.6), 0 0 80px rgba(0,212,232,0.2)",
                  }}
                >
                  +{compareResult.pointsAwarded}
                </p>
                <p className="font-bold text-lg" style={{ color: "#d8f0ff" }}>
                  point{compareResult.pointsAwarded !== 1 ? "s" : ""} earned!
                </p>
                <div className="flex justify-center gap-8 mt-5 text-sm">
                  {[
                    { label: "Before", value: compareResult.beforeCount, color: "#6a9abf" },
                    { sep: "→" },
                    { label: "After", value: compareResult.afterCount, color: "#6a9abf" },
                    { sep: "=" },
                    { label: "Removed", value: compareResult.removed, color: "#00d4e8" },
                  ].map((item, i) =>
                    "sep" in item ? (
                      <div key={i} className="self-center text-2xl" style={{ color: "#2e4a68" }}>{item.sep}</div>
                    ) : (
                      <div key={i} className="text-center">
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#2e4a68" }}>{item.label}</p>
                        <p
                          className="font-black text-2xl tabular-nums"
                          style={{ color: item.color, fontFamily: "'Space Grotesk', monospace" }}
                        >
                          {item.value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button onClick={analyze} disabled={!canAnalyze} loading={analyzing} size="lg" className="flex-1">
            <Zap size={18} />
            {analyzing ? "Scanning…" : "Analyze Cleanup"}
          </Button>
          {compareResult && (
            <Button variant="secondary" size="lg" onClick={handleReset}>
              New Mission
            </Button>
          )}
          <Button variant="secondary" size="lg" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>

        {/* View dashboard CTA after points */}
        {compareResult && compareResult.pointsAwarded > 0 && (
          <button
            className="w-full mt-4 rounded-2xl p-4 flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #00d4e8 0%, #0098b0 100%)",
              color: "#000c18",
              boxShadow: "0 0 30px rgba(0,212,232,0.35)",
            }}
            onClick={() => router.push("/dashboard")}
          >
            View Dashboard <ArrowRight size={16} />
          </button>
        )}

        {/* Mission briefing */}
        {!compareResult && (
          <div
            className="rounded-2xl p-5 mt-6"
            style={{
              background: "rgba(5,14,35,0.72)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(80,160,220,0.13)",
            }}
          >
            <h3 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "#00d4e8" }}>
              <Package size={13} />
              Mission Briefing
            </h3>
            <ol className="flex flex-col gap-3">
              {[
                'Take a "Before" photo showing the litter on the ground',
                "Pick up all the trash and put it in a bin",
                'Take an "After" photo of the same area',
                "Upload both photos above",
                "Click Analyze — AI counts the difference and awards points",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#6a9abf" }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                    style={{
                      background: "rgba(0,212,232,0.1)",
                      color: "#00d4e8",
                      border: "1px solid rgba(0,212,232,0.2)",
                      fontFamily: "'Space Grotesk', monospace",
                    }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p
              className="text-xs mt-4 pt-3"
              style={{ color: "#1a3050", borderTop: "1px solid rgba(80,160,220,0.08)" }}
            >
              Tip: good lighting and a clear view of the ground gives the most accurate detection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
