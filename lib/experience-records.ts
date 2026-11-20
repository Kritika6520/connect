import { createClient } from "@/lib/supabase/server";

export async function getReviewedExperience(userId: string) {
  const supabase = await createClient();
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("task_id, user_id, status, feedback, score, created_at")
    .eq("user_id", userId)
    .eq("status", "reviewed")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Couldn’t load experience records.");

  const taskIds = [...new Set(submissions.map((submission) => submission.task_id))];
  if (taskIds.length === 0) return { records: [], skills: [] as string[] };

  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, role, domain, skills, company_id")
    .in("id", taskIds);
  if (taskError) throw new Error("Couldn’t load tasks for experience records.");

  const companyIds = [...new Set(tasks.map((task) => task.company_id))];
  const { data: companies, error: companyError } = companyIds.length
    ? await supabase.from("companies").select("id, name").in("id", companyIds)
    : { data: [], error: null };
  if (companyError) throw new Error("Couldn’t load companies for experience records.");

  const taskById = new Map(tasks.map((task) => [task.id, task] as const));
  const companyById = new Map(companies.map((company) => [company.id, company] as const));
  const records = submissions.flatMap((submission) => {
    const task = taskById.get(submission.task_id);
    if (!task) return [];
    return [{
      ...submission,
      title: task.title,
      role: task.role,
      domain: task.domain,
      skills: task.skills,
      companyName: companyById.get(task.company_id)?.name ?? "CONNECT company",
    }];
  });
  const skills = [...new Set(records.flatMap((record) => record.skills))].sort((a, b) => a.localeCompare(b));
  return { records, skills };
}

export function formatExperienceDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
