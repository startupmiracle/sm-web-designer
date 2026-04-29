"use client";

import { Loader2, Search } from "lucide-react";

interface BuilderSearchProps {
  uuid: string;
  loading: boolean;
  error: string;
  onUuidChange: (uuid: string) => void;
  onLoad: () => void;
}

export function BuilderSearch({
  uuid,
  loading,
  error,
  onUuidChange,
  onLoad,
}: BuilderSearchProps) {
  return (
    <section className="rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Generate Website from Prospect
          </h2>
          <p className="mt-1 text-xs text-stone-400">
            Press Cmd+V anywhere to paste a UUID and load the prospect.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={uuid}
            onChange={(event) => onUuidChange(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onLoad()}
            placeholder="Paste cold prospect UUID here..."
            className="w-full rounded-xl border border-[oklch(0.86_0.04_90)] bg-[oklch(0.985_0.005_90)] py-3.5 pl-12 pr-4 font-mono text-sm text-stone-900 outline-none transition focus:border-[oklch(0.48_0.12_155)] focus:ring-2 focus:ring-[oklch(0.48_0.12_155_/_0.16)]"
          />
        </div>
        <button
          onClick={onLoad}
          disabled={loading || !uuid.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[oklch(0.48_0.12_155)] px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Load
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
