import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILLING_CYCLE_DAYS } from "@/lib/constants";
import { grantPlanCredits } from "@/lib/credits/credits";
import type { SubscriptionPlan } from "@/types/database";

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billingCycle = "monthly",
    }: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan: SubscriptionPlan;
      // Typed loosely on purpose: a checkout begun before multi-month plans
      // were withdrawn still posts its original cycle here and must settle
      // with the period the customer actually paid for.
      billingCycle?: string;
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 422 });
    }

    if (!["creator", "studio", "agency"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 422 });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const days = BILLING_CYCLE_DAYS[billingCycle] ?? 30;
    const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { error: subError } = await admin.from("subscriptions").insert({
      user_id: user.id,
      provider: "razorpay",
      provider_subscription_id: razorpay_payment_id,
      plan,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    });

    if (subError) {
      // Recorded but not fatal — the plan upgrade below is what the customer
      // actually paid for, so it is still attempted.
      console.error(
        `[verify-payment] subscription insert failed for user=${user.id} plan=${plan} payment=${razorpay_payment_id}:`,
        subError.message
      );
    }

    // Update user plan + reset video usage so they start fresh on the new plan
    const { error: planError } = await admin
      .from("users")
      .update({
        plan,
        payment_provider: "razorpay",
        subscription_status: "active",
        subscription_ends_at: periodEnd.toISOString(),
        videos_used_this_month: 0,
        scripts_used_this_month: 0,
      })
      .eq("id", user.id);

    // This must never fail silently. It did once: plan_type lacked the 'studio'
    // and 'agency' values, so those upgrades raised an enum error that was
    // discarded while the route still answered success — customers paid and
    // stayed on their old plan. Surfacing it means a failure is visible in logs
    // and to the caller, with the payment id needed to reconcile it.
    if (planError) {
      console.error(
        `[verify-payment] PLAN UPGRADE FAILED — payment taken but plan not applied. ` +
        `user=${user.id} plan=${plan} payment=${razorpay_payment_id}:`,
        planError.message
      );
      return NextResponse.json(
        {
          error:
            "Payment received, but activating your plan failed. Contact support with your payment ID and it will be applied.",
          payment_id: razorpay_payment_id,
        },
        { status: 500 }
      );
    }

    // Issue the plan's credit allowance for the new period. Replaces any
    // previous grant, so an upgrade takes effect immediately rather than
    // stacking on the old tier's remainder.
    await grantPlanCredits(admin, user.id, plan);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-payment] error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
