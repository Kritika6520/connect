import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExperienceSection } from "@/components/experience/experience-section";
import { createClient } from "@/lib/supabase/server";
import { isSavedNotice } from "@/lib/profile-form-messages";
import type { ProfileRow } from "@/lib/supabase/database.types";

type PublicProfilePageProps = { params: Promise<{ username: string }>; searchParams: Promise<{ saved?: string }> };

const usernameSchema = z.string().toLowerCase().min(3).max(24).regex(/^[a-z0-9_]+$/);
const availabilityLabels: Record<string, string> = {
  open_to_work: "Open to work",
  open_to_projects: "Open to projects",
  not_looking: "Not looking right now",
};

function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  const parsed = z.string().url().safeParse(value);
  if (!parsed.success || !/^https?:\/\//i.test(value)) return null;
  return value;
}

function ExternalLink({ label, value }: { label: string; value: string | null }) {
  const href = safeExternalUrl(value);
  if (!href) return null;
  return <a className="text-sm font-medium text-primary hover:underline" href={href} rel="noreferrer" target="_blank">{label}<span className="sr-only"> (opens in a new tab)</span></a>;
}

function ProfileTags({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return <section><h2 className="text-sm font-semibold">{label}</h2><ul className="mt-3 flex flex-wrap gap-2">{items.map((item) => <li className="rounded-full border bg-muted/40 px-3 py-1.5 text-sm" key={item}>{item}</li>)}</ul></section>;
}

function ProfileContent({ profile }: { profile: ProfileRow }) {
  const initial = profile.full_name.trim().charAt(0).toUpperCase() || "C";
  const avatarUrl = safeExternalUrl(profile.avatar_url);
  return (
    <Card className="overflow-hidden">
      <div className="h-2 bg-primary" />
      <CardHeader className="flex-row items-center gap-5 p-6 sm:p-8">
        {avatarUrl ? (
          <Image alt={`${profile.full_name}'s avatar`} className="size-20 shrink-0 rounded-full object-cover" height={80} src={avatarUrl} unoptimized width={80} />
        ) : (
          <div aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-semibold text-primary">{initial}</div>
        )}
        <div className="min-w-0"><p className="text-2xl font-semibold tracking-tight">{profile.full_name}</p><p className="mt-1 text-muted-foreground">@{profile.username}</p>{profile.college && <p className="mt-2 text-sm text-muted-foreground">{profile.college}{profile.education ? ` · ${profile.education}` : ""}</p>}</div>
      </CardHeader>
      <CardContent className="space-y-8 px-6 pb-8 sm:px-8">
        {profile.availability && availabilityLabels[profile.availability] && <p className="inline-flex rounded-full border bg-muted/40 px-3 py-1.5 text-sm">{availabilityLabels[profile.availability]}</p>}
        {profile.bio && <p className="max-w-2xl leading-7 text-muted-foreground">{profile.bio}</p>}
        <ProfileTags items={profile.skills} label="Skills" />
        <ProfileTags items={profile.interests} label="Interests" />
        <div className="flex flex-wrap gap-x-5 gap-y-3 border-t pt-6">
          <ExternalLink label="GitHub" value={profile.github_url} />
          <ExternalLink label="LinkedIn" value={profile.linkedin_url} />
          <ExternalLink label="Portfolio" value={profile.portfolio_url} />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PublicProfilePage({ params, searchParams }: PublicProfilePageProps) {
  const [{ username: rawUsername }, query] = await Promise.all([params, searchParams]);
  const parsedUsername = usernameSchema.safeParse(rawUsername);
  if (!parsedUsername.success) notFound();

  const supabase = await createClient();
  const [{ data: claims }, { data: profile, error }] = await Promise.all([
    supabase.auth.getClaims(),
    supabase.from("profiles").select("*").eq("username", parsedUsername.data).maybeSingle(),
  ]);
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  if (error) throw new Error("Could not load this profile.");
  if (!profile) notFound();

  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      {isSavedNotice(query.saved) && <p className="mb-5 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">Your profile is saved.</p>}
      <div className="mb-6 flex justify-end"><Button asChild variant="outline"><Link href={profile.id === userId ? "/profile/edit" : "/"}>{profile.id === userId ? "Edit profile" : "Explore CONNECT"}</Link></Button></div>
      <ProfileContent profile={profile} />
      <ExperienceSection compact userId={profile.id} />
    </section>
  );
}
