"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getProfileDestination, sanitizeInternalPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const signUpSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  next: z.string().optional(),
});

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function getOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    fullName: formString(formData, "full_name"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) redirect("/signup?error=invalid");

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=%2Fonboarding`,
    },
  });

  if (error) redirect("/signup?error=auth");
  if (!data.session) redirect("/login?notice=check-email");
  if (!data.user) redirect("/signup?error=auth");
  redirect(await getProfileDestination(data.user.id));
}

export async function signIn(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
    next: formString(formData, "next"),
  });
  if (!parsed.success) redirect("/login?error=invalid");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) redirect("/login?error=auth");
  if (!data.user) redirect("/login?error=auth");
  redirect(await getProfileDestination(data.user.id, sanitizeInternalPath(parsed.data.next)));
}

export async function signInWithGoogle(formData: FormData) {
  const next = sanitizeInternalPath(formString(formData, "next")) ?? "/profile/edit";
  const supabase = await createClient();
  const origin = await getOrigin();
  const redirectTo = new URL("/auth/callback", origin);
  redirectTo.searchParams.set("next", next);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectTo.toString() },
  });

  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?notice=signed-out");
}
