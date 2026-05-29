/**
 * Pharmacquest — Profile setup Server Actions
 */

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidSchoolValue } from "@/lib/profile/schools";

interface ProfileSetupInput {
  display_name?: string;
  profession?: string;
  school?: string;
  school_other?: string;
  year_of_study?: string;
}

/**
 * Save the user's profile setup. Validates input, writes to DB, marks the
 * profile as completed so middleware stops redirecting them.
 */
export async function completeProfileSetup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const input: ProfileSetupInput = {
    display_name: String(formData.get("display_name") ?? "").trim(),
    profession: String(formData.get("profession") ?? "").trim(),
    school: String(formData.get("school") ?? "").trim(),
    school_other: String(formData.get("school_other") ?? "").trim(),
    year_of_study: String(formData.get("year_of_study") ?? "").trim(),
  };

  // ── Validate ──────────────────────────────────────────────────────────
  const errors: string[] = [];

  if (!input.display_name || input.display_name.length < 2) {
    errors.push("Display name is too short");
  }

  if (input.profession !== "pharmacy") {
    // For v1 we only allow pharmacy. Other professions appear in the
    // dropdown as "Coming soon" — they shouldn't be submitable.
    errors.push("Only pharmacy is supported for now");
  }

  if (!input.school || !isValidSchoolValue(input.school)) {
    errors.push("Please pick your school from the list");
  }

  // If "other" school selected, require a typed name.
  let finalSchoolValue = input.school;
  if (input.school === "other") {
    if (!input.school_other || input.school_other.length < 3) {
      errors.push("Please type the name of your school");
    } else {
      finalSchoolValue = `other:${input.school_other}`;
    }
  }

  const yearNum = Number(input.year_of_study);
  if (!Number.isInteger(yearNum) || yearNum < 1 || yearNum > 6) {
    errors.push("Year of study must be between 1 and 6");
  }

  if (errors.length > 0) {
    redirect(
      `/welcome?error=${encodeURIComponent(errors.join(". "))}`
    );
  }

  // ── Write to DB ────────────────────────────────────────────────────────
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.display_name,
      profession: input.profession,
      school: finalSchoolValue,
      year_of_study: yearNum,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/welcome?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}