/**
 * Pharmacquest — Supabase server client
 *
 * Used in Server Components, Route Handlers, and Server Actions to talk to
 * Supabase from the server side. Reads cookies via Next.js's cookies() helper
 * so it can identify the logged-in user.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies can only be modified
            // in Server Actions or Route Handlers. Safe to ignore here if
            // middleware is refreshing sessions.
          }
        },
      },
    }
  );
}