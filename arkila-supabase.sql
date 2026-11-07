-- ARKILA backend (Supabase, free plan). Run once: Supabase dashboard > SQL Editor > New query > paste > Run.
-- Before running: change the staff email on the LAST line to the email you will log in to Admin with.

create table if not exists staff    (email text primary key);
create table if not exists requests (
  id text primary key, grp text, data jsonb not null,
  status text not null default 'new', paid boolean not null default false,
  track text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists listings (
  id text primary key, data jsonb not null,
  status text not null default 'pending', active boolean not null default true, updated_at timestamptz not null default now());
create table if not exists kv       (key text primary key, data jsonb not null, updated_at timestamptz not null default now());

alter table staff enable row level security;
alter table requests enable row level security;
alter table listings enable row level security;
alter table kv enable row level security;

create or replace function is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from staff where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))) $$;

-- Staff (Admin login) can do everything. Everyone else gets NO direct access to requests (names and phones stay private).
drop policy if exists staff_staff    on staff;    create policy staff_staff    on staff    for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_requests on requests; create policy staff_requests on requests for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_listings on listings; create policy staff_listings on listings for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_kv       on kv;       create policy staff_kv       on kv       for all to authenticated using (is_staff()) with check (is_staff());
-- The public website may only READ approved, active vehicles and the blocked-days / paused lists.
drop policy if exists pub_listings on listings; create policy pub_listings on listings for select to anon using (status = 'approved' and active);
drop policy if exists pub_kv       on kv;       create policy pub_kv       on kv       for select to anon using (true);

-- Renters send, check and cancel through these three functions only.
create or replace function submit_request(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare rid text := p ->> 'id'; tk text := p ->> 'track';
begin
  if rid is null or rid !~ '^REQ-[0-9A-Za-z-]{3,20}$' then raise exception 'bad id'; end if;
  if tk is null or length(tk) < 16 or length(tk) > 64 then raise exception 'bad token'; end if;
  if length(p::text) > 20000 then raise exception 'too large'; end if;
  if (select count(*) from requests where created_at > now() - interval '1 hour' and track = tk) >= 10 then raise exception 'slow down'; end if;
  insert into requests (id, grp, data, status, paid, track)
    values (rid, p ->> 'group', (p - 'track') || jsonb_build_object('status', 'new', 'paid', false), 'new', false, tk)
    on conflict (id) do nothing;
  return jsonb_build_object('ok', true);
end $$;

create or replace function my_requests(tokens text[]) returns table (id text, status text, paid boolean, updated_at timestamptz)
language sql security definer set search_path = public as
$$ select r.id, r.status, r.paid, r.updated_at from requests r where r.track = any (tokens[1:50]) $$;

create or replace function cancel_request(p_id text, p_track text) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  update requests set status = 'cancelled', paid = false, updated_at = now(),
         data = data || jsonb_build_object('status', 'cancelled', 'paid', false)
   where id = p_id and track = p_track and status in ('new', 'approved', 'confirmed');
  return jsonb_build_object('ok', true);
end $$;

revoke all on function submit_request(jsonb), my_requests(text[]), cancel_request(text, text) from public;
grant execute on function submit_request(jsonb), my_requests(text[]), cancel_request(text, text) to anon, authenticated;

-- LAST STEP: your admin email (change it, then run).
insert into staff (email) values ('you@example.com') on conflict do nothing;
