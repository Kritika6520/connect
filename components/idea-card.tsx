import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIdeaDate, ideaStageLabels } from "@/lib/ideas";
import type { IdeaRow } from "@/lib/supabase/database.types";

type IdeaCardProps = {
  idea: IdeaRow;
  ownerName?: string;
  ownerUsername?: string | null;
};

export function IdeaCard({ idea, ownerName = "CONNECT member", ownerUsername }: IdeaCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-colors hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{idea.domain}</span>
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{ideaStageLabels[idea.stage]}</span>
        </div>
        <CardTitle className="line-clamp-2 text-xl">
          <Link className="after:absolute after:inset-0" href={`/build/ideas/${idea.id}`}>{idea.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{idea.problem}</p>
        {idea.skills_needed.length > 0 && <ul aria-label="Skills needed" className="mt-4 flex flex-wrap gap-2">{idea.skills_needed.slice(0, 3).map((skill) => <li className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground" key={skill}>{skill}</li>)}</ul>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
          <div className="min-w-0 truncate">By {ownerUsername ? <Link className="relative z-10 font-medium text-foreground hover:text-primary" href={`/u/${ownerUsername}`}>{ownerName}</Link> : ownerName} · {formatIdeaDate(idea.created_at)}</div>
          <span className="relative z-10 inline-flex shrink-0 items-center gap-1"><Users className="size-3.5" /> up to {idea.team_size}</span>
        </div>
        <ArrowUpRight aria-hidden="true" className="pointer-events-none absolute right-5 top-5 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </CardContent>
    </Card>
  );
}
