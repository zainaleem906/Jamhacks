"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Zap, Package, Leaf, Calendar, ArrowRight, Edit3, Play } from "lucide-react";
import { formatPoints, formatDate, co2Saved } from "@/lib/utils";
import CharacterAvatar, { CharacterConfig, DEFAULT_CHAR, getCharacter } from "@/components/character/CharacterAvatar";
import CharacterCreator from "@/components/character/CharacterCreator";

function useCountUp(target: number, dur = 1000) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick); else setVal(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, dur]);
  return { val, ref };
}

// Circular level progress ring
function LevelRing({ xp, xpInLevel, xpToNext, level, emoji, title, aura }: {
  xp: number; xpInLevel: number; xpToNext: number; level: number; emoji: string; title: string; aura: string;
}) {
  const pct = Math.min(xpInLevel / xpToNext, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width={140} height={140} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(80,160,220,0.12)" strokeWidth={7} />
        {/* Progress */}
        <motion.circle
          cx={70} cy={70} r={r} fill="none"
          stroke="url(#lvlGrad)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="lvlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={aura} />
            <stop offset="100%" stopColor="#ff6b3a" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 28 }}>{emoji}</span>
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 18, fontWeight: 900, color: "#d8f0ff" }}>LV {level}</span>
        <span style={{ fontSize: 9, color: "#2e4a68", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
      </div>
    </div>
  );
}

interface Props {
  user: {
    id: string; displayName: string; username: string; level: number; xp: number; points: number;
    totalItems: number; streak: number; bottlesCollected: number; cansCollected: number;
    bagsCollected: number; cupsCollected: number; otherCollected: number; createdAt: string;
  };
  levelInfo: { level: number; title: string; emoji: string };
  nextLevel: { level: number; minXP: number; emoji: string; title: string } | null;
  xpInLevel: number;
  xpToNext: number;
  co2: number;
  allAchievements: { id: string; name: string; description: string; icon: string; xpReward: number }[];
  earnedIds: string[];
  sessions: { id: string; itemCount: number; pointsEarned: number; startTime: string; endTime: string | null }[];
}

const fd = (d = 0) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: d, ease: [0.25,0.1,0.25,1] as [number,number,number,number] } });

export default function ProfileClient({ user, levelInfo, nextLevel, xpInLevel, xpToNext, co2, allAchievements, earnedIds, sessions }: Props) {
  const [char, setChar] = useState<CharacterConfig>(DEFAULT_CHAR);
  const [showCreator, setShowCreator] = useState(false);
  const [activeTab, setActiveTab] = useState<"achievements" | "history" | "impact">("achievements");
  const pointsC = useCountUp(user.points);
  const itemsC = useCountUp(user.totalItems, 900);
  const co2Kg = parseFloat(co2Saved(co2).replace(" kg", ""));
  const co2C = useCountUp(isNaN(co2Kg) ? 0 : Math.round(co2Kg * 10), 800);
  const earnedSet = new Set(earnedIds);

  useEffect(() => { setChar(getCharacter(user.id)); }, [user.id]);

  const impactItems = [
    { emoji: "🍾", label: "Plastic bottles", count: user.bottlesCollected, color: "#00d4e8" },
    { emoji: "🥤", label: "Cans", count: user.cansCollected, color: "#40e080" },
    { emoji: "🛍️", label: "Plastic bags", count: user.bagsCollected, color: "#ffb347" },
    { emoji: "☕", label: "Cups", count: user.cupsCollected, color: "#9b7fe8" },
    { emoji: "🗑️", label: "Other litter", count: user.otherCollected, color: "#6a9abf" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto relative">
      {/* Ambient background */}
      <div style={{ position: "fixed", top: -100, right: -80, width: 500, height: 500, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: `radial-gradient(circle, ${char.aura}12 0%, transparent 65%)` }} />
      <div style={{ position: "fixed", bottom: -120, left: -60, width: 400, height: 400, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(64,224,128,0.06) 0%, transparent 65%)" }} />

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── HERO CARD ── */}
        <motion.div {...fd(0)} className="rounded-3xl p-6 mb-4 relative overflow-hidden"
          style={{
            background: "rgba(5,14,35,0.82)", backdropFilter: "blur(24px)",
            border: `1px solid ${char.aura}25`,
            boxShadow: `0 0 80px ${char.aura}08, 0 20px 60px rgba(0,0,0,0.5)`,
          }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.025,
            backgroundImage: "linear-gradient(rgba(0,212,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,232,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px" }} />

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Character + Level Ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <LevelRing
                xp={user.xp} xpInLevel={xpInLevel} xpToNext={xpToNext}
                level={levelInfo.level} emoji={levelInfo.emoji} title={levelInfo.title}
                aura={char.aura}
              />
              <div style={{ position: "absolute", inset: "15px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CharacterAvatar config={char} size={80} onClick={() => setShowCreator(true)} animate />
              </div>
            </div>

            {/* Name + info */}
            <div className="flex-1 text-center md:text-left">
              <p style={{ fontSize: 10, color: "#6a9abf", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
                Operative Profile
              </p>
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 900,
                letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6,
                textShadow: `0 1px 0 ${char.aura}80, 0 3px 0 ${char.aura}50, 0 6px 0 ${char.aura}25, 0 12px 30px rgba(0,0,0,0.5)`,
                color: "#fff",
              }}>
                {user.displayName}
              </h1>
              <p style={{ fontSize: 12, color: "#2e4a68", marginBottom: 12 }}>@{user.username} · since {formatDate(new Date(user.createdAt))}</p>
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, background: `${char.aura}15`, color: char.aura, border: `1px solid ${char.aura}40`, boxShadow: `0 0 14px ${char.aura}25` }}>
                  {levelInfo.emoji} {levelInfo.title}
                </span>
                {user.streak > 0 && (
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, background: "rgba(255,107,58,0.12)", color: "#ff6b3a", border: "1px solid rgba(255,107,58,0.3)" }}>
                    🔥 {user.streak}d streak
                  </span>
                )}
                <button onClick={() => setShowCreator(true)} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: "rgba(80,160,220,0.08)", color: "#4a7090", border: "1px solid rgba(80,160,220,0.2)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Edit3 size={10} /> Edit Character
                </button>
              </div>
              {nextLevel && (
                <p style={{ fontSize: 11, color: "#2e4a68", marginTop: 8 }}>
                  {nextLevel.minXP - user.xp} XP to {nextLevel.emoji} {nextLevel.title}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── STAT GRID ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: "⚡", label: "Points", value: formatPoints(pointsC.val), ref: pointsC.ref, color: "#ffb347", sub: "total earned" },
            { icon: "📦", label: "Items", value: itemsC.val.toString(), ref: itemsC.ref, color: "#00d4e8", sub: "collected" },
            { icon: "🌍", label: "CO₂ Saved", value: co2Saved(co2), ref: co2C.ref, color: "#40e080", sub: "kg prevented" },
            { icon: "📅", label: "Sessions", value: sessions.length.toString(), ref: null, color: "#9b7fe8", sub: "missions run" },
          ].map(({ icon, label, value, ref: r, color, sub }, i) => (
            <motion.div key={label} {...fd(0.06 + i * 0.05)} ref={r ?? undefined}
              whileHover={{ scale: 1.04, y: -2 }}
              style={{ borderRadius: 20, padding: "18px 14px", background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)", border: `1px solid ${color}20`, boxShadow: `0 0 30px ${color}06` }}>
              <div style={{ fontSize: 26, marginBottom: 8, filter: `drop-shadow(0 0 6px ${color}70)` }}>{icon}</div>
              <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 26, fontWeight: 800, color: "#d8f0ff", lineHeight: 1, marginBottom: 4, textShadow: `0 0 20px ${color}30` }}>{value}</p>
              <p style={{ fontSize: 9, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              <p style={{ fontSize: 10, color: "#1e3650", marginTop: 2 }}>{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── GO MODE CTA ── */}
        <motion.div {...fd(0.28)}>
          <Link href="/gomode">
            <motion.div whileHover={{ scale: 1.015, y: -3 }} whileTap={{ scale: 0.99 }}
              className="rounded-2xl p-5 flex items-center justify-between mb-4 cursor-pointer relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(64,224,128,0.12) 0%, rgba(0,212,232,0.06) 100%)",
                border: "1px solid rgba(64,224,128,0.3)",
                boxShadow: "0 0 50px rgba(64,224,128,0.08)",
              }}>
              <motion.div animate={{ x: ["-100%","200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(64,224,128,0.05), transparent)", width: "50%", pointerEvents: "none" }} />
              <div>
                <p style={{ fontSize: 9, color: "#40e080", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>🌍 Live Mode</p>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: "#d8f0ff" }}>Go Mode</p>
                <p style={{ fontSize: 12, color: "#6a9abf", marginTop: 3 }}>Walk + detect + score in real-time</p>
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg, #40e080, #00c070)", boxShadow: "0 0 24px rgba(64,224,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Play size={20} fill="#001a0a" style={{ color: "#001a0a" }} />
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* ── TABS ── */}
        <motion.div {...fd(0.32)}>
          <div style={{ display: "flex", gap: 4, marginBottom: 16, padding: "4px", borderRadius: 16, background: "rgba(5,14,35,0.6)", border: "1px solid rgba(80,160,220,0.1)" }}>
            {(["achievements","history","impact"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                flex: 1, padding: "8px 6px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                background: activeTab === t ? "rgba(0,212,232,0.12)" : "transparent",
                color: activeTab === t ? "#00d4e8" : "#2e4a68",
                textTransform: "uppercase", letterSpacing: "0.06em",
                borderBottom: activeTab === t ? "2px solid #00d4e8" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                {t === "achievements" ? "🏆 Badges" : t === "history" ? "📋 History" : "🌿 Impact"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

            {activeTab === "achievements" && (
              <div style={{ borderRadius: 20, padding: 20, background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(80,160,220,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 11, fontWeight: 800, color: "#d8f0ff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Achievements
                  </h3>
                  <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: 12, fontWeight: 800, fontFamily: "'Space Grotesk', monospace", background: "rgba(0,212,232,0.08)", color: "#00d4e8", border: "1px solid rgba(0,212,232,0.2)" }}>
                    {earnedIds.length}/{allAchievements.length}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {allAchievements.map((ach, i) => {
                    const earned = earnedSet.has(ach.id);
                    return (
                      <motion.div key={ach.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={earned ? { scale: 1.03 } : undefined}
                        style={{
                          padding: "14px 12px", borderRadius: 16, textAlign: "center",
                          background: earned ? "rgba(0,212,232,0.05)" : "rgba(80,160,220,0.03)",
                          border: `1px solid ${earned ? "rgba(0,212,232,0.2)" : "rgba(80,160,220,0.06)"}`,
                          filter: earned ? "none" : "grayscale(1)",
                          opacity: earned ? 1 : 0.4,
                          boxShadow: earned ? "0 0 20px rgba(0,212,232,0.05)" : "none",
                          position: "relative", overflow: "hidden",
                        }}>
                        {earned && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(0,212,232,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />}
                        <span style={{ fontSize: 32, display: "block", marginBottom: 6, filter: earned ? `drop-shadow(0 0 8px rgba(255,179,71,0.6))` : "none" }}>{ach.icon}</span>
                        <p style={{ fontSize: 11, fontWeight: 700, color: earned ? "#d8f0ff" : "#2e4a68", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{ach.name}</p>
                        <p style={{ fontSize: 10, color: "#2e4a68", lineHeight: 1.4 }}>{ach.description}</p>
                        {earned && <p style={{ fontSize: 11, fontWeight: 800, color: "#ffb347", marginTop: 6, fontFamily: "'Space Grotesk', monospace" }}>+{ach.xpReward} XP</p>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div style={{ borderRadius: 20, padding: 20, background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(80,160,220,0.1)" }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: "#d8f0ff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Mission History
                </h3>
                {sessions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0" }}>
                    <p style={{ fontSize: 36, marginBottom: 10 }}>🌱</p>
                    <p style={{ color: "#2e4a68", fontSize: 13 }}>Complete your first mission to see history here</p>
                    <Link href="/gomode" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, padding: "8px 16px", borderRadius: 12, background: "rgba(64,224,128,0.1)", border: "1px solid rgba(64,224,128,0.25)", color: "#40e080", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                      <Play size={12} /> Start Go Mode
                    </Link>
                  </div>
                ) : sessions.map((s, i) => {
                  const dur = s.endTime ? Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000) : null;
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(80,160,220,0.06)" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(0,212,232,0.08)", border: "1px solid rgba(0,212,232,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>♻️</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, color: "#d8f0ff", fontWeight: 600 }}>{s.itemCount} item{s.itemCount !== 1 ? "s" : ""} collected</p>
                        <p style={{ fontSize: 11, color: "#2e4a68" }}>{new Date(s.startTime).toLocaleDateString()}{dur != null ? ` · ${dur}m` : ""}</p>
                      </div>
                      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 16, fontWeight: 800, color: "#00d4e8", textShadow: "0 0 12px rgba(0,212,232,0.4)" }}>
                        +{s.pointsEarned}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {activeTab === "impact" && (
              <div style={{ borderRadius: 20, padding: 20, background: "rgba(5,14,35,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(64,224,128,0.12)" }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: "#40e080", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Leaf size={12} /> Environmental Impact
                </h3>

                {/* CO2 highlight */}
                <div style={{ textAlign: "center", marginBottom: 24, padding: 20, borderRadius: 16, background: "rgba(64,224,128,0.06)", border: "1px solid rgba(64,224,128,0.15)" }}>
                  <p style={{ fontSize: 11, color: "#40e080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total CO₂ Prevented</p>
                  <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 48, fontWeight: 900, color: "#40e080", lineHeight: 1, textShadow: "0 0 40px rgba(64,224,128,0.5)" }}>
                    {co2Saved(co2)}
                  </p>
                  <p style={{ fontSize: 11, color: "#2e4a68", marginTop: 6 }}>
                    ≈ {Math.round(parseFloat(co2Saved(co2).replace(" kg","")) / 0.04 || 0)} car-km equivalent
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {impactItems.map(({ emoji, label, count, color }) => {
                    const maxCount = Math.max(...impactItems.map(i => i.count), 1);
                    return (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
                        <span style={{ fontSize: 12, width: 90, flexShrink: 0, color: "#4a7090" }}>{label}</span>
                        <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(80,160,220,0.07)", overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${(count / maxCount) * 100}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            style={{ height: "100%", borderRadius: 3, background: color, boxShadow: `0 0 8px ${color}60` }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color, width: 24, textAlign: "right", fontFamily: "'Space Grotesk', monospace" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Character Creator */}
      <AnimatePresence>
        {showCreator && (
          <CharacterCreator userId={user.id} initial={char} onSave={setChar} onClose={() => setShowCreator(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
