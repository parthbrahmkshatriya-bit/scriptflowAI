import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
      billingCycle,
    }: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan: SubscriptionPlan;
      billingCycle?: "monthly" | "annual";
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
    const daysToAdd = billingCycle === "annual" ? 365 : 30;
    const periodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

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

    await admin
      .from("users")
      .update({
        plan,
        payment_provider: "razorpay",
        subscription_status: "active",
        subscription_ends_at: periodEnd.toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-payment] error:", err);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
