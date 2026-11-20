import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data: companies, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw new Error("Couldn’t load companies.");
  return <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">EXPERIENCE · Companies</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Meet the teams behind the work.</h1><p className="mt-3 text-muted-foreground">Explore companies sharing practical challenges with students.</p>{companies.length === 0 ? <div className="mt-10 rounded-xl border border-dashed p-10 text-center"><Building2 className="mx-auto size-8 text-muted-foreground"/><h2 className="mt-4 font-semibold">No companies yet</h2><p className="mt-2 text-sm text-muted-foreground">Company profiles will appear here as they join CONNECT.</p></div> : <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{companies.map((company) => <Link className="group" href={`/experience/companies/${company.id}`} key={company.id}><Card className="h-full group-hover:border-primary/40"><CardHeader><div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary"><Building2 className="size-5"/></div><CardTitle className="mt-2">{company.name}</CardTitle><p className="text-sm text-muted-foreground">{company.industry}{company.location ? ` · ${company.location}` : ""}</p></CardHeader><CardContent><p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{company.description}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-medium">View company <ArrowUpRight className="size-4"/></span></CardContent></Card></Link>)}</div>}</section>;
}
