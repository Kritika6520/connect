"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="mx-auto max-w-xl px-5 py-24"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">EXPERIENCE</p><h1 className="mt-3 text-3xl font-semibold">Your record didn’t load.</h1><p className="mt-3 text-muted-foreground">Please try again.</p><Button className="mt-6" onClick={reset}>Try again</Button></div>; }
