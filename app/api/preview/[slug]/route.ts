import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const PROJECTS_DIR = path.join(process.cwd(), "sm-web-projects");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(PROJECTS_DIR, `sm-website-${slug}`, "index.html");

  try {
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
