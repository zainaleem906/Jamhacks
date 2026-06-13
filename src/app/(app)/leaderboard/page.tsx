import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/types";

async function getLeaderboard(period: string): Promise<LeaderboardEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/leaderboard?period=${period}`, {
      cache: "no-store",
    });
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
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">See who's making the biggest impact</p>
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
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === value
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "bg-eco-card border border-eco-border text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <LeaderboardTable entries={entries} currentUserId={session.userId} />
    </div>
  );
}
