import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileRow } from "@/lib/supabase/database.types";
import { z } from "zod";

type PersonCardProps = { profile: ProfileRow };
const availabilityLabels: Record<string, string> = {
  open_to_work: "Open to work",
  open_to_projects: "Open to projects",
  not_looking: "Not looking right now",
};

function safeAvatarUrl(value: string | null): string | null {
  if (!value || !z.string().url().safeParse(value).success || !/^https?:\/\//i.test(value)) return null;
  return value;
}

export function PersonCard({ profile }: PersonCardProps) {
  const avatarUrl = safeAvatarUrl(profile.avatar_url);
  const initial = profile.full_name.trim().charAt(0).toUpperCase() || "C";
  return (
    <Card className="h-full transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="flex items-center gap-4">
          {avatarUrl ? <Image alt={`${profile.full_name}'s avatar`} className="size-14 rounded-full object-cover" height={56} src={avatarUrl} unoptimized width={56} /> : <div aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-semibold text-primary">{initial}</div>}
          <div className="min-w-0"><CardTitle className="truncate text-lg">{profile.full_name}</CardTitle><p className="mt-1 truncate text-sm text-muted-foreground">{profile.college || "College not added"}</p></div>
        </div>
      </CardHeader>
      <CardContent>
        {profile.education && <p className="text-sm text-muted-foreground">{profile.education}</p>}
        {profile.bio && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{profile.bio}</p>}
        {profile.skills.length > 0 && <ul aria-label="Skills" className="mt-4 flex flex-wrap gap-2">{profile.skills.slice(0, 5).map((skill) => <li className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground" key={skill}>{skill}</li>)}</ul>}
        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
          {profile.availability && availabilityLabels[profile.availability] ? <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{availabilityLabels[profile.availability]}</span> : <span className="text-xs text-muted-foreground">Availability not listed</span>}
          {profile.username && <Link className="text-sm font-medium text-primary hover:underline" href={`/u/${profile.username}`}>View profile</Link>}
        </div>
      </CardContent>
    </Card>
  );
}
