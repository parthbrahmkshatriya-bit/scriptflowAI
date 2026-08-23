import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const isEmailConfirm = type === "email_confirm";

    // After email confirmation: land on dashboard (user is already signed in from exchangeCodeForSession).
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // Send welcome email for new signups (fire-and-forget, never block redirect)
    if (isEmailConfirm) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser?.email) {
        sendWelcomeEmail({
          userEmail: newUser.email,
          userName: newUser.user_metadata?.full_name ?? null,
        }).catch(() => {});
      }
    }

    return response;
  }

  return NextResponse.redirect(`${origin}/login`);
}
