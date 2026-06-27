import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPayPalOrder } from "@/lib/paypal/client";
import { CREDIT_PACKS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { pack_id } = await request.json() as { pack_id: string };
    const pack = CREDIT_PACKS.find((p) => p.id === pack_id);
    if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 422 });

    const orderId = await createPayPalOrder(pack.usdDisplay, pack.id);
    return NextResponse.json({ order_id: orderId });
  } catch (err) {
    console.error("[credits/paypal/create-order]", err);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}
