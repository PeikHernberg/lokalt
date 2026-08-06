# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lokalt is a single front door for Helsinki residents who want to make their voice heard about something happening in their city. They describe their concern in their own words (Swedish or Finnish), and the app triages it: things that are broken get pointed to the city's existing fault-report channel, personal/legal matters get pointed to the right statutory channel, and brand-new ideas get pointed to citizen-initiative style channels. The product's real depth is reserved for the **policy** case — when the resident wants the city to decide something differently, Lokalt identifies which municipal body actually owns that decision, surfaces a real contact, and drafts a short email the resident sends themselves via a `mailto:` link. It never sends email, requires no accounts, and stores no user data. See [README.md](README.md) for the full product description and setup instructions.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint      # next lint
```

There is no test suite. Requires `ANTHROPIC_API_KEY` in `.env.local` (copy from `.env.local.example`) to exercise the two API routes locally.

## Architecture

**Two-call Claude pipeline, split by responsibility:**

1. `POST /api/route-question` ([src/app/api/route-question/route.ts](src/app/api/route-question/route.ts)) — classifies the resident's free text into one of four **tracks** (`operational`, `policy`, `statutory`, `agenda`) using the system prompt in [src/lib/classify-prompt.ts](src/lib/classify-prompt.ts). Only for the `policy` track does the model also pick a `body_id` from the supplied list of committees. This routing exists because Helsinki's lautakunder/nämnder only decide policy — they must never receive infrastructure-repair reports or personal/legal/health complaints (those have separate statutory channels).
2. `POST /api/draft` ([src/app/api/draft/route.ts](src/app/api/draft/route.ts)) — writes the actual email/text draft (`policy` mode has a recipient; `agenda` mode does not), in the first person, under 150 words, with bracketed placeholders (`[din adress]`) for anything personal.

**The model never sees or produces contact data.** The classifier is only allowed to output an `id` string; [src/lib/bodies.ts](src/lib/bodies.ts)'s `bodiesForPrompt()` deliberately strips names/emails/phones before building the prompt, and the route handler re-validates any returned `body_id` against the known set in `data/bodies.json`, nulling it out if it's not a real id or the track isn't `policy`. This is the core invariant to preserve when touching either API route: names and email addresses are looked up locally, never generated.

**Seed data**: [data/bodies.json](data/bodies.json) is a hand-curated list of the 6 everyday Helsinki municipal bodies (committee remit, chair contact, registry email, plain-language `topics_sv`/`topics_fi` used only to help routing). It's a placeholder for a future live fetch from paatokset.hel.fi (see the `source` field in the JSON itself).

**Shared Claude client**: [src/lib/anthropic.ts](src/lib/anthropic.ts) exports a single `MODEL` constant, a lazily-constructed client that reads `ANTHROPIC_API_KEY` server-side only, and `parseJsonLoose()` since both routes require the model to return raw JSON (defensively strips stray ``` fences).

**i18n**: no library — [src/lib/i18n.ts](src/lib/i18n.ts) is a flat dictionary of Swedish/Finnish strings; Swedish is the default language throughout.

**Routes**:
- `src/app/page.tsx` — marketing landing page.
- `src/app/app/` — the actual tool (Ask → Result → Draft flow), moved here from the site root.
- `src/app/om/page.tsx` — the "About" / disclosure page (independent tool, not an official City of Helsinki service, AI can be wrong).

## Conventions

- Path alias `@/*` maps to `src/*` (see [tsconfig.json](tsconfig.json)).
- Server routes run on `export const runtime = "nodejs"` and must keep `ANTHROPIC_API_KEY` server-side — never expose it to the client.
- When editing the classify or draft system prompts, preserve the "hard rules" structure (JSON-only output, no invented contact details, bracketed placeholders for personal info) — these are safety constraints, not style choices.
