import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dashboardPath, type Profile } from "@/lib/types";

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, building, department")
    .eq("id", userId)
    .single();

  return profile as Profile | null;
}

export async function requireProfile() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export { dashboardPath };
