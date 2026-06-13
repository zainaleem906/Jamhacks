"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { Crosshair, Zap, Package, Timer, X, Play, ArrowRight, Wifi, WifiOff } from "lucide-react";

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  points: number;
  fingerprint: string;
}

interface ScorePopup { id: number; points: number; item: string; }

const CLASS_COLORS: Record<string, string> = {
  bottle: "#00d4e8", can: "#40e080", bag: "#ffb347",
  cup: "#9b7fe8", cardboard: "#ff6b3a", wrapper: "#ff6b8a", litter: "#6a9abf",
};

const CLASS_ICONS: Record<string, string> = {
  bottle: "🍾", can: "🥤", bag: "🛍️", cup: "☕", cardboard: "📦", wrapper: "🍬", litter: "🗑️",
};

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

// Minimal pulse radar component
function Radar({ active }: { active: boolean }) {
  return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={active ? { scale: [1, 2.5], opacity: [0.8, 0] } : { scale: 1, opacity: 0 }}
          transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1.5px solid #40e080",
            boxShadow: "0 0 8px #40e080",
          }}
        />
      ))}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(64,224,128,0.2) 0%, transparent 70%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Crosshair size={22} style={{ color: "#40e080" }} />
      </div>
    </div>
  );
}

export default function GoModePage() {
  const router = useRouter();
  const { videoRef, canvasRef, stream, error, starting, startCamera, stopCamera, captureFrame } = useCamera();
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<"idle" | "active" | "ended">("idle");
  const [detections, setDetections] = useState<Detection[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [itemsCollected, setItemsCollected] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [lockedOn, setLockedOn] = useState<string | null>(null);
  const [cvOffline, setCvOffline] = useState(false);
  const [summary, setSummary] = useState<{ items: number; points: number } | null>(null);
  const [lastPickup, setLastPickup] = useState<string | null>(null);

  // Draw detection overlay
  useEffect(() => {
    const canvas = overlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    for (const det of detections) {
      const [x1, y1, x2, y2] = det.bbox;
      const color = CLASS_COLORS[det.class] ?? "#00d4e8";
      const w = x2 - x1; const h = y2 - y1;

      // Pulsing fill
      ctx.fillStyle = color + "12";
      ctx.fillRect(x1, y1, w, h);

      // Main border
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.strokeRect(x1, y1, w, h);
      ctx.shadowBlur = 0;

      // Corner brackets
      const bw = Math.min(18, w * 0.3);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      for (const [cx, cy, dx, dy] of [[x1, y1, 1, 1], [x2, y1, -1, 1], [x1, y2, 1, -1], [x2, y2, -1, -1]] as [number,number,number,number][]) {
        ctx.beginPath(); ctx.moveTo(cx + dx * bw, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * bw); ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Label pill
      const fs = Math.max(11, canvas.width / 50);
      ctx.font = `700 ${fs}px 'Space Grotesk', monospace`;
      const icon = CLASS_ICONS[det.class] ?? "🗑️";
      const label = `${icon} ${det.class}  ${Math.round(det.confidence * 100)}%`;
      const tw = ctx.measureText(label).width + 14;
      ctx.fillStyle = color + "ee";
      ctx.beginPath();
      ctx.roundRect(x1, Math.max(0, y1 - 26), tw, 22, 4);
      ctx.fill();
      ctx.fillStyle = "#000c18";
      ctx.fillText(label, x1 + 7, Math.max(14, y1 - 8));
    }
  }, [detections, videoRef]);

  const addPopup = useCallback((pts: number, item: string) => {
    const id = Date.now() + Math.random();
    setPopups(p => [...p, { id, points: pts, item }]);
    setTimeout(() => setPopups(p => p.filter(x => x.id !== id)), 2500);
  }, []);

  const startSession = useCallback(async () => {
    await startCamera();
    const res = await fetch("/api/cleanup/start", { method: "POST" });
    const data = await res.json();
    if (!data.ok) return;
    sessionRef.current = data.data.sessionId;
    setPhase("active");

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    intervalRef.current = setInterval(async () => {
      if (!sessionRef.current) return;
      const frame = captureFrame();
      if (!frame) return;
      try {
        const r = await fetch("/api/cleanup/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame, sessionId: sessionRef.current }),
        });
        const d = await r.json();
        if (!d.ok) return;
        const { detections: dets, results, cvOffline: offline } = d.data;
        setCvOffline(!!offline);
        setDetections(dets ?? []);
        setLockedOn((dets ?? []).length > 0 ? dets[0].class : null);

        for (const result of results ?? []) {
          const pts = result.result?.pointsAwarded ?? 0;
          if (pts > 0) {
            setTotalScore(s => s + pts);
            setItemsCollected(c => c + 1);
            const item = result.pickup?.class ?? "litter";
            setLastPickup(item);
            addPopup(pts, item);
            confetti({ particleCount: 90, spread: 75, origin: { y: 0.45 }, colors: ["#00d4e8", "#ff6b3a", "#40e080", "#ffb347"] });
          }
        }
      } catch { /* ignore */ }
    }, 1500);
  }, [startCamera, captureFrame, addPopup]);

  const endSession = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    stopCamera();
    if (sessionRef.current) {
      try {
        const res = await fetch("/api/cleanup/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionRef.current }),
        });
        const data = await res.json();
        setSummary(data.ok
          ? { items: data.data.itemCount, points: data.data.pointsEarned }
          : { items: itemsCollected, points: totalScore });
      } catch {
        setSummary({ items: itemsCollected, points: totalScore });
      }
    } else {
      setSummary({ items: itemsCollected, points: totalScore });
    }
    setPhase("ended");
  }, [stopCamera, itemsCollected, totalScore]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    stopCamera();
  }, [stopCamera]);

  /* ═══ LAUNCH SCREEN ═══ */
  if (phase === "idle") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 24, position: "relative", overflow: "hidden",
      }}>
        {/* Nature futurism background layers */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(64,224,128,0.08) 0%, rgba(0,212,232,0.05) 40%, transparent 70%)" }} />
          {/* Bioluminescent orbs */}
          {[
            { top: "15%", left: "8%", size: 180, color: "#40e080" },
            { top: "60%", right: "5%", size: 240, color: "#00d4e8" },
            { bottom: "10%", left: "20%", size: 130, color: "#9b7fe8" },
          ].map(({ color, size, ...pos }, i) => (
            <motion.div key={i}
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", ...pos, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }}
            />
          ))}
        </div>

        <div className="relative" style={{ zIndex: 1, maxWidth: 420, width: "100%", textAlign: "center" }}>
          {/* Big animated scanner icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ width: 120, height: 120, margin: "0 auto 32px", position: "relative" }}
          >
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: "radial-gradient(circle at 38% 35%, rgba(64,224,128,0.3) 0%, rgba(0,212,232,0.15) 50%, rgba(3,11,28,0.9) 100%)",
              border: "2px solid rgba(64,224,128,0.4)",
              boxShadow: "0 0 60px rgba(64,224,128,0.25), 0 0 120px rgba(0,212,232,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 48,
            }}>
              🌍
            </div>
            {[0.6, 1, 1.45].map((scale, i) => (
              <motion.div key={i}
                animate={{ opacity: [0.6, 0] }}
                transition={{ duration: 2.5, delay: i * 0.5, repeat: Infinity }}
                style={{
                  position: "absolute", inset: `${-i * 14}px`, borderRadius: "50%",
                  border: `1.5px solid rgba(64,224,128,${0.4 - i * 0.1})`,
                }}
              />
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#40e080", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12 }}>
              ◆ New Feature ◆
            </p>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 52, fontWeight: 900,
              lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 8,
              color: "#fff",
              textShadow: "0 2px 0 rgba(64,224,128,0.6), 0 4px 0 rgba(64,224,128,0.4), 0 8px 0 rgba(64,224,128,0.2), 0 12px 30px rgba(0,0,0,0.5), 0 0 80px rgba(64,224,128,0.2)",
            }}>
              GO MODE
            </h1>
            <p style={{ fontSize: 15, color: "#6a9abf", marginBottom: 32, lineHeight: 1.6 }}>
              Walk around with your camera live. AI detects trash in real-time — pick it up and watch your score climb.
            </p>
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ borderRadius: 20, padding: "16px 20px", marginBottom: 28, background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(64,224,128,0.15)", textAlign: "left" }}>
            {[
              { icon: "📸", step: "Camera stays on as you walk", color: "#40e080" },
              { icon: "🔍", step: "AI scans for litter every 1.5s", color: "#00d4e8" },
              { icon: "⚡", step: "Pick up trash → it vanishes → you score", color: "#ffb347" },
              { icon: "🏆", step: "Points auto-awarded when item cleared", color: "#9b7fe8" },
            ].map(({ icon, step, color }, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(80,160,220,0.07)" : "none" }}>
                <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#6a9abf" }}>{step}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginLeft: "auto", boxShadow: `0 0 8px ${color}` }} />
              </motion.div>
            ))}
          </motion.div>

          {error && (
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.25)", color: "#ff7a7a", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={startSession}
            disabled={starting}
            style={{
              width: "100%", padding: "18px", borderRadius: 18, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #40e080 0%, #00c070 40%, #00a060 100%)",
              color: "#001a0a", fontSize: 16, fontWeight: 900,
              textTransform: "uppercase", letterSpacing: "0.08em",
              boxShadow: "0 0 40px rgba(64,224,128,0.4), 0 8px 32px rgba(0,0,0,0.4)",
              fontFamily: "'Space Grotesk', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
          >
            <Play size={20} fill="currentColor" />
            {starting ? "Starting Camera…" : "Launch Go Mode"}
          </motion.button>

          <button onClick={() => router.push("/dashboard")} style={{ marginTop: 14, background: "none", border: "none", color: "#2e4a68", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
            Back to dashboard
          </button>
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    );
  }

  /* ═══ SUMMARY SCREEN ═══ */
  if (phase === "ended") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 24, position: "relative",
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          style={{ maxWidth: 400, width: "100%", textAlign: "center" }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: 72, marginBottom: 20, display: "block" }}
          >
            {(summary?.items ?? 0) > 0 ? "🎉" : "🌱"}
          </motion.div>

          <p style={{ fontSize: 11, fontWeight: 800, color: "#40e080", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>
            Mission Complete
          </p>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 900,
            color: "#d8f0ff", lineHeight: 1, marginBottom: 24,
            textShadow: "0 0 40px rgba(64,224,128,0.3)",
          }}>
            {(summary?.items ?? 0) > 0 ? "Nice Work!" : "Keep Exploring"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Points", value: `+${summary?.points ?? 0}`, color: "#00d4e8", icon: "⚡" },
              { label: "Items", value: summary?.items ?? 0, color: "#40e080", icon: "♻️" },
              { label: "Time", value: formatTime(elapsed), color: "#ffb347", icon: "⏱️" },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{
                borderRadius: 16, padding: "16px 8px",
                background: "rgba(5,14,35,0.8)", backdropFilter: "blur(16px)",
                border: `1px solid ${color}25`,
                boxShadow: `0 0 30px ${color}08`,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#2e4a68", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setPhase("idle"); setTotalScore(0); setItemsCollected(0); setElapsed(0); setSummary(null); setDetections([]); }}
              style={{
                width: "100%", padding: 16, borderRadius: 16, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #40e080, #00c070)",
                color: "#001a0a", fontSize: 14, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.08em",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 0 30px rgba(64,224,128,0.3)",
              }}
            >
              Play Again
            </motion.button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                width: "100%", padding: 14, borderRadius: 16, border: "1px solid rgba(80,160,220,0.2)", cursor: "pointer",
                background: "rgba(5,14,35,0.7)", color: "#6a9abf", fontSize: 14, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              View Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ═══ ACTIVE GO MODE ═══ */
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>
      {/* Full-screen video */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Detection overlay canvas */}
      <canvas
        ref={overlayRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />

      {/* Hidden capture canvas */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
      }} />

      {/* Corner brackets - full screen AR effect */}
      {["tl","tr","bl","br"].map(pos => (
        <div key={pos} style={{
          position: "absolute",
          top: pos.includes("t") ? 16 : undefined,
          bottom: pos.includes("b") ? 16 : undefined,
          left: pos.includes("l") ? 16 : undefined,
          right: pos.includes("r") ? 16 : undefined,
          width: 40, height: 40,
          borderTop: pos.includes("t") ? "2px solid rgba(64,224,128,0.6)" : "none",
          borderBottom: pos.includes("b") ? "2px solid rgba(64,224,128,0.6)" : "none",
          borderLeft: pos.includes("l") ? "2px solid rgba(64,224,128,0.6)" : "none",
          borderRight: pos.includes("r") ? "2px solid rgba(64,224,128,0.6)" : "none",
          pointerEvents: "none",
        }} />
      ))}

      {/* ── TOP HUD ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "16px 20px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(2px)",
      }}>
        {/* Timer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(64,224,128,0.3)",
        }}>
          <Timer size={13} style={{ color: "#40e080" }} />
          <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 16, fontWeight: 800, color: "#40e080" }}>
            {formatTime(elapsed)}
          </span>
        </div>

        {/* Status indicator */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <Radar active={!cvOffline} />
          <AnimatePresence mode="wait">
            <motion.p
              key={lockedOn ?? "scan"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
                color: lockedOn ? "#ffb347" : "#40e080",
                textShadow: lockedOn ? "0 0 12px #ffb347" : "0 0 12px #40e080",
              }}
            >
              {cvOffline ? "CV OFFLINE" : lockedOn ? `🎯 LOCKED: ${lockedOn}` : "SCANNING..."}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Score */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 20,
          background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,212,232,0.3)",
        }}>
          <Zap size={13} style={{ color: "#00d4e8" }} />
          <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 16, fontWeight: 800, color: "#00d4e8" }}>
            {totalScore}
          </span>
        </div>
      </div>

      {/* ── BOTTOM HUD ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "20px",
        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
        backdropFilter: "blur(2px)",
      }}>
        {/* Items collected bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 14,
            background: "rgba(0,0,0,0.5)", border: "1px solid rgba(80,160,220,0.2)",
            flex: 1,
          }}>
            <Package size={12} style={{ color: "#6a9abf" }} />
            <span style={{ fontSize: 12, color: "#6a9abf", fontWeight: 700 }}>
              {itemsCollected} item{itemsCollected !== 1 ? "s" : ""} collected
            </span>
            {lastPickup && (
              <span style={{ marginLeft: "auto", fontSize: 14 }}>
                {CLASS_ICONS[lastPickup] ?? "🗑️"}
              </span>
            )}
          </div>
          {cvOffline && (
            <div style={{ padding: "5px 10px", borderRadius: 12, background: "rgba(255,179,71,0.15)", border: "1px solid rgba(255,179,71,0.3)", display: "flex", alignItems: "center", gap: 5 }}>
              <WifiOff size={11} style={{ color: "#ffb347" }} />
              <span style={{ fontSize: 10, color: "#ffb347", fontWeight: 700 }}>CV offline</span>
            </div>
          )}
        </div>

        {/* Instruction when locked on */}
        <AnimatePresence>
          {lockedOn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{
                textAlign: "center", marginBottom: 12,
                padding: "8px 16px", borderRadius: 14,
                background: "rgba(255,179,71,0.15)", border: "1px solid rgba(255,179,71,0.4)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 800, color: "#ffb347", letterSpacing: "0.05em" }}>
                ♻️ Pick it up — points awarded when it leaves frame!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* End session button */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={endSession}
          style={{
            width: "100%", padding: "15px", borderRadius: 16, border: "1px solid rgba(255,107,58,0.35)", cursor: "pointer",
            background: "rgba(5,14,35,0.85)", backdropFilter: "blur(12px)",
            color: "#ff6b3a", fontSize: 14, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.08em",
            fontFamily: "'Space Grotesk', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <X size={16} />
          End Mission
        </motion.button>
      </div>

      {/* ── SCORE POPUPS ── */}
      <AnimatePresence>
        {popups.map(({ id, points, item }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, scale: 0.5, y: 0, x: "-50%" }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.1, 0.9], y: -120 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            style={{
              position: "absolute", top: "38%", left: "50%",
              textAlign: "center", pointerEvents: "none", zIndex: 50,
            }}
          >
            <div style={{
              padding: "12px 24px", borderRadius: 20,
              background: "rgba(0,212,232,0.15)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,212,232,0.5)",
              boxShadow: "0 0 40px rgba(0,212,232,0.4)",
            }}>
              <p style={{ fontSize: 40, fontWeight: 900, fontFamily: "'Space Grotesk', monospace", color: "#00d4e8", lineHeight: 1, textShadow: "0 0 30px rgba(0,212,232,0.8)" }}>
                +{points}
              </p>
              <p style={{ fontSize: 13, color: "#d8f0ff", fontWeight: 700, marginTop: 4 }}>
                {CLASS_ICONS[item] ?? "🗑️"} {item} collected!
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
