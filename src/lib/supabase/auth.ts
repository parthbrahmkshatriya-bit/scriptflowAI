import { cache } from "react";
import { createClient } from "./server";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the authenticated user for the current request, or null.
 *
 * WHY THIS EXISTS — do not bypass it in server components:
 * Supabase rotates refresh tokens on every refresh. If several server
 * components each call `supabase.auth.getUser()` independently, they each
 * attempt their own refresh; the first consumes the refresh token and the
 * rest present a token that has already been rotated, so their refresh
 * fails and getUser() returns null — bouncing a signed-in user to /login.
 *
 * Server components also cannot persist cookies (see server.ts setAll),
 * so a rotation that happens here is silently thrown away and the browser
 * is left holding a dead refresh token. That was the cause of the Google
 * OAuth "have to log in twice" loop.
 *
 * React's cache() dedupes this to exactly ONE getUser() call per request
 * render pass, shared by the layout and every nested page. Middleware
 * remains the only place that refreshes AND persists cookies.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
