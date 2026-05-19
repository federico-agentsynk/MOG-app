-- MOG Fitness — full schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)

-- ────────────────────────────────────────────────────────────
-- WHOOP tokens (existing)
-- ────────────────────────────────────────────────────────────
create table if not exists whoop_tokens (
  user_id      text primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at   bigint not null,
  updated_at   timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- Workouts
-- ────────────────────────────────────────────────────────────
create table if not exists workouts (
  id         text not null,
  user_id    text not null,
  type       text not null,
  date       text not null,
  exercises  jsonb not null default '[]',
  prs        int  not null default 0,
  created_at timestamptz default now(),
  primary key (user_id, id)
);
create index if not exists workouts_user_date on workouts (user_id, date desc);

-- ────────────────────────────────────────────────────────────
-- Weight log
-- ────────────────────────────────────────────────────────────
create table if not exists weight_log (
  user_id text not null,
  date    text not null,
  weight  numeric not null,
  primary key (user_id, date)
);
create index if not exists weight_log_user on weight_log (user_id, date asc);

-- ────────────────────────────────────────────────────────────
-- Body metrics
-- ────────────────────────────────────────────────────────────
create table if not exists body_metrics (
  user_id     text not null,
  date        text not null,
  neck        numeric,
  chest       numeric,
  arms_flexed numeric,
  shoulders   numeric,
  waist       numeric,
  primary key (user_id, date)
);

-- ────────────────────────────────────────────────────────────
-- Daily protocol
-- ────────────────────────────────────────────────────────────
create table if not exists daily_protocol (
  user_id   text    not null,
  date      text    not null,
  item_id   text    not null,
  completed boolean not null default true,
  primary key (user_id, date, item_id)
);
create index if not exists dp_user_date on daily_protocol (user_id, date);

-- ────────────────────────────────────────────────────────────
-- Weekly habits
-- ────────────────────────────────────────────────────────────
create table if not exists weekly_habits (
  user_id   text    not null,
  week_key  text    not null,
  day_key   text    not null,
  habit_id  text    not null,
  completed boolean not null default true,
  primary key (user_id, week_key, day_key, habit_id)
);
create index if not exists wh_user_week on weekly_habits (user_id, week_key);

-- ────────────────────────────────────────────────────────────
-- User settings
-- ────────────────────────────────────────────────────────────
create table if not exists user_settings (
  user_id          text primary key,
  current_weight   numeric default 147,
  target_weight    numeric default 165,
  goal_date        text    default '2026-10-10',
  morning_time     text    default '08:00',
  checkin_time     text    default '20:00',
  nighttime_time   text    default '22:00',
  notify_morning   boolean default false,
  notify_checkin   boolean default false,
  notify_nighttime boolean default false,
  notify_workout   boolean default false,
  notify_weigh_in  boolean default false,
  updated_at       timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- Progress photos
-- ────────────────────────────────────────────────────────────
create table if not exists progress_photos (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  date       text not null,
  uri        text not null,
  created_at timestamptz default now()
);
create index if not exists pp_user_date on progress_photos (user_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- Row Level Security — all tables
-- (service role key bypasses RLS; these are a safety net)
-- ────────────────────────────────────────────────────────────
alter table whoop_tokens    enable row level security;
alter table workouts        enable row level security;
alter table weight_log      enable row level security;
alter table body_metrics    enable row level security;
alter table daily_protocol  enable row level security;
alter table weekly_habits   enable row level security;
alter table user_settings   enable row level security;
alter table progress_photos enable row level security;
