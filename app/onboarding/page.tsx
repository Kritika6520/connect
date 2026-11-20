import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { requireSignedInUser } from "@/lib/auth";
import { getProfileActionError } from "@/lib/profile-form-messages";

type OnboardingPageProps = { searchParams: Promise<{ error?: string }> };

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { supabase, userId } = await requireSignedInUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (profile?.username && profile.full_name.trim()) redirect("/profile/edit");

  const params = await searchParams;
  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">A few details</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Make your profile yours.</h1>
      <p className="mb-8 mt-3 text-muted-foreground">Add the basics now. You can update them whenever you like.</p>
      <ProfileForm error={getProfileActionError(params.error)} initial={profile} intent="onboarding" />
    </section>
  );
}
