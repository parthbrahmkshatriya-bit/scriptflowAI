import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const cookieStore = await cookies();

    // Capture cookies written by exchangeCodeForSession so we can
    // copy them onto the redirect response — NextResponse.redirect()
    // is a fresh Response that doesn't inherit next/headers mutations.
    const pendingCookies: Array<{
      name: string;
      value: string;
      options: Record<string, unknown>;
    }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies.push(...cookiesToSet);
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      let redirectUrl: string;

      if (type === "email_confirm") {
        await supabase.auth.signOut();
        redirectUrl = `${origin}/login?verified=true`;
      } else {
        redirectUrl = `${origin}${redirect}`;
      }

      const response = NextResponse.redirect(redirectUrl);

      // Write session cookies onto the redirect response so the browser
      // receives them before hitting /dashboard (where middleware checks auth).
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(
          name,
          value,
          options as Parameters<typeof response.cookies.set>[2]
        );
      });

      return response;
    }
  }

  // Code missing or exchange failed — send back to login
  return NextResponse.redirect(`${origin}/login`);
}
