export default function Loading() {
  return (
    <div aria-label="Loading page" className="mx-auto max-w-7xl animate-pulse px-5 py-20 sm:px-8" role="status">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-6 h-16 max-w-xl rounded bg-muted" />
      <div className="mt-4 h-6 max-w-lg rounded bg-muted" />
      <div className="mt-12 grid gap-5 md:grid-cols-2"><div className="h-56 rounded-xl border bg-card" /><div className="h-56 rounded-xl border bg-card" /></div>
      <span className="sr-only">Loading CONNECT</span>
    </div>
  );
}
