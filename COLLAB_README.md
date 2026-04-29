# SM Web Designer Collaboration Notes

Last updated: 2026-04-29

## Current Branch

`main` — all work merged.

## Runtime

- Next.js dev server: `npm run dev`
- Current local URL after restart: `http://localhost:3000`
- Local LLM: Ollama at `http://localhost:11434` — `qwen3.5:4b` (do NOT use llama3.2:3b, it was removed)
- Qwen role: small utility tasks only (review summarization, keyword extraction). NOT for HTML generation — too slow on MacMini (5.5 tok/s, 40min per page).
- Cloud: OpenAI API key in `.env.local` for GPT Image 2 image generation.
- Website HTML generation: done by Claude or Codex interactively ($0, subscription), NOT via API.

## Database

- Supabase project: `sdgmzizibetwhecuaist`
- `cold_prospects` — 1,940 scraped GMB businesses
- `generated_sites` — Website generation tracker (migration applied 2026-04-29)

## Architecture: Website Generation Pipeline

### Design template system
- One active design template: `sm-web-templates/sm-web-001-roofing.template.json` (415 lines, analyzed from `sm-web-001-roofing.webp`)
- Layout, colors, typography, section order are FIXED across all prospects
- Only copy, images, and services change per prospect
- 12 industry content presets in `data/templates/industry-templates.json` (services, taglines, review keywords — NOT design templates)

### Generation flow (when user provides a UUID)
1. Look up prospect in Supabase `cold_prospects` by UUID
2. Resolve variables via `lib/prospect-resolver.ts` (geo style, property type, services from reviews)
3. Generate images via `/api/generate-images` → GPT Image 2 → saves to `sm-web-projects/sm-website-{slug}/images/`
4. Claude or Codex generates full HTML following template spec, with prospect-specific copy
5. Save to `sm-web-projects/sm-website-{slug}/index.html`
6. Preview at `/api/preview/{slug}` or production at `get.startupmiracle.com/{slug}`

### Slug format
`{business-name}-{city}` — e.g. `fence-menders-bakersfield`. Both `lib/format.ts` and `lib/prospect-resolver.ts` must produce the same slug. Do NOT change one without the other.

## Completed Implementation

### Issues #1-#4 (by Codex, PR #5 merged)
- Persistent side nav: Builder, Template Library, Website Tracker, Settings
- 12 industry content presets with services, taglines, review keywords
- Kanban board (Queued → Sold) with Supabase sync via `/api/generated-sites`
- Settings: prompt editor, skills toggles, model selector, Ollama test
- Builder: prospect card, prompt panel, live preview, progress stepper, Cmd+V UUID load

### Post-merge enhancements (by Claude)
- **Generation pipeline:** `/api/generate-images` (GPT Image 2), `/api/generate-website` (qwen fallback), `lib/prospect-resolver.ts` (variable resolver with geo/property/service mapping)
- **Settings redesign:** 4-tab layout (Connections, Models, Agent Prompt, Skills). API keys panel with masked display (first 6 + last 6), reveal toggle, copy-to-clipboard, live connection status.
- **Template Library redesign:** Split into "Design Template" (shows roofing image, section list, color palette) + collapsible "Industry Content Presets" grid.
- **Builder layout rework:** Prospect Card + Live Preview side by side. Agent Prompt collapsed at bottom with chevron toggle. Recent Sites moved to Website Tracker.
- **Local preview:** `/api/preview/[slug]` serves generated HTML from `sm-web-projects/`.
- **Website Tracker:** Kanban board + "Recently Loaded Prospects" section below.
- **First generated site:** Fence Menders (Bakersfield, CA) — `sm-web-projects/sm-website-fence-menders-bakersfield/index.html`

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generated-sites` | GET, POST, PATCH | CRUD for tracker Kanban |
| `/api/generate-images` | POST | GPT Image 2 image generation per prospect |
| `/api/generate-website` | POST | Qwen HTML generation (slow fallback, prefer Claude/Codex) |
| `/api/preview/[slug]` | GET | Serve generated site HTML locally |
| `/api/settings/agent-prompt` | GET, PUT | Load/save AI-WEB-DESIGNER-AGENT.md |
| `/api/settings/api-keys` | GET | Masked API keys + connection status |
| `/api/settings/ollama-test` | POST | Test qwen3.5:4b connection |

## Deployment

- **Target:** Vercel (preview first, then production)
- **Production URL:** `get.startupmiracle.com` (CNAME to Vercel)
- Generated sites served via `/api/preview/[slug]` route

## Verification

Passing locally:
- `npm run lint`
- `npm run build`

## Key Rules for Codex

- Do NOT use `llama3.2:3b` — removed from Ollama. Only `qwen3.5:4b` exists locally.
- Do NOT use qwen for full HTML page generation — too slow (40min). Use it only for small text tasks.
- Slug = `{business-name}-{city}`. Keep `lib/format.ts` and `lib/prospect-resolver.ts` in sync.
- All generated sites go in `sm-web-projects/sm-website-{slug}/` (gitignored).
- Keep UI light-only, OKLCH palette from `app/globals.css`, Tailwind + Lucide React only.
- The roofing template is the ONLY design template. Layout never changes. Only copy and images adapt.
- `.env.local` contains `OPENAI_API_KEY` and Supabase keys — never commit.
