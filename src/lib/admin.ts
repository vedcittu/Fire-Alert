import type { AlertSeverity, AlertStatus, SensorNode } from "@/lib/types";

export type AdminAlertInput = {
  title?: string | null;
  severity: AlertSeverity;
  location?: string | null;
  message?: string | null;
};

export function normalizeAdminText(value?: string | null) {
  return (value ?? "").trim();
}

export function buildAlertPayload(
  node: Pick<SensorNode, "id" | "code" | "location" | "building_id"> | null,
  input: AdminAlertInput,
) {
  const severity = input.severity ?? "warning";
  const safeLocation = normalizeAdminText(input.location) || node?.location || "Campus";
  const safeTitle = normalizeAdminText(input.title) || `${node?.code ?? "Campus"} ${severity} alert`;

  return {
    title: safeTitle,
    location: safeLocation,
    building_id: node?.building_id ?? null,
    node_id: node?.id ?? null,
    severity,
    status: "open" as AlertStatus,
    message: normalizeAdminText(input.message) || "Admin emergency alert has been triggered.",
  };
}
