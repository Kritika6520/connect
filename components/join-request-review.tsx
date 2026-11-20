import { reviewJoinRequest } from "@/lib/actions/teams";
import type { JoinRequestRow } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";

type JoinRequestReviewProps = { request: JoinRequestRow; requesterName: string };

export function JoinRequestReview({ request, requesterName }: JoinRequestReviewProps) {
  return (
    <article className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-medium">{requesterName}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{request.message || "No note included."}</p></div>
        <p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(request.created_at))}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <form action={reviewJoinRequest}><input name="team_id" type="hidden" value={request.team_id} /><input name="request_id" type="hidden" value={request.id} /><input name="decision" type="hidden" value="accepted" /><Button size="sm" type="submit">Accept</Button></form>
        <form action={reviewJoinRequest}><input name="team_id" type="hidden" value={request.team_id} /><input name="request_id" type="hidden" value={request.id} /><input name="decision" type="hidden" value="rejected" /><Button size="sm" type="submit" variant="outline">Decline</Button></form>
      </div>
    </article>
  );
}
