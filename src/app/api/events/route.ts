import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Records what users do with a script after it is generated.
 *
 * Callers treat this as fire-and-forget: analytics must never block or fail a
 * copy, a download, or a render. Every failure path here returns 2xx-or-quiet
 * and logs server-side rather than surfacing an error to the UI.
 */

const EVENT_TYPES = [
  "prompt_copied",
  "all_prompts_copied",
  "share_link_copied",
  "video_generated",
  "video_downloaded",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

function isEventType(v: unknown): v is EventType {
  return typeof v === "string" && (EVENT_TYPES as readonly string[]).includes(v);
}

/** Guards against a malformed client sending something unbounded. */
function cleanMeta(meta: unknown): Record<string, unknown> | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta as Record<string, unknown>).slice(0, 10)) {
    if (typeof v === "string") out[k] = v.slice(0, 200);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Not an error worth surfacing — a signed-out client simply records nothing.
      return NextResponse.json({ recorded: false }, { status: 200 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !isEventType(body.event_type)) {
      return NextResponse.json({ recorded: false }, { status: 200 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("script_events").insert({
      user_id: user.id,
      script_id: typeof body.script_id === "string" ? body.script_id : null,
      scene_id: typeof body.scene_id === "string" ? body.scene_id : null,
      event_type: body.event_type,
      ai_tool: typeof body.ai_tool === "string" ? body.ai_tool.slice(0, 40) : null,
      metadata: cleanMeta(body.metadata),
    });

    if (error) {
      // Most likely the migration has not been run yet. Log it; do not let a
      // missing analytics table make a working feature look broken.
      console.warn("[events] insert failed:", error.message);
      return NextResponse.json({ recorded: false }, { status: 200 });
    }

    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.warn("[events] unexpected:", err instanceof Error ? err.message : err);
    return NextResponse.json({ recorded: false }, { status: 200 });
  }
}
