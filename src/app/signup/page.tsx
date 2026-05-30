/**
 * Pharmacquest — Signup page
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { signUp } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = {
  title: "Sign up",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  // Already logged in? Send home.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
<AuthShell variant="energetic">
      <div className="space-y-7">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-foreground-muted">
            Free for now. No credit card required.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
          </Alert>
        )}

        <form action={signUp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="What should we call you?"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="amaka@uniabuja.edu.ng"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create account
          </Button>
        </form>

        <p className="text-sm text-center text-foreground-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary-700 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}