"use client";

import { Clock, ExternalLink } from "lucide-react";
import type { GeneratedSite, Prospect } from "@/lib/types";

interface HistorySidebarProps {
  recentProspects: Prospect[];
  generatedSites: GeneratedSite[];
  onLoadProspect: (id: string) => void;
}

export function HistorySidebar({
  recentProspects,
  generatedSites,
  onLoadProspect,
}: HistorySidebarProps) {
  const historySites = generatedSites.slice(0, 6);

  return (
    <aside className="space-y-4 rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[oklch(0.48_0.12_155)]" />
        <h2 className="text-sm font-semibold text-[oklch(0.25_0.02_50)]">
          Recent Sites
        </h2>
      </div>

      <div className="space-y-3">
        {historySites.map((site) => (
          <a
            key={site.id}
            href={site.url || `https://get.startupmiracle.com/${site.slug}`}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl border border-[oklch(0.9_0.02_90)] p-2 transition hover:border-[oklch(0.48_0.12_155)]"
          >
            <div className="mb-2 aspect-video rounded-lg bg-[linear-gradient(135deg,oklch(0.94_0.02_90),oklch(0.78_0.12_85_/_0.35))]" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="line-clamp-1 text-xs font-medium text-stone-700">
                  {site.business_name || site.slug}
                </p>
                <p className="line-clamp-1 text-[11px] text-stone-400">
                  {site.status.replaceAll("_", " ")}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-stone-300 group-hover:text-[oklch(0.48_0.12_155)]" />
            </div>
          </a>
        ))}
        {!historySites.length && (
          <p className="rounded-xl bg-[oklch(0.985_0.005_90)] p-3 text-xs leading-5 text-stone-500">
            Generated site history will appear after the tracker table has data.
          </p>
        )}
      </div>

      {!!recentProspects.length && (
        <div className="border-t border-[oklch(0.9_0.02_90)] pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Loaded Prospects
          </p>
          <div className="space-y-2">
            {recentProspects.map((prospect) => (
              <button
                key={prospect.id}
                onClick={() => onLoadProspect(prospect.id)}
                className="w-full rounded-xl bg-[oklch(0.985_0.005_90)] px-3 py-2 text-left text-xs text-stone-600 transition hover:bg-[oklch(0.95_0.02_90)]"
              >
                <span className="line-clamp-1 font-medium">
                  {prospect.business_name}
                </span>
                <span className="line-clamp-1 text-stone-400">
                  {prospect.city}, {prospect.state}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
