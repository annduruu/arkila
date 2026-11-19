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

alter table requests add column if not exists ip text;
create index if not exists requests_created_idx on requests (created_at);
create index if not exists requests_track_idx   on requests (track, created_at);
create index if not exists requests_ip_idx      on requests (ip, created_at);

-- Staff = a signed-in user whose email is on the staff list AND has been confirmed (a fresh unconfirmed sign-up never counts).
create or replace function is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from staff s join auth.users u on lower(u.email) = lower(s.email)
                  where u.id = auth.uid() and u.email_confirmed_at is not null) $$;

-- Never let the last staff email be removed (that would lock everyone out of Admin).
create or replace function keep_one_staff() returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from staff) <= 1 then raise exception 'cannot remove the last staff email'; end if;
  return old;
end $$;
drop trigger if exists keep_one_staff on staff;
create trigger keep_one_staff before delete on staff for each row execute function keep_one_staff();

-- Staff (Admin login) can do everything. Everyone else gets NO direct access to requests (names and phones stay private).
drop policy if exists staff_staff    on staff;    create policy staff_staff    on staff    for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_requests on requests; create policy staff_requests on requests for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_listings on listings; create policy staff_listings on listings for all to authenticated using (is_staff()) with check (is_staff());
drop policy if exists staff_kv       on kv;       create policy staff_kv       on kv       for all to authenticated using (is_staff()) with check (is_staff());
-- Private staff notes about renters (Admin > Renters). Staff only, never readable by the public website.
create table if not exists notes (key text primary key, data jsonb not null, updated_at timestamptz not null default now());
alter table notes enable row level security;
drop policy if exists staff_notes on notes; create policy staff_notes on notes for all to authenticated using (is_staff()) with check (is_staff());
-- The public website may only READ approved, active vehicles and the blocked-days / paused lists.
drop policy if exists pub_listings on listings; create policy pub_listings on listings for select to anon using (status = 'approved' and active);
-- only these shared keys are public; any new kv key stays staff-only until it is added here
drop policy if exists pub_kv       on kv;       create policy pub_kv       on kv       for select to anon using (key in ('blocks', 'booked', 'site', 'vact'));

-- Renters send, check and cancel through these three functions only.
create or replace function submit_request(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare rid text := p ->> 'id'; tk text := p ->> 'track'; d1 date; d2 date;
        phone text := regexp_replace(coalesce(p ->> 'guestPhone', ''), '\D', '', 'g');
        v_ip text := nullif(trim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1)), '');
begin
  if rid is null or rid !~ '^REQ-[0-9A-Za-z-]{3,20}$' then raise exception 'bad id'; end if;
  if tk is null or length(tk) < 16 or length(tk) > 64 then raise exception 'bad token'; end if;
  if length(p::text) > 8000 then raise exception 'too large'; end if;
  if coalesce(p ->> 'hp', '') <> '' then return jsonb_build_object('ok', true); end if;  -- spam trap: bots fill the hidden field
  -- numbers must be numbers (they are shown on the admin screen)
  if exists (select 1 from unnest(array['days','extraH','extraFee','total','deposit']) k
             where p ? k and jsonb_typeof(p -> k) <> 'number') then raise exception 'bad number'; end if;
  if coalesce((p ->> 'total')::numeric, 0) < 0 or coalesce((p ->> 'days')::numeric, 1) < 1 or coalesce((p ->> 'days')::numeric, 1) > 90
     then raise exception 'bad number'; end if;
  -- dates must be real, in order, and not in the past (one day of slack for time zones)
  begin d1 := (p ->> 'from')::date; d2 := (p ->> 'to')::date; exception when others then raise exception 'bad dates'; end;
  if d1 is null or d2 is null or d2 < d1 or d1 < current_date - 1 or d1 > current_date + 400 then raise exception 'bad dates'; end if;
  if length(phone) < 7 then raise exception 'bad phone'; end if;
  -- limits: per renter device, per phone number, per network address, and site-wide
  if (select count(*) from requests where created_at > now() - interval '1 hour' and track = tk) >= 10 then raise exception 'slow down'; end if;
  if (select count(distinct grp) from requests where created_at > now() - interval '1 day'
        and regexp_replace(coalesce(data ->> 'guestPhone', ''), '\D', '', 'g') = phone) >= 5 then raise exception 'slow down'; end if;
  if v_ip is not null and (select count(distinct grp) from requests where created_at > now() - interval '1 hour' and requests.ip = v_ip) >= 6
     then raise exception 'slow down'; end if;
  if (select count(*) from requests where created_at > now() - interval '10 minutes') >= 60 then raise exception 'busy'; end if;  -- site-wide limit
  -- keys starting with _ are internal (e.g. _test) and status/paid/createdAt are set here, never trusted from the website
  p := (select coalesce(jsonb_object_agg(k, v), '{}'::jsonb) from jsonb_each(p) e(k, v) where left(k, 1) <> '_');
  insert into requests (id, grp, data, status, paid, track, ip)
    values (rid, p ->> 'group', (p - 'track' - 'hp') || jsonb_build_object('status', 'new', 'paid', false,
            'createdAt', (extract(epoch from now()) * 1000)::bigint), 'new', false, tk, v_ip)
    on conflict (id) do nothing;
  -- same id already taken by someone else: tell the website, never pretend it was saved
  if not found and not exists (select 1 from requests where id = rid and track = tk) then raise exception 'duplicate id'; end if;
  return jsonb_build_object('ok', true);
end $$;

drop function if exists my_requests(text[]);
create or replace function my_requests(tokens text[]) returns table (id text, status text, paid boolean, updated_at timestamptz, reason text)
language sql security definer set search_path = public as
$$ select r.id, r.status, r.paid, r.updated_at, r.data ->> 'reason' from requests r where r.track = any (tokens[1:50]) $$;
grant execute on function my_requests(text[]) to anon, authenticated;

create or replace function cancel_request(p_id text, p_track text) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  -- paid stays as it was, so Admin still sees that money was received and a refund may be due
  update requests set status = 'cancelled', updated_at = now(),
         data = data || jsonb_build_object('status', 'cancelled', 'cancelledAt', (extract(epoch from now()) * 1000)::bigint)
   where id = p_id and track = p_track and status in ('new', 'approved', 'confirmed');
  return jsonb_build_object('ok', true);
end $$;

revoke all on function submit_request(jsonb), my_requests(text[]), cancel_request(text, text) from public;
grant execute on function submit_request(jsonb), my_requests(text[]), cancel_request(text, text) to anon, authenticated;

-- LAST STEP: your admin email (change it, then run).
insert into staff (email) values ('you@example.com') on conflict do nothing;
