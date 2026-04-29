"use client";

import { Building2, MapPin, Phone, Star } from "lucide-react";
import type { Prospect } from "@/lib/types";

interface ProspectPanelProps {
  prospect: Prospect | null;
}

export function ProspectPanel({ prospect }: ProspectPanelProps) {
  if (!prospect) {
    return (
      <section className="rounded-2xl border border-dashed border-[oklch(0.84_0.03_90)] bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Prospect Card
        </h2>
        <p className="mt-4 text-sm leading-6 text-stone-500">
          Paste a cold prospect UUID to load business details, reviews, and the
          generated agent prompt.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white shadow-sm">
      <div className="border-b border-[oklch(0.9_0.02_90)] p-5">
        <h2 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
          {prospect.business_name}
        </h2>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1 capitalize">
            <Building2 className="h-3.5 w-3.5" />
            {prospect.category || "General services"}
          </span>
          <span className="inline-flex items-center gap-1 text-[oklch(0.68_0.13_80)]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {prospect.rating ?? "N/A"} ({prospect.review_count ?? 0})
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {prospect.city}, {prospect.state}
          </span>
        </div>
        <p className="mt-2 break-all font-mono text-[11px] text-stone-400">
          {prospect.id}
        </p>
      </div>

      <div className="space-y-3 p-5">
        {prospect.phone && (
          <p className="flex items-center gap-2 text-sm text-stone-700">
            <Phone className="h-3.5 w-3.5 text-stone-400" />
            {prospect.phone}
          </p>
        )}
        <p className="flex items-start gap-2 text-sm text-stone-700">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
          {prospect.address || `${prospect.city}, ${prospect.state}`}
        </p>
        {prospect.contact_name && (
          <p className="text-sm text-stone-700">
            Owner: <span className="font-medium">{prospect.contact_name}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="rounded-lg bg-[oklch(0.95_0.05_80)] px-2.5 py-1 text-xs font-medium text-[oklch(0.42_0.1_75)]">
            {prospect.has_website ? "Has Website" : "No Website"}
          </span>
          <span className="rounded-lg bg-[oklch(0.95_0.03_150)] px-2.5 py-1 text-xs font-medium text-[oklch(0.42_0.1_150)]">
            {prospect.business_status || "Unknown"}
          </span>
        </div>
      </div>

      {!!prospect.reviews_data?.length && (
        <div className="space-y-2 border-t border-[oklch(0.9_0.02_90)] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Review Language
          </h3>
          {prospect.reviews_data.slice(0, 3).map((review, index) => (
            <div key={index} className="rounded-xl bg-[oklch(0.985_0.005_90)] p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-stone-700">
                  {review.authorAttribution?.displayName || "Customer"}
                </span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-3 w-3 ${
                        starIndex < (review.rating || 0)
                          ? "fill-[oklch(0.78_0.12_85)] text-[oklch(0.78_0.12_85)]"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs leading-5 text-stone-600">
                {review.text?.text?.slice(0, 170)}
                {(review.text?.text?.length || 0) > 170 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
