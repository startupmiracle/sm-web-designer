import { NextResponse } from "next/server";

interface KeyInfo {
  name: string;
  env_var: string;
  masked: string;
  full: string;
  connected: boolean;
  service: string;
}

function maskKey(key: string): string {
  if (!key || key.length < 14) return key ? "••••••" : "";
  return `${key.slice(0, 6)}${"•".repeat(Math.min(key.length - 12, 30))}${key.slice(-6)}`;
}

async function checkOllama(): Promise<boolean> {
  try {
    const resp = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(3000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function checkOpenAI(key: string): Promise<boolean> {
  if (!key) return false;
  try {
    const resp = await fetch("https://api.openai.com/v1/models/gpt-image-1", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    return resp.ok || resp.status === 403;
  } catch {
    return false;
  }
}

export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY || "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const [ollamaOk, openaiOk] = await Promise.all([
    checkOllama(),
    checkOpenAI(openaiKey),
  ]);

  const keys: KeyInfo[] = [
    {
      name: "OpenAI API Key",
      env_var: "OPENAI_API_KEY",
      masked: maskKey(openaiKey),
      full: openaiKey,
      connected: openaiOk,
      service: "GPT Image 2 · Image generation",
    },
    {
      name: "Ollama (Local)",
      env_var: "OLLAMA_HOST",
      masked: "localhost:11434",
      full: "http://localhost:11434",
      connected: ollamaOk,
      service: "qwen3.5:4b · Website HTML generation",
    },
    {
      name: "Supabase URL",
      env_var: "NEXT_PUBLIC_SUPABASE_URL",
      masked: supabaseUrl ? supabaseUrl.replace("https://", "").slice(0, 20) + "..." : "",
      full: supabaseUrl,
      connected: !!supabaseUrl,
      service: "Database · Prospects & generated sites",
    },
    {
      name: "Supabase Anon Key",
      env_var: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      masked: maskKey(supabaseAnon),
      full: supabaseAnon,
      connected: !!supabaseAnon,
      service: "Auth · Public client access",
    },
  ];

  return NextResponse.json({ keys });
}
