import Link from "next/link";
import { Search } from "lucide-react";
import { z } from "zod";
import { IdeaEmptyState } from "@/components/idea-empty-state";
import { TeamCard } from "@/components/team-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { escapeLike } from "@/lib/ideas";
import { createClient } from "@/lib/supabase/server";

type TeamsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const teamsQuerySchema = z.object({ q: z.string().trim().max(80).optional() });

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const rawParams = await searchParams;
  const scalarParams = Object.fromEntries(Object.entries(rawParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const parsedQuery = teamsQuerySchema.safeParse(scalarParams);
  const queryText = parsedQuery.success ? parsedQuery.data.q : undefined;
  const supabase = await createClient();
  let query = supabase.from("teams").select("*");
  if (queryText) query = query.ilike("name", `%${escapeLike(queryText)}%`);
  const [{ data: teams, error }, { data: claims }] = await Promise.all([
    query.order("created_at", { ascending: false }),
    supabase.auth.getClaims(),
  ]);
  if (error) throw new Error("Could not load teams.");

  const teamIds = teams.map((team) => team.id);
  const ownerIds = [...new Set(teams.map((team) => team.owner_id))];
  const ideaIds = [...new Set(teams.flatMap((team) => team.idea_id ? [team.idea_id] : []))];
  const currentUserId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  const [owners, members, ideas] = await Promise.all([
    currentUserId && ownerIds.length > 0 ? supabase.from("profiles").select("id, full_name, username").in("id", ownerIds) : null,
    currentUserId && teamIds.length > 0 ? supabase.from("team_members").select("team_id, user_id").in("team_id", teamIds) : null,
    ideaIds.length > 0 ? supabase.from("ideas").select("id, title").in("id", ideaIds) : null,
  ]);
  if (owners?.error || members?.error || ideas?.error) throw new Error("Could not load team details.");

  const ownerById = new Map(owners?.data?.map((owner) => [owner.id, owner] as const) ?? []);
  const ideaTitleById = new Map(ideas?.data?.map((idea) => [idea.id, idea.title] as const) ?? []);
  const memberCounts = new Map<string, number>();
  members?.data?.forEach((member) => memberCounts.set(member.team_id, (memberCounts.get(member.team_id) ?? 0) + 1));

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">BUILD · Find teams</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Build better, together.</h1><p className="mt-3 text-muted-foreground">Explore teams that are making room for new ideas and skills.</p></div>
        <Button asChild><Link href="/build/teams/new">Create a team</Link></Button>
      </div>
      <Card className="mb-8"><CardContent className="p-4 sm:p-5"><form action="/build/teams" className="flex flex-col gap-3 sm:flex-row"><label className="relative block flex-1" htmlFor="q"><span className="sr-only">Search teams by name</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={queryText ?? ""} id="q" maxLength={80} name="q" placeholder="Search team names" /></label><Button type="submit">Search teams</Button>{queryText && <Button asChild variant="outline"><Link href="/build/teams">Clear</Link></Button>}</form></CardContent></Card>
      <p className="mb-4 text-sm text-muted-foreground">{teams.length} {teams.length === 1 ? "team" : "teams"}</p>
      {teams.length === 0 ? (
        <IdeaEmptyState actionHref={queryText ? "/build/teams" : "/build/teams/new"} actionLabel={queryText ? "Clear search" : "Create a team"} description={queryText ? "Try another team name, or start a new team around an idea you care about." : "You can start a team around an idea and invite people who want to help build it."} secondaryHref={queryText ? "/build/teams/new" : undefined} secondaryLabel={queryText ? "Create a team" : undefined} title={queryText ? "No teams found." : "No teams yet."} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{teams.map((team) => <TeamCard ideaTitle={team.idea_id ? ideaTitleById.get(team.idea_id) : null} key={team.id} memberCount={members ? memberCounts.get(team.id) ?? 0 : undefined} ownerName={ownerById.get(team.owner_id)?.full_name || "CONNECT member"} team={team} />)}</div>
      )}
    </section>
  );
}
