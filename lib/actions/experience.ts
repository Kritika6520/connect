"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSignedInUser } from "@/lib/auth";

const submissionSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().trim().min(1).max(10000),
  linkUrl: z.union([z.literal(""), z.string().url().max(500).refine((value) => /^https?:\/\//i.test(value), "Use an http or https link.")]),
});

const reviewSchema = z.object({
  submissionId: z.string().uuid(),
  feedback: z.string().trim().min(1).max(3000),
  score: z.string().regex(/^(100|[1-9]?\d)$/).transform(Number).pipe(z.number().int().min(0).max(100)),
});

const taskSchema = z.object({
  companyId: z.string().uuid(), title: z.string().trim().min(3).max(160), description: z.string().trim().min(1).max(5000),
  domain: z.string().trim().min(2).max(80), role: z.string().trim().min(2).max(80),
  skills: z.string().trim().max(500).transform((value) => [...new Set(value.split(/[\n,]/).map((skill) => skill.trim()).filter(Boolean))]).pipe(z.array(z.string().min(1).max(40)).max(20)),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]), estHours: z.string().regex(/^\d{1,3}$/).transform(Number).pipe(z.number().int().min(1).max(500)),
  deadline: z.union([z.literal(""), z.string().date()]), deliverables: z.string().trim().min(1).max(3000), evaluationCriteria: z.string().trim().min(1).max(3000),
});

export async function createExperienceTask(formData: FormData) {
  const parsed = taskSchema.safeParse({ companyId: formData.get("company_id"), title: formData.get("title"), description: formData.get("description"), domain: formData.get("domain"), role: formData.get("role"), skills: formData.get("skills"), difficulty: formData.get("difficulty"), estHours: formData.get("est_hours"), deadline: formData.get("deadline"), deliverables: formData.get("deliverables"), evaluationCriteria: formData.get("evaluation_criteria") });
  if (!parsed.success) redirect("/experience/tasks/new?error=invalid");
  const { supabase, userId } = await requireSignedInUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role !== "company" && profile?.role !== "admin") redirect("/experience/tasks/new?error=role");
  const { data, error } = await supabase.from("tasks").insert({ company_id: parsed.data.companyId, title: parsed.data.title, description: parsed.data.description, domain: parsed.data.domain, role: parsed.data.role, skills: parsed.data.skills, difficulty: parsed.data.difficulty, est_hours: parsed.data.estHours, deadline: parsed.data.deadline || null, deliverables: parsed.data.deliverables, evaluation_criteria: parsed.data.evaluationCriteria }).select("id").single();
  if (error) redirect("/experience/tasks/new?error=save");
  revalidatePath("/experience/tasks");
  redirect(`/experience/tasks/${data.id}`);
}

export async function reviewSubmission(formData: FormData) {
  const parsed = reviewSchema.safeParse({ submissionId: formData.get("submission_id"), feedback: formData.get("feedback"), score: formData.get("score") });
  if (!parsed.success) redirect("/experience/company/submissions?error=invalid");
  const { supabase, userId } = await requireSignedInUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role !== "company" && profile?.role !== "admin") redirect("/experience/company/submissions?error=role");
  const { error } = await supabase.from("submissions").update({ status: "reviewed", feedback: parsed.data.feedback, score: parsed.data.score }).eq("id", parsed.data.submissionId);
  if (error) redirect("/experience/company/submissions?error=save");
  revalidatePath("/experience/company/submissions");
  redirect("/experience/company/submissions?saved=1");
}

export async function submitTask(formData: FormData) {
  const rawTaskId = formData.get("task_id");
  const parsed = submissionSchema.safeParse({ taskId: rawTaskId, content: formData.get("content"), linkUrl: formData.get("link_url") });
  if (!parsed.success) {
    const taskId = z.string().uuid().safeParse(rawTaskId);
    redirect(taskId.success ? `/experience/tasks/${taskId.data}?error=invalid` : "/experience/tasks?error=invalid");
  }
  const { supabase, userId } = await requireSignedInUser();
  const { error } = await supabase.from("submissions").insert({
    task_id: parsed.data.taskId,
    user_id: userId,
    content: parsed.data.content,
    link_url: parsed.data.linkUrl || null,
  });
  if (error) redirect(`/experience/tasks/${parsed.data.taskId}?error=submit`);
  revalidatePath(`/experience/tasks/${parsed.data.taskId}`);
  redirect(`/experience/tasks/${parsed.data.taskId}?submitted=1`);
}
