import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    // Build the redirect response first so we can attach session cookies directly
    // onto it. If we use next/headers cookies() + a separate NextResponse.redirect(),
    // the cookies end up on a different response object and are lost.
    const redirectUrl =
      type === "email_confirm"
        ? `${origin}/login?verified=true`
        : `${origin}${redirect}`;

    const response = NextResponse.redirect(redirectUrl);

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (type === "email_confirm") {
      // Fire owner notification — get user details before signing out
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser?.email) {
        sendWelcomeEmail({
          userEmail: newUser.email,
          userName: newUser.user_metadata?.full_name ?? null,
        }).catch(() => {}); // fire-and-forget, never block the redirect
      }

      await supabase.auth.signOut();
      // Clear session cookies on the response before redirecting to login
      response.cookies.getAll().forEach((c) => {
        if (c.name.startsWith("sb-")) response.cookies.delete(c.name);
      });
      return response;
    }

    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    return response;
  }

  return NextResponse.redirect(`${origin}/login`);
}
