import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay/client";
import { EARLY_BIRD_ACTIVE, EARLY_BIRD_PRICING, PRICING_INR } from "@/lib/constants";
import type { Plan } from "@/types/database";

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
    const plan = body.plan as Plan;

    if (plan !== "creator" && plan !== "pro") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 422 });
    }

    // Use early-bird pricing when the launch offer is active
    const amountINR = EARLY_BIRD_ACTIVE ? EARLY_BIRD_PRICING[plan].inr : PRICING_INR[plan];
    const amountPaise = amountINR * PAISE_PER_RUPEE;
    const receipt = `rcpt_${user.id.slice(0, 8)}_${Date.now()}`;

    const order = await createRazorpayOrder(amountPaise, receipt);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[create-order] error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
