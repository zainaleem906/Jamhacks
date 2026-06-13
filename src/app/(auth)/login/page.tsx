"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
    <main className="min-h-screen bg-eco-bg flex flex-col items-center justify-center p-6">

      {/* App window */}
      <div className="w-full max-w-sm tk-raised overflow-hidden">

        {/* Title bar */}
        <div className="tk-titlebar py-3 px-5">
          <Leaf size={13} className="text-[#4ade80]" />
          TrashGame — Login
        </div>

        {/* Form area */}
        <div className="bg-eco-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="eq-label">Email address:</label>
              <input
                className="eq-input"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="eq-label">Password:</label>
              <input
                className="eq-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="tk-sunken bg-[#2a0000] px-4 py-3">
                <p className="text-red-400 text-xs">Error: {error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                OK
              </Button>
              <Link href="/register">
                <Button variant="secondary" type="button">Register</Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Status bar */}
        <div className="tk-statusbar py-2 px-4">
          {loading ? "Authenticating..." : "Ready."}
        </div>

      </div>

      <p className="mt-8 text-xs text-[#555555]">
        TrashGame v1.0.0 — JAMhacks 2026
      </p>
      <p className="text-xs text-[#444444] mt-2">
        Gamified litter cleanup · powered by YOLOv8
      </p>

    </main>
  );
}
