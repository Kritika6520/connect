"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSignedInUser } from "@/lib/auth";
import { openRoleSchema } from "@/lib/teams";
import type { JoinRequestStatus, Json } from "@/lib/supabase/database.types";

const rolesFromText = z
  .string()
  .trim()
  .max(1200)
  .transform((value) => [...new Set(value.split(/\n/).map((role) => role.trim()).filter(Boolean))])
  .pipe(z.array(z.string().min(1).max(60)).max(20))
  .transform((roles) => roles.map((title) => ({ title, description: "", skills: [] as string[] })))
  .pipe(z.array(openRoleSchema));

const teamFormSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(1).max(3000),
  ideaId: z.union([z.string().uuid(), z.literal("")]).transform((value) => value || null),
  openRoles: rolesFromText,
  sizeLimit: z.string().regex(/^([2-9]|[1-4][0-9]|50)$/).transform(Number).pipe(z.number().int().min(2).max(50)),
});

const joinRequestSchema = z.object({
  teamId: z.string().uuid(),
  message: z.string().trim().max(1000),
});

const reviewSchema = z.object({
  teamId: z.string().uuid(),
  requestId: z.string().uuid(),
  decision: z.enum(["accepted", "rejected"]),
});

const removeMemberSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
});

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createTeam(formData: FormData) {
  const parsed = teamFormSchema.safeParse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    ideaId: formString(formData, "idea_id"),
    openRoles: formString(formData, "open_roles"),
    sizeLimit: formString(formData, "size_limit"),
  });
  if (!parsed.success) redirect("/build/teams/new?error=invalid");

  const { supabase, userId } = await requireSignedInUser();
  const roles = parsed.data.openRoles as Json;
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      idea_id: parsed.data.ideaId,
      owner_id: userId,
      open_roles: roles,
      size_limit: parsed.data.sizeLimit,
    })
    .select("id")
    .single();
  if (error) redirect("/build/teams/new?error=save");

  revalidatePath("/build/teams");
  redirect(`/build/teams/${data.id}`);
}

export async function requestToJoinTeam(formData: FormData) {
  const parsed = joinRequestSchema.safeParse({
    teamId: formString(formData, "team_id"),
    message: formString(formData, "message"),
  });
  if (!parsed.success) redirect("/build/teams?error=invalid");

  const { supabase, userId } = await requireSignedInUser();
  const { error } = await supabase.from("join_requests").insert({
    team_id: parsed.data.teamId,
    user_id: userId,
    message: parsed.data.message,
  });
  if (error) {
    const errorCode = error.code === "23505" ? "duplicate" : error.code === "42501" ? "closed" : "request";
    redirect(`/build/teams/${parsed.data.teamId}?error=${errorCode}`);
  }

  revalidatePath(`/build/teams/${parsed.data.teamId}`);
  redirect(`/build/teams/${parsed.data.teamId}?requested=1`);
}

export async function reviewJoinRequest(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    teamId: formString(formData, "team_id"),
    requestId: formString(formData, "request_id"),
    decision: formString(formData, "decision"),
  });
  if (!parsed.success) redirect("/build/teams?error=review");

  const { supabase } = await requireSignedInUser();
  const { error } = await supabase.rpc("handle_team_join_request", {
    p_request_id: parsed.data.requestId,
    p_decision: parsed.data.decision as JoinRequestStatus,
  });
  if (error) {
    const reason = error.message.includes("full") ? "full" : "review";
    redirect(`/build/teams/${parsed.data.teamId}?error=${reason}`);
  }

  revalidatePath("/build/teams");
  revalidatePath(`/build/teams/${parsed.data.teamId}`);
  revalidatePath("/build/people");
  redirect(`/build/teams/${parsed.data.teamId}?reviewed=1`);
}

export async function removeTeamMember(formData: FormData) {
  const parsed = removeMemberSchema.safeParse({
    teamId: formString(formData, "team_id"),
    userId: formString(formData, "user_id"),
  });
  if (!parsed.success) redirect("/build/teams?error=remove");

  const { supabase } = await requireSignedInUser();
  const { data, error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", parsed.data.teamId)
    .eq("user_id", parsed.data.userId)
    .eq("role", "member")
    .select("user_id")
    .maybeSingle();
  if (error || !data) redirect(`/build/teams/${parsed.data.teamId}?error=remove`);

  revalidatePath("/build/teams");
  revalidatePath(`/build/teams/${parsed.data.teamId}`);
  revalidatePath("/build/people");
  redirect(`/build/teams/${parsed.data.teamId}?removed=1`);
}
