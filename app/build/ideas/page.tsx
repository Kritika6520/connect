import Link from "next/link";
import { IdeaCard } from "@/components/idea-card";
import { IdeaEmptyState } from "@/components/idea-empty-state";
import { Button } from "@/components/ui/button";
import { requireSignedInUser } from "@/lib/auth";

export default async function MyIdeasPage() {
  const { supabase, userId } = await requireSignedInUser();
  const [{ data: ideas, error }, { data: profile }] = await Promise.all([
    supabase.from("ideas").select("*").eq("owner_id", userId).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("full_name, username").eq("id", userId).maybeSingle(),
  ]);

  if (error) throw new Error("Could not load your ideas.");
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">BUILD · My ideas</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Ideas in motion.</h1><p className="mt-3 text-muted-foreground">Keep shaping your ideas and invite the right people along.</p></div>
        <Button asChild><Link href="/build/ideas/new">Post an idea</Link></Button>
      </div>
      {ideas.length === 0 ? (
        <IdeaEmptyState actionHref="/build/ideas/new" actionLabel="Post your first idea" description="Every project starts somewhere. Share a problem you care about and invite others to help you explore it." secondaryHref="/build/explore" secondaryLabel="Explore ideas" title="Your idea space is ready." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{ideas.map((idea) => <IdeaCard idea={idea} key={idea.id} ownerName={profile?.full_name || "You"} ownerUsername={profile?.username} />)}</div>
      )}
    </section>
  );
}
