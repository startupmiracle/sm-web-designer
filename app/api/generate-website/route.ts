import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";
import {
  resolveProspect,
  createSlug,
} from "@/lib/prospect-resolver";
import type { Prospect } from "@/lib/types";

const OLLAMA_BASE = "http://localhost:11434";
const OLLAMA_MODEL = "qwen3.5:4b";
const PROJECTS_DIR = path.join(process.cwd(), "sm-web-projects");

async function callQwen(prompt: string): Promise<string> {
  const resp = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert web designer. You output ONLY valid HTML with inline Tailwind CSS via CDN. No markdown, no explanation, no code fences. Output starts with <!DOCTYPE html> and ends with </html>.",
        },
        { role: "user", content: prompt },
      ],
      stream: false,
      think: false,
      options: { temperature: 0.4, num_predict: 16384 },
    }),
  });

  if (!resp.ok) {
    throw new Error(`Ollama returned ${resp.status}`);
  }

  const data = (await resp.json()) as {
    message?: { content?: string };
  };

  return data.message?.content || "";
}

function buildGenerationPrompt(
  vars: ReturnType<typeof resolveProspect>,
  templateJson: string,
  imageFiles: string[]
): string {
  const imageRefs = imageFiles
    .map((f) => `- images/${f}`)
    .join("\n");

  return `Generate a complete, single-page HTML website for this local business.

## Business Data
- Name: ${vars.prospect_business_name}
- Category: ${vars.prospect_category}
- Location: ${vars.prospect_city}, ${vars.prospect_state}
- Phone: ${vars.prospect_phone}
- Address: ${vars.prospect_address}
- Rating: ${vars.prospect_rating} stars (${vars.prospect_review_count} reviews)
- Owner: ${vars.prospect_contact_name || "the owner"}
- Services: ${vars.prospect_services.join(", ")}
- Regional style: ${vars.prospect_geo_region_style}
- Property type: ${vars.prospect_ideal_client_property_type}

## Real Customer Reviews
${vars.prospect_reviews_text.join("\n\n")}

## Available Images (use these exact paths as src)
${imageRefs}

## Template Specification (follow this EXACTLY for layout, sections, colors, typography, spacing)
${templateJson}

## Rules
1. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
2. Follow the template section_order — every section must appear in order
3. Use the exact color_palette hex values from the template
4. Use the typography scale from the template
5. Reference the available images with relative paths (images/hero_bg.png etc.)
6. Make the phone number a click-to-call link: tel:${vars.prospect_phone}
7. Replace all placeholder names, text, and business info with the real prospect data above
8. Make it fully responsive (mobile-first)
9. Include a Google Maps embed iframe for: ${vars.prospect_address}
10. Output ONLY the complete HTML — no markdown, no explanation`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prospect_id?: string;
    template_id?: string;
  };

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
  const vars = resolveProspect(p);
  const slug = createSlug(p);
  const projectDir = path.join(PROJECTS_DIR, `sm-website-${slug}`);

  // Load template
  const templateId = body.template_id || "sm-web-001-roofing";
  const templatePath = path.join(
    process.cwd(),
    "sm-web-templates",
    `${templateId}.template.json`
  );

  let templateJson: string;
  try {
    templateJson = await readFile(templatePath, "utf-8");
  } catch {
    return NextResponse.json(
      { error: `Template ${templateId} not found` },
      { status: 404 }
    );
  }

  // Check for generated images
  const imagesDir = path.join(projectDir, "images");
  let imageFiles: string[] = [];
  try {
    imageFiles = (await readdir(imagesDir)).filter((f) =>
      /\.(png|jpg|webp)$/i.test(f)
    );
  } catch {
    // No images generated yet — proceed without
  }

  if (imageFiles.length === 0) {
    return NextResponse.json(
      {
        error:
          "No images found. Run /api/generate-images first to create prospect images.",
      },
      { status: 400 }
    );
  }

  // Build prompt and call qwen
  const prompt = buildGenerationPrompt(vars, templateJson, imageFiles);

  let html: string;
  try {
    html = await callQwen(prompt);
  } catch (err) {
    return NextResponse.json(
      {
        error: `Ollama/qwen3.5 failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 }
    );
  }

  // Validate we got HTML
  if (!html.includes("<!DOCTYPE html") && !html.includes("<html")) {
    // Try to extract HTML if qwen wrapped it
    const match = html.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
    if (match) {
      html = match[0];
    } else {
      return NextResponse.json(
        { error: "Qwen did not return valid HTML", raw_length: html.length },
        { status: 502 }
      );
    }
  }

  // Save
  await mkdir(projectDir, { recursive: true });
  const outputPath = path.join(projectDir, "index.html");
  await writeFile(outputPath, html, "utf-8");

  return NextResponse.json({
    slug,
    output: `sm-web-projects/sm-website-${slug}/index.html`,
    html_length: html.length,
    images_used: imageFiles.length,
    preview_url: `https://get.startupmiracle.com/${slug}`,
  });
}
