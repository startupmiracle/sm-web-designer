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
  const { data } = await supabase
    .from("generated_sites")
    .select("html_content")
    .eq("slug", slug)
    .not("html_content", "is", null)
    .limit(1)
    .single();

  if (data?.html_content) {
    return new NextResponse(data.html_content, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300",
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
