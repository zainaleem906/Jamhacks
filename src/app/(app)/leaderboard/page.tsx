import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/types";
import { Globe2 } from "lucide-react";

async function getLeaderboard(period: string): Promise<LeaderboardEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/leaderboard?period=${period}`, {
      next: { revalidate: 30 },
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
    <div className="p-6 max-w-2xl mx-auto">

      <div className="tk-groove bg-[#dcfce7] px-5 py-3 mb-6 flex items-center gap-3 border-[#bbf7d0]">
        <Globe2 size={14} className="text-[#15803d]" />
        <span className="text-sm text-[#15803d] font-bold">Leaderboard — Global Rankings</span>
      </div>

      <div className="flex gap-3 mb-5">
        {[
          { label: "All Time", value: "all" },
          { label: "This Week", value: "weekly" },
        ].map(({ label, value }) => (
          <a
            key={value}
            href={`/leaderboard?period=${value}`}
            className={`px-6 py-2 text-sm font-bold ${period === value ? "tk-btn-primary" : "tk-btn"}`}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="tk-groove bg-eco-card relative pt-7 border-[#bbf7d0]">
        <span className="absolute top-0 left-4 -translate-y-1/2 bg-eco-card px-2 text-[11px] text-[#16a34a] font-semibold">
          {period === "all" ? "All Time" : "This Week"} — {entries.length} players
        </span>
        <LeaderboardTable entries={entries} currentUserId={session.userId} />
      </div>

    </div>
  );
}
