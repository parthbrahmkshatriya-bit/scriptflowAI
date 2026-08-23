-- Ban/suspend columns
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;

-- Video generation rate-limit window (persistent across serverless cold starts)
-- Tracks a rolling 10-minute window: up to 3 video requests per window per user
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS video_rate_count smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_rate_window_start timestamptz;

-- Script generation: last request timestamp for cooldown enforcement
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_script_at timestamptz;

-- Index for admin ban queries
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON public.users (is_banned) WHERE is_banned = true;
