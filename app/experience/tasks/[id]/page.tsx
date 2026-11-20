import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, Building2, Clock3 } from "lucide-react";
import { submitTask } from "@/lib/actions/experience";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function TaskDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const parsedId = z.string().uuid().safeParse((await params).id);
  if (!parsedId.success) notFound();
  const id = parsedId.data;
  const qs = await searchParams;
  const supabase = await createClient();
  const [{ data: task, error }, { data: claims }] = await Promise.all([supabase.from("tasks").select("*").eq("id", id).maybeSingle(), supabase.auth.getClaims()]);
  if (error) throw new Error("Couldn’t load this task.");
  if (!task) notFound();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  const [{ data: company, error: companyError }, { data: viewerProfile, error: profileError }] = await Promise.all([
    supabase.from("companies").select("id,name,industry,website").eq("id", task.company_id).maybeSingle(),
    userId ? supabase.from("profiles").select("role").eq("id", userId).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  const canSubmit = userId !== null && viewerProfile?.role === "student";
  const { data: existing, error: submissionError } = canSubmit
    ? await supabase.from("submissions").select("id,status,feedback,score").eq("task_id", id).eq("user_id", userId).maybeSingle()
    : { data: null, error: null };
  if (companyError || profileError || submissionError) throw new Error("Couldn’t load task information.");
  const err = typeof qs.error === "string" ? qs.error : "";
  return <article className="mx-auto max-w-4xl px-5 py-12 sm:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground" href="/experience/tasks"><ArrowLeft className="size-4"/>All tasks</Link><div className="mt-8 flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary">{task.domain}</span><span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">{task.difficulty}</span><span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock3 className="size-4"/>{task.est_hours} estimated hours</span></div><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{task.title}</h1>{company && <Link className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" href={`/experience/companies/${company.id}`}><Building2 className="size-4"/>{company.name} · {task.role}</Link>}<p className="mt-7 whitespace-pre-wrap leading-7 text-muted-foreground">{task.description}</p><div className="mt-8 grid gap-7 sm:grid-cols-2"><section><h2 className="font-semibold">Skills</h2><div className="mt-3 flex flex-wrap gap-2">{task.skills.map((skill) => <span className="rounded-full border px-3 py-1.5 text-sm" key={skill}>{skill}</span>)}</div></section><section><h2 className="font-semibold">Deliverables</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{task.deliverables}</p></section></div><section className="mt-8"><h2 className="font-semibold">How your work is evaluated</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{task.evaluation_criteria}</p>{task.deadline && <p className="mt-3 text-sm text-muted-foreground">Deadline: {task.deadline}</p>}</section><div className="my-10 border-t"/><h2 className="text-2xl font-semibold">Submit your work</h2>{typeof qs.submitted === "string" && <p className="mt-3 rounded-xl border border-primary/30 bg-accent p-4 text-sm">Your submission was received.</p>}{(err === "submit" || err === "invalid") && <p className="mt-3 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">We couldn’t save your submission. Please try again.</p>}{existing && <div className="mt-4 rounded-xl border p-4 text-sm"><p className="font-medium">Submission status: {existing.status}</p>{existing.score !== null && <p className="mt-1 text-muted-foreground">Score: {existing.score}/100</p>}{existing.feedback && <p className="mt-2 text-muted-foreground">{existing.feedback}</p>}</div>}{userId ? <form action={submitTask} className="mt-5 grid gap-4"><input name="task_id" type="hidden" value={id}/><label className="grid gap-2 text-sm font-medium" htmlFor="content">Tell the company about your work<textarea className="min-h-36 rounded-xl border bg-background p-3 font-normal" id="content" maxLength={10000} name="content" placeholder="Summarize your approach and what you learned…" required/></label><label className="grid gap-2 text-sm font-medium" htmlFor="link_url">Link to your deliverable <span className="font-normal text-muted-foreground">(optional)</span><input className="h-11 rounded-xl border bg-background px-3 font-normal" id="link_url" maxLength={500} name="link_url" placeholder="https://…" type="url"/></label><Button className="w-fit" type="submit">Submit task</Button></form> : <p className="mt-4 text-sm text-muted-foreground"><Link className="font-medium text-primary" href="/login">Log in</Link> to submit your work.</p>}</article>;
}
