"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ClipboardCopy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Save,
  Sparkles,
  Wifi,
  XCircle,
  Wrench,
} from "lucide-react";
import type { AgentSettings } from "@/lib/types";

interface SettingsPanelProps {
  settings: AgentSettings;
  onSettingsChange: (settings: AgentSettings) => void;
  onSavePrompt: () => Promise<void>;
  onTestOllama: () => Promise<string>;
  savingPrompt: boolean;
}

interface ApiKeyInfo {
  name: string;
  env_var: string;
  masked: string;
  full: string;
  connected: boolean;
  service: string;
}

type SettingsTab = "connections" | "models" | "agent" | "skills";

const tabs: { id: SettingsTab; label: string; icon: typeof Key }[] = [
  { id: "connections", label: "Connections", icon: Key },
  { id: "models", label: "Models", icon: Sparkles },
  { id: "agent", label: "Agent Prompt", icon: Bot },
  { id: "skills", label: "Skills", icon: Wrench },
];

const skillLabels = [
  "design-html",
  "design-review",
  "screenshot",
  "browser-use",
  "ship",
  "qa",
];

function ApiKeyRow({ info }: { info: ApiKeyInfo }) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(info.full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[oklch(0.9_0.02_90)] bg-[oklch(0.985_0.005_90)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              info.connected
                ? "bg-[oklch(0.92_0.05_150)] text-[oklch(0.45_0.12_150)]"
                : "bg-[oklch(0.92_0.05_25)] text-[oklch(0.55_0.15_25)]"
            }`}
          >
            <Key className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-stone-800">{info.name}</p>
            <p className="text-[11px] text-stone-400">{info.service}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            info.connected
              ? "bg-[oklch(0.92_0.05_150)] text-[oklch(0.4_0.12_150)]"
              : "bg-[oklch(0.92_0.05_25)] text-[oklch(0.5_0.15_25)]"
          }`}
        >
          {info.connected ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {info.connected ? "Connected" : "Not connected"}
        </span>
      </div>
      {info.full && (
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-white px-3 py-1.5 font-mono text-[11px] text-stone-500 border border-[oklch(0.92_0.02_90)]">
            {revealed ? info.full : info.masked}
          </code>
          <button
            onClick={() => setRevealed(!revealed)}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-white hover:text-stone-600"
            title={revealed ? "Hide" : "Reveal"}
          >
            {revealed ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={copyToClipboard}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-white hover:text-stone-600"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.48_0.12_155)]" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
      <p className="mt-2 font-mono text-[10px] text-stone-300">{info.env_var}</p>
    </div>
  );
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onSavePrompt,
  onTestOllama,
  savingPrompt,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("connections");
  const [ollamaMessage, setOllamaMessage] = useState("");
  const [testing, setTesting] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);

  useEffect(() => {
    fetch("/api/settings/api-keys")
      .then((r) => r.json())
      .then((d: { keys?: ApiKeyInfo[] }) => setApiKeys(d.keys || []))
      .catch(() => {})
      .finally(() => setLoadingKeys(false));
  }, []);

  const connectedCount = apiKeys.filter((k) => k.connected).length;

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
    <section className="space-y-0">
      {/* Tab bar */}
      <div className="rounded-t-2xl border border-b-0 border-[oklch(0.88_0.03_90)] bg-white px-2 pt-2 shadow-sm">
        <nav className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[oklch(0.985_0.005_90)] text-[oklch(0.25_0.02_50)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[oklch(0.48_0.12_155)]"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "connections" && !loadingKeys && (
                  <span
                    className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      connectedCount === apiKeys.length
                        ? "bg-[oklch(0.92_0.05_150)] text-[oklch(0.4_0.12_150)]"
                        : "bg-[oklch(0.92_0.05_60)] text-[oklch(0.45_0.1_60)]"
                    }`}
                  >
                    {connectedCount}/{apiKeys.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="rounded-b-2xl border border-[oklch(0.88_0.03_90)] bg-white shadow-sm">
        {/* ── Connections ── */}
        {activeTab === "connections" && (
          <div className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
                Connected APIs
              </h2>
              <p className="text-sm text-stone-500">
                API keys and service connections powering the web designer.
              </p>
            </div>
            <div className="space-y-3">
              {loadingKeys ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                </div>
              ) : (
                apiKeys.map((info) => (
                  <ApiKeyRow key={info.env_var} info={info} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Models ── */}
        {activeTab === "models" && (
          <div className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
                LLM Model
              </h2>
              <p className="text-sm text-stone-500">
                Choose the model for website HTML generation.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() =>
                  onSettingsChange({ ...settings, activeModel: "ollama" })
                }
                className={`rounded-xl border p-5 text-left transition ${
                  settings.activeModel === "ollama"
                    ? "border-[oklch(0.48_0.12_155)] bg-[oklch(0.95_0.03_150)] ring-2 ring-[oklch(0.48_0.12_155_/_0.15)]"
                    : "border-[oklch(0.9_0.02_90)] hover:border-stone-300"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.95_0.03_150)] text-[oklch(0.45_0.12_150)]">
                    <Bot className="h-5 w-5" />
                  </span>
                  {settings.activeModel === "ollama" && (
                    <span className="rounded-full bg-[oklch(0.48_0.12_155)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="font-semibold text-stone-800">Ollama Local</p>
                <p className="mt-1 text-xs text-stone-500">
                  qwen3.5:4b · localhost:11434
                </p>
                <p className="mt-2 text-xs font-medium text-[oklch(0.48_0.12_155)]">
                  $0.00/call
                </p>
              </button>
              <button
                onClick={() =>
                  onSettingsChange({ ...settings, activeModel: "openai" })
                }
                className={`rounded-xl border p-5 text-left transition ${
                  settings.activeModel === "openai"
                    ? "border-[oklch(0.48_0.12_155)] bg-[oklch(0.95_0.03_150)] ring-2 ring-[oklch(0.48_0.12_155_/_0.15)]"
                    : "border-[oklch(0.9_0.02_90)] hover:border-stone-300"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.95_0.03_90)] text-stone-500">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  {settings.activeModel === "openai" && (
                    <span className="rounded-full bg-[oklch(0.48_0.12_155)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="font-semibold text-stone-800">OpenAI Cloud</p>
                <p className="mt-1 text-xs text-stone-500">
                  GPT-4o-mini · Cloud fallback
                </p>
                <p className="mt-2 text-xs font-medium text-stone-400">
                  ~$0.001/call
                </p>
              </button>
            </div>
            <div className="mt-5 rounded-xl border border-[oklch(0.9_0.02_90)] bg-[oklch(0.985_0.005_90)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-700">
                    Ollama Connection Test
                  </p>
                  <p className="text-xs text-stone-400">
                    Verify qwen3.5:4b is running and responding
                  </p>
                </div>
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className="inline-flex items-center gap-2 rounded-xl border border-[oklch(0.86_0.04_90)] bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wifi className="h-4 w-4" />
                  )}
                  Test
                </button>
              </div>
              {ollamaMessage && (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-stone-600">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[oklch(0.48_0.12_155)]" />
                  {ollamaMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Agent Prompt ── */}
        {activeTab === "agent" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[oklch(0.9_0.02_90)] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
                  Agent System Prompt
                </h2>
                <p className="text-sm text-stone-500">
                  Loads and saves AI-WEB-DESIGNER-AGENT.md
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
                onSettingsChange({
                  ...settings,
                  systemPrompt: event.target.value,
                })
              }
              className="min-h-[560px] w-full resize-y rounded-b-2xl bg-[oklch(0.985_0.005_90)] p-5 font-mono text-sm leading-6 text-stone-700 outline-none"
            />
          </div>
        )}

        {/* ── Skills ── */}
        {activeTab === "skills" && (
          <div className="p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
                Installed Skills
              </h2>
              <p className="text-sm text-stone-500">
                Toggle agent capabilities for the web design pipeline.
              </p>
            </div>
            <div className="space-y-2">
              {skillLabels.map((skill) => (
                <label
                  key={skill}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-transparent bg-[oklch(0.985_0.005_90)] px-4 py-3.5 text-sm text-stone-700 transition hover:border-[oklch(0.9_0.02_90)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-stone-400 shadow-sm">
                      <Wrench className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium">{skill}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.skills[skill] ?? true}
                    onChange={(event) =>
                      updateSkill(skill, event.target.checked)
                    }
                    className="h-4 w-4 rounded accent-[oklch(0.48_0.12_155)]"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
