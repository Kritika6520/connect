import { z } from "zod";

type AuthFormMessageProps = {
  error?: unknown;
  notice?: unknown;
};

const errors: Record<string, string> = {
  invalid: "Check the fields and try again. Passwords must be at least 8 characters.",
  auth: "We couldn’t authenticate those details. Check your email and password, then try again.",
  google: "Google sign-in could not start. Check the provider setup in Supabase and try again.",
  callback: "The sign-in link could not be verified. Request a new link and try again.",
};

const notices: Record<string, string> = {
  "check-email": "Check your inbox for the confirmation link to finish creating your account.",
  "signed-out": "You’re signed out.",
};

const authErrorSchema = z.enum(["invalid", "auth", "google", "callback"]);
const authNoticeSchema = z.enum(["check-email", "signed-out"]);

export function AuthFormMessage({ error, notice }: AuthFormMessageProps) {
  const parsedError = authErrorSchema.safeParse(error);
  if (parsedError.success) return <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{errors[parsedError.data]}</p>;
  const parsedNotice = authNoticeSchema.safeParse(notice);
  if (parsedNotice.success) return <p className="rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">{notices[parsedNotice.data]}</p>;
  return null;
}

