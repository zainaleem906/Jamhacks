import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/types";

async function getLeaderboard(period: string): Promise<LeaderboardEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/leaderboard?period=${period}`, { cache: "no-store" });
    const data = await res.json();
    return data.ok ? data.data : [];
  } catch {
    return [];
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { period = "all" } = await searchParams;
  const entries = await getLeaderboard(period);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto relative">
      {/* Decorative orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-100px", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 30%, rgba(255,179,71,0.12) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#ffb347", boxShadow: "0 0 8px #ffb347" }}
            />
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "#6a9abf" }}>
              Global Rankings
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
            Leaderboard
          </h1>
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { label: "All Time", value: "all" },
            { label: "This Week", value: "weekly" },
          ].map(({ label, value }) => (
            <a
              key={value}
              href={`/leaderboard?period=${value}`}
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02]"
              style={
                period === value
                  ? {
                      background: "rgba(0,212,232,0.1)",
                      color: "#00d4e8",
                      border: "1px solid rgba(0,212,232,0.3)",
                      boxShadow: "0 0 20px rgba(0,212,232,0.08)",
                    }
                  : {
                      background: "rgba(5,14,35,0.7)",
                      color: "#4a7090",
                      border: "1px solid rgba(80,160,220,0.12)",
                    }
              }
            >
              {label}
            </a>
          ))}
        </div>

        <LeaderboardTable entries={entries} currentUserId={session.userId} />
      </div>
    </div>
  );
}
