-- Migration 004: Store generated video URL on scenes
ALTER TABLE public.scenes
  ADD COLUMN IF NOT EXISTS video_url TEXT;
