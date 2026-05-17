-- ============================================================
-- Add studio and agency to plan_type enum
-- ============================================================
-- PostgreSQL requires each ADD VALUE in a separate statement
alter type plan_type add value if not exists 'studio';
alter type plan_type add value if not exists 'agency';

-- ============================================================
-- Fix updated_at trigger function name for video_generations
-- Migration 002 referenced update_updated_at_column() but the
-- project uses handle_updated_at(). Re-create trigger correctly.
-- ============================================================
drop trigger if exists video_generations_updated_at on public.video_generations;

create trigger video_generations_updated_at
  before update on public.video_generations
  for each row
  execute procedure public.handle_updated_at();

-- ============================================================
-- Test helper: set your own account to studio plan
-- Find your user ID in Supabase:
--   Dashboard → Authentication → Users → copy the UUID
-- Then run:
--
--   UPDATE public.users
--   SET plan = 'studio'
--   WHERE id = '<paste-your-uuid-here>';
--
-- Or by email (easier to find):
--
--   UPDATE public.users
--   SET plan = 'studio'
--   WHERE email = 'parth.brahmkshatriya@gmail.com';
-- ============================================================
