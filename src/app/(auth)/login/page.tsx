"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Login failed"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex relative overflow-hidden" style={{ background: "#030b1c" }}>
      {/* Atmospheric background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 700px 500px at 85% -10%, rgba(220,80,20,0.2) 0%, transparent 60%)," +
            "radial-gradient(ellipse 600px 500px at 15% 110%, rgba(0,140,185,0.18) 0%, transparent 55%)",
        }}
      />

      {/* Planet decorations */}
      <div
        className="fixed pointer-events-none animate-float-slow"
        style={{
          top: "-80px", right: "-60px",
          width: "280px", height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 32% 28%, #ffb07a 0%, #e85520 35%, #a02808 65%, #4a0c02 100%)",
          boxShadow: "0 0 80px rgba(220,80,20,0.4), inset -15px -15px 30px rgba(0,0,0,0.4)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none animate-float"
        style={{
          bottom: "10%", left: "-40px",
          width: "140px", height: "140px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #c8e8ff 0%, #6ab0e8 35%, #2870c0 65%, #0a2860 100%)",
          boxShadow: "0 0 50px rgba(80,160,230,0.35), inset -8px -8px 20px rgba(0,0,0,0.3)",
          zIndex: 0, animationDelay: "3s",
        }}
      />

      <div className="relative flex w-full" style={{ zIndex: 1 }}>
        {/* Left branding panel */}
        <div
          className="hidden md:flex flex-col justify-between w-1/2 p-14"
          style={{ borderRight: "1px solid rgba(80,160,220,0.1)" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div
                className="w-9 h-9 rounded-xl"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #ffb07a 0%, #e85520 40%, #801808 100%)",
                  boxShadow: "0 0 20px rgba(220,80,20,0.5)",
                }}
              />
              <span
                className="font-black text-white"
                style={{ fontFamily: "'Space Grotesk', Inter, sans-serif", fontSize: "18px", letterSpacing: "-0.02em" }}
              >
                ECO<span style={{ color: "#00d4e8" }}>QUEST</span>
              </span>
            </div>

            <h2
              className="font-black text-white leading-tight mb-4"
              style={{
                fontFamily: "'Space Grotesk', Inter, sans-serif",
                fontSize: "42px",
                letterSpacing: "-0.02em",
              }}
            >
              Pick up litter.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #00d4e8 0%, #ff6b3a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Earn glory.
              </span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6a9abf" }}>
              AI-verified litter detection. Global leaderboards. Real environmental impact.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: "🤖", text: "YOLOv8 AI verifies every pickup" },
              { icon: "🏆", text: "Global & weekly rankings" },
              { icon: "⚡", text: "12+ achievements to unlock" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm" style={{ color: "#4a6280" }}>
                <span>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-10 md:hidden">
              <div
                className="w-9 h-9 rounded-xl"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #ffb07a 0%, #e85520 40%, #801808 100%)",
                  boxShadow: "0 0 20px rgba(220,80,20,0.4)",
                }}
              />
              <span
                className="font-black text-white"
                style={{ fontFamily: "'Space Grotesk', Inter, sans-serif", fontSize: "16px" }}
              >
                ECO<span style={{ color: "#00d4e8" }}>QUEST</span>
              </span>
            </div>

            <h1
              className="font-black text-white mb-1"
              style={{ fontFamily: "'Space Grotesk', Inter, sans-serif", fontSize: "26px" }}
            >
              Welcome back
            </h1>
            <p className="text-sm mb-8" style={{ color: "#6a9abf" }}>
              Sign in to continue your mission
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="cosmic-label">Email</label>
                <input
                  className="cosmic-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="cosmic-label">Password</label>
                <input
                  className="cosmic-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(255,60,60,0.08)",
                    border: "1px solid rgba(255,60,60,0.2)",
                    color: "#ff7a7a",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 font-black rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 hover:scale-[1.02] hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #00d4e8 0%, #0098b0 100%)",
                  color: "#000c18",
                  boxShadow: "0 0 30px rgba(0,212,232,0.4), 0 4px 20px rgba(0,0,0,0.4)",
                  letterSpacing: "0.08em",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "#2e4a68" }}>
              No account?{" "}
              <Link href="/register" className="font-bold" style={{ color: "#00d4e8" }}>
                Join EcoQuest
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
