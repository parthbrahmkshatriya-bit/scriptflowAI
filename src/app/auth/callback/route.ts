import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

/**
 * Resolve the public-facing origin.
 *
 * Behind Vercel's proxy `request.url` can carry the internal deployment host
 * rather than the host the browser is actually on. Setting session cookies for
 * the wrong host means the browser never sends them back — the user lands on
 * /dashboard with no session and gets bounced to /login.
 */
function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

/** Only allow same-site relative paths — blocks open-redirect via ?redirect=. */
function safePath(value: string | null): string {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const origin = getPublicOrigin(request);
  const redirect = safePath(searchParams.get("redirect"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const isEmailConfirm = type === "email_confirm";

  // After email confirmation: land on dashboard (already signed in from the exchange).
  // After OAuth / magic link: go to the originally requested page.
  const destination = isEmailConfirm ? "/dashboard" : redirect;
  const response = NextResponse.redirect(`${origin}${destination}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Verify the exchange actually produced a session before sending the browser
  // on to a protected route. Without this a silent failure looks identical to a
  // success and the user is bounced back to /login with no explanation.
  if (!data.session) {
    console.error("[auth/callback] exchange returned no session");
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Send welcome email for new signups (fire-and-forget, never block redirect)
  if (isEmailConfirm && data.user?.email) {
    sendWelcomeEmail({
      userEmail: data.user.email,
      userName: data.user.user_metadata?.full_name ?? null,
    }).catch(() => {});
  }

  return response;
}
