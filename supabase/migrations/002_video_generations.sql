-- ============================================================
-- VIDEO GENERATIONS TABLE
-- ============================================================

create type video_generation_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

create table public.video_generations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  scene_id        uuid not null references public.scenes(id) on delete cascade,
  tool            text not null default 'kling',
  status          video_generation_status not null default 'pending',
  fal_request_id  text,
  video_url       text,
  credits_used    integer not null default 1,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create trigger video_generations_updated_at
  before update on public.video_generations
  for each row
  execute function update_updated_at_column();

-- Indexes
create index idx_video_generations_user_id  on public.video_generations(user_id);
create index idx_video_generations_scene_id on public.video_generations(scene_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.video_generations enable row level security;

-- Users can read their own generations
create policy "Users can view own video generations"
  on public.video_generations
  for select
  using (auth.uid() = user_id);

-- Users can insert their own generations (API route writes with user session)
create policy "Users can insert own video generations"
  on public.video_generations
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own generations (API route updates status/video_url)
create policy "Users can update own video generations"
  on public.video_generations
  for update
  using (auth.uid() = user_id);
