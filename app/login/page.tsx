"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.01_90)]">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.48_0.12_155)] text-lg font-bold text-white">
            SM
          </div>
          <h1 className="text-xl font-bold text-[oklch(0.25_0.02_50)]">
            AI Website Builder
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Startup Miracle — Internal Tool
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter access password"
            autoFocus
            className="w-full rounded-xl border border-[oklch(0.88_0.03_90)] px-4 py-3 text-sm outline-none focus:border-[oklch(0.48_0.12_155)] focus:ring-2 focus:ring-[oklch(0.48_0.12_155_/_0.15)]"
          />
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-[oklch(0.48_0.12_155)] py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
