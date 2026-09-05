-- STEP 1 OF 2 — run this file completely on its own, then run 014.
--
-- Supersedes 011 and 012, which must NOT be run. Both failed partway and
-- Postgres rolled each back in full, so nothing from either was applied.
--
-- Why this is a file by itself: Postgres refuses to use a newly added enum
-- value inside the transaction that added it, and the Supabase SQL editor
-- submits a whole script as one transaction. Mixing the ALTER TYPE statements
-- with anything that references 'studio' guarantees a rollback of both.
--
-- Nothing here depends on the credit system, so this file is safe to run first
-- and safe to re-run.

ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'studio';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'agency';

ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'studio';
ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'agency';
