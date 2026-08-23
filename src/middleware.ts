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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the token with Supabase Auth server — required so a
  // freshly-set OAuth session (PKCE) is visible on the very next request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const origin = request.nextUrl.origin;

  // Protect /dashboard/* routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!user.email_confirmed_at) {
      return NextResponse.redirect(new URL("/verify-email", origin));
    }
  }

  // Redirect authenticated+verified users away from auth pages
  if (user && user.email_confirmed_at) {
    if (
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/verify-email"
    ) {
      return NextResponse.redirect(new URL("/dashboard", origin));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip static files, images, API routes, and auth callback
    // Auth callback must be excluded so middleware never touches the PKCE
    // code_verifier cookie before exchangeCodeForSession() consumes it.
    "/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
