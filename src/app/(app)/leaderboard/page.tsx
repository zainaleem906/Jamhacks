import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/types";
import { Globe2 } from "lucide-react";

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
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <p className="text-brand-400 text-sm font-semibold mb-1 flex items-center gap-1.5">
          <Globe2 size={14} /> Global Rankings
        </p>
        <h1 className="text-3xl font-black text-slate-100">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-1">See who&apos;s making the biggest impact</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-3 mb-5">
        {[
          { label: "All Time", value: "all" },
          { label: "This Week", value: "weekly" },
        ].map(({ label, value }) => (
          <a
            key={value}
            href={`/leaderboard?period=${value}`}
            className={`px-5 py-2.5 rounded text-sm font-semibold transition-all ${
              period === value
                ? "bg-brand-700 text-white border border-brand-600"
                : "bg-eco-card border border-eco-border text-slate-400 hover:text-slate-100 hover:border-slate-500"
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
