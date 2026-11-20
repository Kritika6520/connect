import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getSignedInUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string") return null;
  return { supabase, userId };
}

export async function requireSignedInUser() {
  const signedIn = await getSignedInUser();
  if (!signedIn) redirect("/login");
  return signedIn;
}

export async function getProfileDestination(userId: string, requestedPath?: string | null) {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile || !profile.username || !profile.full_name.trim()) return "/onboarding";
  return sanitizeInternalPath(requestedPath) ?? "/profile/edit";
}

export function sanitizeInternalPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}
