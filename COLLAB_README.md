# SM Web Designer Collaboration Notes

Last updated: 2026-04-29

## Current Branch

`main` — all work merged. Deployed to Vercel.

## Live URLs

- **App:** https://sm-web-designer.vercel.app (auth: password in `APP_PASSWORD` env var)
- **Demo sites:** https://demo.startupmiracle.com/api/preview/{slug}
- **First demo:** https://demo.startupmiracle.com/api/preview/fence-menders-bakersfield
- **Stripe payment:** https://buy.stripe.com/9B64gA6VYbce0wd8wF0kE0B ($800 Website Design)
- **Post-payment:** https://startupmiracle.com/website-welcome (Cal.com 15-min booking)

## Runtime

- Next.js dev server: `npm run dev` (localhost:3000)
- Local LLM: Ollama at `http://localhost:11434` — `qwen3.5:4b` (do NOT use llama3.2:3b, removed)
- Qwen role: small utility tasks only (review summarization, keyword extraction). NOT for HTML generation — too slow on MacMini (5.5 tok/s, 40min per page).
- Cloud: OpenAI API key in `.env.local` for GPT Image 2 image generation.
- Website HTML generation: done by Claude or Codex interactively ($0, subscription), NOT via API.

## Database

- Supabase project: `sdgmzizibetwhecuaist`
- `cold_prospects` — 1,940 scraped GMB businesses with reviews, scores, competitive data
- `generated_sites` — Website generation tracker with `html_content` column for Supabase-served previews

## Architecture: Website Generation Pipeline

### Template system
- One active design template: `sm-web-templates/sm-web-001-roofing.template.json` (analyzed from `sm-web-001-roofing.webp`)
- Layout, colors, typography, section order are FIXED across all prospects
- Only copy, images, and services change per prospect
- 12 industry content presets in `data/templates/industry-templates.json` (services, taglines, review keywords)

### Template engine (`lib/template-engine.ts`)
- `renderWebsite(prospect, copy)` → complete HTML with all 10 sections
- Auto-handles: SEO metadata, OG tags, geo-localized H1, hero wordmark, review cards, gallery, Google Maps embed, phone click-to-call, business hours, footer attribution
- Claude/Codex provides a `ProspectCopy` object with headlines, service descriptions, brand statement, process steps, and about text

### Stock photo mapper (`lib/stock-photos.ts`)
- Curated photo sets per industry: fencing, roofing, painting, plumbing, HVAC, landscaping, concrete, general contractor
- Each set: hero (1400w), intro, about, call card, 8 gallery images with labels
- Auto-selected by `getPhotosForCategory(prospect.category)`

### Prospect variable resolver (`lib/prospect-resolver.ts`)
- Maps prospect data → template variables: geo style, property type, services from reviews
- Slug format: `{business-name}-{city}` (e.g. `fence-menders-bakersfield`)
- Both `lib/format.ts` and `lib/prospect-resolver.ts` produce the same slug — keep in sync

### Generation flow (when user provides a UUID)
1. Look up prospect in Supabase `cold_prospects` by UUID
2. Resolve variables via `lib/prospect-resolver.ts`
3. Claude/Codex writes the `ProspectCopy` object (headlines, services, about text, etc.)
4. `renderWebsite(prospect, copy)` produces complete HTML
5. Publish to Supabase via `POST /api/publish-site`
6. Preview at `demo.startupmiracle.com/api/preview/{slug}`
7. Share with prospect via SMS (OG tags create rich link preview)

## Sales Flow

1. Text prospect the demo: `demo.startupmiracle.com/api/preview/{slug}`
2. On the call, send payment link: `buy.stripe.com/9B64gA6VYbce0wd8wF0kE0B`
3. Prospect pays $800, redirected to `startupmiracle.com/website-welcome`
4. Cal.com 15-min booking embed → onboarding call
5. Finalize website → deploy to custom domain

## Completed Implementation

### Issues #1-#4 (all closed)
- #1 Template Library (Codex, PR #5) — 12 industry presets
- #2 Website Tracker (Codex + Claude) — Kanban board with Supabase sync
- #3 Settings (Codex + Claude) — 4-tab layout, API keys, model selector
- #4 Builder UX/UI (Codex + Claude) — Prospect + Live Preview side by side, sticky nav, hamburger mobile menu, collapsible Agent Prompt, scrollable gallery, geo SEO, OG tags

### Additional features (by Claude)
- **Auth gate:** `proxy.ts` redirects to `/login` for unauthenticated users. Preview routes are public.
- **Supabase HTML storage:** `generated_sites.html_content` column. Preview route reads from Supabase first, filesystem fallback for dev.
- **Publish endpoint:** `POST /api/publish-site` saves HTML from local files to Supabase.
- **Template engine:** `lib/template-engine.ts` — `renderWebsite()` produces complete HTML from prospect data + copy object.
- **Stock photo mapper:** `lib/stock-photos.ts` — curated photo sets for 8 industries.
- **Vercel deployment:** Live at `sm-web-designer.vercel.app` + `demo.startupmiracle.com`
- **Stripe product:** Website Design $800 one-time, payment link created
- **Post-payment page:** `startupmiracle.com/website-welcome` with Cal.com booking
- **First demo site:** Fence Menders (Bakersfield, CA) — sticky nav, hamburger menu, scrollable gallery, geo SEO H1, real reviews, OG image for SMS previews

## Open Issues

- #6 Wire `renderWebsite()` to Builder UI with Generate button
- #7 GPT Image 2 prospect-specific image generation
- #8 End-to-end auto-generate website from UUID

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generated-sites` | GET, POST, PATCH | CRUD for tracker Kanban |
| `/api/generate-images` | POST | GPT Image 2 image generation per prospect |
| `/api/generate-website` | POST | Qwen HTML generation (slow fallback) |
| `/api/preview/[slug]` | GET | Serve generated site from Supabase (public, no auth) |
| `/api/publish-site` | POST | Save HTML to Supabase (public for CLI/API use) |
| `/api/auth/login` | POST | Password auth, sets session cookie |
| `/api/auth/logout` | POST | Clears session cookie |
| `/api/settings/agent-prompt` | GET, PUT | Load/save AI-WEB-DESIGNER-AGENT.md |
| `/api/settings/api-keys` | GET | Masked API keys + connection status |
| `/api/settings/ollama-test` | POST | Test qwen3.5:4b connection |

## Environment Variables (Vercel + .env.local)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `OPENAI_API_KEY` | GPT Image 2 image generation |
| `APP_PASSWORD` | Auth gate password for the app |

## Key Rules for Codex

- Do NOT use `llama3.2:3b` — removed from Ollama. Only `qwen3.5:4b` exists locally.
- Do NOT use qwen for full HTML page generation — too slow (40min). Use it only for small text tasks.
- Website HTML is generated by `lib/template-engine.ts` `renderWebsite()` — use it, don't write HTML manually.
- Slug = `{business-name}-{city}`. Keep `lib/format.ts` and `lib/prospect-resolver.ts` in sync.
- All generated sites stored in Supabase `generated_sites.html_content` — NOT local filesystem on Vercel.
- `sm-web-projects/` is gitignored (local dev convenience only).
- Keep UI light-only, OKLCH palette from `app/globals.css`, Tailwind + Lucide React only.
- The roofing template is the ONLY design template. Layout never changes. Only copy and images adapt.
- `.env.local` contains secrets — never commit.
- Preview routes (`/api/preview/*`) are public (no auth) — prospects need to see their demo sites.
