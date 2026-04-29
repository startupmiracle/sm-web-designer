import { supabase } from "@/lib/supabase";
import type { GeneratedSiteStatus } from "@/lib/types";

const statuses = new Set<GeneratedSiteStatus>([
  "queued",
  "generating",
  "review",
  "ready_to_pitch",
  "pitched",
  "sold",
]);

export async function GET() {
  const { data, error } = await supabase
    .from("generated_sites")
    .select(
      "id, prospect_id, slug, url, status, deal_amount, created_at, cold_prospects(business_name, category, city)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const sites = (data || []).map((site) => {
    const prospect = Array.isArray(site.cold_prospects)
      ? site.cold_prospects[0]
      : site.cold_prospects;

    return {
      id: site.id,
      prospect_id: site.prospect_id,
      slug: site.slug,
      url: site.url,
      status: site.status,
      deal_amount: site.deal_amount,
      created_at: site.created_at,
      business_name: prospect?.business_name,
      category: prospect?.category,
      city: prospect?.city,
    };
  });

  return Response.json({ sites });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    prospect_id?: string;
    slug?: string;
    url?: string;
    status?: GeneratedSiteStatus;
    deal_amount?: number;
  };

  if (!body.slug) {
    return Response.json({ error: "slug is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("generated_sites")
    .insert({
      prospect_id: body.prospect_id || null,
      slug: body.slug,
      url: body.url || `https://get.startupmiracle.com/${body.slug}`,
      status: body.status || "queued",
      deal_amount: body.deal_amount ?? 900,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ site: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: string;
    status?: GeneratedSiteStatus;
    deal_amount?: number;
  };

  if (!body.id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  if (body.status && !statuses.has(body.status)) {
    return Response.json({ error: "invalid status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("generated_sites")
    .update({
      ...(body.status ? { status: body.status } : {}),
      ...(typeof body.deal_amount === "number"
        ? { deal_amount: body.deal_amount }
        : {}),
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ site: data });
}
