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

  async function handleSubmit(e: React.FormEvent) {
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
      if (!data.ok) {
        setError(data.error ?? "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-eco-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TrashGame</span>
        </div>

        <div className="bg-eco-card border border-eco-border rounded-2xl p-6">
          <h1 className="text-xl font-bold text-white mb-1">Join TrashGame</h1>
          <p className="text-gray-500 text-sm mb-6">Start your cleanup journey today 🌿</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <label className="eq-label">Email</label>
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
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
