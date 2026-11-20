import { createTeam } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TeamFormProps = { ideas: Array<{ id: string; title: string }>; error?: string };
const inputClass = "mt-2 h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textClass = "mt-2 w-full rounded-xl border bg-background px-3.5 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function TeamForm({ ideas, error }: TeamFormProps) {
  return (
    <form action={createTeam} className="space-y-6">
      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
      <Card>
        <CardHeader><CardTitle>Team details</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <label className="block text-sm font-medium" htmlFor="name">Team name<input className={inputClass} id="name" maxLength={100} name="name" placeholder="A name your future teammates can remember" required /></label>
          <label className="block text-sm font-medium" htmlFor="description">What are you building together?<textarea className={textClass} id="description" maxLength={3000} name="description" placeholder="Share the goal, approach, and what the team hopes to learn." required rows={5} /></label>
          <label className="block text-sm font-medium" htmlFor="idea_id">Connect an idea <span className="font-normal text-muted-foreground">(optional)</span><select className={inputClass} defaultValue="" id="idea_id" name="idea_id"><option value="">No linked idea</option>{ideas.map((idea) => <option key={idea.id} value={idea.id}>{idea.title}</option>)}</select></label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Who are you looking for?</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <label className="block text-sm font-medium" htmlFor="open_roles">Open roles <span className="font-normal text-muted-foreground">(one role per line)</span><textarea className={textClass} id="open_roles" maxLength={1200} name="open_roles" placeholder={"Product designer\nResearch partner\nFrontend developer"} rows={4} /></label>
          <label className="block max-w-xs text-sm font-medium" htmlFor="size_limit">Team size limit, including you<input className={inputClass} defaultValue={5} id="size_limit" max={50} min={2} name="size_limit" required type="number" /></label>
        </CardContent>
      </Card>
      <Button size="lg" type="submit">Create team</Button>
    </form>
  );
}
