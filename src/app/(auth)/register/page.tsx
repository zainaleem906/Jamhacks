"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", displayName: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Registration failed"); return; }
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
          TrashGame - Create Account
        </div>

        <div className="bg-eco-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="eq-label">Display Name</label>
              <input
                className="eq-input"
                type="text"
                placeholder="Eco Hero"
                value={form.displayName}
                onChange={set("displayName")}
                required
              />
            </div>
            <div>
              <label className="eq-label">Username</label>
              <input
                className="eq-input"
                type="text"
                placeholder="ecohero123"
                value={form.username}
                onChange={set("username")}
                pattern="[a-zA-Z0-9_]{3,20}"
                title="3-20 characters, letters/numbers/underscore"
                required
              />
            </div>
            <div>
              <label className="eq-label">Email address</label>
              <input
                className="eq-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="eq-label">Password</label>
              <input
                className="eq-input"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set("password")}
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={loading} className="flex-1">Create Account</Button>
              <Link href="/login">
                <Button variant="secondary" type="button">Login</Button>
              </Link>
            </div>
          </form>
        </div>

        <div className="tk-statusbar">
          {loading ? "Creating account..." : "Fill in all fields to register."}
        </div>

      </div>

      <p className="mt-8 text-xs text-[#6b7280]">TrashGame - JAMhacks 2026</p>

    </main>
  );
}
