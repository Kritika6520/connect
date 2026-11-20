import { NextResponse, type NextRequest } from "next/server";
import { getProfileDestination, sanitizeInternalPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeInternalPath(request.nextUrl.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=callback", request.url));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/login?error=callback", request.url));

  const destination = await getProfileDestination(data.user.id, next);
  return NextResponse.redirect(new URL(destination, request.url));
}
