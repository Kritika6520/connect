"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/experience", label: "Experience" },
  { href: "/build", label: "Build" },
  { href: "/profile/edit", label: "Profile" },
];

export function Navbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link aria-label="CONNECT home" className="text-lg font-bold tracking-[0.16em]" href="/">
          CONNECT<span className="text-primary">.</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <form action={signOut}><Button type="submit" variant="ghost">Sign out</Button></form>
          ) : (
            <>
              <Button asChild variant="ghost"><Link href="/login">Log in</Link></Button>
              <Button asChild><Link href="/signup">Sign up</Link></Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)} size="icon" variant="ghost">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav aria-label="Mobile navigation" className="border-t bg-background px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <Link className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-4">
              {isAuthenticated ? (
                <form action={signOut} className="col-span-2"><Button className="w-full" type="submit" variant="outline">Sign out</Button></form>
              ) : (
                <><Button asChild variant="outline"><Link href="/login">Log in</Link></Button><Button asChild><Link href="/signup">Sign up</Link></Button></>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
