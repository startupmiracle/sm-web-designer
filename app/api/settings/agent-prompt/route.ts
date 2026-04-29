import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const promptPath = path.join(process.cwd(), "AI-WEB-DESIGNER-AGENT.md");

export async function GET() {
  const content = await readFile(promptPath, "utf8");
  return Response.json({ content });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { content?: string };

  if (typeof body.content !== "string") {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  await writeFile(promptPath, body.content, "utf8");
  return Response.json({ ok: true });
}
