"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const WORDS = ["Bottles.", "Cans.", "Bags.", "Cups.", "Litter."];

function TypeCycler() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % WORDS.length); setVisible(true); }, 400);
    }, 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      style={{
        display: "inline-block",
        transition: "opacity 0.3s, transform 0.3s",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        background: "linear-gradient(135deg, #00d4e8 0%, #ff6b3a 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {WORDS[idx]}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#030b1c" }}>
      {/* Big orange planet — top right */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "fixed", top: -140, right: -100,
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle at 32% 28%, #ffb07a 0%, #e85520 35%, #a02808 65%, #4a0c02 100%)",
          boxShadow: "0 0 140px rgba(220,80,20,0.5), 0 0 300px rgba(220,80,20,0.15), inset -30px -30px 60px rgba(0,0,0,0.4)",
          zIndex: 0, pointerEvents: "none",
        }}
      />
      {/* Medium blue planet — left */}
      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{
          position: "fixed", top: "28%", left: -70,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #c8e8ff 0%, #6ab0e8 35%, #2870c0 65%, #0a2860 100%)",
          boxShadow: "0 0 70px rgba(80,160,230,0.4), 0 0 140px rgba(80,160,230,0.12), inset -15px -15px 30px rgba(0,0,0,0.3)",
          zIndex: 0, pointerEvents: "none",
        }}
      />
      {/* Small teal planet — bottom right */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "fixed", bottom: "12%", right: "7%",
          width: 110, height: 110, borderRadius: "50%",
          background: "radial-gradient(circle at 36% 30%, #b0f8ff 0%, #30d8f0 35%, #0098b0 65%, #003848 100%)",
          boxShadow: "0 0 50px rgba(0,180,210,0.45), inset -10px -10px 25px rgba(0,0,0,0.3)",
          zIndex: 0, pointerEvents: "none",
        }}
      />
      {/* Tiny purple planet */}
      <motion.div
        animate={{ y: [0, 10, 0], x: [0, 6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: "fixed", top: "55%", right: "18%",
          width: 55, height: 55, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #d4b0ff 0%, #9b7fe8 40%, #5030a0 70%, #1a0840 100%)",
          boxShadow: "0 0 30px rgba(150,100,230,0.4)",
          zIndex: 0, pointerEvents: "none",
        }}
      />

      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between px-8 py-5"
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "radial-gradient(circle at 35% 30%, #ffb07a 0%, #e85520 40%, #801808 100%)",
              boxShadow: "0 0 20px rgba(220,80,20,0.5)",
            }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              ECO<span style={{ color: "#00d4e8" }}>QUEST</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" style={{ color: "#6a9abf", fontSize: 14, fontWeight: 600, padding: "8px 14px" }}>
              Sign in
            </Link>
            <Link href="/register" className="hover:scale-105 transition-transform" style={{
              padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 800,
              background: "linear-gradient(135deg, #00d4e8 0%, #0098b0 100%)",
              color: "#000c18", boxShadow: "0 0 24px rgba(0,212,232,0.4)", letterSpacing: "0.06em",
            }}>
              PLAY FREE
            </Link>
          </div>
        </motion.nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-8" style={{ paddingTop: "60px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 18px", borderRadius: 999, marginBottom: 32,
              background: "rgba(0,212,232,0.08)", border: "1px solid rgba(0,212,232,0.2)",
              color: "#00d4e8", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4e8", boxShadow: "0 0 8px #00d4e8", display: "inline-block", animation: "pulse 2s infinite" }} />
            AI-Verified · Real Impact · Actually Fun
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(48px, 8.5vw, 108px)",
              fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: 12,
              textShadow: "0 0 100px rgba(255,255,255,0.07)",
            }}
          >
            Pick up
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(48px, 8.5vw, 108px)",
              fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: 28,
            }}
          >
            <TypeCycler />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(24px, 3.5vw, 44px)",
              fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em",
              color: "rgba(216,240,255,0.55)", marginBottom: 36,
            }}
          >
            Save worlds.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ color: "#6a9abf", fontSize: 17, maxWidth: 520, lineHeight: 1.65, marginBottom: 48 }}
          >
            EcoQuest turns real-world litter cleanup into a competitive game.
            Our AI verifies every single pickup. Earn XP. Climb global ranks. Actually save the planet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/register" className="hover:scale-105 transition-transform" style={{
              padding: "16px 40px", borderRadius: 16, fontSize: 14, fontWeight: 800,
              background: "linear-gradient(135deg, #00d4e8 0%, #0098b0 100%)",
              color: "#000c18", boxShadow: "0 0 50px rgba(0,212,232,0.45), 0 8px 40px rgba(0,0,0,0.4)",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Start Your Mission
            </Link>
            <Link href="/login" className="hover:scale-105 transition-transform" style={{
              padding: "16px 32px", borderRadius: 16, fontSize: 14, fontWeight: 700,
              background: "rgba(5,14,35,0.7)", border: "1px solid rgba(80,160,220,0.2)",
              color: "#6a9abf", backdropFilter: "blur(8px)",
            }}>
              Sign in
            </Link>
          </motion.div>
        </section>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex justify-center gap-12 py-8 px-6"
          style={{ borderTop: "1px solid rgba(80,160,220,0.08)", borderBottom: "1px solid rgba(80,160,220,0.08)" }}
        >
          {[
            { value: "10+", label: "Pts per bottle" },
            { value: "AI", label: "Verified pickups" },
            { value: "Live", label: "Leaderboards" },
            { value: "12", label: "Achievements" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 28, fontWeight: 800, color: "#d8f0ff", letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#2e4a68", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <section className="px-6 py-16 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { num: "01", title: "AI-Verified Pickups", desc: "Snap before & after. Our YOLOv8 model counts what you cleaned. No cheating the system.", color: "#00d4e8", glow: "rgba(0,212,232,0.18)", delay: 0.1 },
              { num: "02", title: "Earn XP & Level Up", desc: "Every item removed is points earned. Unlock ranks from Scout to Planet Guardian.", color: "#ff6b3a", glow: "rgba(255,107,58,0.18)", delay: 0.2 },
              { num: "03", title: "Compete Globally", desc: "Weekly leaderboards. Streak bonuses. Achievements. Your cleanup ranked against the world.", color: "#ffb347", glow: "rgba(255,179,71,0.18)", delay: 0.3 },
            ].map(({ num, title, desc, color, glow, delay }) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay }}
                whileHover={{ scale: 1.03, y: -4 }}
                style={{
                  borderRadius: 20, padding: "28px 24px",
                  background: "rgba(5, 14, 35, 0.65)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${color}30`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${glow}`,
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color, opacity: 0.5, fontFamily: "'Space Grotesk', monospace", marginBottom: 16, letterSpacing: "0.08em" }}>{num}</div>
                <div style={{ width: 36, height: 3, borderRadius: 2, background: color, marginBottom: 16, boxShadow: `0 0 10px ${color}` }} />
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: "#d8f0ff", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#6a9abf", lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
