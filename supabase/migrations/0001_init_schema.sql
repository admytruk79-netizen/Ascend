-- ASCEND MVP schema — matches spec sections 4 (cards), 7 (journal), 9 (backend/sync).
-- Sync strategy per spec: append-only for sessions/journal, last-write-wins for
-- anchor/favorites (user_card_state). RLS enforces per-user isolation everywhere.

create extension if not exists "pgcrypto";

-- 1. Profiles — one row per auth.users entry (spec §9: Users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  ai_consent boolean not null default false, -- spec §8: explicit opt-in required before any AI processing
  ai_consent_updated_at timestamptz
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. Cards — spec §4 canonical Card model, plus acute_recommended from the
-- real card-manifest-34-final.json (whether the card is recommended for
-- acute/crisis use vs. reflective browsing only). Content is versioned via
-- the manifest; this table lets the client know which manifest version the
-- backend expects.
create table public.cards (
  id text primary key,
  asset_key text not null,
  category text not null,
  acute_recommended boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

create policy "cards_select_all_authenticated" on public.cards
  for select using (auth.role() = 'authenticated');
-- Cards are managed by the admin console (spec §9), not written by clients.

-- 3. UserCardState — spec §4. Exactly one row can have is_primary_anchor = true
-- per user; enforced with a partial unique index rather than app-level checks
-- alone, since this is a hard invariant from spec §4 ("Primary Anchor rule").
create table public.user_card_state (
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_id text not null references public.cards (id) on delete cascade,
  is_favorite boolean not null default false,
  is_primary_anchor boolean not null default false,
  last_used_at timestamptz,
  use_count integer not null default 0,
  updated_at timestamptz not null default now(), -- drives last-write-wins sync
  primary key (user_id, card_id)
);

create unique index user_card_state_one_primary_anchor
  on public.user_card_state (user_id)
  where is_primary_anchor;

alter table public.user_card_state enable row level security;

create policy "user_card_state_all_own" on public.user_card_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Sessions — spec §5. Append-only: rows are inserted at session start and
-- updated once at session end, never deleted by the client.
create table public.sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  card_id text not null references public.cards (id),
  trigger_source text not null check (trigger_source in ('manual', 'wearable')),
  started_at timestamptz not null,
  ended_at timestamptz,
  planned_seconds integer not null default 120,
  actual_seconds integer,
  extend_count integer not null default 0 check (extend_count between 0 and 3),
  completed boolean not null default false,
  interrupted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "sessions_all_own" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. JournalEntries — spec §7. Append-only; edits allowed (spec: "editing
-- permitted, edit history optional") so this is update-in-place, not append-only
-- at the row level, but entries are never synced as deletes.
create table public.journal_entries (
  entry_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  text text not null,
  mood smallint check (mood between 1 and 5),
  card_id text references public.cards (id),
  session_id uuid references public.sessions (session_id)
);

alter table public.journal_entries enable row level security;

create policy "journal_entries_all_own" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. AIInsights — spec §8/9. Post-session reflections and weekly summaries.
-- safety_flagged records the pattern/keyword pass result (build guide P5):
-- when true, `content` holds the neutral resource message, not a reflection.
create table public.ai_insights (
  insight_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid references public.sessions (session_id),
  kind text not null check (kind in ('post_session', 'weekly_summary')),
  content text not null,
  safety_flagged boolean not null default false,
  feedback text check (feedback in ('up', 'down')),
  created_at timestamptz not null default now()
);

alter table public.ai_insights enable row level security;

create policy "ai_insights_select_own" on public.ai_insights
  for select using (auth.uid() = user_id);
create policy "ai_insights_update_feedback_own" on public.ai_insights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Inserts happen only from the Edge Function via the service role key, which
-- bypasses RLS — clients never write ai_insights directly (spec §8 safety rule).

create index sessions_user_id_started_at_idx on public.sessions (user_id, started_at desc);
create index journal_entries_user_id_created_at_idx on public.journal_entries (user_id, created_at desc);
create index ai_insights_user_id_created_at_idx on public.ai_insights (user_id, created_at desc);
