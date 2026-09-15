-- Applied 2026-09-15, outside the migration runner (see note below).
--
-- spatial_ref_sys belongs to the postgis extension and is owned by
-- supabase_admin, so neither `alter table ... enable row level security` nor a
-- `revoke` issued by the postgres role has any effect on it — the Supabase
-- linter reports it as "RLS disabled in public" and there is no way to clear
-- that from here. It still sits in `public`, which PostgREST exposes, and it
-- is PostGIS's coordinate-system registry: every distance the nearby-reports
-- search computes depends on the rows in it, so it should be readable by the
-- API roles and writable by neither.
--
-- A row-level trigger is the one lever that does work from the postgres role:
-- writes by the two API roles are refused, while the extension's own upgrades
-- (which run as supabase_admin) still go through.
--
-- Note: this has to be applied with a direct SQL statement rather than through
-- the migration runner, which runs as a role that cannot drop the trigger it
-- is replacing.
create or replace function public.block_public_srs_writes()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, pg_temp
as $body$
begin
  if current_user in ('anon', 'authenticated') then
    raise exception 'spatial_ref_sys is read-only for API roles';
  end if;
  return case tg_op when 'DELETE' then old else new end;
end;
$body$;

drop trigger if exists block_public_srs_writes on public.spatial_ref_sys;
create trigger block_public_srs_writes
  before insert or update or delete on public.spatial_ref_sys
  for each row execute function public.block_public_srs_writes();

revoke all on function public.block_public_srs_writes() from public, anon, authenticated;
