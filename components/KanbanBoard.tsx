"use client";

import { DollarSign, GripVertical } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { GeneratedSite, GeneratedSiteStatus } from "@/lib/types";

interface KanbanBoardProps {
  sites: GeneratedSite[];
  onMoveSite: (id: string, status: GeneratedSiteStatus) => void;
}

const columns: { status: GeneratedSiteStatus; label: string }[] = [
  { status: "queued", label: "Queued" },
  { status: "generating", label: "Generating" },
  { status: "review", label: "Review" },
  { status: "ready_to_pitch", label: "Ready to Pitch" },
  { status: "pitched", label: "Pitched" },
  { status: "sold", label: "Sold" },
];

export function KanbanBoard({ sites, onMoveSite }: KanbanBoardProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[oklch(0.25_0.02_50)]">
          Website Tracker
        </h2>
        <p className="text-sm text-stone-500">
          Drag generated sites across the sales pipeline. Moves sync to
          Supabase when the `generated_sites` table is available.
        </p>
      </div>
      <div className="grid min-h-[640px] gap-4 overflow-x-auto pb-2 xl:grid-cols-6">
        {columns.map((column) => {
          const columnSites = sites.filter((site) => site.status === column.status);
          const total = columnSites.reduce(
            (sum, site) => sum + Number(site.deal_amount || 0),
            0
          );

          return (
            <div
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("text/plain");
                if (id) onMoveSite(id, column.status);
              }}
              className="min-w-[240px] rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-3 shadow-sm"
            >
              <div className="mb-3 rounded-xl bg-[oklch(0.985_0.005_90)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-stone-700">
                    {column.label}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-stone-500">
                    {columnSites.length}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[oklch(0.48_0.12_155)]">
                  <DollarSign className="h-3 w-3" />
                  {formatMoney(total)}
                </p>
              </div>
              <div className="space-y-3">
                {columnSites.map((site) => (
                  <article
                    key={site.id}
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", site.id)
                    }
                    className="cursor-grab rounded-xl border border-[oklch(0.9_0.02_90)] bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-sm font-semibold text-stone-800">
                          {site.business_name || site.slug}
                        </h4>
                        <p className="line-clamp-1 text-xs text-stone-500">
                          {[site.category, site.city].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <GripVertical className="h-4 w-4 shrink-0 text-stone-300" />
                    </div>
                    <div className="mb-3 aspect-video rounded-lg bg-[linear-gradient(135deg,oklch(0.94_0.02_90),oklch(0.78_0.12_85_/_0.36))]" />
                    <p className="line-clamp-1 font-mono text-[11px] text-stone-400">
                      {site.url || `get.startupmiracle.com/${site.slug}`}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[oklch(0.48_0.12_155)]">
                      {formatMoney(Number(site.deal_amount || 0))}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
