# TripLens

The modern client experience layer for travel agencies.

Stack: Next.js (App Router) · Supabase (Auth + Postgres + RLS) · Claude Haiku · react-pdf · Tailwind.

## Architecture

```
app/
├── (marketing)/        Landing, pricing, demo  (public)
├── (auth)/             Login, signup           (public)
├── (dashboard)/        Agent workspace         (auth-gated)
│   ├── dashboard/      Overview
│   ├── trips/[id]/     Trip + itinerary editor
│   ├── clients/[id]/   Client profiles
│   ├── templates/      Reusable trip templates
│   └── settings/       Agency, team, billing
├── portal/[token]/     Public client portal    (no auth, fast)
└── api/
    ├── itinerary/      Claude → structured itinerary JSON
    └── pdf/[id]/       react-pdf export
```

Multi-tenant: every row carries `agency_id`, enforced by Postgres Row-Level Security.
Itinerary stored as normalized rows (`itinerary_days` → `itinerary_blocks`), never markdown blobs.
Trips have `published` separate from `status` — agents draft privately, publish to the client portal.

## Setup

1. **Create a Supabase project** at supabase.com
2. **Run the schema**: paste `lib/supabase/schema.sql` into the Supabase SQL Editor and run it.
   This creates all tables, RLS policies, and the signup trigger (auto-creates agency + owner profile).
3. **Copy env**: `cp .env.example .env.local` and fill in:
   - Supabase URL + anon key + service role key (Project Settings → API)
   - Anthropic API key (console.anthropic.com)
4. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
5. Open http://localhost:3000

## Status

Built:
- ✅ Schema + RLS + multi-tenancy
- ✅ Auth (Supabase) — signup creates agency, login, middleware guard
- ✅ Marketing landing page
- ✅ Dashboard shell + overview
- ✅ Claude itinerary generation lib (structured JSON)

Next:
- ⬜ New trip flow + AI generation API route
- ⬜ Trip detail + block-based itinerary editor
- ⬜ Client portal (`/portal/[token]`)
- ⬜ PDF export
- ⬜ Clients, templates, settings pages
