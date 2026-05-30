/**
 * Pharmacquest — Profile setup (post-signup welcome)
 *
 * One-screen onboarding. Asks for display name (pre-filled), profession,
 * school, year of study. After saving, the user lands on the dashboard.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeProfileSetup } from "@/lib/profile/actions";
import { NIGERIAN_PHARMACY_SCHOOLS } from "@/lib/profile/schools";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = {
  title: "Welcome",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function WelcomePage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If they already completed setup, no need to come here again.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, profile_completed")
    .eq("id", user.id)
    .single();
  if (profile?.profile_completed) redirect("/");

  const defaultName = profile?.display_name ?? user.email?.split("@")[0] ?? "";

  return (
<AuthShell variant="calm">
      <div className="space-y-7">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Pharmacquest</h1>
          <p className="text-sm text-foreground-muted">
            Set up your profile to get started.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
          </Alert>
        )}

        <form action={completeProfileSetup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display_name">What should we call you?</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              defaultValue={defaultName}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Your profession or course</Label>
            <select
              id="profession"
              name="profession"
              required
              defaultValue="pharmacy"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pharmacy">Pharmacy</option>
              <option value="nursing" disabled>Nursing (coming soon)</option>
              <option value="mls" disabled>Medical Laboratory Science (coming soon)</option>
              <option value="medicine" disabled>Medicine (coming soon)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">Your school</Label>
            <select
              id="school"
              name="school"
              required
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Pick your school…
              </option>
              {NIGERIAN_PHARMACY_SCHOOLS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
              <option value="other">Other (please specify)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="school_other">
              Your school (if not in the list)
              <span className="text-foreground-subtle font-normal ml-1">— optional</span>
            </Label>
            <Input
              id="school_other"
              name="school_other"
              type="text"
              placeholder="Only fill in if you selected 'Other' above"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year_of_study">Year of study</Label>
            <select
              id="year_of_study"
              name="year_of_study"
              required
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                Pick your year…
              </option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
              <option value="5">Year 5</option>
              <option value="6">Year 6 / Doctor of Pharmacy</option>
            </select>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Start training
          </Button>
        </form>

        <p className="text-xs text-center text-foreground-subtle">
          You can update these details anytime from your profile.
        </p>
      </div>
    </AuthShell>
  );
}