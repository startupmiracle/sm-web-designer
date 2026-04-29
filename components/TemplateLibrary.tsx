"use client";

import { Paintbrush, Plus } from "lucide-react";
import templates from "@/data/templates/industry-templates.json";
import type { IndustryTemplate } from "@/lib/types";

interface TemplateLibraryProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: IndustryTemplate) => void;
}

const industryTemplates = templates as IndustryTemplate[];

export function TemplateLibrary({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateLibraryProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[oklch(0.25_0.02_50)]">
          Template Library
        </h2>
        <p className="text-sm text-stone-500">
          Pick an industry to pre-fill the agent prompt with services, review
          priorities, and visual direction.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {industryTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              selectedTemplateId === template.id
                ? "border-[oklch(0.48_0.12_155)] ring-2 ring-[oklch(0.48_0.12_155_/_0.16)]"
                : "border-[oklch(0.88_0.03_90)]"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[oklch(0.25_0.02_50)]">
                  {template.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-stone-400">
                  {template.colorAccent}
                </p>
              </div>
              <span className="rounded-xl bg-[oklch(0.95_0.03_150)] p-2 text-[oklch(0.48_0.12_155)]">
                <Paintbrush className="h-4 w-4" />
              </span>
            </div>
            <p className="mb-4 text-sm leading-6 text-stone-600">
              {template.heroImageStyle}
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {template.defaultServices.slice(0, 3).map((service) => (
                <span
                  key={service}
                  className="rounded-lg bg-[oklch(0.985_0.005_90)] px-2 py-1 text-xs text-stone-600"
                >
                  {service}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.48_0.12_155)]">
              <Plus className="h-4 w-4" />
              Use template
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
