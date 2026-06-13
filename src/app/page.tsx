import Link from "next/link";
import { Leaf, Camera, Trophy, Zap, Shield, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-eco-bg bg-eco-grid overflow-hidden">
      {/* Glow blob */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-eco-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">TrashGame</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-20 pb-24 px-6">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <Zap size={12} />
          AI-Powered Litter Cleanup
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
          Clean Earth,{" "}
          <span className="text-brand-400 animate-glow">Earn Rewards</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
          Pick up litter, get verified by AI, and earn points, achievements, and
          leaderboard glory. The planet wins every time you play.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/register"
            className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-2xl text-base transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 active:scale-95"
          >
            Start Cleaning 🌿
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 bg-eco-card border border-eco-border hover:border-brand-500/40 text-white font-semibold rounded-2xl text-base transition-all active:scale-95"
          >
            View Leaderboard
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6 max-w-lg w-full">
          {[
            { value: "10+", label: "Points per bottle" },
            { value: "12", label: "Achievement types" },
            { value: "Real-time", label: "AI verification" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <span className="text-2xl font-black text-brand-400">{value}</span>
              <span className="text-xs text-gray-500 mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Camera,
              title: "AI Detection",
              desc: "YOLOv8 computer vision verifies every pickup in real time. No cheating — just cleaning.",
              color: "#22c55e",
            },
            {
              icon: Trophy,
              title: "Compete & Win",
              desc: "Global leaderboards, weekly challenges, and 12+ achievements to unlock as you level up.",
              color: "#f59e0b",
            },
            {
              icon: Shield,
              title: "Anti-Cheat",
              desc: "Smart object tracking prevents score farming. Every point is a real piece of litter removed.",
              color: "#0ea5e9",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-eco-card border border-eco-border rounded-2xl p-6 hover:border-opacity-60 transition-all group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                style={{ backgroundColor: color + "22", border: `1px solid ${color}44` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Levels preview */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">Level Up Your Impact</h2>
          <p className="text-gray-400 text-sm">From Seedling to Nature's Hero — your journey starts with one pickup.</p>
        </div>
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-3">
          {[
            { emoji: "🌱", title: "Seedling", color: "#86efac" },
            { emoji: "♻️", title: "Recycler", color: "#4ade80" },
            { emoji: "⚔️", title: "Eco Warrior", color: "#16a34a" },
            { emoji: "🦸", title: "Cleanup Hero", color: "#15803d" },
            { emoji: "🌍", title: "Planet Guardian", color: "#f59e0b" },
            { emoji: "👑", title: "Nature's Hero", color: "#ec4899" },
          ].map(({ emoji, title, color }) => (
            <div
              key={title}
              className="flex items-center gap-2 bg-eco-card border border-eco-border rounded-full px-4 py-2 text-sm"
            >
              <span>{emoji}</span>
              <span style={{ color }}>{title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-xl mx-auto bg-gradient-to-br from-brand-900/40 to-eco-card border border-brand-500/25 rounded-3xl p-10 text-center">
          <Star size={32} className="text-brand-400 mx-auto mb-4 animate-float" />
          <h2 className="text-3xl font-black text-white mb-3">Ready to save the planet?</h2>
          <p className="text-gray-400 text-sm mb-6">Join TrashGame and turn your neighborhood cleanup into an adventure.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-500/30"
          >
            <Leaf size={18} />
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-eco-border px-6 py-6 text-center text-xs text-gray-600">
        TrashGame — Built at JAMhacks 2026 🌿
      </footer>
    </main>
  );
}
