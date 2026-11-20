import Link from "next/link";
import { z } from "zod";
import { TeamForm } from "@/components/team-form";
import { Button } from "@/components/ui/button";
import { requireSignedInUser } from "@/lib/auth";

type NewTeamPageProps = { searchParams: Promise<{ error?: string }> };
const errorSchema = z.enum(["invalid", "save"]);
const errorMessages: Record<z.infer<typeof errorSchema>, string> = {
  invalid: "Check the team name, description, team size, and role list, then try again.",
  save: "We couldn’t create your team. Please try again.",
};

export default async function NewTeamPage({ searchParams }: NewTeamPageProps) {
  const { supabase } = await requireSignedInUser();
  const [{ data: ideas, error }, params] = await Promise.all([
    supabase.from("ideas").select("id, title").order("created_at", { ascending: false }),
    searchParams,
  ]);
  if (error) throw new Error("Could not load ideas to link.");
  const parsedError = errorSchema.safeParse(params.error);

  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <Button asChild className="mb-7 px-0" variant="link"><Link href="/build">← Back to Build</Link></Button>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Make room for teammates</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start a team.</h1>
      <p className="mb-8 mt-3 text-muted-foreground">Share what you’re working on and the kinds of people who would help move it forward.</p>
      <TeamForm error={parsedError.success ? errorMessages[parsedError.data] : undefined} ideas={ideas} />
    </section>
  );
}
