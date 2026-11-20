import Link from "next/link";
import { ArrowRight, Compass, Lightbulb, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const destinations = [
  {
    href: "/build/ideas",
    title: "My ideas",
    description: "Keep your ideas in one place. Shape them, update their stage, and share what you’re making.",
    icon: Lightbulb,
    link: "See your ideas",
  },
  {
    href: "/build/explore",
    title: "Explore ideas",
    description: "Find projects that match your interests and skills. Meet people who want to make them real.",
    icon: Compass,
    link: "Find a project",
  },
  {
    href: "/build/people",
    title: "Find people",
    description: "Discover students by skill, college, and availability. Meet people ready to learn and make things together.",
    icon: Users,
    link: "Meet collaborators",
  },
  {
    href: "/build/teams",
    title: "Find teams",
    description: "See teams looking for new perspectives and skills, or start a team around an idea you care about.",
    icon: Compass,
    link: "Explore teams",
  },
];

export default function BuildPage() {
  return (
    <>
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground"><Users className="size-4 text-primary" /> BUILD · Ideas and teams</p>
          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Find your people.<br /><span className="text-primary">Build something real.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Bring an idea, find people who care about the same problem, and turn a first step into something you can share.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link href="/build/ideas/new">Post an idea <Plus className="size-4" /></Link></Button><Button asChild size="lg" variant="outline"><Link href="/build/explore">Explore projects <ArrowRight className="size-4" /></Link></Button></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Start building</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Your next step, your way.</h2></div><Button asChild variant="outline"><Link href="/build/teams/new">Create a team</Link></Button></div>
        <div className="grid gap-5 md:grid-cols-2">
          {destinations.map(({ href, title, description, icon: Icon, link }) => (
            <Card className="group" key={title}>
              <CardHeader><span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary"><Icon className="size-5" /></span><CardTitle className="mt-2 text-2xl">{title}</CardTitle></CardHeader>
              <CardContent><p className="max-w-lg leading-7 text-muted-foreground">{description}</p><Link className="mt-6 inline-flex items-center gap-2 text-sm font-medium group-hover:text-primary" href={href}>{link}<ArrowRight className="size-4" /></Link></CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
