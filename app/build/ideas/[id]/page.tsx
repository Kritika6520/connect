import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { IdeaForm } from "@/components/idea-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIdeaDate, ideaStageLabels } from "@/lib/ideas";
import { createClient } from "@/lib/supabase/server";

type IdeaDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

const idSchema = z.string().uuid();
const errorSchema = z.enum(["invalid", "save"]);
const savedSchema = z.literal("1");

export default async function IdeaDetailPage({ params, searchParams }: IdeaDetailPageProps) {
  const [{ id: rawId }, query] = await Promise.all([params, searchParams]);
  const id = idSchema.safeParse(rawId);
  if (!id.success) notFound();

  const supabase = await createClient();
  const [{ data: idea, error }, { data: claims }] = await Promise.all([
    supabase.from("ideas").select("*").eq("id", id.data).maybeSingle(),
    supabase.auth.getClaims(),
  ]);
  if (error) throw new Error("Could not load this idea.");
  if (!idea) notFound();

  const viewerId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  const isOwner = viewerId === idea.owner_id;
  const ownerResult = viewerId
    ? await supabase.from("profiles").select("full_name, username").eq("id", idea.owner_id).maybeSingle()
    : null;
  if (ownerResult?.error) throw new Error("Could not load the idea owner.");

  const parsedError = errorSchema.safeParse(query.error);
  const saved = savedSchema.safeParse(query.saved).success;
  const message = parsedError.success
    ? parsedError.data === "invalid"
      ? "Check the required fields and try again."
      : "We couldn’t save your changes. You may not own this idea."
    : undefined;

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
      <Button asChild className="mb-7 px-0" variant="link"><Link href="/build/explore">← Back to Explore</Link></Button>
      {saved && <p className="mb-5 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">Your changes are saved.</p>}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">{idea.domain}</span><span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">{ideaStageLabels[idea.stage]}</span></div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{idea.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Shared by {ownerResult?.data?.full_name || "a CONNECT member"} · Updated {formatIdeaDate(idea.updated_at)}</p>
        </div>
        {ownerResult?.data?.username && !isOwner && <Button asChild variant="outline"><Link href={`/u/${ownerResult.data.username}`}>View creator profile</Link></Button>}
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-5">
          <Card><CardHeader><CardTitle>What problem does it solve?</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap leading-7 text-muted-foreground">{idea.problem}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>What might you build?</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap leading-7 text-muted-foreground">{idea.solution}</p></CardContent></Card>
          <Card><CardHeader><CardTitle>Who is it for?</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap leading-7 text-muted-foreground">{idea.target_users}</p></CardContent></Card>
        </div>
        <aside className="space-y-5">
          <Card><CardHeader><CardTitle className="text-base">Project snapshot</CardTitle></CardHeader><CardContent className="space-y-5">
            <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Team size</p><p className="mt-1 font-medium">Up to {idea.team_size} people</p></div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Skills needed</p>{idea.skills_needed.length > 0 ? <ul className="mt-2 flex flex-wrap gap-2">{idea.skills_needed.map((skill) => <li className="rounded-full border px-2.5 py-1 text-xs" key={skill}>{skill}</li>)}</ul> : <p className="mt-1 text-sm text-muted-foreground">Open to different skills</p>}</div>
            <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Posted</p><p className="mt-1 text-sm">{formatIdeaDate(idea.created_at)}</p></div>
          </CardContent></Card>
          {ownerResult?.data?.username && <Button asChild className="w-full" variant="outline"><Link href={`/u/${ownerResult.data.username}`}>See creator profile</Link></Button>}
        </aside>
      </div>

      {isOwner && <div className="mt-14 border-t pt-10"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Owner tools</p><h2 className="mb-6 mt-2 text-2xl font-semibold">Edit this idea</h2><IdeaForm error={message} idea={idea} /></div>}
      {!isOwner && message && <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{message}</p>}
    </section>
  );
}
