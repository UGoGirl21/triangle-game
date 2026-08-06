-- gen_random_uuid() is built into Postgres core since v13; Supabase's default
-- Postgres (15+) has it natively. This line is a harmless no-op safety net.
create extension if not exists pgcrypto;

create table if not exists game_results (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  player1_name text not null,
  player1_symbol text not null,
  player1_score integer not null,
  player2_name text not null,
  player2_symbol text not null,
  player2_score integer not null,
  winner smallint check (winner in (1, 2)), -- null = draw
  dot_count integer not null,
  created_at timestamptz not null default now()
);

create index if not exists game_results_created_at_idx on game_results (created_at desc);

alter table game_results enable row level security;

create policy "public can read results" on game_results
  for select using (true);

create policy "public can insert results" on game_results
  for insert with check (true);
-- No update/delete policies -> those operations are denied by default under RLS.

-- security_invoker=true is best practice (avoids Supabase's "Security Definer View"
-- advisory lint) even though it makes no behavioral difference here, since the
-- underlying select policy is already open to everyone.
create or replace view leaderboard
  with (security_invoker = true) as
with rows as (
  select player1_name as name, coalesce(winner = 1, false) as won from game_results
  union all
  select player2_name as name, coalesce(winner = 2, false) as won from game_results
)
select
  name,
  count(*)::int as games_played,
  count(*) filter (where won)::int as wins,
  round(100.0 * count(*) filter (where won) / count(*), 1) as win_rate
from rows
group by name
order by wins desc, win_rate desc, games_played desc;

-- Supabase's default privileges normally already grant these automatically to
-- anon/authenticated for new public-schema objects, but stated explicitly for safety.
grant select, insert on game_results to anon, authenticated;
grant select on leaderboard to anon, authenticated;

-- Daily challenge: everyone gets the same dot layout + AI difficulty for a given
-- KST calendar day (derived client-side from a date-based seed), plays one solo
-- match against the AI, and today's attempts rank against each other. The
-- `game_results` / `leaderboard` view above back the old friend-match ranking,
-- which is no longer surfaced in the UI; left in place rather than dropped.
create table if not exists daily_challenge_scores (
  id uuid primary key default gen_random_uuid(),
  challenge_date date not null,
  name text not null,
  score integer not null,
  opponent_score integer not null,
  duration_seconds integer not null,
  difficulty text not null,
  dot_count integer not null,
  created_at timestamptz not null default now()
);

create index if not exists daily_challenge_scores_date_idx on daily_challenge_scores (challenge_date, score desc, duration_seconds asc);

alter table daily_challenge_scores enable row level security;

create policy "public can read daily scores" on daily_challenge_scores
  for select using (true);

create policy "public can insert daily scores" on daily_challenge_scores
  for insert with check (true);
-- No update/delete policies -> those operations are denied by default under RLS.

grant select, insert on daily_challenge_scores to anon, authenticated;
