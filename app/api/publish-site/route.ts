import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const PROJECTS_DIR = path.join(process.cwd(), "sm-web-projects");

export async function POST(request: Request) {
  const body = (await request.json()) as { slug?: string; html?: string };
  const slug = body.slug;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  // Get HTML from body or read from local file
  let html = body.html;
  if (!html) {
    try {
      const filePath = path.join(PROJECTS_DIR, `sm-website-${slug}`, "index.html");
      html = await readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json(
        { error: `No local file found for slug: ${slug}` },
        { status: 404 }
      );
    }
  }

  // Check if a generated_sites record exists for this slug (use newest)
  const { data: rows } = await supabase
    .from("generated_sites")
    .select("id")
    .eq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(1);

  const existing = rows?.[0];
  if (existing) {
    // Update existing record with HTML
    const { error } = await supabase
      .from("generated_sites")
      .update({ html_content: html, status: "review" })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to update: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      action: "updated",
      slug,
      id: existing.id,
      preview: `/api/preview/${slug}`,
      html_length: html.length,
    });
  } else {
    // Insert new record
    const { data: inserted, error } = await supabase
      .from("generated_sites")
      .insert({
        slug,
        url: `/api/preview/${slug}`,
        html_content: html,
        status: "review",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to insert: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      action: "created",
      slug,
      id: inserted?.id,
      preview: `/api/preview/${slug}`,
      html_length: html.length,
    });
  }
}
