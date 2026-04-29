"use client";

import { LayoutTemplate, Settings, Sparkles, Columns3 } from "lucide-react";

export type AppSection = "builder" | "templates" | "tracker" | "settings";

interface SideNavigationProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

const items = [
  { id: "builder", label: "Builder", icon: Sparkles },
  { id: "templates", label: "Template Library", icon: LayoutTemplate },
  { id: "tracker", label: "Website Tracker", icon: Columns3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function SideNavigation({
  activeSection,
  onSectionChange,
}: SideNavigationProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-[oklch(0.88_0.03_90)] bg-white/80 px-4 py-5 shadow-sm lg:w-72">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[oklch(0.48_0.12_155)] text-sm font-bold text-white">
          SM
        </div>
        <div>
          <p className="text-base font-semibold text-[oklch(0.25_0.02_50)]">
            Web Designer
          </p>
          <p className="text-xs text-stone-500">Startup Miracle</p>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-[oklch(0.48_0.12_155)] text-white shadow-sm"
                  : "text-stone-600 hover:bg-[oklch(0.95_0.02_90)] hover:text-[oklch(0.25_0.02_50)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
