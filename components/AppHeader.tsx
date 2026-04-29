"use client";

import { Cpu, DollarSign } from "lucide-react";

interface AppHeaderProps {
  activeModel: "ollama" | "openai";
  costEstimate: number;
}

export function AppHeader({ activeModel, costEstimate }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-[oklch(0.88_0.03_90)] bg-[oklch(0.97_0.01_90)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <h1 className="text-xl font-semibold text-[oklch(0.25_0.02_50)]">
          AI Website Builder
        </h1>
        <p className="text-sm text-stone-500">
          Generate, review, and track local business demo sites.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.86_0.04_90)] bg-white px-3 py-2 text-xs font-medium text-stone-600">
          <Cpu className="h-3.5 w-3.5 text-[oklch(0.48_0.12_155)]" />
          {activeModel === "ollama" ? "Ollama qwen3.5:4b" : "OpenAI GPT-4o-mini"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.86_0.04_90)] bg-white px-3 py-2 text-xs font-medium text-stone-600">
          <DollarSign className="h-3.5 w-3.5 text-[oklch(0.78_0.12_85)]" />
          ${costEstimate.toFixed(3)} / generation
        </span>
      </div>
    </header>
  );
}
