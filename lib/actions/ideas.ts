"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ideaStageSchema } from "@/lib/ideas";
import { requireSignedInUser } from "@/lib/auth";

const skillsSchema = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => [...new Set(value.split(/[\n,]/).map((skill) => skill.trim()).filter(Boolean))])
  .pipe(z.array(z.string().min(1).max(40)).max(20));

const teamSizeSchema = z
  .string()
  .regex(/^([1-9]|[1-4][0-9]|50)$/)
  .transform(Number)
  .pipe(z.number().int().min(1).max(50));

const ideaFormSchema = z.object({
  id: z.union([z.string().uuid(), z.literal("")]).transform((value) => value || null),
  title: z.string().trim().min(3).max(120),
  problem: z.string().trim().min(1).max(3000),
  solution: z.string().trim().min(1).max(3000),
  targetUsers: z.string().trim().min(1).max(500),
  domain: z.string().trim().min(2).max(80),
  skillsNeeded: skillsSchema,
  teamSize: teamSizeSchema,
  stage: ideaStageSchema,
});

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveIdea(formData: FormData) {
  const parsed = ideaFormSchema.safeParse({
    id: formString(formData, "id"),
    title: formString(formData, "title"),
    problem: formString(formData, "problem"),
    solution: formString(formData, "solution"),
    targetUsers: formString(formData, "target_users"),
    domain: formString(formData, "domain"),
    skillsNeeded: formString(formData, "skills_needed"),
    teamSize: formString(formData, "team_size"),
    stage: formString(formData, "stage"),
  });

  if (!parsed.success) {
    const id = formString(formData, "id");
    redirect(id ? `/build/ideas/${encodeURIComponent(id)}?error=invalid` : "/build/ideas/new?error=invalid");
  }

  const { supabase, userId } = await requireSignedInUser();
  const values = {
    title: parsed.data.title,
    problem: parsed.data.problem,
    solution: parsed.data.solution,
    target_users: parsed.data.targetUsers,
    domain: parsed.data.domain,
    skills_needed: parsed.data.skillsNeeded,
    team_size: parsed.data.teamSize,
    stage: parsed.data.stage,
  };

  if (parsed.data.id) {
    const { data, error } = await supabase
      .from("ideas")
      .update(values)
      .eq("id", parsed.data.id)
      .eq("owner_id", userId)
      .select("id")
      .maybeSingle();
    if (error || !data) redirect(`/build/ideas/${parsed.data.id}?error=save`);
    revalidatePath("/build");
    revalidatePath("/build/ideas");
    revalidatePath("/build/explore");
    revalidatePath(`/build/ideas/${data.id}`);
    redirect(`/build/ideas/${data.id}?saved=1`);
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({ ...values, owner_id: userId })
    .select("id")
    .single();
  if (error) redirect("/build/ideas/new?error=save");
  revalidatePath("/build");
  revalidatePath("/build/ideas");
  revalidatePath("/build/explore");
  redirect(`/build/ideas/${data.id}`);
}
