"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, formatPoints } from "@/lib/utils";
import { Leaf, BarChart2, Trophy, User, LogOut, Zap } from "lucide-react";
import type { AuthUser } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/cleanup", label: "Cleanup", icon: Leaf },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
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
      {/* Desktop sidebar — tkinter Listbox frame */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-eco-card border-r-2 border-eco-border">

        {/* Title bar */}
        <div className="tk-titlebar py-3 px-4">
          <Leaf size={14} className="text-[#4ade80]" />
          TrashGame
        </div>

        {/* User info frame */}
        <div className="mx-3 mt-5 mb-2 tk-groove bg-eco-muted p-4">
          <p className="text-[11px] text-[#888888] mb-1">user:</p>
          <p className="text-sm text-[#c8c8c8] font-bold truncate mb-1">{user.displayName}</p>
          <p className="text-[11px] text-[#22c55e] flex items-center gap-1.5">
            <Zap size={10} /> {formatPoints(user.points)} pts
          </p>
        </div>

        {/* Nav listbox */}
        <div className="mx-3 my-2 tk-sunken flex-1 overflow-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-4 text-sm border-b border-[#1a1a1a]",
                pathname.startsWith(href)
                  ? "bg-[#1a5c32] text-white"
                  : "text-[#c8c8c8] hover:bg-eco-muted"
              )}
            >
              <Icon size={14} className="flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="mx-3 mb-4">
          <button
            onClick={handleLogout}
            className="tk-btn w-full text-xs py-2 flex items-center justify-center gap-2"
          >
            <LogOut size={12} /> Log out
          </button>
        </div>

      </aside>

      {/* Mobile bottom nav — toolbar style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-eco-card border-t-2 border-eco-border flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center py-3 gap-1 text-[10px] border-r border-eco-border last:border-r-0",
              pathname.startsWith(href)
                ? "bg-[#1a5c32] text-white"
                : "text-[#888888] hover:bg-eco-muted hover:text-[#c8c8c8]"
            )}
          >
            <Icon size={19} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
