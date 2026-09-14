import { createNodeAlert, updateNodeSettings } from "@/app/actions/admin";
import { BottomNav } from "@/components/BottomNav";
import { LiveTelemetryBoard } from "@/components/LiveTelemetryBoard";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dashboardPath, type Alert, type Building, type SensorNode } from "@/lib/types";
import { redirect } from "next/navigation";

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? "just now" : `${mins}m ago`;
}

export default async function AdminDashboard() {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    redirect(dashboardPath(profile.role));
  }
  const supabase = await createClient();

  const [{ data: nodes }, { data: alerts }, { data: buildings }] = await Promise.all([
    supabase.from("sensor_nodes").select("*").order("code"),
    supabase.from("alerts").select("*").neq("status", "resolved").order("created_at", { ascending: false }),
    supabase.from("buildings").select("*").order("name"),
  ]);

  const nodeList = (nodes as SensorNode[] | null) ?? [];
  const alertList = (alerts as Alert[] | null) ?? [];
  const buildingList = (buildings as Building[] | null) ?? [];
  const onlineCount = nodeList.filter((n) => n.status === "online").length;
  const offlineCount = nodeList.filter((n) => n.status === "offline").length;
  const criticalCount = alertList.filter((a) => a.severity === "critical" || a.severity === "emergency").length;
  const openAlerts = alertList.filter((a) => a.status !== "resolved");
  const firstNode = nodeList[0];

  return (
    <div className="min-h-screen bg-background pb-28 text-on-surface">
      <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">System overview</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.05em] text-primary sm:text-3xl">Admin dashboard</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-safety-green/30 bg-safety-green/10 px-3 py-1.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-safety-green" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-safety-green">online</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total nodes" value={String(nodeList.length)} tone="primary" trend="Live" />
          <StatCard title="Online nodes" value={String(onlineCount)} tone="success" trend="Healthy" />
          <StatCard title="Offline nodes" value={String(offlineCount)} tone="neutral" trend="Watch" />
          <StatCard title="Critical alerts" value={String(criticalCount)} tone="danger" trend="Action" />
        </section>

        <section className="mt-6">
          <LiveTelemetryBoard nodes={nodeList} title="Admin live telemetry board" />
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-[-0.04em] text-primary">Campus status</h2>
              <span className="rounded-full bg-primary-container px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-on-primary">
                Live feed
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {buildingList.map((building) => {
                const statusColor =
                  building.status === "critical"
                    ? "border-critical-red bg-critical-red/5"
                    : building.status === "warning"
                      ? "border-warning-yellow bg-warning-yellow/10"
                      : "border-safety-green bg-safety-green/10";
                const dotColor =
                  building.status === "critical"
                    ? "bg-critical-red"
                    : building.status === "warning"
                      ? "bg-warning-yellow"
                      : "bg-safety-green";

                return (
                  <div key={building.id} className={`rounded-2xl border p-4 ${statusColor}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                        {building.name}
                      </span>
                      <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    </div>
                    <p className="mt-4 text-2xl font-black tracking-[-0.05em] text-primary">
                      {building.status === "critical" ? "Critical" : building.status === "warning" ? "Warning" : "Nominal"}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {building.status === "critical"
                        ? "Immediate response required"
                        : building.status === "warning"
                          ? "Watch conditions closely"
                          : "No active anomaly detected"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-[-0.04em] text-primary">Active alerts</h2>
              <span className="rounded-full bg-error-container px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-on-error-container">
                {openAlerts.length}
              </span>
            </div>

            <div className="space-y-3">
              {openAlerts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No active alerts.</div>
              ) : (
                openAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-outline-variant bg-surface-container p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-primary">{alert.title}</p>
                        <p className="mt-1 text-sm text-on-surface-variant">{alert.location}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-error">{alert.severity}</span>
                    </div>
                    <p className="mt-3 text-xs text-on-surface-variant">{timeAgo(alert.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-[-0.04em] text-primary">Set alert</h2>
              <span className="rounded-full bg-error-container px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-on-error-container">
                Manual dispatch
              </span>
            </div>

            <form action={createNodeAlert} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Node</span>
                  <select
                    name="nodeId"
                    defaultValue={firstNode?.id ?? ""}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  >
                    {nodeList.length === 0 ? (
                      <option value="">No nodes available</option>
                    ) : (
                      nodeList.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.code} — {node.location}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Severity</span>
                  <select
                    name="severity"
                    defaultValue="critical"
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  >
                    <option value="warning">Warning</option>
                    <option value="emergency">Emergency</option>
                    <option value="critical">Critical</option>
                    <option value="safe">Safe</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-on-surface-variant">
                <span>Alert title</span>
                <input
                  name="title"
                  placeholder={firstNode ? `${firstNode.code} critical alert` : "Enter alert title"}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-on-surface-variant">
                <span>Location</span>
                <input
                  name="location"
                  placeholder={firstNode?.location ?? "Enter location"}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-on-surface-variant">
                <span>Message</span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Describe the incident or response instructions"
                  className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-error px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_32px_rgba(239,68,68,0.28)] transition hover:opacity-95"
              >
                Trigger alert
              </button>
            </form>
          </div>

          <div className="rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-[-0.04em] text-primary">Edit nodes</h2>
              <span className="rounded-full bg-safety-green/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-safety-green">
                Live controls
              </span>
            </div>

            <form action={updateNodeSettings} className="space-y-4">
              <label className="block space-y-2 text-sm font-medium text-on-surface-variant">
                <span>Node</span>
                <select
                  name="nodeId"
                  defaultValue={firstNode?.id ?? ""}
                  className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                >
                  {nodeList.length === 0 ? (
                    <option value="">No nodes available</option>
                  ) : (
                    nodeList.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.code} — {node.location}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Node status</span>
                  <select
                    name="status"
                    defaultValue={firstNode?.status ?? "online"}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Smoke level</span>
                  <select
                    name="smoke_level"
                    defaultValue={firstNode?.smoke_level ?? "normal"}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  >
                    <option value="normal">Normal</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Temp °C</span>
                  <input
                    type="number"
                    name="temperature_c"
                    defaultValue={firstNode?.temperature_c ?? 24}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Humidity %</span>
                  <input
                    type="number"
                    name="humidity_pct"
                    defaultValue={firstNode?.humidity_pct ?? 50}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-on-surface-variant">
                  <span>Load %</span>
                  <input
                    type="number"
                    name="load_pct"
                    defaultValue={firstNode?.load_pct ?? 0}
                    className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none ring-0"
                  />
                </label>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface px-3 py-3 text-sm text-on-surface-variant">
                <span>Flame detected</span>
                <input
                  type="checkbox"
                  name="flame_detected"
                  defaultChecked={firstNode?.flame_detected ?? false}
                  className="h-4 w-4 rounded border-outline-variant"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_32px_rgba(14,116,144,0.25)] transition hover:opacity-95"
              >
                Save node changes
              </button>
            </form>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-[-0.04em] text-primary">Monitored labs</h2>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">System health</span>
          </div>

          <div className="space-y-3">
            {nodeList.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No sensor nodes configured yet.</div>
            ) : (
              nodeList.map((node) => {
                const statusCode = node.status === "online" ? "online" : "offline";
                return (
                  <div key={node.id} className="flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container p-4">
                    <div>
                      <p className="font-bold text-primary">{node.code}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{node.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant">{node.temperature_c}°C</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                          statusCode === "online"
                            ? "bg-safety-green/10 text-safety-green"
                            : "bg-error-container text-on-error-container"
                        }`}
                      >
                        {statusCode}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
      <BottomNav role={profile.role} alertCount={openAlerts.length} />
    </div>
  );
}

function StatCard({
  title,
  value,
  tone,
  trend,
}: {
  title: string;
  value: string;
  tone: "primary" | "success" | "neutral" | "danger";
  trend: string;
}) {
  const tones = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    success: "border-safety-green/30 bg-safety-green/10 text-safety-green",
    neutral: "border-outline-variant bg-surface-container text-on-surface-variant",
    danger: "border-error/20 bg-error-container text-on-error-container",
  };

  return (
    <div className={`rounded-[24px] border p-4 shadow-[0_15px_28px_rgba(15,23,42,0.04)] ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-3xl font-black tracking-[-0.06em]">{value}</p>
        <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{trend}</span>
      </div>
    </div>
  );
}
