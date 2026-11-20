import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link className="font-semibold tracking-[0.14em] text-foreground" href="/">CONNECT<span className="text-primary">.</span></Link>
        <p>From Learning to Doing.</p>
        <p>© {new Date().getFullYear()} CONNECT</p>
      </div>
    </footer>
  );
}
