import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { PLAN_PRICES_INR } from "@/lib/constants";
import type { SubscriptionPlan } from "@/types/database";

const PAISE_PER_RUPEE = 100;

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("[create-order] Missing Razorpay env vars");
    return NextResponse.json(
      { error: "Payment system not configured. Contact support." },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan as SubscriptionPlan;

    if (!["creator", "studio", "agency"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 422 });
    }

    // Monthly is the only cycle sold; any billingCycle in the body is ignored.
    const monthlyPrice = PLAN_PRICES_INR[plan];
    if (!monthlyPrice || monthlyPrice <= 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 422 });
    }

    const amountPaise = monthlyPrice * PAISE_PER_RUPEE;
    const receipt = `sf_${user.id.slice(0, 8)}_${Date.now()}`;

    const order = await createRazorpayOrder(amountPaise, receipt);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    console.error("[create-order]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
