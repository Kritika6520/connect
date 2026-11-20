import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompanyRow, TaskRow } from "@/lib/supabase/database.types";

export function TaskCard({ task, company }: { task: TaskRow; company: Pick<CompanyRow, "id" | "name"> }) {
  return <Link className="group block" href={`/experience/tasks/${task.id}`}><Card className="h-full transition-colors group-hover:border-primary/40"><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-primary">{task.domain}</span><span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">{task.difficulty}</span></div><CardTitle className="text-lg">{task.title}</CardTitle><p className="text-sm text-muted-foreground">{company.name} · {task.role}</p></CardHeader><CardContent><p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{task.description}</p><div className="mt-5 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" />{task.est_hours} hours</span><span className="flex items-center gap-1 text-sm font-medium">View task <ArrowUpRight className="size-4" /></span></div></CardContent></Card></Link>;
}
