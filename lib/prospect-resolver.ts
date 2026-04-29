import type { Prospect } from "./types";

export interface ResolvedProspect {
  prospect_category: string;
  prospect_city: string;
  prospect_state: string;
  prospect_business_name: string;
  prospect_phone: string;
  prospect_address: string;
  prospect_rating: string;
  prospect_review_count: string;
  prospect_contact_name: string;
  prospect_slug: string;
  prospect_services_primary: string;
  prospect_services: string[];
  prospect_ideal_client_property_type: string;
  prospect_geo_region_style: string;
  prospect_reviews_text: string[];
}

const GEO_STYLES: Record<string, string> = {
  FL: "Florida stucco and tile",
  GA: "Southern brick and siding",
  TX: "Texas ranch-style",
  AZ: "Southwestern adobe and stucco",
  NM: "adobe and southwestern",
  CA: "California stucco and Spanish tile",
  OR: "Pacific Northwest craftsman bungalow",
  WA: "Pacific Northwest craftsman bungalow",
  NY: "colonial or brownstone",
  NJ: "colonial or Cape Cod",
  CT: "New England colonial",
  MA: "New England colonial",
  PA: "colonial brick and stone",
  OH: "Midwestern brick and siding",
  MI: "Midwestern brick and siding",
  IL: "Midwestern brick and siding",
  IN: "Midwestern brick and siding",
  MN: "Midwestern split-level and rambler",
  CO: "mountain modern and ranch",
  NC: "Southern craftsman and ranch",
  SC: "Southern low-country and brick",
  VA: "colonial brick and farmhouse",
  TN: "Southern ranch and craftsman",
  AL: "Southern brick ranch",
  LA: "Louisiana Creole and shotgun",
  MD: "Mid-Atlantic row house and colonial",
};

const PROPERTY_TYPES: Record<string, string> = {
  roofing: "residential home",
  fencing: "residential home with yard",
  landscaping: "residential home with front yard",
  plumbing: "single-family home",
  hvac: "single-family home",
  painting: "home or storefront",
  concrete: "residential property",
  "junk removal": "residential garage or driveway",
  "tree service": "residential property with mature trees",
  "pressure washing": "residential home exterior",
  "garage door": "residential home with attached garage",
  "general contractor": "home under renovation",
};

function extractServicesFromReviews(reviews: Prospect["reviews_data"]): string[] {
  if (!reviews?.length) return [];

  const serviceKeywords = [
    "roof", "shingle", "gutter", "leak", "flashing", "siding", "fence",
    "deck", "patio", "driveway", "lawn", "tree", "trim", "paint",
    "plumb", "pipe", "drain", "water heater", "AC", "HVAC", "furnace",
    "concrete", "stump", "pressure wash", "garage door", "remodel",
    "kitchen", "bathroom", "install", "repair", "replace", "clean",
  ];

  const found = new Set<string>();
  for (const review of reviews) {
    const text = (review.text?.text || "").toLowerCase();
    for (const kw of serviceKeywords) {
      if (text.includes(kw.toLowerCase())) found.add(kw);
    }
  }
  return Array.from(found).slice(0, 8);
}

export function createSlug(prospect: Prospect): string {
  const business = (prospect.business_name || "business")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const city = (prospect.city || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return [business, city].filter(Boolean).join("-").slice(0, 80);
}

export function resolveProspect(
  prospect: Prospect,
  templateDefaults?: string[]
): ResolvedProspect {
  const category = (prospect.category || "home services").toLowerCase();
  const state = (prospect.state || "").toUpperCase();
  const reviewServices = extractServicesFromReviews(prospect.reviews_data);
  const services =
    reviewServices.length > 0
      ? reviewServices
      : templateDefaults || [category];

  const reviewTexts = (prospect.reviews_data || [])
    .slice(0, 5)
    .map(
      (r) =>
        `"${(r.text?.text || "").slice(0, 200)}" — ${r.authorAttribution?.displayName || "Customer"}`
    )
    .filter((t) => t.length > 10);

  return {
    prospect_category: category,
    prospect_city: prospect.city || "the local area",
    prospect_state: prospect.state || "",
    prospect_business_name: prospect.business_name || "Local Business",
    prospect_phone: prospect.phone || "",
    prospect_address: prospect.address || `${prospect.city}, ${prospect.state}`,
    prospect_rating: String(prospect.rating ?? "N/A"),
    prospect_review_count: String(prospect.review_count ?? 0),
    prospect_contact_name: prospect.contact_name || "",
    prospect_slug: createSlug(prospect),
    prospect_services_primary: services[0] || category,
    prospect_services: services,
    prospect_ideal_client_property_type:
      PROPERTY_TYPES[category] || "residential property",
    prospect_geo_region_style:
      GEO_STYLES[state] || "typical American residential",
    prospect_reviews_text: reviewTexts,
  };
}

export function resolvePromptTemplate(
  template: string,
  vars: ResolvedProspect
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{${key}}`;
    const replacement = Array.isArray(value) ? value.join(", ") : value;
    result = result.replaceAll(placeholder, replacement);
  }
  return result;
}
