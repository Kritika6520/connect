import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { z } from "zod";
import { JoinRequestReview } from "@/components/join-request-review";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { removeTeamMember, requestToJoinTeam } from "@/lib/actions/teams";
import { formatIdeaDate } from "@/lib/ideas";
import { createClient } from "@/lib/supabase/server";
import { parseOpenRoles } from "@/lib/teams";

type TeamDetailPageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; requested?: string; reviewed?: string; removed?: string }> };
const idSchema = z.string().uuid();
const errorSchema = z.enum(["request", "duplicate", "closed", "invalid", "review", "full", "remove"]);
const noticeSchema = z.literal("1");

const requestErrors: Record<z.infer<typeof errorSchema>, string> = {
  request: "We couldn’t send your request. Please try again.",
  duplicate: "You have already sent a request to this team.",
  closed: "This team is full or can no longer accept requests.",
  invalid: "The request could not be validated. Please refresh and try again.",
  review: "We couldn’t review that request. It may already have been handled.",
  full: "This team has reached its size limit. The request remains pending.",
  remove: "We couldn’t update team membership. Only the team owner can manage members.",
};

export default async function TeamDetailPage({ params, searchParams }: TeamDetailPageProps) {
  const [{ id: rawId }, search] = await Promise.all([params, searchParams]);
  const parsedId = idSchema.safeParse(rawId);
  if (!parsedId.success) notFound();

  const supabase = await createClient();
  const [{ data: team, error }, { data: claims }] = await Promise.all([
    supabase.from("teams").select("*").eq("id", parsedId.data).maybeSingle(),
    supabase.auth.getClaims(),
  ]);
  if (error) throw new Error("Could not load this team.");
  if (!team) notFound();

  const viewerId = typeof claims?.claims?.sub === "string" ? claims.claims.sub : null;
  const isOwner = viewerId === team.owner_id;
  const [memberResult, requestResult, pendingResult, ideaResult] = await Promise.all([
    viewerId ? supabase.from("team_members").select("*").eq("team_id", team.id).order("created_at") : null,
    viewerId && !isOwner ? supabase.from("join_requests").select("*").eq("team_id", team.id).eq("user_id", viewerId).maybeSingle() : null,
    isOwner ? supabase.from("join_requests").select("*").eq("team_id", team.id).eq("status", "pending").order("created_at") : null,
    team.idea_id ? supabase.from("ideas").select("id, title").eq("id", team.idea_id).maybeSingle() : null,
  ]);
  if (memberResult?.error || requestResult?.error || pendingResult?.error || ideaResult?.error) throw new Error("Could not load team members or requests.");

  const memberRows = memberResult?.data ?? [];
  const pendingRows = pendingResult?.data ?? [];
  const profileIds = [...new Set([team.owner_id, ...memberRows.map((member) => member.user_id), ...pendingRows.map((request) => request.user_id)])];
  const profilesResult = viewerId && profileIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", profileIds)
    : null;
  if (profilesResult?.error) throw new Error("Could not load team profiles.");
  const profileById = new Map(profilesResult?.data?.map((profile) => [profile.id, profile] as const) ?? []);

  const isMember = memberRows.some((member) => member.user_id === viewerId);
  const memberCount = viewerId ? memberRows.length : null;
  const isFull = memberCount !== null && memberCount >= team.size_limit;
  const roles = parseOpenRoles(team.open_roles);
  const parsedError = errorSchema.safeParse(search.error);
  const showRequested = noticeSchema.safeParse(search.requested).success;
  const showReviewed = noticeSchema.safeParse(search.reviewed).success;
  const showRemoved = noticeSchema.safeParse(search.removed).success;
  const loginHref = `/login?${new URLSearchParams({ next: `/build/teams/${team.id}` }).toString()}`;

  return (
    <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
      <Button asChild className="mb-7 px-0" variant="link"><Link href="/build/teams">← Back to teams</Link></Button>
      {showRequested && <p className="mb-5 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">Your request was sent. The team owner will review it.</p>}
      {showReviewed && <p className="mb-5 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">The request has been reviewed and the team page is up to date.</p>}
      {showRemoved && <p className="mb-5 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">The member was removed from this team.</p>}
      {parsedError.success && <p className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{requestErrors[parsedError.data]}</p>}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">BUILD · Team</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{team.name}</h1><p className="mt-3 text-sm text-muted-foreground">Led by {profileById.get(team.owner_id)?.full_name || "a CONNECT member"} · Started {formatIdeaDate(team.created_at)}</p></div>
        <Card className="min-w-44"><CardContent className="flex items-center gap-3 p-4"><Users className="size-5 text-primary" /><div><p className="font-semibold">{memberCount === null ? `Up to ${team.size_limit}` : `${memberCount} / ${team.size_limit}`}</p><p className="text-xs text-muted-foreground">team members</p></div></CardContent></Card>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <Card><CardHeader><CardTitle>About the team</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap leading-7 text-muted-foreground">{team.description}</p></CardContent></Card>
          {ideaResult?.data && <Card><CardHeader><CardTitle>Building around an idea</CardTitle></CardHeader><CardContent><Link className="font-medium text-primary hover:underline" href={`/build/ideas/${ideaResult.data.id}`}>{ideaResult.data.title}</Link></CardContent></Card>}
          <Card><CardHeader><CardTitle>Who’s on the team</CardTitle></CardHeader><CardContent>
            {viewerId ? <ul className="space-y-3">{memberRows.map((member) => {
              const profile = profileById.get(member.user_id);
              return <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3" key={member.user_id}><div><p className="font-medium">{profile?.full_name || (member.user_id === viewerId ? "You" : "CONNECT member")}</p>{profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}</div><div className="flex items-center gap-2"><span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{member.role === "owner" ? "Owner" : "Member"}</span>{isOwner && member.role === "member" && <form action={removeTeamMember}><input name="team_id" type="hidden" value={team.id} /><input name="user_id" type="hidden" value={member.user_id} /><Button size="sm" type="submit" variant="outline">Remove</Button></form>}</div></li>;
            })}</ul> : <p className="text-sm text-muted-foreground">Sign in to view the team roster.</p>}
          </CardContent></Card>

          {isOwner && <Card><CardHeader><CardTitle>Join requests {pendingRows.length > 0 && <span className="ml-2 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{pendingRows.length}</span>}</CardTitle></CardHeader><CardContent>
            {pendingRows.length === 0 ? <p className="text-sm text-muted-foreground">There are no requests waiting for review.</p> : <div className="space-y-3">{pendingRows.map((request) => <JoinRequestReview key={request.id} requesterName={profileById.get(request.user_id)?.full_name || "CONNECT member"} request={request} />)}</div>}
          </CardContent></Card>}
        </div>

        <aside className="space-y-5">
          <Card><CardHeader><CardTitle className="text-base">Open roles</CardTitle></CardHeader><CardContent>
            {roles.length === 0 ? <p className="text-sm text-muted-foreground">This team is open to people with different skills.</p> : <ul className="space-y-3">{roles.map((role) => <li className="rounded-xl border p-3 text-sm font-medium" key={role.title}>{role.title}</li>)}</ul>}
          </CardContent></Card>

          {isOwner ? <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">You own this team. New join requests appear here for review.</p> : isMember ? <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm font-medium">You’re on this team.</p> : requestResult?.data ? <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Your request is <span className="font-medium text-foreground">{requestResult.data.status}</span>.</p> : isFull ? <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">This team has reached its size limit.</p> : viewerId ? (
            <Card><CardHeader><CardTitle className="text-base">Request to join</CardTitle></CardHeader><CardContent><form action={requestToJoinTeam} className="space-y-3"><input name="team_id" type="hidden" value={team.id} /><label className="block text-sm font-medium" htmlFor="message">A note to the owner <span className="font-normal text-muted-foreground">(optional)</span><textarea className="mt-2 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" id="message" maxLength={1000} name="message" placeholder="Share what you’d like to contribute." rows={4} /></label><Button className="w-full" type="submit">Send request</Button></form></CardContent></Card>
          ) : <Card><CardHeader><CardTitle className="text-base">Interested?</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-muted-foreground">Sign in to introduce yourself to the team owner.</p><Button asChild className="mt-4 w-full"><Link href={loginHref}>Log in to request</Link></Button></CardContent></Card>}
        </aside>
      </div>
    </section>
  );
}
