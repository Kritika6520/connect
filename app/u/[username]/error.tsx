"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="mx-auto max-w-xl px-5 py-24"><h1 className="text-3xl font-semibold">This profile didn’t load.</h1><p className="mt-3 text-muted-foreground">Please try again in a moment.</p><Button className="mt-6" onClick={reset}>Try again</Button></div>; }
