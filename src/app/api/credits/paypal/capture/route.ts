import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { capturePayPalOrder } from "@/lib/paypal/client";
import { CREDIT_PACKS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { order_id, pack_id } = await request.json() as { order_id: string; pack_id: string };
    const pack = CREDIT_PACKS.find((p) => p.id === pack_id);
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 422 });

    const capture = await capturePayPalOrder(order_id);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json({ error: `Payment not completed: ${capture.status}` }, { status: 400 });
    }

    // Verify the pack_id in the captured order matches what was requested
    if (capture.packId !== pack_id) {
      return NextResponse.json({ error: "Pack mismatch" }, { status: 400 });
    }

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
    console.error("[credits/paypal/capture]", err);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
