"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Wand2,
  Search,
  Star,
  MapPin,
  Phone,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Building2,
  Palette,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Prospect {
  id: string;
  business_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  rating: number | null;
  review_count: number | null;
  has_website: boolean;
  reviews_data: any[] | null;
  business_status: string | null;
  newest_review_months: number | null;
  contact_name: string | null;
  google_place_id: string | null;
}

export default function WebDesignerPage() {
  const [uuid, setUuid] = useState("");
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Prospect[]>([]);

  const loadProspect = async (id?: string) => {
    const searchId = id || uuid.trim();
    if (!searchId) return;

    setLoading(true);
    setError("");
    setProspect(null);
    setGeneratedPrompt("");

    const { data, error: err } = await supabase
      .from("cold_prospects")
      .select("*")
      .eq("id", searchId)
      .single();

    if (err || !data) {
      setError("Prospect not found. Check the UUID.");
      setLoading(false);
      return;
    }

    setProspect(data);
    setRecentSearches((prev) => {
      const filtered = prev.filter((p) => p.id !== data.id);
      return [data, ...filtered].slice(0, 5);
    });
    generatePrompt(data);
    setLoading(false);
  };

  const generatePrompt = (p: Prospect) => {
    const reviewSnippets = (p.reviews_data || [])
      .slice(0, 3)
      .map((r: any) => `"${r.text?.text?.slice(0, 200) || ""}" — ${r.authorAttribution?.displayName || "Customer"}`)
      .join("\n\n");

    const slug = p.business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      + "-" + (p.city || "").toLowerCase().replace(/\s+/g, "-");

    const prompt = `Build a landing page for cold prospect UUID: ${p.id}

**Business:** ${p.business_name}
**Category:** ${p.category || "General Services"}
**Location:** ${p.address || `${p.city}, ${p.state}`}
**Phone:** ${p.phone || "N/A"}
**Rating:** ${p.rating} stars (${p.review_count} reviews)
**Contact:** ${p.contact_name || "Unknown"}
**Has Website:** ${p.has_website ? "Yes" : "No"}
**Suggested Slug:** ${slug}

**Top Reviews:**
${reviewSnippets || "No reviews cached. Run Sync Reviews first."}

**Instructions:**
1. Pull full data from Supabase cold_prospects table using UUID above
2. Analyze reviews for owner name, services, USPs
3. Find competitors in ${p.city}, ${p.state} from cold_prospects
4. Generate landing page using /design-html skill
5. Deploy to get.startupmiracle.com/${slug}
6. Use warm color palette (cream/forest-green/gold), Cormorant Garamond + Plus Jakarta Sans
7. Include Google Maps embed, click-to-call, review showcase, services grid`;

    setGeneratedPrompt(prompt);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.48 0.12 155)" }}>
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Web Designer</h1>
              <p className="text-xs text-gray-500">AI-Powered Landing Page Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Palette className="h-3.5 w-3.5" />
            Startup Miracle
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Generate Website from Prospect</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadProspect()}
                placeholder="Paste cold prospect UUID here..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm font-mono"
                style={{ "--tw-ring-color": "oklch(0.48 0.12 155)" } as React.CSSProperties}
              />
            </div>
            <button
              onClick={() => loadProspect()}
              disabled={loading || !uuid.trim()}
              className="px-6 py-3.5 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ background: "oklch(0.48 0.12 155)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Load
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          {recentSearches.length > 0 && !prospect && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setUuid(p.id); loadProspect(p.id); }}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {p.business_name} — {p.city}, {p.state}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prospect Card + Prompt (side by side) */}
        {prospect && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Prospect Info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{prospect.business_name}</h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-gray-500 text-sm capitalize flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> {prospect.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm" style={{ color: "oklch(0.78 0.12 85)" }}>
                    <Star className="h-3.5 w-3.5 fill-current" /> {prospect.rating} ({prospect.review_count})
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {prospect.city}, {prospect.state}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-mono mt-1.5">{prospect.id}</p>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                {prospect.phone && (
                  <p className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {prospect.phone}
                  </p>
                )}
                <p className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" /> {prospect.address || `${prospect.city}, ${prospect.state}`}
                </p>
                {prospect.contact_name && (
                  <p className="text-sm text-gray-700">Owner: <span className="font-medium">{prospect.contact_name}</span></p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {prospect.has_website ? (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg">Has Website</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg">No Website</span>
                  )}
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                    prospect.business_status === "OPERATIONAL"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}>
                    {prospect.business_status || "Unknown"}
                  </span>
                  {prospect.newest_review_months !== null && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                      prospect.newest_review_months < 6 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      Last review: {prospect.newest_review_months === 0 ? "Recent" : `${prospect.newest_review_months}mo ago`}
                    </span>
                  )}
                </div>
              </div>

              {/* Reviews Preview */}
              {prospect.reviews_data && prospect.reviews_data.length > 0 && (
                <div className="p-5 border-t border-gray-100 space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Top Reviews</h4>
                  {prospect.reviews_data.slice(0, 3).map((r: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">{r.authorAttribution?.displayName || "Customer"}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, s) => (
                            <Star key={s} className={`h-3 w-3 ${s < (r.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{r.text?.text?.slice(0, 150)}{(r.text?.text?.length || 0) > 150 && "..."}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Generated Prompt */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: "oklch(0.48 0.12 155)" }} />
                  <h3 className="font-semibold text-gray-900">Agent Prompt</h3>
                </div>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                  style={{ background: "oklch(0.48 0.12 155)" }}
                >
                  {promptCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {promptCopied ? "Copied!" : "Copy Prompt"}
                </button>
              </div>
              <div className="p-5 flex-1">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-xl p-5 border border-gray-100 leading-relaxed h-full overflow-y-auto">
                  {generatedPrompt}
                </pre>
              </div>
              <div className="p-5 pt-0">
                <p className="text-xs text-gray-400">
                  Paste this into a new Claude Code session with the AI Web Designer agent context.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
