"use client";

import { useState, useEffect } from "react";
import type { AuthUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setUser(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, setUser };
}
