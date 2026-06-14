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
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-eco-bg flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-sm tk-groove overflow-hidden shadow-lg">

        <div className="tk-titlebar">
          <Leaf size={15} className="text-white" />
          Soteria - Login
        </div>

        <div className="bg-eco-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="eq-label">Email address</label>
              <input
                className="eq-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="eq-label">Password</label>
              <input
                className="eq-input"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={loading} className="flex-1">Sign in</Button>
              <Link href="/register">
                <Button variant="secondary" type="button">Register</Button>
              </Link>
            </div>
          </form>
        </div>

        <div className="tk-statusbar">
          {loading ? "Signing in..." : "Ready."}
        </div>

      </div>

      <p className="mt-8 text-xs text-[#6b7280]">Soteria - JAMhacks 2026</p>
      <p className="text-xs text-[#9ca3af] mt-1">Gamified litter cleanup powered by YOLOv8</p>

    </main>
  );
}
