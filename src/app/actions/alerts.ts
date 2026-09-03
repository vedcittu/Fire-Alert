"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { AlertStatus } from "@/lib/types";

export async function updateAlertStatus(alertId: string, status: AlertStatus) {
  const profile = await requireProfile();
  if (profile.role === "student") {
    return { error: "Students cannot update alerts." };
  }

  const patch: Record<string, string | null> = { status };
  if (status === "acknowledged") patch.acknowledged_at = new Date().toISOString();
  if (status === "resolved") patch.resolved_at = new Date().toISOString();

  const supabase = await createClient();
  const { error } = await supabase.from("alerts").update(patch).eq("id", alertId);
  if (error) return { error: error.message };

  revalidatePath("/faculty");
  revalidatePath("/rescue");
  revalidatePath("/alerts");
  revalidatePath("/student");
  return { ok: true };
}
