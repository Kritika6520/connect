import { z } from "zod";
import type { Json } from "@/lib/supabase/database.types";

export const openRoleSchema = z.object({
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().max(240),
  skills: z.array(z.string().trim().min(1).max(40)).max(10),
});

export const openRolesSchema = z.array(openRoleSchema).max(20);
export type OpenRole = z.infer<typeof openRoleSchema>;

export function parseOpenRoles(value: Json): OpenRole[] {
  const parsed = openRolesSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export const teamQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
});
