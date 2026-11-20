import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExperienceSection } from "@/components/experience/experience-section";
import { createClient } from "@/lib/supabase/server";

export default async function MyExperiencePage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  if (!userId) redirect("/login?next=%2Fexperience%2Fme");
  const { data: profile, error } = await supabase.from("profiles").select("username,full_name").eq("id", userId).maybeSingle();
  if (error) throw new Error("Couldn’t load your profile.");
  return <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">EXPERIENCE · My record</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your work, recognized.</h1><p className="mt-3 max-w-2xl text-muted-foreground">Completed company tasks, skills you’ve demonstrated, and feedback you’ve earned along the way.</p></div>{profile?.username && <Button asChild variant="outline"><Link href={`/u/${profile.username}`}><Share2 className="size-4"/>View shareable profile <ArrowUpRight className="size-4"/></Link></Button>}</div><ExperienceSection userId={userId}/></section>;
}
