import { createAdminClient } from "@/lib/supabase/admin";

interface SecurityCheck {
  banned: boolean;
  reason?: string;
}

/**
 * Checks whether a user is banned.
 * Called at the top of every costly API route before doing any work.
 */
export async function checkUserSecurity(userId: string): Promise<SecurityCheck> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("is_banned, ban_reason")
    .eq("id", userId)
    .single();

  if (data?.is_banned) {
    return { banned: true, reason: data.ban_reason ?? "Your account has been suspended." };
  }
  return { banned: false };
}

/**
 * Persistent rate limiter for video generation — stored in DB so it survives
 * Vercel serverless cold starts. Window: 10 minutes, max 3 requests.
 *
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }
 */
const VIDEO_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const VIDEO_WINDOW_MAX = 3;

export async function checkVideoRateLimit(
  userId: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const admin = createAdminClient();
  const now = new Date();

  const { data: profile } = await admin
    .from("users")
    .select("video_rate_count, video_rate_window_start")
    .eq("id", userId)
    .single();

  const windowStart = profile?.video_rate_window_start
    ? new Date(profile.video_rate_window_start)
    : null;
  const count = profile?.video_rate_count ?? 0;
  const windowExpired = !windowStart || now.getTime() - windowStart.getTime() > VIDEO_WINDOW_MS;

  if (windowExpired) {
    // Start a fresh window
    await admin
      .from("users")
      .update({ video_rate_count: 1, video_rate_window_start: now.toISOString() })
      .eq("id", userId);
    return { allowed: true };
  }

  if (count >= VIDEO_WINDOW_MAX) {
    const resetAt = windowStart!.getTime() + VIDEO_WINDOW_MS;
    const retryAfterSeconds = Math.ceil((resetAt - now.getTime()) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  await admin
    .from("users")
    .update({ video_rate_count: count + 1 })
    .eq("id", userId);
  return { allowed: true };
}
