import type { Alert, SensorNode } from "@/lib/types";

export function buildRescueViewData(nodes: SensorNode[] = [], alerts: Alert[] = []) {
  const alertList = [...alerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const openAlerts = alertList.filter((alert) => alert.status !== "resolved");

  const critical =
    openAlerts.find(
      (alert) => alert.severity === "critical" || alert.severity === "emergency",
    ) ?? null;

  const focus =
    nodes.find((node) => node.id === critical?.node_id) ??
    nodes.find((node) => node.flame_detected || node.smoke_level === "high") ??
    nodes[0] ??
    null;

  const onlineUnits = nodes.filter((node) => node.status === "online").length;
  const hotZones = nodes.filter((node) => node.flame_detected || node.smoke_level === "high").length;
  const criticalCount = openAlerts.filter(
    (alert) => alert.severity === "critical" || alert.severity === "emergency",
  ).length;

  const quickStats = [
    { label: "Active alerts", value: String(openAlerts.length), style: "bg-error-container text-error" },
    { label: "Online units", value: String(onlineUnits), style: "bg-safety-green/10 text-safety-green" },
    { label: "Hot zones", value: String(hotZones), style: "bg-warning-yellow/15 text-warning-yellow" },
  ];

  const timeline = openAlerts.slice(0, 4).map((alert) => ({
    time: formatClock(alert.created_at),
    title: alert.title || "Incident update",
    detail: `${alert.location} · ${alert.severity.toUpperCase()} status${alert.node_id ? ` · node ${alert.node_id}` : ""}`,
  }));

  const escalations = [
    {
      level: "Level 1",
      title: "On-site triage",
      status: critical ? "Active" : "Standby",
      tone: critical ? "bg-warning-yellow/20 text-warning-yellow" : "bg-surface-container text-on-surface-variant",
    },
    {
      level: "Level 2",
      title: "Containment",
      status: criticalCount > 1 ? "Escalated" : "Monitoring",
      tone: criticalCount > 1 ? "bg-error-container text-error" : "bg-warning-yellow/20 text-warning-yellow",
    },
    {
      level: "Level 3",
      title: "Campus-wide alert",
      status: critical ? "Broadcast" : "Ready",
      tone: critical ? "bg-safety-green/10 text-safety-green" : "bg-surface-container text-on-surface-variant",
    },
  ];

  const actionQueue = [
    focus
      ? `Prioritize ${focus.location} and verify the ${focus.code} node telemetry before dispatching further units.`
      : "Review the latest sensor activity and verify the affected zone.",
    `Assign at least one responder to the most active node and confirm safe evacuation routes for nearby rooms.`,
    `Update all faculty and student channels with the latest incident summary and current status.`,
  ];

  const mapZones = nodes.length
    ? nodes.slice(0, 3).map((node, index) => {
        const riskLevel = node.flame_detected ? "Blocked" : node.smoke_level === "high" ? "Risk" : "Open";
        const style =
          riskLevel === "Blocked"
            ? "border-error/40 bg-error-container text-error"
            : riskLevel === "Risk"
              ? "border-warning-yellow/40 bg-warning-yellow/20 text-warning-yellow"
              : "border-safety-green/40 bg-safety-green/10 text-safety-green";

        return {
          name: node.location || `Zone ${index + 1}`,
          flag: riskLevel,
          style,
        };
      })
    : [];

  const teamAssignments = nodes.slice(0, 3).map((node, index) => {
    const status = node.status === "online" ? (node.flame_detected ? "Responding" : "En route") : "Standby";
    const color =
      status === "Responding"
        ? "text-error"
        : status === "En route"
          ? "text-safety-green"
          : "text-warning-yellow";

    return {
      name: `Unit ${String(index + 1).padStart(2, "0")}`,
      role: node.location || `Sector ${index + 1}`,
      status,
      color,
    };
  });

  const responseBoard = [
    {
      label: "Nearest unit",
      value: focus ? `${teamAssignments[0]?.name ?? "Unit 01"} / ${focus.location}` : "Awaiting telemetry",
      badge: focus ? (focus.status === "online" ? "En route" : "Standby") : "Standby",
      badgeStyle: focus
        ? focus.status === "online"
          ? "bg-safety-green/10 text-safety-green"
          : "bg-warning-yellow/20 text-warning-yellow"
        : "bg-surface-container text-on-surface-variant",
    },
    {
      label: "Evac route",
      value: focus ? `${focus.location} / Safe exit` : "Route unavailable",
      badge: "CLEAR",
      badgeStyle: "bg-primary/10 text-primary",
    },
    {
      label: "Team status",
      value: `${Math.max(onlineUnits, 1)} responders ready`,
      badge: critical ? "ACTIVE" : "READY",
      badgeStyle: critical ? "bg-error-container text-error" : "bg-warning-yellow/20 text-warning-yellow",
    },
  ];

  return {
    critical,
    focus,
    quickStats,
    timeline,
    escalations,
    actionQueue,
    mapZones,
    teamAssignments,
    responseBoard,
    onlineUnits,
    hotZones,
    openAlerts,
  };
}

function formatClock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
