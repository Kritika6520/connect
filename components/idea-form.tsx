import { saveIdea } from "@/lib/actions/ideas";
import { ideaDomains, ideaStageLabels } from "@/lib/ideas";
import type { IdeaRow } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IdeaFormProps = { idea?: IdeaRow; error?: string };
const inputClass = "mt-2 h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textClass = "mt-2 w-full rounded-xl border bg-background px-3.5 py-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  name,
  label,
  value,
  placeholder,
  required = false,
  type = "text",
}: {
  name: string;
  label: string;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return <label className="block text-sm font-medium" htmlFor={name}>{label}{required && <span className="text-primary"> *</span>}<input className={inputClass} defaultValue={value ?? ""} id={name} max={name === "team_size" ? 50 : undefined} maxLength={name === "title" ? 120 : undefined} min={name === "team_size" ? 1 : undefined} name={name} placeholder={placeholder} required={required} type={type} /></label>;
}

function TextField({
  name,
  label,
  value,
  placeholder,
  rows = 5,
}: {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  rows?: number;
}) {
  return <label className="block text-sm font-medium" htmlFor={name}>{label}<textarea className={textClass} defaultValue={value ?? ""} id={name} maxLength={name === "target_users" ? 500 : 3000} name={name} placeholder={placeholder} required rows={rows} /></label>;
}

export function IdeaForm({ idea, error }: IdeaFormProps) {
  const isEditing = Boolean(idea);
  return (
    <form action={saveIdea} className="space-y-6">
      <input name="id" type="hidden" value={idea?.id ?? ""} />
      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
      <Card>
        <CardHeader><CardTitle>The idea</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <Field label="Project title" name="title" placeholder="A clear, memorable name" required value={idea?.title} />
          <TextField label="What problem are you trying to solve?" name="problem" placeholder="Describe the problem and why it matters." value={idea?.problem} />
          <TextField label="What might you build?" name="solution" placeholder="Share your early solution or approach. It can change as you learn." value={idea?.solution} />
          <TextField label="Who is it for?" name="target_users" placeholder="Describe the people or community this could help." rows={3} value={idea?.target_users} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Find your collaborators</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium" htmlFor="domain">Domain<input className={inputClass} defaultValue={idea?.domain ?? ""} id="domain" list="idea-domain-options" maxLength={80} name="domain" placeholder="e.g. Climate, Health, Education" required /><datalist id="idea-domain-options">{ideaDomains.map((domain) => <option key={domain} value={domain} />)}</datalist></label>
          <Field label="Ideal team size" name="team_size" required type="number" value={idea?.team_size ?? 3} />
          <label className="block text-sm font-medium sm:col-span-2" htmlFor="skills_needed">Skills needed <span className="font-normal text-muted-foreground">(comma or line separated)</span><textarea className={textClass} defaultValue={idea?.skills_needed.join(", ") ?? ""} id="skills_needed" maxLength={1000} name="skills_needed" placeholder="Research, product design, React" rows={3} /></label>
        </CardContent>
      </Card>
      {idea && <Card><CardHeader><CardTitle>Project stage</CardTitle></CardHeader><CardContent><label className="block max-w-sm text-sm font-medium" htmlFor="stage">Stage<select className={inputClass} defaultValue={idea.stage} id="stage" name="stage">{Object.entries(ideaStageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></CardContent></Card>}
      {!idea && <input name="stage" type="hidden" value="idea" />}
      <Button size="lg" type="submit">{isEditing ? "Save changes" : "Post idea"}</Button>
    </form>
  );
}
