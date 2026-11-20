import Link from "next/link";
import { Search } from "lucide-react";
import { z } from "zod";
import { IdeaCard } from "@/components/idea-card";
import { IdeaEmptyState } from "@/components/idea-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { escapeLike, ideaStageLabels, parseIdeaQuery } from "@/lib/ideas";
import { createClient } from "@/lib/supabase/server";

type ExplorePageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const stageSchema = z.enum(["idea", "planning", "building", "testing", "launched"]);
const errorText = "Couldn’t load ideas right now. Please refresh and try again.";

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = parseIdeaQuery(await searchParams);
  const supabase = await createClient();
  let query = supabase.from("ideas").select("*");
  if (params.q) query = query.ilike("title", `%${escapeLike(params.q)}%`);
  if (params.domain) query = query.eq("domain", params.domain);
  if (params.skill) query = query.contains("skills_needed", [params.skill]);
  if (params.stage) query = query.eq("stage", params.stage);
  query = query.order("created_at", { ascending: params.sort === "oldest" });

  const [{ data: ideas, error }, { data: domains, error: domainError }, { data: claims }] = await Promise.all([
    query,
    supabase.from("ideas").select("domain").order("domain"),
    supabase.auth.getClaims(),
  ]);
  if (error || domainError) throw new Error(errorText);

  const domainOptions = [...new Set(domains.map((row) => row.domain))];
  const ownerIds = [...new Set(ideas.map((idea) => idea.owner_id))];
  const currentUserId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  const owners = currentUserId && ownerIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", ownerIds)
    : null;
  if (owners?.error) throw new Error("Could not load idea owners.");
  const ownerById = new Map(owners?.data?.map((owner) => [owner.id, owner] as const) ?? []);
  const isFiltered = Boolean(params.q || params.domain || params.skill || params.stage);
  const selectedStage = stageSchema.safeParse(params.stage);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">BUILD · Explore</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find a project that fits.</h1><p className="mt-3 text-muted-foreground">Browse ideas, bring your skills, and build with other students.</p></div>
        <Button asChild><Link href="/build/ideas/new">Post an idea</Link></Button>
      </div>
      <Card className="mb-8"><CardContent className="p-4 sm:p-5">
        <form action="/build/explore" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <label className="relative block sm:col-span-2 lg:col-span-2" htmlFor="q"><span className="sr-only">Search idea titles</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input className="h-11 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={params.q ?? ""} id="q" maxLength={80} name="q" placeholder="Search idea titles" /></label>
          <label className="block" htmlFor="domain"><span className="sr-only">Filter by domain</span><select className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={params.domain ?? ""} id="domain" name="domain"><option value="">All domains</option>{domainOptions.map((domain) => <option key={domain} value={domain}>{domain}</option>)}</select></label>
          <label className="block" htmlFor="skill"><span className="sr-only">Filter by skill</span><input className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={params.skill ?? ""} id="skill" maxLength={40} name="skill" placeholder="Skill (e.g. React)" /></label>
          <label className="block" htmlFor="stage"><span className="sr-only">Filter by stage</span><select className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={selectedStage.success ? selectedStage.data : ""} id="stage" name="stage"><option value="">Any stage</option>{Object.entries(ideaStageLabels).map(([stage, label]) => <option key={stage} value={stage}>{label}</option>)}</select></label>
          <label className="block" htmlFor="sort"><span className="sr-only">Sort ideas</span><select className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={params.sort ?? "newest"} id="sort" name="sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-6"><Button type="submit">Apply filters</Button>{isFiltered && <Button asChild variant="outline"><Link href="/build/explore">Clear filters</Link></Button>}</div>
        </form>
      </CardContent></Card>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-medium text-muted-foreground">{ideas.length} {ideas.length === 1 ? "idea" : "ideas"}</h2></div>
      {ideas.length === 0 ? (
        <IdeaEmptyState actionHref={isFiltered ? "/build/explore" : "/build/ideas/new"} actionLabel={isFiltered ? "Clear filters" : "Post an idea"} description={isFiltered ? "Try a different search or remove a filter. You can also share a new idea for others to discover." : "Be the first to share an idea. The right teammate may be looking for exactly this kind of project."} secondaryHref={isFiltered ? "/build/ideas/new" : undefined} secondaryLabel={isFiltered ? "Post an idea" : undefined} title={isFiltered ? "No ideas match those filters." : "No ideas have been posted yet."} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{ideas.map((idea) => {
          const owner = ownerById.get(idea.owner_id);
          return <IdeaCard idea={idea} key={idea.id} ownerName={owner?.full_name || "CONNECT member"} ownerUsername={owner?.username} />;
        })}</div>
      )}
    </section>
  );
}
