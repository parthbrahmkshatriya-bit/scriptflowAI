-- Add video_credits column to users table
-- Credits are purchased separately and have no expiry
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS video_credits integer NOT NULL DEFAULT 0;
