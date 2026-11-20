import { z } from "zod";

export const availabilitySchema = z.enum(["open_to_work", "open_to_projects", "not_looking"]);
export const peoplePageSize = 12;

const peopleQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  skill: z.string().trim().max(40).optional(),
  college: z.string().trim().max(120).optional(),
  availability: z.union([availabilitySchema, z.literal("")]).transform((value) => value || undefined).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(10000)).optional(),
});

export type PeopleFilters = z.infer<typeof peopleQuerySchema>;

export function parsePeopleFilters(searchParams: Record<string, string | string[] | undefined>): PeopleFilters {
  const scalarParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = peopleQuerySchema.safeParse(scalarParams);
  return parsed.success ? parsed.data : {};
}

export function peoplePageHref(filters: PeopleFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.skill) params.set("skill", filters.skill);
  if (filters.college) params.set("college", filters.college);
  if (filters.availability) params.set("availability", filters.availability);
  params.set("page", String(page));
  return `/build/people?${params.toString()}`;
}

export const availabilityLabels: Record<z.infer<typeof availabilitySchema>, string> = {
  open_to_work: "Open to work",
  open_to_projects: "Open to projects",
  not_looking: "Not looking right now",
};
