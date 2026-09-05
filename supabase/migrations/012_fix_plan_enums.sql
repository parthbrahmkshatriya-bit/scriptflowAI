-- Add the missing plan values, then provision credits.
--
-- plan_type was created in 001 as ('free','creator','pro') and
-- subscription_plan_type as ('creator','pro'). Migration 003 was meant to add
-- 'studio' and 'agency' but never took effect on this database — 011 failed
-- with "invalid input value for enum plan_type: studio", which proves it.
--
-- The consequence is worse than a failed migration. /api/payment/verify writes
-- the purchased plan to both users.plan and subscriptions.plan without checking
-- the result, so a Studio or Agency purchase raised an enum error, was
-- swallowed, and the route still returned success. Those customers paid and
-- stayed on their previous plan.
--
-- ===========================================================================
-- RUN THIS FILE IN TWO STEPS.
--
-- Postgres will not let a newly added enum value be USED in the same
-- transaction that adds it, and the Supabase SQL editor runs a script as one
-- transaction. Running the whole file at once fails on the UPDATE at the end.
--
--   STEP 1 — select and run ONLY the block marked STEP 1, then stop.
--   STEP 2 — select and run the rest.
-- ===========================================================================


-- ===========================================================================
-- STEP 1 — run this block on its own first
-- ===========================================================================

ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'studio';
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'agency';

ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'studio';
ALTER TYPE subscription_plan_type ADD VALUE IF NOT EXISTS 'agency';

-- Confirm before continuing — both should list free, creator, pro, studio, agency:
--   SELECT t.typname, e.enumlabel
--     FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
--    WHERE t.typname IN ('plan_type','subscription_plan_type')
--    ORDER BY t.typname, e.enumsortorder;


-- ===========================================================================
-- STEP 2 — run everything below after step 1 has committed
-- ===========================================================================

-- Provision credits for existing subscribers. Same amounts as 011, which could
-- not complete because the enum rejected 'studio'.
UPDATE public.users
   SET credit_balance    = credit_balance + CASE plan::text
         WHEN 'creator' THEN 60
         WHEN 'studio'  THEN 220
         WHEN 'pro'     THEN 700
         WHEN 'agency'  THEN 700
         ELSE 0 END,
       credits_from_plan = CASE plan::text
         WHEN 'creator' THEN 60
         WHEN 'studio'  THEN 220
         WHEN 'pro'     THEN 700
         WHEN 'agency'  THEN 700
         ELSE 0 END,
       plan_grant_period = date_trunc('month', now())
 WHERE plan::text IN ('creator', 'studio', 'pro', 'agency')
   AND plan_grant_period IS NULL;

INSERT INTO public.credit_ledger (user_id, delta, balance_after, reason, metadata)
SELECT id, credits_from_plan, credit_balance, 'plan_grant',
       jsonb_build_object('migration', '012', 'reason', 'initial provisioning')
  FROM public.users
 WHERE credits_from_plan > 0
   AND plan_grant_period = date_trunc('month', now());

-- ===========================================================================
-- AFTERWARDS — check whether any customer was affected by the silent failure.
--
-- A paid subscription whose user row still says 'free' or 'creator' is someone
-- who bought a higher tier and never received it. Correct those manually; the
-- subscriptions row records what they actually paid for.
--
--   SELECT u.email, u.plan AS current_plan, s.plan AS paid_for,
--          s.status, s.current_period_end, s.created_at
--     FROM public.subscriptions s
--     JOIN public.users u ON u.id = s.user_id
--    WHERE s.status = 'active'
--      AND u.plan::text <> s.plan::text
--    ORDER BY s.created_at DESC;
--
-- To correct one, and grant the credits that go with it:
--
--   UPDATE public.users SET plan = 'studio' WHERE email = '...';
--   SELECT public.grant_plan_credits(
--     (SELECT id FROM public.users WHERE email = '...'), 220);
-- ===========================================================================
