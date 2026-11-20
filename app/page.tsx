import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BriefcaseBusiness, Lightbulb, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { number: "01", title: "Choose your path", description: "Pick a real-world challenge or bring an idea of your own." },
  { number: "02", title: "Make it together", description: "Learn by doing, collaborate with others, and keep moving forward." },
  { number: "03", title: "Show what you did", description: "Build a record of practical work you can share with confidence." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[590px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" /> A new way to get started
            </p>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              From Learning<br />to <span className="text-primary">Doing.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Your education is a starting point. CONNECT helps you turn what you know into real work, real projects, and real momentum.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg"><Link href="/signup">Get started <ArrowRight className="size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="#how-it-works">See how it works <ArrowDown className="size-4" /></Link></Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">A place to learn by doing, at every stage.</p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-8 rounded-full bg-accent/60 blur-3xl" />
            <Card className="relative rotate-[-2deg] p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your work, in motion</p>
                  <p className="mt-2 text-2xl font-semibold">A little progress adds up.</p>
                </div>
                <span className="rounded-xl bg-accent p-3 text-primary"><ShieldCheck className="size-6" /></span>
              </div>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
                  <span className="rounded-lg bg-muted p-2.5"><BriefcaseBusiness className="size-5 text-muted-foreground" /></span>
                  <div className="min-w-0 flex-1"><p className="font-medium">Customer research sprint</p><p className="mt-1 text-xs text-muted-foreground">Experience · Completed</p></div>
                  <ShieldCheck className="size-5 shrink-0 text-primary" />
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
                  <span className="rounded-lg bg-muted p-2.5"><Users className="size-5 text-muted-foreground" /></span>
                  <div className="min-w-0 flex-1"><p className="font-medium">Campus food map</p><p className="mt-1 text-xs text-muted-foreground">Build · Team of 3</p></div>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t pt-5 text-sm">
                <span className="text-muted-foreground">Your experience is growing</span>
                <span className="font-medium text-primary">View record</span>
              </div>
            </Card>
            <div className="absolute -bottom-7 -left-5 hidden rounded-xl border bg-card p-4 sm:block">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-accent p-2 text-primary"><Lightbulb className="size-5" /></span><div><p className="text-sm font-medium">Ideas welcome</p><p className="text-xs text-muted-foreground">Start with what you have</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="paths-heading" className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Two ways to move forward</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl" id="paths-heading">Make your learning count.</h2>
            <p className="mt-4 text-muted-foreground">Get hands-on with meaningful work, or build something that starts with you.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="group transition-colors hover:border-primary/40" id="experience">
              <CardHeader className="pb-4">
                <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-accent text-primary"><BriefcaseBusiness className="size-5" /></span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pillar 01</p>
                <CardTitle className="text-2xl">EXPERIENCE</CardTitle>
                <CardDescription className="max-w-md text-base">Do real tasks, projects, and challenges from companies. Build a verifiable record of what you can do.</CardDescription>
              </CardHeader>
              <CardContent><Link className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary" href="/#experience">Explore opportunities <ArrowRight className="size-4" /></Link></CardContent>
            </Card>
            <Card className="group transition-colors hover:border-primary/40" id="build">
              <CardHeader className="pb-4">
                <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-accent text-primary"><Lightbulb className="size-5" /></span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Pillar 02</p>
                <CardTitle className="text-2xl">BUILD</CardTitle>
                <CardDescription className="max-w-md text-base">Share an idea, find people who want to make it real, and build projects together from the ground up.</CardDescription>
              </CardHeader>
              <CardContent><Link className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary" href="/build">Find your people <ArrowRight className="size-4" /></Link></CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24" id="how-it-works">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start where you are.</h2>
          <p className="mt-4 text-muted-foreground">No perfect plan needed. Just a next step.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div className="border-t pt-5" key={step.number}>
              <p className="text-sm font-semibold text-primary">{step.number}</p>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12"><Button asChild size="lg"><Link href="/signup">Find your next step <ArrowRight className="size-4" /></Link></Button></div>
      </section>
    </>
  );
}
