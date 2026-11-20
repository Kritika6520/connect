import { z } from "zod";

export const taskQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  domain: z.string().trim().max(80).optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", ""]).optional(),
  skill: z.string().trim().max(40).optional(),
});

export function parseTaskQuery(params: Record<string, string | string[] | undefined>) {
  const scalar = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const parsed = taskQuerySchema.safeParse(scalar);
  return parsed.success ? parsed.data : {};
}

export function escapeExperienceSearch(value: string) { return value.replace(/[\\%_]/g, "\\$&"); }

export function safeHttpUrl(value: string | null): string | null {
  if (!value || !/^https?:\/\//i.test(value)) return null;
  return z.string().url().safeParse(value).success ? value : null;
}
