import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay/client";
import { CREDIT_PACKS, CREDITS_PER_PACK_VIDEO } from "@/lib/constants";
import { addPurchasedCredits } from "@/lib/credits/credits";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json() as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      pack_id: string;
    };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pack_id } = body;

    const valid = await verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!valid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    const pack = CREDIT_PACKS.find((p) => p.id === pack_id);
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 422 });

    const admin = createAdminClient();

    // Packs are sold in whole videos; renders are charged in credits. One video
    // converts at 8 credits, which covers a Veo 3.1 Lite render at 720p for the
    // full 8 seconds — the same rate migration 010 used to convert existing
    // balances, so a pack buys no less than it did before.
    const creditsToAdd = pack.videos * CREDITS_PER_PACK_VIDEO;

    // Keyed on the payment id so a duplicated verify call cannot credit twice.
    const newBalance = await addPurchasedCredits(
      admin,
      user.id,
      creditsToAdd,
      razorpay_payment_id
    );

    if (newBalance === null) {
      // Credit system unavailable (migration 010 not applied). Fall back to the
      // legacy counter so a paid-for pack is never silently lost.
      const { data: profile } = await admin
        .from("users")
        .select("video_credits")
        .eq("id", user.id)
        .single();
      const current = (profile?.video_credits as number) ?? 0;
      await admin
        .from("users")
        .update({ video_credits: current + pack.videos })
        .eq("id", user.id);
      console.warn("[credits/razorpay/verify] credited legacy video_credits — credit system unavailable");
      return NextResponse.json({ success: true, credits_added: pack.videos, new_balance: current + pack.videos });
    }

    return NextResponse.json({
      success: true,
      credits_added: creditsToAdd,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("[credits/razorpay/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
