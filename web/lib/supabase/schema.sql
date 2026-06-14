-- ============================================================
-- TripLens Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- ── AGENCIES ─────────────────────────────────────────────────
create table agencies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique,
  plan        text not null default 'starter',  -- starter | pro | agency_plus
  logo_url    text,
  created_at  timestamptz default now()
);

-- ── PROFILES (extends auth.users) ────────────────────────────
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  agency_id   uuid references agencies on delete cascade,
  full_name   text,
  role        text not null default 'agent',  -- owner | agent
  created_at  timestamptz default now()
);

-- ── CLIENTS ──────────────────────────────────────────────────
create table clients (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references agencies on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz default now()
);

-- ── TRIPS ────────────────────────────────────────────────────
create table trips (
  id            uuid primary key default gen_random_uuid(),
  agency_id     uuid not null references agencies on delete cascade,
  client_id     uuid references clients on delete set null,
  client_name   text,                    -- denormalized for quick display
  title         text not null,
  destination   text not null,
  start_date    date,
  end_date      date,
  budget        numeric,
  style         text default 'balanced', -- budget | luxury | adventure | balanced
  status        text not null default 'draft',   -- draft | proposed | confirmed | completed
  published     boolean not null default false,  -- controls client portal visibility
  portal_token  uuid not null unique default gen_random_uuid(),
  notes         text,
  created_by    uuid references profiles,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── ITINERARY DAYS ───────────────────────────────────────────
create table itinerary_days (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references trips on delete cascade,
  agency_id     uuid not null references agencies on delete cascade,
  day_number    int not null,
  date          date,
  title         text not null default 'Day',
  notes         text,
  position      int not null default 0,
  created_at    timestamptz default now()
);

-- ── ITINERARY BLOCKS ─────────────────────────────────────────
-- type: activity | hotel | transport | meal | flight | note
create table itinerary_blocks (
  id            uuid primary key default gen_random_uuid(),
  day_id        uuid not null references itinerary_days on delete cascade,
  agency_id     uuid not null references agencies on delete cascade,
  type          text not null default 'activity',
  title         text not null,
  description   text,
  time_start    text,       -- "09:00"
  duration      text,       -- "2 hours"
  location      text,
  price         numeric,
  position      int not null default 0,
  metadata      jsonb default '{}'::jsonb,  -- booking refs, coords, etc.
  created_at    timestamptz default now()
);

-- ── DOCUMENTS ────────────────────────────────────────────────
create table documents (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references trips on delete cascade,
  agency_id   uuid not null references agencies on delete cascade,
  name        text not null,
  url         text not null,  -- supabase storage URL
  type        text,           -- passport | visa | booking | other
  created_at  timestamptz default now()
);

-- ── TEMPLATES ────────────────────────────────────────────────
create table templates (
  id                uuid primary key default gen_random_uuid(),
  agency_id         uuid not null references agencies on delete cascade,
  title             text not null,
  destination       text not null,
  style             text default 'balanced',
  description       text,
  duration_days     int,
  itinerary_snapshot jsonb not null default '[]'::jsonb,  -- cloneable day/block JSON
  created_at        timestamptz default now()
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on trips
  for each row execute function touch_updated_at();

-- ── AUTO-CREATE PROFILE + AGENCY ON SIGNUP ───────────────────
create or replace function handle_new_user()
returns trigger as $$
declare
  new_agency_id uuid;
begin
  if new.raw_user_meta_data->>'agency_name' is not null then
    insert into agencies (name)
    values (new.raw_user_meta_data->>'agency_name')
    returning id into new_agency_id;

    insert into profiles (id, agency_id, full_name, role)
    values (
      new.id,
      new_agency_id,
      coalesce(new.raw_user_meta_data->>'full_name', new.email),
      'owner'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table agencies         enable row level security;
alter table profiles         enable row level security;
alter table clients          enable row level security;
alter table trips            enable row level security;
alter table itinerary_days   enable row level security;
alter table itinerary_blocks enable row level security;
alter table documents        enable row level security;
alter table templates        enable row level security;

-- Helper: get caller's agency_id
create or replace function my_agency_id()
returns uuid as $$
  select agency_id from profiles where id = auth.uid()
$$ language sql stable security definer;

-- profiles: own row
create policy "profiles_own" on profiles
  for all using (id = auth.uid());

-- agencies: own agency
create policy "agencies_own" on agencies
  for all using (id = my_agency_id());

-- clients: agency-scoped
create policy "clients_agency" on clients
  for all using (agency_id = my_agency_id());

-- trips: agency-scoped
create policy "trips_agency" on trips
  for all using (agency_id = my_agency_id());

-- itinerary_days: agency-scoped
create policy "idays_agency" on itinerary_days
  for all using (agency_id = my_agency_id());

-- itinerary_blocks: agency-scoped
create policy "iblocks_agency" on itinerary_blocks
  for all using (agency_id = my_agency_id());

-- documents: agency-scoped
create policy "docs_agency" on documents
  for all using (agency_id = my_agency_id());

-- templates: agency-scoped
create policy "templates_agency" on templates
  for all using (agency_id = my_agency_id());

-- ── INDEXES ──────────────────────────────────────────────────
create index trips_agency_id_idx         on trips (agency_id);
create index trips_client_id_idx         on trips (client_id);
create index trips_portal_token_idx      on trips (portal_token);
create index idays_trip_id_idx           on itinerary_days (trip_id);
create index iblocks_day_id_idx          on itinerary_blocks (day_id);
create index clients_agency_id_idx       on clients (agency_id);
