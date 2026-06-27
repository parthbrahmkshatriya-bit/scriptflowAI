import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/razorpay/client";
import { CREDIT_PACKS } from "@/lib/constants";

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

    return NextResponse.json({ success: true, credits_added: pack.videos, new_balance: current + pack.videos });
  } catch (err) {
    console.error("[credits/razorpay/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
