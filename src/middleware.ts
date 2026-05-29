/**
 * Pharmacquest — Middleware
 *
 * Runs before every matching request. Two jobs:
 * 1. Refresh the Supabase session so logged-in users stay logged in
 * 2. Redirect unauthenticated users away from protected routes
 * 3. Redirect logged-in users with incomplete profiles to /welcome
 */

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

  // IMPORTANT: getUser() must be called immediately after creating the client.
  // It also refreshes the session token if it's near expiry.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes: require login.
  const protectedPaths = ["/play", "/profile", "/casebook", "/welcome"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isHome = pathname === "/";

  if ((isProtected || isHome) && !user) {
    if (isHome) {
      // Logged-out home is the public landing page. Allow through.
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "Please log in to continue");
    return NextResponse.redirect(url);
  }

  // If logged in but profile not yet completed, force them through /welcome.
  // Skip this check on /welcome itself (would cause infinite redirect) and
  // on auth pages.
  if (
    user &&
    !pathname.startsWith("/welcome") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/signup")
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_completed")
      .eq("id", user.id)
      .single();

    if (profile && !profile.profile_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

/**
 * The matcher controls which requests run through this middleware.
 * We exclude static assets and Next.js internals for performance.
 */
export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};