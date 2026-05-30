/**
 * Pharmacquest — Login page
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { logIn } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = {
  title: "Log in",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
<AuthShell variant="calm">
      <div className="space-y-7">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
          <p className="text-sm text-foreground-muted">
            Continue your training.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
          </Alert>
        )}

        <form action={logIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Log in
          </Button>
        </form>

        <p className="text-sm text-center text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary-700 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}