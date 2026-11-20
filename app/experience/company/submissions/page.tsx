import { redirect } from "next/navigation";
import { reviewSubmission } from "@/lib/actions/experience";
import { requireSignedInUser } from "@/lib/auth";
import { safeHttpUrl } from "@/lib/experience";
import { Button } from "@/components/ui/button";

export default async function CompanySubmissionsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { supabase, userId } = await requireSignedInUser();
  const [{ data: profile }, { data: tasks, error: taskError }] = await Promise.all([supabase.from("profiles").select("role").eq("id", userId).maybeSingle(), supabase.from("tasks").select("id,title,company_id").order("created_at", { ascending: false })]);
  if (profile?.role !== "company" && profile?.role !== "admin") redirect("/experience");
  if (taskError) throw new Error("Couldn’t load company tasks.");
  const taskIds = tasks.map((task) => task.id);
  const { data: submissions, error } = taskIds.length ? await supabase.from("submissions").select("*").in("task_id", taskIds).order("created_at", { ascending: false }) : { data: [], error: null };
  if (error) throw new Error("Couldn’t load submissions.");
  const query = await searchParams;
  const taskById = new Map(tasks.map((task) => [task.id, task] as const));
  return <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">COMPANY · Reviews</p><h1 className="mt-3 text-3xl font-semibold">Student submissions</h1><p className="mt-2 text-muted-foreground">Review work submitted to tasks owned by your company.</p>{query.saved && <p className="mt-4 rounded-xl border bg-accent p-3 text-sm" role="status">Review saved.</p>}{query.error && <p className="mt-4 rounded-xl border border-destructive/30 p-3 text-sm text-destructive" role="alert">Couldn’t save the review. Check the feedback and score, then try again.</p>}{submissions.length === 0 ? <div className="mt-8 rounded-xl border border-dashed p-9 text-center"><h2 className="font-semibold">No submissions yet</h2><p className="mt-2 text-sm text-muted-foreground">Student work for your tasks will show up here.</p></div> : <div className="mt-8 grid gap-5">{submissions.map((submission) => { const task = taskById.get(submission.task_id); const deliverableUrl = safeHttpUrl(submission.link_url); return <article className="rounded-xl border p-5 sm:p-7" key={submission.id}><p className="text-sm text-primary">{task?.title ?? "Company task"} · {submission.status}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{submission.content}</p>{deliverableUrl && <a className="mt-3 inline-block text-sm text-primary underline" href={deliverableUrl} rel="noreferrer" target="_blank">Open deliverable<span className="sr-only"> (opens in a new tab)</span></a>}<form action={reviewSubmission} className="mt-5 grid gap-3 border-t pt-5 sm:grid-cols-[1fr_8rem_auto]"><input name="submission_id" type="hidden" value={submission.id}/><label className="grid gap-2 text-sm">Feedback<textarea className="min-h-20 rounded-xl border bg-background p-3" defaultValue={submission.feedback ?? ""} maxLength={3000} name="feedback" required/></label><label className="grid gap-2 text-sm">Score (0–100)<input className="h-11 rounded-xl border bg-background px-3" defaultValue={submission.score ?? ""} max="100" min="0" name="score" required type="number"/></label><Button className="self-end" type="submit">Save review</Button></form></article>; })}</div>}</section>;
}
