import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";

export async function updateSession(request: NextRequest) {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = getSupabasePublicEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        if (headers) Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isProtectedPath = /^\/(onboarding|profile)(\/|$)/.test(request.nextUrl.pathname)
    || request.nextUrl.pathname === "/build/ideas"
    || request.nextUrl.pathname === "/build/ideas/new"
    || request.nextUrl.pathname === "/build/people"
    || request.nextUrl.pathname === "/build/teams/new";
  const isAuthenticated = typeof data?.claims?.sub === "string";

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    ["cache-control", "expires", "pragma"].forEach((header) => {
      const value = response.headers.get(header);
      if (value) redirectResponse.headers.set(header, value);
    });
    return redirectResponse;
  }

  return response;
}
