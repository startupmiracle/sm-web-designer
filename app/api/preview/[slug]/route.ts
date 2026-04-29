import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const PROJECTS_DIR = path.join(process.cwd(), "sm-web-projects");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Try Supabase first (works on Vercel + local)
  const { data: rows } = await supabase
    .from("generated_sites")
    .select("html_content")
    .eq("slug", slug)
    .not("html_content", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const html_content = rows?.[0]?.html_content;
  if (html_content) {
    return new NextResponse(html_content, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=10, s-maxage=30",
      },
    });
  }

  // 2. Fallback to local filesystem (dev only)
  try {
    const filePath = path.join(PROJECTS_DIR, `sm-website-${slug}`, "index.html");
    const html = await readFile(filePath, "utf-8");
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return NextResponse.json(
      { error: `No generated site found for slug: ${slug}` },
      { status: 404 }
    );
  }
}
