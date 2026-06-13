"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterAvatar, { CharacterConfig, saveCharacter } from "./CharacterAvatar";

const BASES = ["🦸", "🧙", "🦹", "👾", "🤖", "👽", "🦊", "🐸", "🔮", "🌟", "🐉", "🦄"];
const ACCESSORIES = ["⚡", "🔥", "🏆", "💎", "🌍", "🛸", "⭐", "🌊", "👑", "🎯", "🚀", "🌈"];
const AURAS = [
  { color: "#00d4e8", label: "Cosmic" },
  { color: "#ff6b3a", label: "Blaze" },
  { color: "#9b7fe8", label: "Void" },
  { color: "#ffb347", label: "Solar" },
  { color: "#40e080", label: "Terra" },
  { color: "#ff6b8a", label: "Nova" },
];
const RINGS = [
  { color: "#ff6b3a", label: "Fire" },
  { color: "#00d4e8", label: "Ice" },
  { color: "#9b7fe8", label: "Arcane" },
  { color: "#ffb347", label: "Gold" },
  { color: "#40e080", label: "Nature" },
  { color: "#ff6b8a", label: "Rose" },
];

type Tab = "character" | "aura" | "ring" | "accessory";

interface Props {
  userId: string;
  initial: CharacterConfig;
  onSave: (cfg: CharacterConfig) => void;
  onClose: () => void;
}

export default function CharacterCreator({ userId, initial, onSave, onClose }: Props) {
  const [cfg, setCfg] = useState<CharacterConfig>(initial);
  const [tab, setTab] = useState<Tab>("character");

  function handleSave() {
    saveCharacter(userId, cfg);
    onSave(cfg);
    onClose();
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "character", label: "Character", icon: "🦸" },
    { id: "accessory", label: "Accessory", icon: "⚡" },
    { id: "aura", label: "Aura", icon: "✨" },
    { id: "ring", label: "Ring", icon: "💫" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(3,11,28,0.85)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: 480,
            background: "rgba(5,14,35,0.97)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(0,212,232,0.2)",
            borderRadius: 24,
            boxShadow: "0 0 80px rgba(0,212,232,0.1), 0 40px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(80,160,220,0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6a9abf", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                Customize
              </p>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: "#d8f0ff" }}>
                Your Character
              </h2>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(80,160,220,0.1)", border: "none", color: "#6a9abf", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>

          {/* Preview */}
          <div style={{ display: "flex", justifyContent: "center", padding: "28px 24px 20px" }}>
            <CharacterAvatar config={cfg} size={120} animate={false} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, padding: "0 20px 16px" }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: tab === t.id ? "rgba(0,212,232,0.15)" : "rgba(80,160,220,0.05)",
                  color: tab === t.id ? "#00d4e8" : "#4a7090",
                  fontSize: 11, fontWeight: 700,
                  borderBottom: tab === t.id ? "2px solid #00d4e8" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>

          {/* Options */}
          <div style={{ padding: "0 20px 24px", minHeight: 160 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {tab === "character" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                    {BASES.map(b => (
                      <motion.button
                        key={b}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCfg(c => ({ ...c, base: b }))}
                        style={{
                          padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer",
                          fontSize: 26, background: cfg.base === b ? `${cfg.aura}20` : "rgba(80,160,220,0.06)",
                          outline: cfg.base === b ? `2px solid ${cfg.aura}` : "2px solid transparent",
                          transition: "all 0.15s",
                        }}
                      >
                        {b}
                      </motion.button>
                    ))}
                  </div>
                )}
                {tab === "accessory" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                    {ACCESSORIES.map(a => (
                      <motion.button
                        key={a}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCfg(c => ({ ...c, accessory: a }))}
                        style={{
                          padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer",
                          fontSize: 26, background: cfg.accessory === a ? `${cfg.ring}20` : "rgba(80,160,220,0.06)",
                          outline: cfg.accessory === a ? `2px solid ${cfg.ring}` : "2px solid transparent",
                          transition: "all 0.15s",
                        }}
                      >
                        {a}
                      </motion.button>
                    ))}
                  </div>
                )}
                {tab === "aura" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {AURAS.map(({ color, label }) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCfg(c => ({ ...c, aura: color }))}
                        style={{
                          padding: "14px 10px", borderRadius: 14, border: "none", cursor: "pointer",
                          background: `${color}12`,
                          outline: cfg.aura === color ? `2px solid ${color}` : `2px solid ${color}30`,
                          boxShadow: cfg.aura === color ? `0 0 20px ${color}40` : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, margin: "0 auto 6px", boxShadow: `0 0 12px ${color}` }} />
                        <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
                {tab === "ring" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {RINGS.map(({ color, label }) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCfg(c => ({ ...c, ring: color }))}
                        style={{
                          padding: "14px 10px", borderRadius: 14, border: "none", cursor: "pointer",
                          background: `${color}12`,
                          outline: cfg.ring === color ? `2px solid ${color}` : `2px solid ${color}30`,
                          boxShadow: cfg.ring === color ? `0 0 20px ${color}40` : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px dashed ${color}`, margin: "0 auto 6px", boxShadow: `0 0 12px ${color}50` }} />
                        <p style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Save */}
          <div style={{ padding: "0 20px 24px" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              style={{
                width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${cfg.aura} 0%, ${cfg.ring} 100%)`,
                color: "#000c18", fontSize: 14, fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.08em",
                boxShadow: `0 0 30px ${cfg.aura}40`,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Save Character
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
