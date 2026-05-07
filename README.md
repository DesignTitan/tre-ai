# tre.ai

Field-rep prospecting tool for sell-side / exit-advisory reps. Built for Jamie.

Land in any city, see the business owners most likely thinking about an exit, walk in pitch-ready.

---

## Run it locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

It opens to the **Plan Trip** page. Pick a radius, toggle areas, hit *Start trip* — you land on the Scout list with the 9 real Detroit-metro businesses ranked by Exit Readiness. Tap a card → detail with signal breakdown. Bottom tabs go to Today (route), Pipeline, and back to Trip.

---

## Stack

- **Next.js 15 (App Router)** + **React 19** + **TypeScript**
- **Tailwind CSS** with the locked tre.ai design tokens (see `tailwind.config.ts`)
- **Inter** via `next/font/google`
- All state is local in `useState` for now — Supabase comes in Phase 2

---

## Code map

```
app/
  layout.tsx           Device frame + status bar + tab bar wrap every page
  page.tsx             redirects to /plan
  plan/page.tsx        Trip planner (anchor city, radius, area toggles)
  scout/page.tsx       Ranked prospect list with area + filter chips
  prospect/[id]/page.tsx   Detail with score breakdown and "why this one"
  today/page.tsx       Day route with map + tap-to-cycle stop status
  pipeline/page.tsx    Stage-grouped deal list
  globals.css          Conic-gradient score rings + status-bar icons

components/
  DeviceFrame.tsx      Phone-frame chrome (desktop) / fullscreen (mobile)
  StatusBar.tsx        9:41 + wifi + battery
  TabBar.tsx           Bottom nav with active state from pathname
  ScoreDot.tsx         48px ring on prospect cards
  ScoreRing.tsx        96px ring on prospect detail
  ProspectCard.tsx     Card on the Scout list

lib/
  types.ts             Prospect, Area, Deal, Trip — single source of truth
  utils.ts             cx(), yearsSince(), formatRevenueBand(), renderInlineBold()
  score.ts             Exit Readiness model — placeholder weights until Jamie's PRD
  data/
    prospects.ts       Seed data — 9 real Detroit-metro businesses, sourced
    areas.ts           5 Detroit-metro areas with current prospect counts
    deals.ts           Pipeline state for the seed prospects
```

---

## What's wired and what's not

**Working today**
- Plan Trip with live area toggles + radius selection
- Scout list filtered by trip params, area pivot, score-ranked
- Prospect detail with full signal breakdown and per-signal weight bars
- Today with tap-to-cycle stop status (queued → next → done)
- Pipeline with stage grouping, stuck-deal warning state, links to detail
- Tab bar reflects current section
- Mobile-fullscreen / desktop phone-frame responsive
- Inter font, locked design tokens, conic-gradient score rings

**Stubbed / intentional placeholders**
- The 9 prospects are seeded from `lib/data/prospects.ts` — no DB yet
- "Add to Today" toast fires but doesn't persist across sessions
- Filter chips on Scout toggle visually but don't actually filter the list yet
- City picker on Plan Trip shows Detroit hard-coded — no city autocomplete
- Voice memo, photo capture, and offline-sync are not yet wired

**Not started**
- Supabase + auth
- PWA manifest (so Jamie can install on her phone)
- Prospect ingestion pipeline (Firecrawl + scoring service for new cities)
- Real-time sync across devices

---

## Design system

The aesthetic is locked. Don't introduce new colors or accents.

- Background: `bg` `#F4F1EC` (warm paper)
- Primary ink: `ink` `#101418`
- Accent: `accent` `#1F4E5F` (deep teal — only chromatic accent)
- Status colors: `green` `red` `gold` `warm` — used sparingly, only for status
- Type: Inter, with `feature-settings: "ss01","cv11"`
- Score visualization: conic-gradient ring, green progress arc on dark inner

See `tailwind.config.ts` for the full token table.

---

## Phase 2 roadmap

1. Supabase project — schema mirrors `lib/types.ts` exactly
2. Auth (email magic link to start)
3. PWA manifest + service worker for offline cache
4. Notes (text, photo, voice memo) tied to prospects + visits
5. Real city picker via Google Places autocomplete
6. Tune the score model in `lib/score.ts` against Jamie's PRD answers

---

## Phase 3 roadmap

1. Firecrawl-powered ingestion: pick a city, fetch businesses + signals on demand
2. Score on demand using tuned weights
3. Optional paid enrichment (Clay / ZoomInfo / D&B) for revenue verification
