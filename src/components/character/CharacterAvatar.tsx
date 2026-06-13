"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export interface CharacterConfig {
  base: string;
  aura: string;
  accessory: string;
  ring: string;
  title?: string;
}

export const DEFAULT_CHAR: CharacterConfig = {
  base: "🦸",
  aura: "#00d4e8",
  accessory: "⚡",
  ring: "#ff6b3a",
  title: "Eco Warrior",
};

export function getCharacter(userId: string): CharacterConfig {
  if (typeof window === "undefined") return DEFAULT_CHAR;
  try {
    const raw = localStorage.getItem(`eq_char_${userId}`);
    return raw ? { ...DEFAULT_CHAR, ...JSON.parse(raw) } : DEFAULT_CHAR;
  } catch { return DEFAULT_CHAR; }
}

export function saveCharacter(userId: string, config: CharacterConfig) {
  localStorage.setItem(`eq_char_${userId}`, JSON.stringify(config));
}

// Floating particles canvas
function ParticleField({ size, color }: { size: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    type Particle = { angle: number; dist: number; speed: number; size: number; opacity: number; phase: number };
    const particles: Particle[] = Array.from({ length: 18 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: r * (0.45 + Math.random() * 0.55),
      speed: (Math.random() - 0.5) * 0.006,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, size, size);
      frame++;
      for (const p of particles) {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.dist;
        const y = cy + Math.sin(p.angle) * p.dist;
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + p.phase);
        const alpha = p.opacity * pulse;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        const hex = color.replace("#", "");
        const ri = parseInt(hex.slice(0, 2), 16);
        const gi = parseInt(hex.slice(2, 4), 16);
        const bi = parseInt(hex.slice(4, 6), 16);
        ctx.fillStyle = `rgba(${ri},${gi},${bi},${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [size, color]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ position: "absolute", inset: `-${size * 0.25}px`, width: `${size * 1.5}px`, height: `${size * 1.5}px`, pointerEvents: "none" }} />;
}

interface Props {
  config: CharacterConfig;
  size?: number;
  level?: number;
  onClick?: () => void;
  animate?: boolean;
}

export default function CharacterAvatar({ config, size = 100, level, onClick, animate = true }: Props) {
  const { base, aura, ring, accessory } = config;
  const orb = size;

  // Compute derived colors for multi-layer planet-like rendering
  const hex2rgb = (h: string) => {
    const c = h.replace("#", "");
    return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
  };
  const [ar, ag, ab] = hex2rgb(aura);
  const [rr, rg, rb] = hex2rgb(ring);

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.06 } : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      style={{ position: "relative", width: orb, height: orb, cursor: onClick ? "pointer" : "default", flexShrink: 0 }}
    >
      {/* Particle field */}
      {animate && <ParticleField size={orb} color={aura} />}

      {/* Outermost glow halo */}
      {animate && (
        <motion.div
          animate={{ scale: [1, 1.22, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -orb * 0.12,
            borderRadius: "50%",
            border: `1.5px solid ${aura}`,
            boxShadow: `0 0 ${orb * 0.3}px ${aura}40`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Secondary pulsing halo */}
      {animate && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0, 0.25] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          style={{
            position: "absolute",
            inset: -orb * 0.06,
            borderRadius: "50%",
            border: `1px solid ${ring}80`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Spinning ring orbit */}
      {animate && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: -orb * 0.04,
            borderRadius: "50%",
            border: `2px dashed ${ring}45`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Counter-rotating ring */}
      {animate && (
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: -orb * 0.01,
            borderRadius: "50%",
            border: `1.5px dotted ${aura}30`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── MAIN ORB BODY ── */}
      <div style={{
        width: orb, height: orb, borderRadius: "50%",
        position: "relative", overflow: "hidden",
        boxShadow: [
          `0 0 ${orb * 0.5}px ${aura}35`,
          `0 0 ${orb * 0.9}px ${aura}12`,
          `0 ${orb * 0.15}px ${orb * 0.4}px rgba(0,0,0,0.6)`,
          `inset 0 0 ${orb * 0.35}px rgba(0,0,0,0.55)`,
          `inset 0 ${orb * 0.05}px ${orb * 0.2}px rgba(255,255,255,0.04)`,
        ].join(", "),
        background: [
          `radial-gradient(circle at 32% 28%, rgba(${ar},${ag},${ab},0.55) 0%, rgba(${ar},${ag},${ab},0.25) 30%, rgba(${rr},${rg},${rb},0.15) 55%, rgba(3,11,28,0.95) 85%)`,
        ].join(", "),
        border: `1.5px solid rgba(${ar},${ag},${ab},0.55)`,
      }}>
        {/* Atmospheric rim - left */}
        <div style={{
          position: "absolute", left: "-15%", top: "-10%",
          width: "50%", height: "120%",
          borderRadius: "0 50% 50% 0",
          background: `radial-gradient(ellipse at 100% 50%, rgba(${ar},${ag},${ab},0.18) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Surface texture layer 1 - lighter band */}
        <div style={{
          position: "absolute", top: "18%", left: "-10%", right: "-10%", height: "20%",
          background: `radial-gradient(ellipse at 50% 50%, rgba(${ar},${ag},${ab},0.12) 0%, transparent 70%)`,
          transform: "rotate(-5deg)",
          pointerEvents: "none",
        }} />

        {/* Surface texture layer 2 - equatorial dark band */}
        <div style={{
          position: "absolute", top: "48%", left: "-10%", right: "-10%", height: "14%",
          background: "rgba(0,0,0,0.12)",
          transform: "rotate(-3deg)",
          pointerEvents: "none",
        }} />

        {/* Primary specular highlight */}
        <div style={{
          position: "absolute", top: "6%", left: "12%",
          width: "35%", height: "25%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 50%, rgba(${ar},${ag},${ab},0.6) 0%, rgba(255,255,255,0.15) 40%, transparent 80%)`,
          filter: `blur(${orb * 0.04}px)`,
          pointerEvents: "none",
        }} />

        {/* Secondary smaller highlight */}
        <div style={{
          position: "absolute", top: "14%", left: "18%",
          width: "14%", height: "10%",
          borderRadius: "50%",
          background: `rgba(255,255,255,0.35)`,
          filter: `blur(${orb * 0.02}px)`,
          pointerEvents: "none",
        }} />

        {/* Bottom shadow */}
        <div style={{
          position: "absolute", bottom: "-5%", left: "-5%", right: "-5%", height: "45%",
          background: "radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.5) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Emoji */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}>
          <span style={{
            fontSize: orb * 0.43,
            lineHeight: 1,
            filter: `drop-shadow(0 ${orb * 0.025}px ${orb * 0.07}px rgba(0,0,0,0.7)) drop-shadow(0 0 ${orb * 0.06}px ${aura}50)`,
            userSelect: "none",
          }}>
            {base}
          </span>
        </div>
      </div>

      {/* Accessory badge - floating orb */}
      <motion.div
        animate={animate ? { y: [0, -orb * 0.04, 0], rotate: [0, 5, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: -orb * 0.07,
          right: -orb * 0.07,
          width: orb * 0.38,
          height: orb * 0.38,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: [
            `0 0 ${orb * 0.2}px ${ring}70`,
            `0 0 ${orb * 0.4}px ${ring}25`,
            `inset 0 0 ${orb * 0.15}px rgba(0,0,0,0.4)`,
          ].join(", "),
          background: `radial-gradient(circle at 32% 28%, rgba(${rr},${rg},${rb},0.7) 0%, rgba(${rr},${rg},${rb},0.35) 40%, rgba(3,11,28,0.95) 100%)`,
          border: `1.5px solid rgba(${rr},${rg},${rb},0.7)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Accessory specular */}
        <div style={{
          position: "absolute", top: "8%", left: "12%", width: "32%", height: "22%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
          filter: "blur(2px)",
        }} />
        <span style={{ fontSize: orb * 0.18, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))", zIndex: 1 }}>
          {accessory}
        </span>
      </motion.div>

      {/* Level badge */}
      {level !== undefined && (
        <div style={{
          position: "absolute",
          bottom: -orb * 0.1,
          left: "50%",
          transform: "translateX(-50%)",
          padding: `${orb * 0.025}px ${orb * 0.1}px`,
          borderRadius: 20,
          background: "rgba(3,11,28,0.96)",
          border: `1.5px solid ${aura}55`,
          boxShadow: `0 0 ${orb * 0.12}px ${aura}35, 0 2px 8px rgba(0,0,0,0.4)`,
          fontSize: orb * 0.12,
          fontWeight: 900,
          color: aura,
          fontFamily: "'Space Grotesk', monospace",
          whiteSpace: "nowrap",
          letterSpacing: "0.05em",
          zIndex: 5,
        }}>
          LVL {level}
        </div>
      )}

      {/* Edit overlay */}
      {onClick && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: orb * 0.04,
            fontSize: orb * 0.12,
            color: "#d8f0ff",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: orb * 0.24 }}>✏️</span>
          <span>Edit</span>
        </motion.div>
      )}
    </motion.div>
  );
}
