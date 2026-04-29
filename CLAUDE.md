@AGENTS.md

# SM Web Designer — Project Context

## What This Is
AI-powered website builder for Startup Miracle's cold outreach campaign. Sales team scrapes prospects from Google Maps (no-website businesses), then uses this app to generate demo landing pages in seconds. The demo site is shown on a sales call to close $800-$1K website deals.

## Tech Stack
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (project: sdgmzizibetwhecuaist)
  - `cold_prospects` — 1,940 scraped GMB businesses with reviews, scores, competitive data
  - `stl_prospects` — Landing page data (what the deployed pages read from)
  - `generated_sites` — Website generation tracking (to be created)
- **AI/LLM:** OpenAI GPT-4o-mini (cloud) + Ollama qwen3.5:4b (local on MacMini at localhost:11434)
- **Deployment:** Landing pages deploy to `get.startupmiracle.com/{slug}` via Cloudflare
- **DNS:** Wildcard CNAME on `get.startupmiracle.com` handles all demo pages

## Design System
- **Mode:** Light only (cream background, NOT dark)
- **Palette (OKLCH):**
  - Cream bg: `oklch(0.97 0.01 90)` / `#FAFAF8`
  - Forest green (primary/CTAs): `oklch(0.48 0.12 155)`
  - Gold (accents/stars): `oklch(0.78 0.12 85)`
  - Dark text: `oklch(0.25 0.02 50)`
- **Typography:** Inter for the app UI. Generated landing pages use Cormorant Garamond (headings) + Plus Jakarta Sans (body)
- **Components:** Rounded-2xl cards, subtle shadows, no dark mode

## Supabase Credentials
```
NEXT_PUBLIC_SUPABASE_URL=https://sdgmzizibetwhecuaist.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZ216aXppYmV0d2hlY3VhaXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjUwNDEsImV4cCI6MjA3OTUwMTA0MX0.gJJJqdZLzb9c59hJOK9kfqtjUPkd6-Wikt7Fle3bXYg
```

## Ollama (Local LLM)
- Endpoint: `http://localhost:11434`
- Available model: `qwen3.5:4b`
- Use for: draft generation, review analysis, cost-free operations
- Fall back to OpenAI GPT-4o-mini for quality-critical outputs

## Commands
```bash
npm install    # Install dependencies
npm run dev    # Dev server (localhost:3000)
npm run build  # Production build
```

## Key Files
- `app/page.tsx` — Main page (UUID input → prospect card → agent prompt)
- `app/layout.tsx` — Root layout with SM branding
- `app/globals.css` — OKLCH color variables

## GitHub Issues (Active)
- #1 Side Menu: Template Library by Industry
- #2 Side Menu: Website Tracker (Kanban Board)
- #3 Side Menu: Settings (Agent Config, Skills, LLM)
- #4 Improve Website Design Builder UX/UI
