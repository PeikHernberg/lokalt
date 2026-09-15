-- Applied 2026-09-15.
--
-- search_nearby_reports is reachable over the public REST API, so every
-- argument arrives from the caller rather than from our own client. Each one
-- is clamped to what the product actually asks for (see nearby-reports.ts:
-- 300m/800m radius, 12 months, 20 candidates), so the duplicate-report helper
-- stays a duplicate-report helper whatever it is asked for. search_path is
-- pinned so the function always resolves `similarity` and `feedback_reports`
-- where it expects them (the Supabase linter's function_search_path_mutable).
create or replace function public.search_nearby_reports(
  p_lat double precision,
  p_lon double precision,
  p_radius_meters double precision,
  p_query text default ''::text,
  p_months integer default 12,
  p_limit integer default 20
)
returns table(
  service_request_id text,
  description text,
  address text,
  status_notes text,
  requested_at timestamp with time zone,
  distance_meters double precision,
  similarity real
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $function$
  with bounded as (
    select
      least(greatest(coalesce(p_radius_meters, 300), 1), 1000)::double precision as radius,
      least(greatest(coalesce(p_months, 12), 1), 24)                             as months,
      least(greatest(coalesce(p_limit, 20), 1), 20)                              as row_limit,
      -- Helsinki only: a point outside the city is not a lookup this
      -- function has any reason to answer.
      (p_lat between 59 and 61 and p_lon between 23 and 26)                      as in_area,
      left(coalesce(p_query, ''), 2000)                                          as q
  )
  select
    r.service_request_id,
    r.description,
    r.address,
    r.status_notes,
    r.requested_at,
    ST_Distance(r.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography) as distance_meters,
    case when b.q = '' then 0 else similarity(r.description, b.q) end as similarity
  from feedback_reports r
  cross join bounded b
  where b.in_area
    and r.geom is not null
    and ST_DWithin(r.geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography, b.radius)
    and r.requested_at > now() - (b.months || ' months')::interval
  order by
    (case when b.q = '' then 0 else similarity(r.description, b.q) end) desc,
    distance_meters asc
  limit (select row_limit from bounded);
$function$;

-- Only the two API roles the site uses may call it; nothing inherits it
-- from the catch-all `public` role any more.
revoke all on function public.search_nearby_reports(
  double precision, double precision, double precision, text, integer, integer
) from public;
grant execute on function public.search_nearby_reports(
  double precision, double precision, double precision, text, integer, integer
) to anon, authenticated, service_role;
