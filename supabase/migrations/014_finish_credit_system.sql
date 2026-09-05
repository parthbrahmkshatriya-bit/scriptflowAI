-- STEP 2 OF 2 — run only after 013 has completed successfully.
--
-- Supersedes 011 and 012, which must NOT be run. Each failed partway and was
-- rolled back in full, so the column and function changes they contained were
-- never applied. Everything they were meant to do is repeated here, in an order
-- that works.
--
-- Migration 010 succeeded, so credit_balance, credits_from_plan, credit_ledger
-- and the four credit functions already exist. This file adds what 011 could
-- not, then provisions existing subscribers.
--
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Which period the current plan grant belongs to.
--    NULL means never granted, which is what makes first-use provisioning work.
-- ---------------------------------------------------------------------------

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan_grant_period timestamptz;

-- ---------------------------------------------------------------------------
-- 2. spend_credits — draw down plan credits before purchased ones.
--
--    Plan credits expire at period end and purchased credits do not, so a spend
--    must consume the expiring ones first. Without this, credits_from_plan
--    still records the size of the original grant, and the rollover below
--    subtracts more than is actually left — quietly eating credits the user
--    paid cash for.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.spend_credits(
  p_user_id    uuid,
  p_amount     integer,
  p_job_id     text    DEFAULT NULL,
  p_model_key  text    DEFAULT NULL,
  p_seconds    integer DEFAULT NULL,
  p_resolution text    DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'spend amount must be positive, got %', p_amount;
  END IF;

  UPDATE public.users
     SET credit_balance    = credit_balance - p_amount,
         credits_from_plan = GREATEST(0, credits_from_plan - p_amount)
   WHERE id = p_user_id
     AND credit_balance >= p_amount
  RETURNING credit_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RETURN -1;                       -- insufficient balance, nothing changed
  END IF;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, job_id, model_key, seconds, resolution)
  VALUES
    (p_user_id, -p_amount, v_new_balance, 'spend', p_job_id, p_model_key, p_seconds, p_resolution)
  ON CONFLICT DO NOTHING;

  RETURN v_new_balance;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. grant_plan_credits — expire only what remains, and stamp the period.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grant_plan_credits(
  p_user_id uuid,
  p_amount  integer
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_remaining   integer;
  v_new_balance integer;
BEGIN
  SELECT credits_from_plan INTO v_remaining FROM public.users WHERE id = p_user_id;
  IF v_remaining IS NULL THEN
    RETURN -1;
  END IF;

  UPDATE public.users
     SET credit_balance    = GREATEST(0, credit_balance - v_remaining) + p_amount,
         credits_from_plan = p_amount,
         plan_grant_period = date_trunc('month', now())
   WHERE id = p_user_id
  RETURNING credit_balance INTO v_new_balance;

  INSERT INTO public.credit_ledger
    (user_id, delta, balance_after, reason, metadata)
  VALUES
    (p_user_id, p_amount - v_remaining, v_new_balance, 'plan_grant',
     jsonb_build_object('expired_remainder', v_remaining, 'new_grant', p_amount));

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid,integer,text,text,integer,text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_plan_credits(uuid,integer)                   FROM public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Provision existing subscribers so they have a usable balance now, rather
--    than waiting for a render to trigger the grant.
--
--    plan is compared as text so this works whether or not the enum values from
--    013 are present — a database still missing them simply matches nothing.
-- ---------------------------------------------------------------------------

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
       jsonb_build_object('migration', '014', 'reason', 'initial provisioning')
  FROM public.users
 WHERE credits_from_plan > 0
   AND plan_grant_period = date_trunc('month', now());

-- ---------------------------------------------------------------------------
-- 5. Verification — one row, everything should read OK.
-- ---------------------------------------------------------------------------

SELECT
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'plan_type' AND e.enumlabel IN ('studio','agency'))        AS plan_enum_values,
  (SELECT count(*) FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'subscription_plan_type' AND e.enumlabel IN ('studio','agency')) AS sub_enum_values,
  (SELECT count(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users'
      AND column_name='plan_grant_period')                                       AS period_column,
  (SELECT count(*) FROM public.users WHERE credit_balance > 0)                   AS users_with_credits,
  (SELECT count(*) FROM public.credit_ledger)                                    AS ledger_rows;
-- Expect: 2, 2, 1, <number of paying users>, <same or more>
