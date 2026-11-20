import { Search } from "lucide-react";
import Link from "next/link";
import { TaskCard } from "@/components/experience/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { escapeExperienceSearch, parseTaskQuery } from "@/lib/experience";
import { createClient } from "@/lib/supabase/server";

export default async function TasksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseTaskQuery(await searchParams);
  const supabase = await createClient();
  let query = supabase.from("tasks").select("*");
  if (filters.q) query = query.ilike("title", `%${escapeExperienceSearch(filters.q)}%`);
  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.skill) query = query.contains("skills", [filters.skill]);
  const [{ data: tasks, error }, { data: companies, error: companyError }] = await Promise.all([query.order("created_at", { ascending: false }), supabase.from("companies").select("id,name").order("name")]);
  if (error || companyError) throw new Error("Couldn’t load tasks.");
  const companyById = new Map(companies.map((company) => [company.id, company] as const));
  const domains = [...new Set(tasks.map((task) => task.domain))].sort();
  return <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">EXPERIENCE · Tasks</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose a challenge. Make it yours.</h1><p className="mt-3 text-muted-foreground">Practice real skills on focused tasks from companies.</p><Card className="mt-8"><CardContent className="p-4 sm:p-5"><form action="/experience/tasks" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="relative sm:col-span-2 lg:col-span-2"><span className="sr-only">Search tasks</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><input className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm" defaultValue={filters.q ?? ""} maxLength={80} name="q" placeholder="Search tasks"/></label><select aria-label="Filter domain" className="h-11 rounded-xl border bg-background px-3 text-sm" defaultValue={filters.domain ?? ""} name="domain"><option value="">All domains</option>{domains.map((domain) => <option key={domain}>{domain}</option>)}</select><select aria-label="Filter difficulty" className="h-11 rounded-xl border bg-background px-3 text-sm" defaultValue={filters.difficulty ?? ""} name="difficulty"><option value="">Any difficulty</option>{["Beginner","Intermediate","Advanced"].map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select><input aria-label="Filter skill" className="h-11 rounded-xl border bg-background px-3 text-sm" defaultValue={filters.skill ?? ""} maxLength={40} name="skill" placeholder="Skill (e.g. React)"/><div className="flex gap-2 sm:col-span-2 lg:col-span-5"><Button type="submit">Apply filters</Button>{(filters.q || filters.domain || filters.difficulty || filters.skill) && <Button asChild variant="outline"><Link href="/experience/tasks">Clear</Link></Button>}</div></form></CardContent></Card><p className="mb-4 mt-7 text-sm text-muted-foreground">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</p>{tasks.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center"><h2 className="font-semibold">No tasks match those filters</h2><p className="mt-2 text-sm text-muted-foreground">Try another search or clear a filter.</p></div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{tasks.map((task) => { const company = companyById.get(task.company_id); return company ? <TaskCard company={company} key={task.id} task={task}/> : null; })}</div>}</section>;
}
