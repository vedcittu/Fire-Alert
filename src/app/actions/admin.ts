"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildAlertPayload } from "@/lib/admin";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AlertSeverity, AlertStatus, SensorNode } from "@/lib/types";

async function ensureAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    throw new Error("Only administrators can manage alerts and nodes.");
  }
  return profile;
}

async function triggerEmailDispatch(alert: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return;
  }

  const response = await fetch(`${url}/functions/v1/fire-alert-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ alert }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("fire-alert-email dispatch failed:", text);
  }
}

export async function createNodeAlert(formData: FormData) {
  try {
    const profile = await ensureAdmin();
    const nodeId = String(formData.get("nodeId") ?? "").trim();
    const severity = (String(formData.get("severity") ?? "warning") as AlertSeverity) || "warning";
    const title = String(formData.get("title") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!nodeId) {
      throw new Error("Select a node before creating an alert.");
    }

    const supabase = await createClient();
    const { data: node, error: nodeError } = await supabase
      .from("sensor_nodes")
      .select("*")
      .eq("id", nodeId)
      .single();

    if (nodeError || !node) {
      throw new Error("Selected node could not be found.");
    }

    const payload = buildAlertPayload(node as Pick<SensorNode, "id" | "code" | "location" | "building_id">, {
      title,
      severity,
      location,
      message,
    });

    const { data: insertedAlert, error } = await supabase
      .from("alerts")
      .insert([
        {
          title: payload.title,
          location: payload.location,
          building_id: payload.building_id,
          node_id: payload.node_id,
          severity: payload.severity,
          status: payload.status as AlertStatus,
        },
      ])
      .select()
      .single();

    if (error || !insertedAlert) {
      throw new Error(error?.message ?? "Unable to create the alert.");
    }

    if (payload.building_id) {
      const nextBuildingStatus = severity === "critical" || severity === "emergency" ? "critical" : "warning";
      await supabase
        .from("buildings")
        .update({ status: nextBuildingStatus })
        .eq("id", payload.building_id);
    }

    if (severity === "critical" || severity === "emergency") {
      await triggerEmailDispatch({
        ...insertedAlert,
        created_at: insertedAlert.created_at ?? new Date().toISOString(),
      });
    }

    revalidatePath("/admin");
    revalidatePath("/student");
    revalidatePath("/faculty");
    revalidatePath("/rescue");
    revalidatePath("/alerts");
    redirect("/admin");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    redirect(`/admin?error=${encodeURIComponent(reason)}`);
  }
}

export async function updateNodeSettings(formData: FormData) {
  try {
    await ensureAdmin();

    const nodeId = String(formData.get("nodeId") ?? "").trim();
    const status = String(formData.get("status") ?? "online");
    const temperature = Number(formData.get("temperature_c") ?? 24);
    const humidity = Number(formData.get("humidity_pct") ?? 50);
    const smoke = String(formData.get("smoke_level") ?? "normal");
    const flame = formData.get("flame_detected") === "on" || formData.get("flame_detected") === "true";
    const load = Number(formData.get("load_pct") ?? 0);

    if (!nodeId) {
      throw new Error("Node record is missing.");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("sensor_nodes")
      .update({
        status,
        temperature_c: temperature,
        humidity_pct: humidity,
        smoke_level: smoke,
        flame_detected: flame,
        load_pct: Number.isFinite(load) ? load : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", nodeId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath("/map");
    revalidatePath("/student");
    revalidatePath("/faculty");
    revalidatePath("/rescue");
    redirect("/admin");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";
    redirect(`/admin?error=${encodeURIComponent(reason)}`);
  }
}
