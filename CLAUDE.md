# tre.ai — Working Notes for Claude Code

This file is the handoff context. Read this before doing anything else in this codebase.

---

## What this is

A field-rep prospecting tool for **sell-side / exit-advisory reps** at International Development Services (IDS). The user is **Jamie Bradshaw**.

The job-to-be-done: drop her into any city → show her the business owners most likely thinking about an exit → walk her in pitch-ready.

The product centerpiece is the **Exit Readiness Score** — a 0–100 probability read from observable public signals. It is *not* a generic lead score. Don't treat it like one.

## Who's it for

- **Jamie:** field rep at IDS. Title: Business Consultant / Senior Area Manager. Travels city-to-city.
- **Her targets:** privately-held businesses with **$2.5M–$15M revenue** (lower mid-market). The TRUE filter is owners likely thinking about an exit — old businesses, single-owner, no obvious successor, in industries actively being rolled up by PE.
- **Signals that matter:** owner age proxies, succession risk, industry consolidation tailwind, life-stage signals (real-estate listings, retirement chatter), comparable nearby sales.

## The aesthetic is LOCKED

Bubs (the project owner) explicitly approved the visual language. **Do not introduce new accent colors, gradients, or chrome.** Tokens live in `tailwind.config.ts`. The design moves available to you:

- Background: warm paper `#F4F1EC`
- Primary ink: `#101418`
- Accent: deep teal `#1F4E5F` — the only chromatic accent
- Status colors used sparingly: `green` (done), `red` (stuck), `gold` (PE tailwind tag), `warm` (owner-led tag)
- Type: Inter, with `feature-settings: "ss01","cv11"`
- Score visualization: conic-gradient ring, green progress arc on dark inner mask, white number

If you find yourself reaching for a new color, stop and ask Bubs.

**Do not use emojis in code or copy** unless the user explicitly asks. Restrained typography-driven interface.

## Geographic scope is the loudest control

Earlier iteration buried the city in a small caption. Bubs called it out. The Plan Trip screen now leads with: anchor city, drive radius, adjacent cities listed with prospect counts, toggle each one in/out. **Don't regress this** — the geographic scope is the primary control on the home screen, never a status line.

## What's wired and what's not

**Working:**
- All 5 pages routed (`/plan`, `/scout`, `/prospect/[id]`, `/today`, `/pipeline`)
- 9 real Detroit-metro businesses as a typed `Prospect[]` module — see `lib/data/prospects.ts`. Sourced from public BBB profiles, company websites, public Google search. No paid APIs.
- Plan Trip with live area toggles + radius selection that pass through to Scout via search params
- Scout area-pivot via the area chip strip
- Prospect Detail with full signal breakdown
- Today with tap-to-cycle stop status (queued → next → done)
- Pipeline grouped by stage with stuck-deal warning state
- Mobile-fullscreen / desktop phone-frame responsive
- Tab bar reflects active route via `usePathname`

**Stubbed (Phase 2 work):**
- No DB — all state is local component state. `lib/types.ts` is the source of truth that the Supabase schema should mirror.
- No auth
- "Add to Today" toast fires but doesn't persist
- Filter chips on Scout toggle visually but don't actually filter the list
- City picker is hard-coded to Detroit (no autocomplete)
- No notes / photos / voice memos
- No PWA manifest yet

**Not started (Phase 3):**
- Real prospect ingestion pipeline (Firecrawl + scoring service for arbitrary cities)
- On-demand scoring at runtime (currently scores are hand-set in the seed data)
- Optional paid enrichment (Clay / ZoomInfo / D&B) for revenue verification

## Score model placeholder

The score model lives in `lib/score.ts` but **is not currently used at runtime** — the scores in `lib/data/prospects.ts` are hand-set values that already reflect this logic. The module exists so we can switch over cleanly the moment we have real signal weights from Jamie.

The real model gets tuned when Jamie's PRD answers come back. Until then, `lib/score.ts` is the placeholder. **Don't tune the weights without those answers** — guessing more here just creates a sharper-looking wrong answer.

The PRD lives at `~/Documents/Claude/Projects/Jamie - App/Jamie - Product Brief.docx`. Three answers especially matter when they come back:
1. What her last 3–5 closes had in common (Q5)
2. Signals that tell her an owner is thinking exit even if they haven't said it (Q8)
3. Her real pipeline stage names (Q18) — replace `first-visit | discovery | engagement` everywhere

## Code conventions

- Server components by default; `"use client"` only when needed (state, hooks, event handlers).
- Path alias: `@/*` resolves to project root. Use `@/lib/...` and `@/components/...`.
- Types are the source of truth — when adding fields, update `lib/types.ts` first.
- The `cx()` helper in `lib/utils.ts` is the className joiner — use it instead of template strings.
- Bullet copy on prospect cards uses `**bold**` markdown that `renderInlineBold()` resolves at render time. Keep new copy in this format.
- Inline SVG over icon libraries — keep the bundle tiny, the design controlled.
- No external CSS frameworks beyond Tailwind. No styled-components, no Emotion.

## Deploy plan

**Target:** GitHub Pages via GitHub Actions, or Vercel if the user prefers.

For **GitHub Pages**, set up a workflow at `.github/workflows/deploy.yml` that:
1. Installs deps
2. Configures `next.config.mjs` with `output: 'export'`, plus `basePath: '/<repo-name>'` and `assetPrefix: '/<repo-name>/'` so asset paths work under the GitHub Pages subpath
3. Runs `next build`
4. Publishes the `out/` directory to the `gh-pages` branch

For **Vercel**, no workflow needed — `npx vercel` from the repo root, link to project, done.

**Custom domain (`tre.ai`):** if/when registered, add a `CNAME` file with `tre.ai` and configure DNS at the registrar.

## Open decisions (don't decide unilaterally)

- **Domain.** Is `tre.ai` registered? If not, worth grabbing.
- **Paid data source.** Free sources cannot reliably confirm $2.5–15M revenue at the company level. Either we accept estimated bands (current behavior) or add Clay (~$200/mo) / Apollo / D&B.
- **Multi-user vs. Jamie-only.** Currently single-user. Decide before adding auth.
- **Tab bar count.** Currently 4 tabs (Scout, Today, Pipeline, Trip). Bubs flagged this as probably one too many — collapsing Trip into a header banner is the leading candidate.
- **Score visualization.** Conic-gradient ring is current. Open whether to keep it, swap to a horizontal bar, or do something more idiosyncratic. Worth experimenting once she's using it.

## Files in the broader project

These live at `~/Documents/Claude/Projects/Jamie - App/`:

- `Jamie - Product Brief.docx` — the PRD (send this to Jamie if she hasn't filled it out)
- `Jamie - Mockups v1.html` / `v2.html` / `v3 (real data).html` — design iterations
- `tre.ai - One Pager.pdf` / `.html` — the single-page sharable
- `tre.ai - Prototype/index.html` — the vanilla-JS clickable prototype (visually identical to this codebase)
- `tre.ai - Status Report.md` — full project status doc

## Where to start

Look at `app/plan/page.tsx` first — it's the entry point and most-interactive screen. Then `app/scout/page.tsx`, then `app/prospect/[id]/page.tsx`. These three carry the bulk of the product behavior.

Phase 2 priorities, in order:
1. **Deploy.** Get this on a permanent URL (GitHub Pages or Vercel) so Bubs can share with Jamie.
2. **PWA manifest** so Jamie can install on her iPhone home screen.
3. **Supabase project** + auth (email magic link) + schema mirroring `lib/types.ts`.
4. **Persist trip state + visit notes** in Supabase.
5. **Wire up the filter chips** on Scout (currently visual-only).
6. **Real city autocomplete** via Google Places (replace the hard-coded "Detroit, MI").

Phase 3 is the data ingestion pipeline. Don't start that until Phase 2 is solid and Jamie has used the app on a real trip.
