"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Paintbrush, Plus } from "lucide-react";
import Image from "next/image";
import templates from "@/data/templates/industry-templates.json";
import type { IndustryTemplate } from "@/lib/types";

interface TemplateLibraryProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: IndustryTemplate) => void;
}

const industryTemplates = templates as IndustryTemplate[];

const DESIGN_TEMPLATE = {
  id: "sm-web-001-roofing",
  name: "Modern Warm Gradient",
  image: "/templates/sm-web-001-roofing.webp",
  sections: [
    "Hero with oversized wordmark",
    "Intro + gallery cards",
    "Service cards carousel",
    "Centered brand statement",
    "About with accordion",
    "4-step process",
    "Testimonial cards",
    "Lead capture form",
    "Footer with map",
  ],
  palette: ["#f96310", "#fcceb2", "#ffffff", "#231f23", "#f5f5f5"],
};

export function TemplateLibrary({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateLibraryProps) {
  const [presetsExpanded, setPresetsExpanded] = useState(true);

  return (
    <section className="space-y-8">
      {/* ── Active Design Template ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[oklch(0.25_0.02_50)]">
            Design Template
          </h2>
          <p className="text-sm text-stone-500">
            The base layout, colors, and section structure used for every
            generated website.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[oklch(0.48_0.12_155)] bg-white shadow-sm ring-2 ring-[oklch(0.48_0.12_155_/_0.12)]">
          <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Template preview image */}
            <div className="relative aspect-[1/2] max-h-[600px] overflow-hidden bg-[oklch(0.97_0.01_90)] lg:aspect-auto lg:max-h-none">
              <Image
                src={DESIGN_TEMPLATE.image}
                alt="Active design template preview"
                fill
                className="object-cover object-top"
                sizes="320px"
                priority
              />
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.48_0.12_155)] px-3 py-1 text-[11px] font-semibold text-white shadow-md">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              </div>
            </div>

            {/* Template details */}
            <div className="flex flex-col p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-[oklch(0.25_0.02_50)]">
                  {DESIGN_TEMPLATE.name}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {DESIGN_TEMPLATE.id}
                </p>
              </div>

              {/* Color palette */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Color Palette
                </p>
                <div className="flex gap-2">
                  {DESIGN_TEMPLATE.palette.map((color) => (
                    <div key={color} className="group relative">
                      <div
                        className="h-8 w-8 rounded-lg border border-stone-200 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-1.5 py-0.5 font-mono text-[9px] text-white opacity-0 transition group-hover:opacity-100">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section list */}
              <div className="mb-5 flex-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Sections (fixed order)
                </p>
                <ol className="space-y-1.5">
                  {DESIGN_TEMPLATE.sections.map((section, i) => (
                    <li
                      key={section}
                      className="flex items-center gap-2.5 text-sm text-stone-600"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[oklch(0.95_0.03_90)] font-mono text-[10px] font-semibold text-stone-400">
                        {i + 1}
                      </span>
                      {section}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="rounded-xl bg-[oklch(0.97_0.02_90)] px-4 py-3 text-xs leading-5 text-stone-500">
                Layout, typography, spacing, and section order stay fixed.
                Copy, images, and services adapt per prospect UUID.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Industry Content Presets ── */}
      <div>
        <button
          onClick={() => setPresetsExpanded(!presetsExpanded)}
          className="mb-4 flex w-full items-center justify-between"
        >
          <div className="text-left">
            <h2 className="text-xl font-semibold text-[oklch(0.25_0.02_50)]">
              Industry Content Presets
            </h2>
            <p className="text-sm text-stone-500">
              Pre-fill services, taglines, and review priorities for the agent
              prompt. Does not change the design.
            </p>
          </div>
          <span className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
            {presetsExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </button>

        {presetsExpanded && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {industryTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selectedTemplateId === template.id
                    ? "border-[oklch(0.48_0.12_155)] ring-2 ring-[oklch(0.48_0.12_155_/_0.16)]"
                    : "border-[oklch(0.88_0.03_90)]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.95_0.03_150)] text-[oklch(0.48_0.12_155)]">
                      <Paintbrush className="h-4 w-4" />
                    </span>
                    <h3 className="font-semibold text-[oklch(0.25_0.02_50)]">
                      {template.name}
                    </h3>
                  </div>
                  {selectedTemplateId === template.id && (
                    <CheckCircle2 className="h-4 w-4 text-[oklch(0.48_0.12_155)]" />
                  )}
                </div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {template.defaultServices.slice(0, 3).map((service) => (
                    <span
                      key={service}
                      className="rounded-md bg-[oklch(0.985_0.005_90)] px-2 py-0.5 text-[11px] text-stone-500"
                    >
                      {service}
                    </span>
                  ))}
                  {template.defaultServices.length > 3 && (
                    <span className="rounded-md bg-[oklch(0.985_0.005_90)] px-2 py-0.5 text-[11px] text-stone-400">
                      +{template.defaultServices.length - 3}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(0.48_0.12_155)]">
                  <Plus className="h-3.5 w-3.5" />
                  Apply preset
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
