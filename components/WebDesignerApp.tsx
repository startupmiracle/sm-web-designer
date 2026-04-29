"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import templates from "@/data/templates/industry-templates.json";
import { AppHeader } from "@/components/AppHeader";
import { BuilderSearch } from "@/components/BuilderSearch";
import { HistorySidebar } from "@/components/HistorySidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ProgressStepper } from "@/components/ProgressStepper";
import { PromptPanel } from "@/components/PromptPanel";
import { ProspectPanel } from "@/components/ProspectPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { SideNavigation, type AppSection } from "@/components/SideNavigation";
import { TemplateLibrary } from "@/components/TemplateLibrary";
import { createSlug } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type {
  AgentSettings,
  GeneratedSite,
  GeneratedSiteStatus,
  IndustryTemplate,
  Prospect,
} from "@/lib/types";

const industryTemplates = templates as IndustryTemplate[];

const defaultSettings: AgentSettings = {
  systemPrompt: "",
  activeModel: "ollama",
  skills: {
    "design-html": true,
    "design-review": true,
    screenshot: true,
    "browser-use": true,
    ship: true,
    qa: true,
  },
};

export function WebDesignerApp() {
  const [activeSection, setActiveSection] = useState<AppSection>("builder");
  const [uuid, setUuid] = useState("");
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [recentProspects, setRecentProspects] = useState<Prospect[]>([]);
  const [generatedSites, setGeneratedSites] = useState<GeneratedSite[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<AgentSettings>(defaultSettings);
  const [savingPrompt, setSavingPrompt] = useState(false);

  const costEstimate = settings.activeModel === "openai" ? 0.001 : 0;

  useEffect(() => {
    void loadSettings();
    void loadGeneratedSites();
  }, []);

  const suggestedTemplate =
    selectedTemplate ||
    (prospect?.category
      ? industryTemplates.find((template) =>
          prospect.category?.toLowerCase().includes(template.category)
        ) || null
      : null);

  async function loadSettings() {
    const localSettings = window.localStorage.getItem("sm-web-designer-settings");
    const parsedSettings = localSettings
      ? ({ ...defaultSettings, ...JSON.parse(localSettings) } as AgentSettings)
      : defaultSettings;

    const response = await fetch("/api/settings/agent-prompt");
    const data = (await response.json()) as { content?: string };
    setSettings({ ...parsedSettings, systemPrompt: data.content || "" });
  }

  function persistSettings(nextSettings: AgentSettings) {
    setSettings(nextSettings);
    window.localStorage.setItem(
      "sm-web-designer-settings",
      JSON.stringify({
        activeModel: nextSettings.activeModel,
        skills: nextSettings.skills,
      })
    );
  }

  async function loadGeneratedSites() {
    const response = await fetch("/api/generated-sites").catch(() => null);
    if (!response?.ok) return;
    const data = (await response.json()) as { sites?: GeneratedSite[] };
    setGeneratedSites(data.sites || []);
  }

  const loadProspect = useCallback(async (id?: string) => {
    const searchId = (id || uuid).trim();
    if (!searchId) return;

    setLoading(true);
    setError("");
    setStep(0);

    const { data, error: prospectError } = await supabase
      .from("cold_prospects")
      .select("*")
      .eq("id", searchId)
      .single();

    if (prospectError || !data) {
      setError("Prospect not found. Check the UUID.");
      setLoading(false);
      return;
    }

    const loadedProspect = data as Prospect;
    const template =
      selectedTemplate ||
      industryTemplates.find((item) =>
        loadedProspect.category?.toLowerCase().includes(item.category)
      ) ||
      null;

    setProspect(loadedProspect);
    setRecentProspects((previous) => [
      loadedProspect,
      ...previous.filter((item) => item.id !== loadedProspect.id),
    ].slice(0, 5));
    setGeneratedPrompt(createPrompt(loadedProspect, template));

    // Check if a local preview exists, otherwise fall back to production URL
    const slug = createSlug(loadedProspect);
    const localPreview = `/api/preview/${slug}`;
    try {
      const check = await fetch(localPreview, { method: "HEAD" });
      setPreviewUrl(check.ok ? localPreview : `https://get.startupmiracle.com/${slug}`);
      setStep(check.ok ? 3 : 1);
    } catch {
      setPreviewUrl(`https://get.startupmiracle.com/${slug}`);
      setStep(1);
    }

    setLoading(false);
  }, [selectedTemplate, uuid]);

  useEffect(() => {
    const handlePasteShortcut = async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (!event.metaKey || event.key.toLowerCase() !== "v" || isEditable) {
        return;
      }

      const text = await navigator.clipboard.readText().catch(() => "");
      const pastedUuid = text.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
      )?.[0];

      if (pastedUuid) {
        event.preventDefault();
        setUuid(pastedUuid);
        void loadProspect(pastedUuid);
      }
    };

    window.addEventListener("keydown", handlePasteShortcut);
    return () => window.removeEventListener("keydown", handlePasteShortcut);
  }, [loadProspect]);

  function selectTemplate(template: IndustryTemplate) {
    setSelectedTemplate(template);
    setActiveSection("builder");

    if (prospect) {
      setGeneratedPrompt(createPrompt(prospect, template));
    } else {
      setGeneratedPrompt(createTemplateOnlyPrompt(template));
    }
  }

  async function createTrackerRecord() {
    if (!prospect) return;
    setStep(2);
    const slug = createSlug(prospect);
    const response = await fetch("/api/generated-sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospect_id: prospect.id,
        slug,
        url: `https://get.startupmiracle.com/${slug}`,
        status: "queued",
        deal_amount: 900,
      }),
    });

    if (response.ok) {
      await loadGeneratedSites();
      setStep(3);
    } else {
      setError("Could not create tracker record. Run the generated_sites migration first.");
    }
  }

  async function moveSite(id: string, status: GeneratedSiteStatus) {
    setGeneratedSites((previous) =>
      previous.map((site) => (site.id === id ? { ...site, status } : site))
    );

    await fetch("/api/generated-sites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => undefined);
  }

  async function savePrompt() {
    setSavingPrompt(true);
    await fetch("/api/settings/agent-prompt", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: settings.systemPrompt }),
    });
    setSavingPrompt(false);
  }

  async function testOllama() {
    const response = await fetch("/api/settings/ollama-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: "http://localhost:11434",
        model: "qwen3.5:4b",
      }),
    }).catch(() => null);
    const data = (await response?.json().catch(() => ({}))) as { message?: string };
    return data.message || "Ollama test did not return a response.";
  }

  const [promptExpanded, setPromptExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_90)] text-[oklch(0.25_0.02_50)]">
      <div className="grid min-h-screen lg:grid-cols-[288px_minmax(0,1fr)]">
        <SideNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="min-w-0">
          <AppHeader activeModel={settings.activeModel} costEstimate={costEstimate} />
          <main className="space-y-6 px-5 py-6 lg:px-8">
            {activeSection === "builder" && (
              <div className="space-y-6">
                {/* Search + Stepper */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
                  <BuilderSearch
                    uuid={uuid}
                    loading={loading}
                    error={error}
                    onUuidChange={setUuid}
                    onLoad={() => loadProspect()}
                  />
                  <div className="space-y-3 rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-800">
                      Generation Controls
                    </h2>
                    <p className="text-sm leading-6 text-stone-500">
                      {suggestedTemplate
                        ? `${suggestedTemplate.name} preset selected.`
                        : "Load a prospect to begin."}
                    </p>
                    <button
                      onClick={createTrackerRecord}
                      disabled={!prospect}
                      className="w-full rounded-xl bg-[oklch(0.48_0.12_155)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                      Add to Tracker
                    </button>
                  </div>
                </div>

                <ProgressStepper currentStep={step} />

                {/* Prospect Card + Live Preview side by side */}
                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                  <ProspectPanel prospect={prospect} />
                  <PreviewPanel previewUrl={previewUrl} />
                </div>

                {/* Agent Prompt — collapsed by default */}
                <div className="rounded-2xl border border-[oklch(0.88_0.03_90)] bg-white shadow-sm">
                  <button
                    onClick={() => setPromptExpanded(!promptExpanded)}
                    className="flex w-full items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[oklch(0.48_0.12_155)]" />
                      <h2 className="text-sm font-semibold text-[oklch(0.25_0.02_50)]">
                        Agent Prompt
                      </h2>
                      {generatedPrompt && (
                        <span className="rounded-full bg-[oklch(0.95_0.03_150)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.4_0.12_150)]">
                          Ready
                        </span>
                      )}
                    </div>
                    <span className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
                      {promptExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {promptExpanded && (
                    <div className="border-t border-[oklch(0.9_0.02_90)]">
                      <PromptPanel
                        prompt={generatedPrompt}
                        onPromptChange={setGeneratedPrompt}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === "templates" && (
              <TemplateLibrary
                selectedTemplateId={selectedTemplate?.id || null}
                onSelectTemplate={selectTemplate}
              />
            )}
            {activeSection === "tracker" && (
              <div className="space-y-8">
                <KanbanBoard sites={generatedSites} onMoveSite={moveSite} />
                <HistorySidebar
                  recentProspects={recentProspects}
                  generatedSites={generatedSites}
                  onLoadProspect={(id) => {
                    setActiveSection("builder");
                    void loadProspect(id);
                  }}
                />
              </div>
            )}
            {activeSection === "settings" && (
              <SettingsPanel
                settings={settings}
                onSettingsChange={persistSettings}
                onSavePrompt={savePrompt}
                onTestOllama={testOllama}
                savingPrompt={savingPrompt}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function createPrompt(prospect: Prospect, template: IndustryTemplate | null) {
  const reviewSnippets = (prospect.reviews_data || [])
    .slice(0, 3)
    .map(
      (review) =>
        `"${review.text?.text?.slice(0, 200) || ""}" - ${
          review.authorAttribution?.displayName || "Customer"
        }`
    )
    .join("\n\n");
  const slug = createSlug(prospect);
  const templateText = template
    ? `\n**Industry Template:** ${template.name}
**Hero Image Style:** ${template.heroImageStyle}
**Color Accent:** ${template.colorAccent}
**Default Services:** ${template.defaultServices.join(", ")}
**Tagline Options:** ${template.taglineExamples.join(" | ")}
**Review Keyword Priorities:** ${template.reviewKeywordPriorities.join(", ")}
**Template Instructions:** ${template.promptInstructions}\n`
    : "";

  return `Build a landing page for cold prospect UUID: ${prospect.id}

**Business:** ${prospect.business_name}
**Category:** ${prospect.category || "General Services"}
**Location:** ${prospect.address || `${prospect.city}, ${prospect.state}`}
**Phone:** ${prospect.phone || "N/A"}
**Rating:** ${prospect.rating} stars (${prospect.review_count} reviews)
**Contact:** ${prospect.contact_name || "Unknown"}
**Has Website:** ${prospect.has_website ? "Yes" : "No"}
**Suggested Slug:** ${slug}
${templateText}
**Top Reviews:**
${reviewSnippets || "No reviews cached. Run Sync Reviews first."}

**Instructions:**
1. Pull full data from Supabase cold_prospects table using UUID above
2. Analyze reviews for owner name, services, USPs, and customer language
3. Find competitors in ${prospect.city}, ${prospect.state} from cold_prospects
4. Generate landing page using /design-html skill
5. Deploy to get.startupmiracle.com/${slug}
6. Use Startup Miracle cream, forest green, and gold visual system
7. Include Google Maps embed, click-to-call, review showcase, services grid, and clear local CTA`;
}

function createTemplateOnlyPrompt(template: IndustryTemplate) {
  return `Use the ${template.name} industry template for the next generated site.

Hero image style: ${template.heroImageStyle}
Color accent: ${template.colorAccent}
Default services: ${template.defaultServices.join(", ")}
Tagline examples: ${template.taglineExamples.join(" | ")}
Review keyword priorities: ${template.reviewKeywordPriorities.join(", ")}

Template instructions:
${template.promptInstructions}

After a prospect UUID is loaded, merge these instructions with the prospect's reviews, city, phone, service signals, and competitor context.`;
}
