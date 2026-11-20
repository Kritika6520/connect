"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">We couldn’t load this page.</h1>
      <p className="mt-3 text-muted-foreground">Try again. Your next step is still here when you’re ready.</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  );
}
