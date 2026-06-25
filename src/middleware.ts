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

  // getSession() reads the JWT from the cookie without a remote call — fast.
  // API routes do their own auth with getUser(); no need to double-check here.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

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
    // Skip static files, images, and API routes (they handle their own auth)
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
