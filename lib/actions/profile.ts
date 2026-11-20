"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSignedInUser } from "@/lib/auth";

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).transform((value) => value.length > 0 ? value : null);

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, "Enter a valid URL.")
  .refine((value) => value.length === 0 || /^https?:\/\//i.test(value), "Use an http or https URL.")
  .transform((value) => value || null);

const tagList = z
  .string()
  .max(1000)
  .transform((value) => [...new Set(value.split(/[\n,]/).map((tag) => tag.trim()).filter(Boolean))])
  .pipe(z.array(z.string().min(1).max(40)).max(20));

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(80),
  username: z.string().trim().toLowerCase().min(3).max(24).regex(/^[a-z0-9_]+$/),
  college: optionalText(120),
  education: optionalText(120),
  bio: optionalText(500),
  skills: tagList,
  interests: tagList,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  availability: z.enum(["open_to_work", "open_to_projects", "not_looking", ""])
    .transform((value) => value || null),
  avatarUrl: optionalUrl,
  intent: z.enum(["onboarding", "edit"]),
});

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveProfile(formData: FormData) {
  const input = profileSchema.safeParse({
    fullName: formString(formData, "full_name"),
    username: formString(formData, "username"),
    college: formString(formData, "college"),
    education: formString(formData, "education"),
    bio: formString(formData, "bio"),
    skills: formString(formData, "skills"),
    interests: formString(formData, "interests"),
    githubUrl: formString(formData, "github_url"),
    linkedinUrl: formString(formData, "linkedin_url"),
    portfolioUrl: formString(formData, "portfolio_url"),
    availability: formString(formData, "availability"),
    avatarUrl: formString(formData, "avatar_url"),
    intent: formString(formData, "intent"),
  });

  const intent = formString(formData, "intent");
  const errorPath = intent === "onboarding" ? "/onboarding" : "/profile/edit";
  if (!input.success) redirect(`${errorPath}?error=invalid`);

  const { supabase, userId } = await requireSignedInUser();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.data.fullName,
      username: input.data.username,
      college: input.data.college,
      education: input.data.education,
      bio: input.data.bio,
      skills: input.data.skills,
      interests: input.data.interests,
      github_url: input.data.githubUrl,
      linkedin_url: input.data.linkedinUrl,
      portfolio_url: input.data.portfolioUrl,
      availability: input.data.availability,
      avatar_url: input.data.avatarUrl,
    })
    .eq("id", userId)
    .select("username")
    .single();

  if (error) {
    redirect(`${errorPath}?error=${error.code === "23505" ? "username-taken" : "save"}`);
  }

  redirect(`/u/${data.username}?saved=1`);
}
