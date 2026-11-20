import { z } from "zod";

const profileActionErrorSchema = z.enum(["invalid", "username-taken", "save"]);

const messages: Record<z.infer<typeof profileActionErrorSchema>, string> = {
  invalid: "Check the required fields, username format, URLs, and tag lists.",
  "username-taken": "That username is already in use. Try another one.",
  save: "We couldn’t save your profile. Please try again.",
};

export function getProfileActionError(value: string | undefined): string | undefined {
  const parsed = profileActionErrorSchema.safeParse(value);
  return parsed.success ? messages[parsed.data] : undefined;
}

export function isSavedNotice(value: string | undefined): boolean {
  return z.literal("1").safeParse(value).success;
}
