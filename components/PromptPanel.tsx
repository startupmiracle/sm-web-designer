"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface PromptPanelProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

export function PromptPanel({ prompt, onPromptChange }: PromptPanelProps) {
  const [copied, setCopied] = useCopiedFlag();

  const copyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied();
  };

  return (
    <section className="flex min-h-[320px] flex-col">
      <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-3">
        <button
          onClick={copyPrompt}
          disabled={!prompt}
          className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.48_0.12_155)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-45"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Template instructions and prospect context will appear here."
        className="min-h-0 flex-1 resize-none rounded-b-2xl bg-[oklch(0.985_0.005_90)] p-5 font-mono text-sm leading-6 text-stone-700 outline-none"
      />
    </section>
  );
}

function useCopiedFlag(): [boolean, () => void] {
  const [copied, setCopied] = useState(false);

  const trigger = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return [copied, trigger];
}
