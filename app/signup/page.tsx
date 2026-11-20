import Link from "next/link";
import { signInWithGoogle, signUp } from "@/lib/actions/auth";
import { AuthFormMessage } from "@/components/auth-form-message";
import { Button } from "@/components/ui/button";

type SignupPageProps = { searchParams: Promise<{ error?: string; notice?: string }> };

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Create your account</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Make your next step count.</h1>
      <p className="mt-3 text-muted-foreground">Join CONNECT and start learning by doing.</p>
      <div className="mt-7"><AuthFormMessage error={params.error} notice={params.notice} /></div>
      <form action={signUp} className="mt-6 space-y-4">
        <label className="block text-sm font-medium" htmlFor="full_name">Full name<input autoComplete="name" className="mt-2 h-11 w-full rounded-xl border bg-background px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" id="full_name" maxLength={80} name="full_name" required /></label>
        <label className="block text-sm font-medium" htmlFor="email">Email<input autoComplete="email" className="mt-2 h-11 w-full rounded-xl border bg-background px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" id="email" name="email" required type="email" /></label>
        <label className="block text-sm font-medium" htmlFor="password">Password<input autoComplete="new-password" className="mt-2 h-11 w-full rounded-xl border bg-background px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" id="password" minLength={8} name="password" required type="password" /></label>
        <Button className="w-full" size="lg" type="submit">Create account</Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />OR<span className="h-px flex-1 bg-border" /></div>
      <form action={signInWithGoogle}><Button className="w-full" size="lg" type="submit" variant="outline">Continue with Google</Button></form>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-medium text-primary hover:underline" href="/login">Log in</Link></p>
    </section>
  );
}
