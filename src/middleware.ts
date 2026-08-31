import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild supabaseResponse so refreshed tokens are included in its
          // Set-Cookie headers — required by @supabase/ssr to keep sessions alive.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any logic between createServerClient and getUser().
  // getUser() validates the JWT with the Supabase Auth server and may refresh
  // the access token, which triggers setAll() above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  // Helper: redirect while carrying the session cookies from supabaseResponse.
  // Without this, any token refresh done by getUser() above is silently dropped
  // and the browser session goes out of sync — causing the double-login loop.
  function redirectTo(url: URL): NextResponse {
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirect;
  }

  // Protect /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return redirectTo(loginUrl);
    }

    // Only block unconfirmed email/password users — OAuth users (Google, etc.)
    // always have email_confirmed_at set by Supabase, but check identity provider
    // so we never accidentally lock out a Google user on a slow Supabase write.
    const isOAuthUser = user.app_metadata?.provider !== "email";
    if (!isOAuthUser && !user.email_confirmed_at) {
      return redirectTo(new URL("/verify-email", origin));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user) {
    const isEmailUser = user.app_metadata?.provider === "email";
    const isVerified = !isEmailUser || !!user.email_confirmed_at;

    if (isVerified && (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/verify-email"
    )) {
      return redirectTo(new URL("/dashboard", origin));
    }
  }

  // IMPORTANT: must return supabaseResponse as-is so Set-Cookie headers
  // (from a token refresh) reach the browser. Never create a new NextResponse
  // here without copying supabaseResponse.cookies onto it.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip static files, images, API routes, and auth callback.
    // Auth callback must be excluded so middleware never intercepts the PKCE
    // code_verifier cookie before exchangeCodeForSession() consumes it.
    "/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
