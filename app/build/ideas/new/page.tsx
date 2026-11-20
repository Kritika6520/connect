import Link from "next/link";
import { z } from "zod";
import { IdeaForm } from "@/components/idea-form";
import { requireSignedInUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type NewIdeaPageProps = { searchParams: Promise<{ error?: string }> };
const errorSchema = z.enum(["invalid", "save"]);
const errorMessages: Record<z.infer<typeof errorSchema>, string> = {
  invalid: "Check the title, required descriptions, team size, and stage, then try again.",
  save: "We couldn’t post your idea. Please try again.",
};

export default async function NewIdeaPage({ searchParams }: NewIdeaPageProps) {
  await requireSignedInUser();
  const params = await searchParams;
  const error = errorSchema.safeParse(params.error);
  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <Button asChild className="mb-7 px-0" variant="link"><Link href="/build">← Back to Build</Link></Button>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Start with an idea</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">What would you like to build?</h1>
      <p className="mb-8 mt-3 text-muted-foreground">A clear problem is a great first draft. You can refine the idea as your team grows.</p>
      <IdeaForm error={error.success ? errorMessages[error.data] : undefined} />
    </section>
  );
}
