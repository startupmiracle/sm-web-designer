# SM Web Designer Collaboration Notes

Last updated: 2026-04-29

## Current Branch

`codex/issues-1-4-web-designer-workflow`

## Runtime

- Next.js dev server: `npm run dev`
- Current local URL after restart: `http://localhost:3000`
- Local LLM: Ollama at `http://localhost:11434`
- Active Ollama model for integrations: `qwen3.5:4b`
- Cloud fallback shown in UI: OpenAI GPT-4o-mini

## Database

The `generated_sites` migration has been run successfully by the user.

Migration file:

- `supabase/migrations/20260429120000_create_generated_sites.sql`

## Completed Implementation

Issue #4, UX/UI foundation:

- Persistent side navigation for Builder, Template Library, Website Tracker, and Settings.
- Desktop workflow layout with prospect card and editable agent prompt side by side.
- Startup Miracle light theme using cream background, forest green CTAs, and gold accents.
- Live preview iframe panel pointed at `https://get.startupmiracle.com/{slug}`.
- Progress stepper: Analyzing, Designing, Building, Deploying.
- Cmd+V shortcut that reads a UUID from clipboard and loads the prospect.
- Recent generated site history sidebar with thumbnail placeholders.

Issue #1, Template Library:

- 12 industry templates stored in `data/templates/industry-templates.json`.
- Template cards include hero image direction, color accent, services, taglines, and review keyword priorities.
- Selecting a template pre-fills or enriches the agent prompt.

Issue #2, Website Tracker:

- Drag-and-drop Kanban board for Queued, Generating, Review, Ready to Pitch, Pitched, Sold.
- Cards show business, category/city, slug/URL, thumbnail placeholder, and deal amount.
- `/api/generated-sites` supports list, create, and status update operations.
- Column totals show count and dollar value.

Issue #3, Settings:

- Agent prompt editor loads/saves `AI-WEB-DESIGNER-AGENT.md`.
- Installed skills list with toggles persisted to local storage.
- Model selector for Ollama local and OpenAI GPT-4o-mini.
- Ollama test endpoint checks for `qwen3.5:4b`.
- Header shows active model and estimated per-generation cost.

## Verification

Passing locally:

- `npm run lint`
- `npm run build`

## Known Follow-Ups

- Replace tracker/history placeholder thumbnails with real generated site screenshots when screenshot capture is wired in.
- Add user-visible error toast/status for failed Supabase writes instead of only inline builder error text.
- If creating PRs per issue, split this combined branch into issue-specific PRs or use this branch as the integration base.

## Coordination Notes for Claude

- Do not switch Ollama references back to `llama3.2:3b`; use `qwen3.5:4b`.
- The app currently relies on the public Supabase anon key from `CLAUDE.md` as a fallback when `.env.local` is missing.
- Keep UI light-only and aligned to the SM OKLCH palette in `app/globals.css`.
- Avoid external UI libraries; use Tailwind and Lucide React only.
