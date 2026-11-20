import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSignedInUser } from "@/lib/auth";
import { getProfileActionError, isSavedNotice } from "@/lib/profile-form-messages";

type EditProfilePageProps = { searchParams: Promise<{ error?: string; saved?: string }> };

export default async function EditProfilePage({ searchParams }: EditProfilePageProps) {
  const { supabase, userId } = await requireSignedInUser();
  const [{ data: profile, error }, params] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    searchParams,
  ]);

  if (error) throw new Error("Could not load your profile.");
  if (!profile) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <Card><CardHeader><CardTitle>Your profile is not ready yet.</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">The profile row is created when your account is created. Try refreshing, or return to onboarding.</p><Button asChild className="mt-5"><Link href="/onboarding">Continue onboarding</Link></Button></CardContent></Card>
      </section>
    );
  }
  if (!profile.username || !profile.full_name.trim()) redirect("/onboarding");

  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Your profile</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Edit your details.</h1></div>
        <Button asChild variant="outline"><Link href={`/u/${profile.username}`}>View public profile</Link></Button>
      </div>
      {isSavedNotice(params.saved) && <p className="mb-5 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">Your profile is saved.</p>}
      <ProfileForm error={getProfileActionError(params.error)} initial={profile} intent="edit" />
    </section>
  );
}
