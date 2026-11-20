import type { ProfileRow } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveProfile } from "@/lib/actions/profile";

type ProfileFormProps = {
  initial?: ProfileRow | null;
  intent: "onboarding" | "edit";
  error?: string;
};

const fieldClass = "mt-2 h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";
const textareaClass = "mt-2 w-full rounded-xl border bg-background px-3.5 py-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium" htmlFor={name}>
      {label}{required && <span className="text-primary"> *</span>}
      <input className={fieldClass} defaultValue={defaultValue ?? ""} id={name} maxLength={name === "username" ? 24 : undefined} name={name} placeholder={placeholder} required={required} type={type} />
    </label>
  );
}

export function ProfileForm({ initial, intent, error }: ProfileFormProps) {
  return (
    <form action={saveProfile} className="space-y-6">
      <input name="intent" type="hidden" value={intent} />
      {error && <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
      <Card>
        <CardHeader><CardTitle>About you</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field defaultValue={initial?.full_name} label="Full name" name="full_name" placeholder="Your name" required />
          <Field defaultValue={initial?.username} label="Username" name="username" placeholder="yourname" required />
          <Field defaultValue={initial?.college} label="College" name="college" placeholder="Your college or university" />
          <Field defaultValue={initial?.education} label="Education" name="education" placeholder="e.g. BSc Computer Science, 2027" />
          <label className="block text-sm font-medium sm:col-span-2" htmlFor="bio">
            Short bio
            <textarea className={textareaClass} defaultValue={initial?.bio ?? ""} id="bio" maxLength={500} name="bio" placeholder="A little about what you’re learning and what you want to do next" rows={4} />
          </label>
          <label className="block text-sm font-medium" htmlFor="skills">
            Skills <span className="font-normal text-muted-foreground">(comma or line separated)</span>
            <textarea className={textareaClass} defaultValue={initial?.skills.join(", ") ?? ""} id="skills" name="skills" placeholder="Research, Figma, Python" rows={3} />
          </label>
          <label className="block text-sm font-medium" htmlFor="interests">
            Interests <span className="font-normal text-muted-foreground">(comma or line separated)</span>
            <textarea className={textareaClass} defaultValue={initial?.interests.join(", ") ?? ""} id="interests" name="interests" placeholder="Climate, design, education" rows={3} />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Links and availability</CardTitle></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field defaultValue={initial?.github_url} label="GitHub URL" name="github_url" placeholder="https://github.com/you" type="url" />
          <Field defaultValue={initial?.linkedin_url} label="LinkedIn URL" name="linkedin_url" placeholder="https://linkedin.com/in/you" type="url" />
          <Field defaultValue={initial?.portfolio_url} label="Portfolio URL" name="portfolio_url" placeholder="https://your-site.com" type="url" />
          <Field defaultValue={initial?.avatar_url} label="Avatar image URL" name="avatar_url" placeholder="https://your-image-url" type="url" />
          <label className="block text-sm font-medium" htmlFor="availability">
            Availability
            <select className={fieldClass} defaultValue={initial?.availability ?? ""} id="availability" name="availability">
              <option value="">Choose an option</option>
              <option value="open_to_work">Open to work</option>
              <option value="open_to_projects">Open to projects</option>
              <option value="not_looking">Not looking right now</option>
            </select>
          </label>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" type="submit">{intent === "onboarding" ? "Save and continue" : "Save profile"}</Button>
        {intent === "edit" && <p className="text-sm text-muted-foreground">Anyone with your profile link can view your public profile.</p>}
      </div>
    </form>
  );
}
