"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatPoints } from "@/lib/utils";
import { LayoutDashboard, Camera, Trophy, User, LogOut, Zap } from "lucide-react";
import type { AuthUser } from "@/types";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#00d4e8" },
  { href: "/gomode", label: "Go Mode", icon: null, color: "#40e080", special: true },
  { href: "/cleanup", label: "Photo Verify", icon: Camera, color: "#ffb347" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, color: "#9b7fe8" },
  { href: "/profile", label: "Profile", icon: User, color: "#ff6b3a" },
];

export default function Navbar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 min-h-screen p-4 gap-1 flex-shrink-0 relative z-10"
        style={{
          background: "rgba(2, 7, 20, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(80,160,220,0.1)",
        }}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-3 mb-4">
          {/* Detailed planet logo */}
          <div className="animate-float" style={{ position: "relative", width: 38, height: 38, flexShrink: 0 }}>
            {/* Planet body */}
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: `
                radial-gradient(circle at 30% 28%, rgba(255,220,120,0.9) 0%, rgba(230,120,30,0.85) 22%, rgba(170,50,10,0.9) 50%, rgba(90,20,5,1) 100%)
              `,
              boxShadow: "0 0 18px rgba(220,80,20,0.5), 0 0 36px rgba(220,80,20,0.15), inset 0 0 12px rgba(0,0,0,0.4)",
              overflow: "hidden", position: "relative",
            }}>
              {/* Surface bands */}
              <div style={{ position: "absolute", top: "22%", left: 0, right: 0, height: "14%", background: "rgba(255,200,80,0.25)", transform: "rotate(-4deg) scale(1.1)" }} />
              <div style={{ position: "absolute", top: "52%", left: 0, right: 0, height: "10%", background: "rgba(200,100,30,0.3)", transform: "rotate(-3deg) scale(1.1)" }} />
              {/* Polar cap */}
              <div style={{ position: "absolute", top: "-4px", left: "-4px", right: "-4px", height: "30%", background: "radial-gradient(ellipse at 50% 0%, rgba(255,240,200,0.35) 0%, transparent 80%)" }} />
              {/* Specular highlight */}
              <div style={{ position: "absolute", top: "12%", left: "15%", width: "28%", height: "18%", borderRadius: "50%", background: "rgba(255,255,200,0.4)", filter: "blur(3px)" }} />
            </div>
            {/* Ring system */}
            <div style={{
              position: "absolute", top: "38%", left: "-50%", right: "-50%", height: "26%",
              borderRadius: "50%", border: "2px solid rgba(255,160,50,0.35)",
              boxShadow: "0 0 8px rgba(255,140,30,0.2)",
              transform: "rotateX(70deg)",
              pointerEvents: "none",
            }} />
          </div>
          <div>
            <span className="font-black text-white block leading-none" style={{ fontFamily: "'Space Grotesk', Inter, sans-serif", fontSize: "15px", letterSpacing: "-0.02em" }}>
              ECO<span style={{ color: "#00d4e8" }}>QUEST</span>
            </span>
            <span className="text-xs font-semibold block mt-0.5" style={{ color: "rgba(106,154,191,0.7)", letterSpacing: "0.08em" }}>
              SAVE WORLDS
            </span>
          </div>
        </Link>

        {/* User card */}
        <div className="flex items-center gap-3 rounded-xl p-3 mb-4" style={{ background: "rgba(5,14,35,0.7)", border: "1px solid rgba(80,160,220,0.12)" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: "radial-gradient(circle at 35% 30%, rgba(0,212,232,0.5) 0%, rgba(0,80,120,0.8) 60%, rgba(3,11,28,0.9) 100%)",
            border: "1.5px solid rgba(0,212,232,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>
            🌍
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate leading-tight" style={{ color: "#d8f0ff", fontSize: "13px" }}>
              {user.displayName}
            </p>
            <p className="text-xs flex items-center gap-1 mt-0.5">
              <Zap size={9} style={{ color: "#00d4e8" }} />
              <span className="tabular-nums font-bold" style={{ color: "#00d4e8", fontFamily: "'Space Grotesk', monospace" }}>
                {formatPoints(user.points)}
              </span>
              <span style={{ color: "#2e4a68" }}>pts</span>
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, color, special }) => {
            const active = pathname.startsWith(href);
            if (special) {
              return (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
                      background: active
                        ? "rgba(64,224,128,0.15)"
                        : "linear-gradient(135deg, rgba(64,224,128,0.08) 0%, rgba(0,212,232,0.05) 100%)",
                      border: active ? "1px solid rgba(64,224,128,0.4)" : "1px solid rgba(64,224,128,0.2)",
                      boxShadow: "0 0 20px rgba(64,224,128,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: 8, height: 8, borderRadius: "50%", background: "#40e080", boxShadow: "0 0 10px #40e080", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#40e080", letterSpacing: "0.01em" }}>{label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#40e080", background: "rgba(64,224,128,0.12)", padding: "1px 6px", borderRadius: 6 }}>LIVE</span>
                  </motion.div>
                </Link>
              );
            }
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color: active ? color : "#4a7090",
                  background: active ? `${color}10` : "transparent",
                  borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
                  boxShadow: active ? `inset 0 0 20px ${color}05` : "none",
                }}
              >
                {Icon && <Icon size={15} />}
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 w-full text-left"
          style={{ color: "#2e4a68" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ff7a7a"; (e.currentTarget as HTMLElement).style.background = "rgba(255,60,60,0.06)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#2e4a68"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          background: "rgba(2,7,20,0.96)",
          borderTop: "1px solid rgba(80,160,220,0.1)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon, color, special }) => {
          const active = pathname.startsWith(href);
          if (special) {
            return (
              <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2 gap-0.5">
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(64,224,128,0.15)", border: "1.5px solid rgba(64,224,128,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    🌍
                  </motion.div>
                  <motion.div animate={{ scale: [1,2], opacity: [0.5,0] }} transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid #40e080" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: "#40e080", fontSize: 9 }}>GO</span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2.5 gap-1 text-xs font-semibold transition-colors" style={{ color: active ? color : "#2e4a68" }}>
              {Icon && <Icon size={18} />}
              <span style={{ fontSize: 9 }}>{label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
