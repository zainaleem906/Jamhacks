"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatPoints, co2Saved } from "@/lib/utils";
import { Zap, Package, Leaf, Flame, Play, ArrowRight, Target, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LevelBadge from "@/components/gamification/LevelBadge";
import StreakBadge from "@/components/gamification/StreakBadge";
import XPBar from "@/components/gamification/XPBar";
import CharacterAvatar, { CharacterConfig, DEFAULT_CHAR, getCharacter } from "@/components/character/CharacterAvatar";
import CharacterCreator from "@/components/character/CharacterCreator";

function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setValue(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
          else setValue(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

interface Props {
  user: {
    id: string;
    displayName: string; level: number; xp: number; points: number;
    totalItems: number; streak: number; bottlesCollected: number;
    cansCollected: number; bagsCollected: number; cupsCollected: number; otherCollected: number;
  };
  levelInfo: { title: string; emoji: string };
  nextLevel: { level: number; minXP: number; emoji: string; title: string } | null;
  co2: number;
  sessions: { id: string; itemCount: number; pointsEarned: number; startTime: string; endTime: string | null }[];
  achievements: { id: string; name: string; description: string; icon: string }[];
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] },
});

export default function DashboardClient({ user, levelInfo, nextLevel, co2, sessions, achievements }: Props) {
  const [char, setChar] = useState<CharacterConfig>(DEFAULT_CHAR);
  const [showCreator, setShowCreator] = useState(false);
  const pointsCount = useCountUp(user.points);
  const itemsCount = useCountUp(user.totalItems, 900);

  useEffect(() => {
    setChar(getCharacter(user.id));
  }, [user.id]);

  const itemLog = [
    { label: "Bottles", count: user.bottlesCollected, color: "#00d4e8", icon: "🍾" },
    { label: "Cans", count: user.cansCollected, color: "#40e080", icon: "🥤" },
    { label: "Bags", count: user.bagsCollected, color: "#ffb347", icon: "🛍️" },
    { label: "Cups", count: user.cupsCollected, color: "#9b7fe8", icon: "☕" },
    { label: "Other", count: user.otherCollected, color: "#4a7090", icon: "🗑️" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto relative">
      {/* Background glows */}
      <div style={{ position: "fixed", top: -200, right: -150, width: 700, height: 700, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(220,80,20,0.1) 0%, transparent 65%)" }} />
      <div style={{ position: "fixed", bottom: -200, left: -100, width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(0,140,185,0.09) 0%, transparent 65%)" }} />
      <div style={{ position: "fixed", top: "40%", right: "10%", width: 400, height: 400, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(155,127,232,0.07) 0%, transparent 65%)" }} />

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── HERO PANEL ── */}
        <motion.div
          {...fade(0)}
          className="rounded-3xl p-6 md:p-8 mb-5 relative overflow-hidden"
          style={{
            background: "rgba(5,14,35,0.8)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${char.aura}30`,
            boxShadow: `0 0 80px ${char.aura}10, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Subtle grid lines */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
            backgroundImage: "linear-gradient(rgba(0,212,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,232,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Decorative corner accent */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, pointerEvents: "none",
            background: `radial-gradient(circle at 100% 0%, ${char.aura}15 0%, transparent 60%)`,
          }} />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative">
            {/* Character avatar */}
            <div className="flex flex-col items-center gap-3">
              <CharacterAvatar
                config={char}
                size={110}
                level={user.level}
                onClick={() => setShowCreator(true)}
                animate
              />
              <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ fontSize: 10, color: char.aura, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
              >
                Tap to customize
              </motion.p>
            </div>

            {/* Name + level + status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: "#40e080", boxShadow: "0 0 10px #40e080", display: "inline-block", flexShrink: 0 }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6a9abf", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Operative Online
                </span>
              </div>

              {/* 3D name text */}
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(36px, 5.5vw, 58px)",
                fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em",
                color: "#fff",
                textShadow: `
                  0 1px 0 ${char.aura}80,
                  0 2px 0 ${char.aura}60,
                  0 4px 0 ${char.aura}40,
                  0 6px 0 ${char.aura}20,
                  0 8px 20px rgba(0,0,0,0.5),
                  0 0 60px ${char.aura}30
                `,
                marginBottom: 8,
              }}>
                {user.displayName.split(" ")[0]}
              </h1>

              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span style={{
                  padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800,
                  background: `${char.ring}20`, color: char.ring, border: `1px solid ${char.ring}50`,
                  boxShadow: `0 0 16px ${char.ring}30`,
                }}>
                  {levelInfo.emoji} {levelInfo.title}
                </span>
                <StreakBadge streak={user.streak} />
              </div>

              <XPBar xp={user.xp} />
              {nextLevel && (
                <p style={{ color: "#2e4a68", fontSize: 12, marginTop: 6 }}>
                  {nextLevel.minXP - user.xp} XP to {nextLevel.emoji} {nextLevel.title}
                </p>
              )}
            </div>

            {/* Quick stat pills */}
            <div className="flex md:flex-col gap-2 flex-wrap md:flex-nowrap">
              {[
                { icon: "⚡", label: formatPoints(user.points), color: "#ffb347" },
                { icon: "📦", label: `${user.totalItems} items`, color: "#00d4e8" },
                { icon: "🔥", label: `${user.streak}d streak`, color: "#ff6b3a" },
              ].map(({ icon, label, color }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 20,
                  background: `${color}10`, border: `1px solid ${color}30`,
                  fontSize: 12, fontWeight: 700, color,
                  whiteSpace: "nowrap",
                }}>
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { icon: Zap, emoji: "⚡", label: "Score", display: formatPoints(pointsCount.value), ref: pointsCount.ref, color: "#ffb347", sub: "total points" },
            { icon: Package, emoji: "📦", label: "Items", display: itemsCount.value.toString(), ref: itemsCount.ref, color: "#00d4e8", sub: "collected" },
            { icon: Leaf, emoji: "🌍", label: "CO₂ Saved", display: co2Saved(co2), ref: null, color: "#40e080", sub: "kg prevented" },
            { icon: Flame, emoji: "🔥", label: "Streak", display: `${user.streak}`, ref: null, color: "#ff6b3a", sub: "days running" },
          ].map(({ emoji, label, display, ref: r, color, sub }, i) => (
            <motion.div
              key={label}
              {...fade(0.08 + i * 0.06)}
              ref={r ?? undefined}
              whileHover={{ scale: 1.05, y: -3 }}
              style={{
                borderRadius: 20, padding: "20px 16px",
                background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)",
                border: `1px solid ${color}25`,
                boxShadow: `0 4px 30px rgba(0,0,0,0.35), 0 0 40px ${color}08`,
                cursor: "default",
              }}
            >
              <div style={{
                fontSize: 28, marginBottom: 10,
                filter: `drop-shadow(0 0 8px ${color}80)`,
              }}>{emoji}</div>
              <p style={{
                fontFamily: "'Space Grotesk', monospace", fontSize: 28, fontWeight: 800,
                color: "#d8f0ff", lineHeight: 1, marginBottom: 4,
                textShadow: `0 0 20px ${color}40`,
              }}>{display}</p>
              <p style={{ fontSize: 10, color: color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              <p style={{ fontSize: 10, color: "#2e4a68", marginTop: 2 }}>{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── MISSION CTAs ── */}
        <motion.div {...fade(0.3)} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {/* GO MODE */}
          <Link href="/gomode">
            <motion.div whileHover={{ scale: 1.015, y: -3 }} whileTap={{ scale: 0.99 }}
              className="rounded-2xl p-5 flex items-center justify-between cursor-pointer relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(64,224,128,0.14) 0%, rgba(0,180,100,0.08) 50%, rgba(0,212,232,0.08) 100%)", border: "1px solid rgba(64,224,128,0.35)", boxShadow: "0 0 60px rgba(64,224,128,0.1), 0 10px 40px rgba(0,0,0,0.4)", minHeight: 88 }}>
              <motion.div animate={{ x: ["-100%","200%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, transparent, rgba(64,224,128,0.07), transparent)", width: "50%" }} />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <motion.div animate={{ scale: [1,1.4,1], opacity: [1,0.3,1] }} transition={{ duration: 1.6, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#40e080", boxShadow: "0 0 10px #40e080" }} />
                  <p style={{ fontSize: 9, color: "#40e080", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em" }}>LIVE · Go Mode</p>
                </div>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 900, color: "#d8f0ff", textShadow: "0 0 25px rgba(64,224,128,0.2)" }}>Walk & Collect</p>
                <p style={{ fontSize: 11, color: "#4a8060", marginTop: 2 }}>AI detects as you explore</p>
              </div>
              <motion.div whileHover={{ scale: 1.12 }} style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg, #40e080, #00c070)", boxShadow: "0 0 26px rgba(64,224,128,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Play size={21} fill="#001a0a" style={{ color: "#001a0a" }} />
              </motion.div>
            </motion.div>
          </Link>
          {/* PHOTO VERIFY */}
          <Link href="/cleanup">
            <motion.div whileHover={{ scale: 1.015, y: -3 }} whileTap={{ scale: 0.99 }}
              className="rounded-2xl p-5 flex items-center justify-between cursor-pointer relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,212,232,0.1) 0%, rgba(0,80,120,0.06) 100%)", border: "1px solid rgba(0,212,232,0.18)", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", minHeight: 88 }}>
              <div>
                <p style={{ fontSize: 9, color: "#6a9abf", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>📸 Photo Mode</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 800, color: "#d8f0ff" }}>Submit Cleanup</p>
                <p style={{ fontSize: 11, color: "#2e4a68", marginTop: 2 }}>Before & after AI verify</p>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: "rgba(0,212,232,0.1)", border: "1px solid rgba(0,212,232,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Play size={20} style={{ color: "#00d4e8" }} />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>

        {/* ── BOTTOM GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Item log */}
          <motion.div {...fade(0.35)} style={{
            borderRadius: 20, padding: 20,
            background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(80,160,220,0.12)",
          }}>
            <h3 style={{ color: "#d8f0ff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <Package size={12} style={{ color: "#00d4e8" }} /> Collection Log
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {itemLog.map(({ icon, label, count, color }) => {
                const pct = user.totalItems > 0 ? (count / user.totalItems) * 100 : 0;
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 11, width: 44, flexShrink: 0, color: "#2e4a68", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(80,160,220,0.08)", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 10px ${color}60` }}
                      />
                    </div>
                    <span style={{ fontSize: 13, width: 24, textAlign: "right", color: color, fontWeight: 800, fontFamily: "'Space Grotesk', monospace" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div {...fade(0.4)} style={{
            borderRadius: 20, padding: 20,
            background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(80,160,220,0.12)",
          }}>
            <h3 style={{ color: "#d8f0ff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={12} style={{ color: "#ffb347" }} /> Achievements
            </h3>
            {achievements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>🌱</p>
                <p style={{ fontSize: 13, color: "#2e4a68" }}>Complete your first cleanup to earn achievements</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {achievements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12,
                      background: "rgba(255,179,71,0.04)", border: "1px solid rgba(255,179,71,0.12)",
                    }}
                  >
                    <span style={{ fontSize: 22, width: 32, textAlign: "center", filter: "drop-shadow(0 0 6px rgba(255,179,71,0.5))" }}>{a.icon}</span>
                    <div>
                      <p style={{ color: "#d8f0ff", fontSize: 12, fontWeight: 700 }}>{a.name}</p>
                      <p style={{ color: "#4a7090", fontSize: 11 }}>{a.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <Link href="/profile" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, marginTop: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#2e4a68" }}>
              All achievements <ArrowRight size={10} />
            </Link>
          </motion.div>
        </div>

        {/* ── MISSION LOG ── */}
        {sessions.length > 0 && (
          <motion.div {...fade(0.45)} style={{
            borderRadius: 20, padding: 20,
            background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(80,160,220,0.12)",
          }}>
            <h3 style={{ color: "#d8f0ff", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={12} style={{ color: "#00d4e8" }} /> Mission Log
            </h3>
            {sessions.map((s, i) => {
              const duration = s.endTime
                ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000)
                : null;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(80,160,220,0.07)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,212,232,0.1)", border: "1px solid rgba(0,212,232,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      🗑️
                    </div>
                    <div>
                      <p style={{ color: "#d8f0ff", fontSize: 13, fontWeight: 600 }}>{s.itemCount} items collected</p>
                      <p style={{ color: "#2e4a68", fontSize: 11 }}>
                        {new Date(s.startTime).toLocaleDateString()}{duration != null && ` · ${duration}m`}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    style={{
                      fontFamily: "'Space Grotesk', monospace", fontSize: 16, fontWeight: 800, color: "#00d4e8",
                      textShadow: "0 0 12px rgba(0,212,232,0.5)",
                    }}
                  >
                    +{s.pointsEarned}
                  </motion.span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Character Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <CharacterCreator
            userId={user.id}
            initial={char}
            onSave={setChar}
            onClose={() => setShowCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
