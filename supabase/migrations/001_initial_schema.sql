-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type plan_type as enum ('free', 'creator', 'pro');
create type subscription_status_type as enum ('active', 'cancelled', 'past_due', 'none');
create type payment_provider_type as enum ('stripe', 'razorpay');
create type video_duration_type as enum ('15s', '30s', '60s');
create type platform_type as enum ('youtube_shorts', 'instagram_reels', 'tiktok');
create type visual_style_type as enum ('cinematic', 'cartoon', 'realistic', 'minimal', 'anime');
create type ai_tool_type as enum ('veo3', 'kling', 'runway', 'pika', 'midjourney', 'generic');
create type subscription_plan_type as enum ('creator', 'pro');
create type subscription_detail_status_type as enum ('active', 'cancelled', 'past_due', 'trialing');

-- ============================================================
-- USERS TABLE (extends auth.users)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  plan plan_type not null default 'free',
  scripts_used_this_month integer not null default 0,
  stripe_customer_id text,
  razorpay_customer_id text,
  payment_provider payment_provider_type,
  subscription_status subscription_status_type not null default 'none',
  subscription_ends_at timestamptz,
  preferred_platform text,
  preferred_ai_tool text,
  preferred_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SCRIPTS TABLE
-- ============================================================
create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  concept text not null check (char_length(concept) <= 500),
  title text not null,
  duration video_duration_type not null,
  platform platform_type not null,
  visual_style visual_style_type not null,
  ai_tool ai_tool_type not null,
  scene_count integer not null,
  is_favorite boolean not null default false,
  is_public boolean not null default false,
  share_slug text unique,
  generation_time_ms integer,
  model_used text,
  created_at timestamptz not null default now()
);

create index scripts_user_id_idx on public.scripts(user_id);
create index scripts_share_slug_idx on public.scripts(share_slug) where share_slug is not null;

-- ============================================================
-- SCENES TABLE
-- ============================================================
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references public.scripts(id) on delete cascade,
  scene_number integer not null,
  duration_seconds integer not null,
  visual_description text not null,
  camera_direction text not null,
  voiceover_text text,
  onscreen_text text,
  ai_generation_prompt text not null,
  suggested_music text,
  transition text
);

create index scenes_script_id_idx on public.scenes(script_id);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider payment_provider_type not null,
  provider_subscription_id text not null,
  plan subscription_plan_type not null,
  status subscription_detail_status_type not null,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.scripts enable row level security;
alter table public.scenes enable row level security;
alter table public.subscriptions enable row level security;

-- users policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- scripts policies
create policy "Users can view own scripts"
  on public.scripts for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own scripts"
  on public.scripts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scripts"
  on public.scripts for update
  using (auth.uid() = user_id);

create policy "Users can delete own scripts"
  on public.scripts for delete
  using (auth.uid() = user_id);

-- scenes policies
create policy "Users can view scenes of own scripts"
  on public.scenes for select
  using (
    exists (
      select 1 from public.scripts
      where scripts.id = scenes.script_id
        and (scripts.user_id = auth.uid() or scripts.is_public = true)
    )
  );

create policy "Users can insert scenes for own scripts"
  on public.scenes for insert
  with check (
    exists (
      select 1 from public.scripts
      where scripts.id = scenes.script_id
        and scripts.user_id = auth.uid()
    )
  );

create policy "Users can delete scenes of own scripts"
  on public.scenes for delete
  using (
    exists (
      select 1 from public.scripts
      where scripts.id = scenes.script_id
        and scripts.user_id = auth.uid()
    )
  );

-- subscriptions policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- MONTHLY USAGE RESET (scheduled via pg_cron or Supabase cron)
-- Run: SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *', 'UPDATE public.users SET scripts_used_this_month = 0');
-- ============================================================
