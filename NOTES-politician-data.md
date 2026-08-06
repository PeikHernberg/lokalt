# Politician/committee data feasibility spike

Research spike only — no code, no data, no API routes changed. Goal: figure out whether we can
move `data/bodies.json` from "one chair contact per body" to a real committee-roster /
council-member data model, and whether agenda-item matching ("this is being decided on
[date]") is technically feasible.

## Important caveat on this research

This sandbox has no outbound network access to `dev.hel.fi` — both `curl` and WebFetch got
`ECONNREFUSED` on every attempt, including the exact endpoints the task asked me to hit
(`/openahjo/v1/policymaker/`, `/openahjo/v1/committee/`, `/paatokset/v1/`). Everything below
about the *current* API's shape is reconstructed from web search results, GitHub repo READMEs,
and the HRI/avoindata.fi dataset pages I *could* reach — not from a live response body I
inspected myself. Before writing any code against this API, someone with unrestricted network
access needs to actually curl it and confirm field names.

## 1. OpenAhjo — the API named in the task — is dead

- The `City-of-Helsinki/openahjo` GitHub repo is **archived** ("This repository was archived by
  the owner on Oct 6, 2025. It is now read-only.").
- Web search confirms: "The OpenAhjo API, launched in 2015, has reached the end of its
  technical lifecycle and has been closed as of December 2024."
- `dev.hel.fi` itself appears to be unreachable/decommissioned from here (connection refused,
  not just 404 — consistent with it being taken down rather than just the docs page moving).

So the endpoints named in the task (`dev.hel.fi/apis/openahjo/v1/policymaker/`, etc.) are not
usable even if we had network access — this API no longer exists in production.

**Separately, and worth flagging even if it were still alive**: OpenAhjo's own data model
(per its README) never had a first-class "member" resource. Its resources were `Policymaker`
(committee/board/council as a single entity, not its people), `Meeting`, `Issue`,
`AgendaItem`, `Category`, `Video`, `Attachment`. So even the old API would not have solved
"give me all 13 members of kaupunkiympäristölautakunta with party and contact info" — it
modeled bodies and their decisions, not their composition.

## 2. There is a successor API — but I couldn't inspect it

Search results point to a newer API that backs the current paatokset.hel.fi site:

- Base URL: `dev.hel.fi/paatokset/v1`, described as following the OpenAPI/Swagger spec.
- It's consumed by `City-of-Helsinki/helsinki-paatokset`, a Drupal site that is under active
  development (thousands of commits, open PRs). Its README states: "The majority of the site's
  content come from AHJO API: Meetings, motions decisions, policymakers, office holder
  profiles."
- That implies **office holder profiles** (individual people, not just committee-as-entity)
  are modeled — which is more promising than OpenAhjo ever was. But I cannot confirm from here
  whether "office holder" means only chairs/deputy mayors (the people already in our seed data)
  or the full elected membership of each lautakunta, and I could not see field-level detail
  (email? party? photo? district?).
- HRI/avoindata.fi has a dataset page ("Open decision API of Helsinki") that likely documents
  this, but it returned 403 to WebFetch — needs a human or an unrestricted fetcher to read.

**Bottom line: this needs a follow-up spike with real network access** — curl
`dev.hel.fi/paatokset/v1/` (or whatever its current Swagger/OpenAPI JSON path is), pull the
schema, and specifically check for a `policymaker` → `members` relationship with name/party/
email/photo fields, and separately confirm whether it covers the full 85-seat
`kaupunginvaltuusto` with district/party.

## 3. paatokset.hel.fi itself is a client-rendered SPA — static fetch shows nothing useful

I tried fetching individual committee pages directly (e.g.
`paatokset.hel.fi/fi/paattajat/kaupunkiymparistolautakunta` and the "browse decision-makers"
org-chart page). Both come back as page shells: they state the committee has N members and
name the chair, but the actual member roster clearly loads client-side (presumably from the
`paatokset/v1` API above) and isn't present in the static HTML WebFetch retrieves. This is
consistent with #2 — the real data lives behind that API, not on the rendered page — but it
means we can't scrape our way around a network block; we need the API itself.

## 4. Council-group contact page — confirmed, works today, good fallback tier

`paatokset.hel.fi/en/decision-making/helsinki-city-council/helsinki-council-group-contact-info`
loaded cleanly and lists, for all 9 council groups:

| Group | Chair | Secretary / contact email |
|---|---|---|
| Kokoomus | Matias Pajula | sami.matikainen@kokoomus.fi |
| Sosialidemokraatit | Elisa Gebhard | sampo.untamala@sdp.fi |
| Vihreät | Amanda Pasanen | anna.hyodynmaa@vihreat.fi |
| Vasemmistoliitto | Mia Haglund | iija.eloranta@vasemmistoliitto.fi |
| Perussuomalaiset | Wille Rydman | valtuustoryhma@perushelsinki.fi |
| RKP/SFP | Nora Grotenfelt | helsingfors@sfp.fi |
| Keskusta | Terhi Peltokorpi | valtuustoryhma@helsinginkeskusta.fi |
| Kristillisdemokraatit | Eija-Riitta Korhola-Dunderfelt | toni.ahva@gmail.com |
| Liike Nyt Helsinki | Harry Harkimo | laura.sulkava@gmail.com |

Caveats: these are **party/group** emails (several are personal gmail addresses of volunteer
secretaries, not @hel.fi), no phone numbers, and this identifies "who chairs the X party's
group on the council," not "who on lautakunta Y is sympathetic to my specific issue." It's a
real, stable, low-effort data source, but it only gets a resident to a party gatekeeper, not
to an individual sympathetic member — the thing that motivated this investigation.

## 5. Agenda-item matching ("decided on this date") — plausible in principle, unverified here

OpenAhjo's old model *did* have `Issue` (topic, tracked across meetings) and `AgendaItem`
(linking issue → meeting → date), which is exactly the shape you'd need for "this is being
decided on [date]." The successor `paatokset/v1` API almost certainly has an equivalent, since
paatokset.hel.fi's UI already shows upcoming meeting agendas per body. But:

- I have no confirmed field-level schema for it (see caveat above).
- Matching a resident's free-text concern to a specific upcoming agenda item is a much harder
  NLP/retrieval problem than committee routing — agenda item titles are terse bureaucratic
  Finnish/Swedish, and false positives (telling someone the wrong item is being decided) are
  actively harmful, unlike a wrong-but-harmless static contact.
- This is a strong v2+ differentiator, not a v1 scope item.

## Recommendation

**Ship v1 with the current chair-only model, and add the council-group contact page as a
second, clearly-labeled fallback tier — don't attempt a full committee-roster/member data model
yet.**

Reasoning:
- The one API that could plausibly give a full committee roster with contact fields
  (`paatokset/v1`) is not verified from this environment — we don't know if it even exposes
  individual lautakunta members (vs. only "office holders" = chairs), let alone whether it has
  emails or just names+party.
- The API that *is* fully confirmed dead (OpenAhjo) never had member-level data anyway, so
  there's no fallback to "the old way" if the new API disappoints.
- The council-group page is real today and already improves on chair-only (a resident can at
  least reach their own party's group secretary), but it's not "reach a sympathetic committee
  member" — closer to a labeled stopgap than a real upgrade. It fits naturally as a second
  contact block in the existing `data/bodies.json` shape (e.g. a `council_groups` sibling array
  read once at build time, independent of `bodies`), not a restructuring of `bodies`.

**Before building a real committee-roster model**, do a second, narrower spike — from an
environment with actual network access — that specifically:
1. Fetches `dev.hel.fi/paatokset/v1`'s OpenAPI/Swagger document.
2. Confirms whether `policymaker` has a `members` (or similar) relationship exposing
   individual people, with what fields (name, party, email, photo).
3. Confirms coverage of the full 85-member `kaupunginvaltuusto` with district/party.
4. Checks whether agenda items are queryable by upcoming date per policymaker, as a precursor
   to the "decided on [date]" differentiator (v2 scope, not v1).

**If that spike confirms a real member roster with usable contact fields**, the natural shape
is a one-time build script (not a live fetch at request time — matches how
`data/bodies.json` already documents itself as "hand-curated seed" pending "Phase 1" live
fetch) that writes an extended JSON file: keep `bodies[].members[]` as the array it already is
in the current file, just populate it with the full roster instead of one chair, adding
`party`/`district` fields already present in the schema's spirit (`party` exists on the chair
entry today). No route or UI changes are implied by that alone — `POST /api/route-question`
already only needs a `body_id`; which specific member of that body to surface in the draft
step would be a later, separate decision (e.g. "prefer a member whose party matches
[user-selected district/party]" — out of scope for this spike).

**If that spike shows the new API also lacks per-member contact fields**, don't build a
member-roster model at all — stay on chair + council-group-fallback indefinitely, since no
other public source was found in this research that would fill the gap.
