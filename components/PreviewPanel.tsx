"use client";

import { Monitor } from "lucide-react";

interface PreviewPanelProps {
  previewUrl: string;
}

export function PreviewPanel({ previewUrl }: PreviewPanelProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[oklch(0.9_0.02_90)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-[oklch(0.48_0.12_155)]" />
          <h2 className="text-sm font-semibold text-[oklch(0.25_0.02_50)]">
            Live Preview
          </h2>
        </div>
        <span className="max-w-[220px] truncate text-xs text-stone-400">
          {previewUrl || "No generated URL yet"}
        </span>
      </div>
      <div className="h-[420px] bg-[oklch(0.985_0.005_90)]">
        {previewUrl ? (
          <iframe
            title="Generated site preview"
            src={previewUrl}
            className="h-full w-full bg-white"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-stone-500">
            Load a prospect and create a tracker record to preview the generated
            Startup Miracle landing page URL.
          </div>
        )}
      </div>
    </section>
  );
}
