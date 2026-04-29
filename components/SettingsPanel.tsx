"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Save, Wifi } from "lucide-react";
import type { AgentSettings } from "@/lib/types";

interface SettingsPanelProps {
  settings: AgentSettings;
  onSettingsChange: (settings: AgentSettings) => void;
  onSavePrompt: () => Promise<void>;
  onTestOllama: () => Promise<string>;
  savingPrompt: boolean;
}

const skillLabels = [
  "design-html",
  "design-review",
  "screenshot",
  "browser-use",
  "ship",
  "qa",
];

export function SettingsPanel({
  settings,
  onSettingsChange,
  onSavePrompt,
  onTestOllama,
  savingPrompt,
}: SettingsPanelProps) {
  const [ollamaMessage, setOllamaMessage] = useState("");
  const [testing, setTesting] = useState(false);

  const updateSkill = (skill: string, enabled: boolean) => {
    onSettingsChange({
      ...settings,
      skills: { ...settings.skills, [skill]: enabled },
    });
  };

  const testConnection = async () => {
    setTesting(true);
    const message = await onTestOllama();
    setOllamaMessage(message);
    setTesting(false);
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[oklch(0.9_0.02_90)] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
              Agent System Prompt
            </h2>
            <p className="text-sm text-stone-500">
              Loads and saves `AI-WEB-DESIGNER-AGENT.md`.
            </p>
          </div>
          <button
            onClick={onSavePrompt}
            disabled={savingPrompt}
            className="inline-flex items-center gap-2 rounded-xl bg-[oklch(0.48_0.12_155)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {savingPrompt ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
        <textarea
          value={settings.systemPrompt}
          onChange={(event) =>
            onSettingsChange({ ...settings, systemPrompt: event.target.value })
          }
          className="min-h-[560px] w-full resize-y rounded-b-2xl bg-[oklch(0.985_0.005_90)] p-5 font-mono text-sm leading-6 text-stone-700 outline-none"
        />
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[oklch(0.25_0.02_50)]">
            Installed Skills
          </h3>
          <div className="mt-4 space-y-3">
            {skillLabels.map((skill) => (
              <label
                key={skill}
                className="flex items-center justify-between rounded-xl bg-[oklch(0.985_0.005_90)] px-3 py-3 text-sm text-stone-700"
              >
                {skill}
                <input
                  type="checkbox"
                  checked={settings.skills[skill] ?? true}
                  onChange={(event) => updateSkill(skill, event.target.checked)}
                  className="h-4 w-4 accent-[oklch(0.48_0.12_155)]"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-[oklch(0.25_0.02_50)]">
            LLM Model
          </h3>
          <div className="mt-4 grid gap-3">
            <button
              onClick={() => onSettingsChange({ ...settings, activeModel: "ollama" })}
              className={`rounded-xl border p-4 text-left ${
                settings.activeModel === "ollama"
                  ? "border-[oklch(0.48_0.12_155)] bg-[oklch(0.95_0.03_150)]"
                  : "border-[oklch(0.9_0.02_90)]"
              }`}
            >
              <p className="font-medium text-stone-800">Ollama local</p>
              <p className="text-xs text-stone-500">
                http://localhost:11434 · qwen3.5:4b
              </p>
            </button>
            <button
              onClick={() => onSettingsChange({ ...settings, activeModel: "openai" })}
              className={`rounded-xl border p-4 text-left ${
                settings.activeModel === "openai"
                  ? "border-[oklch(0.48_0.12_155)] bg-[oklch(0.95_0.03_150)]"
                  : "border-[oklch(0.9_0.02_90)]"
              }`}
            >
              <p className="font-medium text-stone-800">OpenAI GPT-4o-mini</p>
              <p className="text-xs text-stone-500">$0.001/call cloud fallback</p>
            </button>
          </div>
          <button
            onClick={testConnection}
            disabled={testing}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[oklch(0.86_0.04_90)] px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-[oklch(0.985_0.005_90)] disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            Test Ollama Connection
          </button>
          {ollamaMessage && (
            <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.48_0.12_155)]" />
              {ollamaMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
