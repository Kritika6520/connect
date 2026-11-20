import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseOpenRoles } from "@/lib/teams";
import type { TeamRow } from "@/lib/supabase/database.types";

type TeamCardProps = { team: TeamRow; memberCount?: number; ownerName?: string; ideaTitle?: string | null };

export function TeamCard({ team, memberCount, ownerName = "CONNECT member", ideaTitle }: TeamCardProps) {
  const roles = parseOpenRoles(team.open_roles);
  return (
    <Card className="group transition-colors hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{ideaTitle ?? "Open team"}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Users className="size-3.5" />{memberCount === undefined ? `Up to ${team.size_limit}` : `${memberCount} / ${team.size_limit}`}</span>
        </div>
        <CardTitle className="text-xl"><Link className="hover:text-primary" href={`/build/teams/${team.id}`}>{team.name}</Link></CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{team.description}</p>
        <p className="mt-3 text-xs text-muted-foreground">Led by {ownerName}</p>
        {roles.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{roles.slice(0, 3).map((role) => <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground" key={role.title}>{role.title}</span>)}</div>}
        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary" href={`/build/teams/${team.id}`}>View team<ArrowRight className="size-4" /></Link>
      </CardContent>
    </Card>
  );
}
