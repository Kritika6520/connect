import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { z } from "zod";
import { PersonCard } from "@/components/person-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { escapeLike } from "@/lib/ideas";
import { availabilityLabels, parsePeopleFilters, peoplePageHref, peoplePageSize } from "@/lib/people";
import { requireSignedInUser } from "@/lib/auth";

type PeoplePageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const availabilityValues = z.enum(["open_to_work", "open_to_projects", "not_looking"]);

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const { supabase } = await requireSignedInUser();
  const filters = parsePeopleFilters(await searchParams);
  const page = filters.page ?? 1;
  const start = (page - 1) * peoplePageSize;
  let query = supabase.from("profiles").select("*", { count: "exact" });
  if (filters.q) query = query.ilike("full_name", `%${escapeLike(filters.q)}%`);
  if (filters.skill) query = query.contains("skills", [filters.skill]);
  if (filters.college) query = query.ilike("college", `%${escapeLike(filters.college)}%`);
  if (filters.availability) query = query.eq("availability", filters.availability);

  const { data: profiles, count, error } = await query
    .order("full_name", { ascending: true })
    .range(start, start + peoplePageSize - 1);
  if (error) throw new Error("Could not load student profiles.");

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / peoplePageSize));
  if (page > pageCount) redirect(peoplePageHref(filters, pageCount));
  const hasFilters = Boolean(filters.q || filters.skill || filters.college || filters.availability);
  const parsedAvailability = availabilityValues.safeParse(filters.availability);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">BUILD · Find people</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Meet your next collaborator.</h1><p className="mt-3 text-muted-foreground">Find students by what they know, where they study, and what they’re ready to do.</p></div>
        <Button asChild variant="outline"><Link href="/profile/edit"><Users className="size-4" />Update your profile</Link></Button>
      </div>

      <Card className="mb-8"><CardContent className="p-4 sm:p-5">
        <form action="/build/people" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block" htmlFor="q"><span className="sr-only">Search students by name</span><input className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={filters.q ?? ""} id="q" maxLength={80} name="q" placeholder="Search by name" /></label>
          <label className="block" htmlFor="skill"><span className="sr-only">Filter by skill</span><input className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={filters.skill ?? ""} id="skill" maxLength={40} name="skill" placeholder="Skill (e.g. Figma)" /></label>
          <label className="block" htmlFor="college"><span className="sr-only">Filter by college</span><input className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={filters.college ?? ""} id="college" maxLength={120} name="college" placeholder="College" /></label>
          <label className="block" htmlFor="availability"><span className="sr-only">Filter by availability</span><select className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" defaultValue={parsedAvailability.success ? parsedAvailability.data : ""} id="availability" name="availability"><option value="">Any availability</option>{Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="flex gap-2"><Button className="flex-1" type="submit">Apply filters</Button>{hasFilters && <Button asChild variant="outline"><Link href="/build/people">Clear</Link></Button>}</div>
        </form>
      </CardContent></Card>

      <div className="mb-4 flex items-center justify-between"><p className="text-sm text-muted-foreground">{total > 0 ? `Showing ${start + 1}–${Math.min(start + profiles.length, total)} of ${total} students` : "0 students"}</p></div>
      {profiles.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center px-6 py-14 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary"><Users className="size-5" /></span><h2 className="mt-5 text-xl font-semibold">{hasFilters ? "No students match those filters." : "No profiles to show yet."}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{hasFilters ? "Try a different name, skill, college, or availability." : "Complete your own profile and check back as more students join CONNECT."}</p><div className="mt-6 flex gap-3">{hasFilters ? <Button asChild variant="outline"><Link href="/build/people">Clear filters</Link></Button> : <Button asChild><Link href="/profile/edit">Complete your profile</Link></Button>}{page > pageCount && <Button asChild variant="outline"><Link href={peoplePageHref(filters, 1)}>Back to first page</Link></Button>}</div></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{profiles.map((profile) => <PersonCard key={profile.id} profile={profile} />)}</div>
      )}

      {pageCount > 1 && <nav aria-label="People pages" className="mt-8 flex items-center justify-center gap-4"><Button asChild className={page <= 1 ? "pointer-events-none opacity-50" : undefined} size="sm" variant="outline"><Link aria-disabled={page <= 1} href={peoplePageHref(filters, Math.max(page - 1, 1))} tabIndex={page <= 1 ? -1 : undefined}>Previous</Link></Button><span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span><Button asChild className={page >= pageCount ? "pointer-events-none opacity-50" : undefined} size="sm" variant="outline"><Link aria-disabled={page >= pageCount} href={peoplePageHref(filters, Math.min(page + 1, pageCount))} tabIndex={page >= pageCount ? -1 : undefined}>Next</Link></Button></nav>}
    </section>
  );
}
