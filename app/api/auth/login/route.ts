import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const APP_PASSWORD = process.env.APP_PASSWORD || "sm2026";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };

  if (body.password !== APP_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Set a signed session cookie (valid 7 days)
  const token = Buffer.from(`sm-auth:${Date.now()}`).toString("base64");
  const cookieStore = await cookies();
  cookieStore.set("sm-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
