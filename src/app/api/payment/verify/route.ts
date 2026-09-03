import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BILLING_CYCLE_DAYS } from "@/lib/constants";
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

    await admin.from("subscriptions").insert({
      user_id: user.id,
      provider: "razorpay",
      provider_subscription_id: razorpay_payment_id,
      plan,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    });

    // Update user plan + reset video usage so they start fresh on the new plan
    await admin
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-payment] error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
