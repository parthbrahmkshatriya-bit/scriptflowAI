import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { PRICING_TIERS } from "@/lib/constants";
import type { SubscriptionPlan } from "@/types/database";

const PAISE_PER_RUPEE = 100;

export async function POST(request: Request) {
  // Fail fast if Razorpay credentials are missing
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("[create-order] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars");
    return NextResponse.json(
      { error: "Payment system not configured. Please contact support." },
      { status: 503 }
    );
  }

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
    const plan = body.plan as SubscriptionPlan;
    const billingCycle = (body.billingCycle ?? "monthly") as "monthly" | "annual";

    if (!["creator", "studio", "agency"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 422 });
    }

    const tier = PRICING_TIERS.find((t) => t.plan === plan);
    if (!tier) {
      return NextResponse.json({ error: "Plan not found" }, { status: 422 });
    }

    const amountINR = billingCycle === "annual" ? tier.inrAnnual : tier.inrMonthly;
    if (!amountINR || amountINR <= 0) {
      return NextResponse.json({ error: "Invalid plan amount" }, { status: 422 });
    }

    const amountPaise = amountINR * PAISE_PER_RUPEE;
    const receipt = `rcpt_${user.id.slice(0, 8)}_${Date.now()}`;

    const order = await createRazorpayOrder(amountPaise, receipt);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    // Extract meaningful error from Razorpay SDK response
    const rzpErr = err as { statusCode?: number; error?: { description?: string; code?: string } };
    const rzpMessage = rzpErr?.error?.description ?? rzpErr?.error?.code;
    console.error("[create-order] Razorpay error:", rzpErr?.statusCode, rzpMessage ?? err);

    const clientMessage = rzpMessage
      ? `Payment gateway error: ${rzpMessage}`
      : "Failed to create order. Please try again or contact support.";

    return NextResponse.json({ error: clientMessage }, { status: 500 });
  }
}
