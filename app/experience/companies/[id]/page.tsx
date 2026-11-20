import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft, ArrowUpRight, Building2 } from "lucide-react";
import { TaskCard } from "@/components/experience/task-card";
import { safeHttpUrl } from "@/lib/experience";
import { createClient } from "@/lib/supabase/server";

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const parsedId = z.string().uuid().safeParse((await params).id);
  if (!parsedId.success) notFound();
  const id = parsedId.data;
  const supabase = await createClient();
  const [{ data: company, error }, { data: tasks, error: taskError }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).maybeSingle(),
    supabase.from("tasks").select("*").eq("company_id", id).order("created_at", { ascending: false }),
  ]);
  if (error || taskError) throw new Error("Couldn’t load this company.");
  if (!company) notFound();
  const websiteUrl = safeHttpUrl(company.website);
  return <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/experience/companies"><ArrowLeft className="size-4"/>All companies</Link><div className="mt-8 flex items-start gap-4"><div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary"><Building2 className="size-6"/></div><div><p className="text-sm font-medium text-primary">{company.industry}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{company.name}</h1><p className="mt-2 text-sm text-muted-foreground">{company.location}</p></div></div><p className="mt-7 max-w-3xl leading-7 text-muted-foreground">{company.description}</p><div className="mt-5 flex flex-wrap gap-2">{company.tech.map((tech) => <span className="rounded-full border px-3 py-1.5 text-sm" key={tech}>{tech}</span>)}</div>{websiteUrl && <a className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary" href={websiteUrl} rel="noreferrer" target="_blank">Company website <ArrowUpRight className="size-4"/></a>}<div className="mb-5 mt-12"><h2 className="text-2xl font-semibold">Open tasks</h2><p className="mt-2 text-muted-foreground">Challenges from {company.name}.</p></div>{tasks.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">This company has no open tasks right now.</div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tasks.map((task) => <TaskCard company={company} key={task.id} task={task}/>)}</div>}</section>;
}
