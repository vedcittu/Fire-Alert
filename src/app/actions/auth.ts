"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dashboardPath, type UserRole } from "@/lib/types";

const FALLBACK_ADMIN_EMAIL = "vedprakash783988@gmail.com";

async function resolveAdminEmail(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("email, role")
    .in("role", ["faculty", "admin"])
    .limit(50);

  if (!error && Array.isArray(data) && data.length > 0) {
    const match =
      data.find((profile) => profile.email?.toLowerCase() === FALLBACK_ADMIN_EMAIL.toLowerCase()) ??
      data.find((profile) => profile.email && profile.role === "faculty") ??
      data.find((profile) => profile.email && profile.role === "admin") ??
      null;

    if (match?.email) return match.email.trim().toLowerCase();
  }

  return FALLBACK_ADMIN_EMAIL.toLowerCase();
}

function asRole(value: FormDataEntryValue | null): UserRole {
  if (value === "faculty" || value === "admin" || value === "rescue" || value === "student") return value;
  return "student";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  const requestedRole = asRole(formData.get("role"));
  const allowedAdminEmail = await resolveAdminEmail();
  const isAdminLogin = requestedRole === "admin" || email.toLowerCase() === allowedAdminEmail.toLowerCase();

  if (requestedRole === "admin" && email.toLowerCase() !== allowedAdminEmail.toLowerCase()) {
    redirect(
      `/login?error=${encodeURIComponent(`Only the admin email ${allowedAdminEmail} is allowed to sign in.`)}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  revalidatePath("/", "layout");
  if (next.startsWith("/")) redirect(next);

  const resolvedRole = isAdminLogin
    ? "admin"
    : profile?.role === "faculty" || profile?.role === "admin" || profile?.role === "rescue"
      ? (profile.role as UserRole)
      : requestedRole;
  redirect(dashboardPath(resolvedRole));
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = asRole(formData.get("role"));
  const allowedAdminEmail = await resolveAdminEmail();
  const isAdminSignup = role === "admin" && email.toLowerCase() === allowedAdminEmail.toLowerCase();

  if (role === "admin" && !isAdminSignup) {
    redirect(
      `/signup?error=${encodeURIComponent(`Only the admin email ${allowedAdminEmail} is allowed to register.`)}`,
    );
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: { role, full_name: fullName },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect("/login?notice=Check your email to confirm your account, then sign in.");
  }

  revalidatePath("/", "layout");
  redirect(dashboardPath(role));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const building = String(formData.get("building") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  if (!userId) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      building: building || null,
      department: department || null,
    })
    .eq("id", userId);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  redirect("/profile?notice=Profile updated");
}
