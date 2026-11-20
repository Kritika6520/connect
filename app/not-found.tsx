import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Nothing here yet</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">We couldn’t find that page.</h1>
      <p className="mt-3 text-muted-foreground">The link may be out of date, or the profile may not exist.</p>
      <Button asChild className="mt-6"><Link href="/">Back to CONNECT</Link></Button>
    </section>
  );
}
