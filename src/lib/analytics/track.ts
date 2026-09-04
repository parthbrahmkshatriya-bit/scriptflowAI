export type ScriptEventType =
  | "prompt_copied"
  | "all_prompts_copied"
  | "share_link_copied"
  | "video_generated"
  | "video_downloaded";

interface TrackPayload {
  script_id?: string | null;
  scene_id?: string | null;
  ai_tool?: string | null;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Record a script usage event.
 *
 * Deliberately un-awaited and never throws: copying a prompt must succeed even
 * if analytics is down, the migration has not been run, or the user is offline.
 * Uses sendBeacon where available so the event still lands if the click also
 * navigates away.
 */
export function trackScriptEvent(
  event_type: ScriptEventType,
  payload: TrackPayload = {}
): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({ event_type, ...payload });

  try {
    if (typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(
        "/api/events",
        new Blob([body], { type: "application/json" })
      );
      if (ok) return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let instrumentation break the action it is measuring.
  }
}
