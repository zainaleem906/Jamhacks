"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, avatarUrl, formatPoints } from "@/lib/utils";
import { Leaf, BarChart2, Trophy, User, LogOut, Zap } from "lucide-react";
import type { AuthUser } from "@/types";
import Image from "next/image";

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
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-eco-card border-r border-eco-border p-4 gap-1">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-3 mb-3">
          <div className="w-9 h-9 bg-brand-700 rounded flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="text-lg font-black text-slate-100 tracking-tight">TrashGame</span>
        </Link>

        {/* User card */}
        <div className="flex items-center gap-3 bg-eco-muted rounded p-3 mb-3 border border-eco-border">
          <Image
            src={avatarUrl(user.username, user.avatar)}
            alt={user.displayName}
            width={36}
            height={36}
            className="rounded flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-slate-200 text-sm font-semibold truncate">{user.displayName}</p>
            <p className="text-brand-400 text-xs flex items-center gap-0.5 font-medium">
              <Zap size={10} />
              {formatPoints(user.points)} pts
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold transition-all",
                pathname.startsWith(href)
                  ? "bg-brand-700 text-white"
                  : "text-slate-400 hover:text-slate-100 hover:bg-eco-muted"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded text-sm font-semibold text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-eco-card border-t border-eco-border flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-semibold transition-colors",
              pathname.startsWith(href) ? "text-brand-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
