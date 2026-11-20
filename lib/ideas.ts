import { z } from "zod";
import type { IdeaStage } from "@/lib/supabase/database.types";

export const ideaStageSchema = z.enum(["idea", "planning", "building", "testing", "launched"]);

export const ideaStageLabels: Record<IdeaStage, string> = {
  idea: "Idea",
  planning: "Planning",
  building: "Building",
  testing: "Testing",
  launched: "Launched",
};

export const ideaDomains = [
  "AI & Data",
  "Business",
  "Climate",
  "Design",
  "Education",
  "Health",
  "Social Impact",
  "Technology",
  "Other",
] as const;

export const ideaQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  domain: z.string().trim().max(80).optional(),
  skill: z.string().trim().max(40).optional(),
  stage: z.union([ideaStageSchema, z.literal("")]).transform((value) => value || undefined).optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
});

export function parseIdeaQuery(searchParams: Record<string, string | string[] | undefined>) {
  const scalarParams = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = ideaQuerySchema.safeParse(scalarParams);
  return parsed.success ? parsed.data : {};
}

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function formatIdeaDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
