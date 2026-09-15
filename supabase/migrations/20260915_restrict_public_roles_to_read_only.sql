-- Applied 2026-09-15. Kept here so the database's access rules are reviewable
-- in the repo rather than only in the Supabase dashboard.
--
-- Lokalt's public API key (anon) is, by Supabase's design, a value that may
-- end up published, so it is scoped as if it already had been: the
-- anon/authenticated roles get SELECT and nothing else, on only the four
-- tables the web app actually reads. Everything that writes (the
-- ingest-palaute Edge Function, the cache-fill path in the web app)
-- authenticates as service_role, which bypasses RLS.
--
-- Policies are scoped `to anon, authenticated` rather than to the catch-all
-- `public` role, and the grants are the real boundary — the policies only
-- narrow what the grants already allow.

-- 1. Clear the earlier policy set, which was written for the `public` role.
drop policy if exists "server reads cache"           on public.area_responsibility_cache;
drop policy if exists "server writes cache"          on public.area_responsibility_cache;
drop policy if exists "server updates cache"         on public.area_responsibility_cache;

drop policy if exists "server reads bounds cache"    on public.area_responsibility_bounds_cache;
drop policy if exists "server writes bounds cache"   on public.area_responsibility_bounds_cache;
drop policy if exists "server updates bounds cache"  on public.area_responsibility_bounds_cache;

drop policy if exists "server reads decisions cache"   on public.decisions_cache;
drop policy if exists "server writes decisions cache"  on public.decisions_cache;
drop policy if exists "server updates decisions cache" on public.decisions_cache;

drop policy if exists "server reads reports cache"   on public.recent_reports_cache;
drop policy if exists "server writes reports cache"  on public.recent_reports_cache;
drop policy if exists "server updates reports cache" on public.recent_reports_cache;

drop policy if exists "server reads feedback"        on public.feedback_reports;
drop policy if exists "server writes feedback"       on public.feedback_reports;
drop policy if exists "server updates feedback"      on public.feedback_reports;

drop policy if exists "server reads ingest log"      on public.ingest_log;
drop policy if exists "server writes ingest log"     on public.ingest_log;
drop policy if exists "server updates ingest log"    on public.ingest_log;

-- 2. Strip every table privilege from the two public-facing roles, then hand
--    back SELECT only where the site genuinely reads.
revoke all on public.area_responsibility_cache        from anon, authenticated;
revoke all on public.area_responsibility_bounds_cache from anon, authenticated;
revoke all on public.decisions_cache                  from anon, authenticated;
revoke all on public.recent_reports_cache             from anon, authenticated;
revoke all on public.feedback_reports                 from anon, authenticated;
revoke all on public.ingest_log                       from anon, authenticated;

grant select on public.area_responsibility_cache        to anon, authenticated;
grant select on public.area_responsibility_bounds_cache to anon, authenticated;
grant select on public.decisions_cache                  to anon, authenticated;
grant select on public.feedback_reports                 to anon, authenticated;

-- recent_reports_cache and ingest_log are operational tables the web app
-- never touches; they keep no grant at all.

-- 3. Read-only policies, scoped to the specific roles rather than `public`.
create policy "read cached area lookups"
  on public.area_responsibility_cache
  for select to anon, authenticated using (true);

create policy "read cached area bounds"
  on public.area_responsibility_bounds_cache
  for select to anon, authenticated using (true);

create policy "read cached decisions"
  on public.decisions_cache
  for select to anon, authenticated using (true);

-- Open311 reports are already published by the city; the site only ever
-- shows them back. Reading is fine, writing is the Edge Function's alone.
create policy "read ingested reports"
  on public.feedback_reports
  for select to anon, authenticated using (true);

-- recent_reports_cache and ingest_log deliberately get no policy: with RLS
-- enabled and no policy, anon and authenticated see nothing at all.

-- 4. Stop the same thing happening to the next table somebody creates.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;
