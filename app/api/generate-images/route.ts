import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";
import {
  resolveProspect,
  resolvePromptTemplate,
  createSlug,
} from "@/lib/prospect-resolver";
import type { Prospect } from "@/lib/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const PROJECTS_DIR = path.join(process.cwd(), "sm-web-projects");

interface ImageJob {
  name: string;
  prompt: string;
  size: string;
}

interface OpenAIImageResponse {
  data?: { b64_json?: string; url?: string }[];
  error?: { message: string };
}

async function generateImage(
  prompt: string,
  size: string
): Promise<Buffer | null> {
  const resp = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size,
      quality: "medium",
      output_format: "png",
    }),
  });

  const data = (await resp.json()) as OpenAIImageResponse;
  if (!resp.ok || data.error) {
    console.error("Image generation failed:", data.error?.message || resp.statusText);
    return null;
  }

  const b64 = data.data?.[0]?.b64_json;
  if (!b64) return null;
  return Buffer.from(b64, "base64");
}

function buildImageJobs(
  vars: ReturnType<typeof resolveProspect>,
  templatePrompts: Record<string, { prompt: string; size?: string }>
): ImageJob[] {
  const jobs: ImageJob[] = [];

  for (const [name, config] of Object.entries(templatePrompts)) {
    if (name === "service_cards") continue;
    if (name === "testimonial_portraits") continue;
    jobs.push({
      name,
      prompt: resolvePromptTemplate(config.prompt, vars),
      size: config.size || "1024x1024",
    });
  }

  // Service cards — one per service (max 4)
  if (templatePrompts.service_cards) {
    const servicePromptTemplate = (
      templatePrompts.service_cards as { prompt_per_service?: string; prompt?: string }
    ).prompt_per_service ||
      templatePrompts.service_cards.prompt;

    for (const [i, service] of vars.prospect_services.slice(0, 4).entries()) {
      jobs.push({
        name: `service_card_${i + 1}`,
        prompt: resolvePromptTemplate(servicePromptTemplate, vars).replaceAll(
          "{service_name}",
          service
        ),
        size: "1024x1024",
      });
    }
  }

  // Testimonial portraits (3)
  if (templatePrompts.testimonial_portraits) {
    const portraitBase = templatePrompts.testimonial_portraits.prompt;
    const variations = [
      { age: "30-40", desc: "young professional homeowner, casual attire" },
      { age: "45-55", desc: "middle-aged homeowner, warm and approachable" },
      { age: "55-65", desc: "experienced homeowner, confident and friendly" },
    ];
    for (const [i, v] of variations.entries()) {
      jobs.push({
        name: `testimonial_portrait_${i + 1}`,
        prompt: resolvePromptTemplate(portraitBase, vars)
          .replaceAll("{portrait_age_range}", v.age)
          .replaceAll("{portrait_description}", v.desc),
        size: "1024x1024",
      });
    }
  }

  return jobs;
}

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { prospect_id?: string };
  const prospectId = body.prospect_id;
  if (!prospectId) {
    return NextResponse.json(
      { error: "prospect_id is required" },
      { status: 400 }
    );
  }

  // Load prospect
  const { data: prospect, error: dbError } = await supabase
    .from("cold_prospects")
    .select("*")
    .eq("id", prospectId)
    .single();

  if (dbError || !prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  const p = prospect as Prospect;

  // Load template
  const templatePath = path.join(
    process.cwd(),
    "sm-web-templates",
    "sm-web-001-roofing.template.json"
  );
  const { readFile } = await import("fs/promises");
  let templateData: {
    image_generation?: { prompt_templates?: Record<string, { prompt: string; size?: string }> };
  };
  try {
    templateData = JSON.parse(await readFile(templatePath, "utf-8"));
  } catch {
    return NextResponse.json(
      { error: "Template file not found" },
      { status: 500 }
    );
  }

  const promptTemplates = templateData.image_generation?.prompt_templates;
  if (!promptTemplates) {
    return NextResponse.json(
      { error: "Template has no image_generation.prompt_templates" },
      { status: 500 }
    );
  }

  // Resolve variables
  const vars = resolveProspect(p);
  const slug = createSlug(p);
  const imagesDir = path.join(PROJECTS_DIR, `sm-website-${slug}`, "images");
  await mkdir(imagesDir, { recursive: true });

  // Build jobs
  const jobs = buildImageJobs(vars, promptTemplates);

  // Generate images — 3 concurrent max to respect rate limits
  const results: { name: string; path: string; status: "ok" | "failed" }[] = [];
  const concurrency = 3;

  for (let i = 0; i < jobs.length; i += concurrency) {
    const batch = jobs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (job) => {
        const buffer = await generateImage(job.prompt, job.size);
        if (!buffer) {
          return { name: job.name, path: "", status: "failed" as const };
        }
        const filePath = path.join(imagesDir, `${job.name}.png`);
        await writeFile(filePath, buffer);
        return {
          name: job.name,
          path: `sm-web-projects/sm-website-${slug}/images/${job.name}.png`,
          status: "ok" as const,
        };
      })
    );
    results.push(...batchResults);
  }

  const succeeded = results.filter((r) => r.status === "ok").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({
    slug,
    images_dir: `sm-web-projects/sm-website-${slug}/images`,
    total: results.length,
    succeeded,
    failed,
    results,
  });
}
