import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { PRICING_TIERS } from "@/lib/constants";
import type { SubscriptionPlan } from "@/types/database";

const PAISE_PER_RUPEE = 100;

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
    console.error("[create-order] error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
