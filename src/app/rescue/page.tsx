import { AlertActions } from "@/components/AlertActions";
import { BottomNav } from "@/components/BottomNav";
import { SensorMap } from "@/components/SensorMap";
import { requireProfile } from "@/lib/auth";
import { buildRescueViewData } from "@/lib/live-data";
import { createClient } from "@/lib/supabase/server";
import type { Alert, SensorNode } from "@/lib/types";

export default async function RescueDashboard() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: alerts }, { data: nodes }] = await Promise.all([
    supabase.from("alerts").select("*").order("created_at", { ascending: false }),
    supabase.from("sensor_nodes").select("*"),
  ]);

  const alertList = (alerts as Alert[] | null) ?? [];
  const nodeList = (nodes as SensorNode[] | null) ?? [];
  const { critical, focus, quickStats, timeline, escalations, actionQueue, teamAssignments, responseBoard } =
    buildRescueViewData(nodeList, alertList);
  const openCount = alertList.filter((a) => a.status !== "resolved").length;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <div className="min-w-0">
              <p className="font-label-caps text-[10px] uppercase text-on-surface-variant">Campus safety</p>
              <h1 className="truncate text-base font-bold text-primary sm:text-lg">Rescue operations</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-safety-green/30 bg-safety-green/10 px-3 py-1.5 font-label-caps text-[10px] font-bold text-safety-green">
              <span className="h-2 w-2 animate-pulse rounded-full bg-safety-green" />
              LIVE
            </span>
            <span className="rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 font-data-mono text-[11px] font-bold text-on-surface-variant">
              {openCount} ACTIVE
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 pb-28 pt-6 md:px-8 md:pb-24 md:pt-8">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Incident response</p>
            <h2 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">Operations overview</h2>
          </div>
          <p className="font-data-mono text-xs text-on-surface-variant">
            {focus ? `${focus.code} · ${focus.location}` : "No sensor selected"}
          </p>
        </section>

        {critical ? (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-error/30 border-l-4 border-l-error bg-error-container/70 p-4 sm:p-5" aria-labelledby="active-incident-title">
            <div className="flex min-w-0 items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-2xl text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div className="min-w-0">
                <p className="font-label-caps text-[10px] font-bold uppercase text-error">Priority incident · {critical.severity}</p>
                <h2 id="active-incident-title" className="mt-1 break-words text-lg font-bold text-on-error-container">{critical.title}</h2>
                <p className="mt-1 text-sm text-on-error-container">{critical.location}{focus?.code ? ` · ${focus.code}` : ""}</p>
              </div>
            </div>
            <span className="rounded-full border border-error/30 bg-white/70 px-3 py-1.5 font-data-mono text-xs font-bold uppercase text-error">
              {critical.status.replaceAll("_", " ")}
            </span>
          </section>
        ) : (
          <section className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${openCount ? "border-warning-yellow/40 bg-warning-yellow/10" : "border-safety-green/30 bg-safety-green/10"}`} aria-live="polite">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${openCount ? "text-warning-yellow" : "text-safety-green"}`}>
                {openCount ? "info" : "verified_user"}
              </span>
              <div>
                <p className={`font-bold ${openCount ? "text-on-surface" : "text-safety-green"}`}>
                  {openCount ? "No active critical incident" : "All clear"}
                </p>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  {openCount ? `${openCount} alert${openCount === 1 ? "" : "s"} still require monitoring.` : "No active incidents are being tracked."}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Current response metrics">
          {quickStats.map((item) => (
            <div key={item.label} className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${item.style}`}>
              <p className="font-label-caps text-[10px] font-bold uppercase">{item.label}</p>
              <p className="font-data-mono text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="response-actions-title">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Next step</p>
                <h3 id="response-actions-title" className="mt-1 text-lg font-bold text-primary">RESPONSE ACTIONS</h3>
              </div>
              {critical ? (
                <span className="rounded-full bg-error-container px-2.5 py-1 font-label-caps text-[10px] font-bold uppercase text-error">{critical.severity}</span>
              ) : null}
            </div>
            {critical ? (
              <AlertActions alert={critical} />
            ) : (
              <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
                No critical alert is selected for response.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="current-status-title">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Sensor snapshot</p>
                <h3 id="current-status-title" className="mt-1 text-lg font-bold text-primary">CURRENT STATUS</h3>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-data-mono text-[11px] font-bold ${focus?.status === "online" ? "bg-safety-green/10 text-safety-green" : "bg-surface-container text-on-surface-variant"}`}>
                <span className={`h-2 w-2 rounded-full ${focus?.status === "online" ? "bg-safety-green" : "bg-node-offline"}`} />
                {focus?.status === "online" ? "ONLINE" : focus ? "OFFLINE" : "NO NODE"}
              </span>
            </div>
            {focus ? (
              <>
                <p className="mb-3 text-sm font-semibold text-on-surface-variant">{focus.location} <span className="font-data-mono text-xs">· {focus.code}</span></p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatusMetric label="Temperature" value={`${focus.temperature_c}°C`} tone={focus.temperature_c >= 45 ? "danger" : "normal"} />
                  <StatusMetric label="Smoke" value={focus.smoke_level.toUpperCase()} tone={focus.smoke_level === "high" ? "danger" : "normal"} />
                  <StatusMetric label="Flame" value={focus.flame_detected ? "DETECTED" : "CLEAR"} tone={focus.flame_detected ? "danger" : "normal"} />
                  <StatusMetric label="IR sensor" value={focus.ir_detected ? "DETECTED" : "CLEAR"} tone={focus.ir_detected ? "warning" : "normal"} />
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">Waiting for sensor readings.</p>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="emergency-map-title">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Campus zones</p>
                <h3 id="emergency-map-title" className="mt-1 text-lg font-bold text-primary">EMERGENCY MAP PANEL</h3>
              </div>
              <span className="material-symbols-outlined text-primary" aria-hidden="true">map</span>
            </div>
            <SensorMap nodes={nodeList} alerts={alertList} size="compact" />
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="timeline-title">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Recent activity</p>
                <h3 id="timeline-title" className="mt-1 text-lg font-bold text-primary">LIVE INCIDENT TIMELINE</h3>
              </div>
              <span className="material-symbols-outlined text-primary" aria-hidden="true">history</span>
            </div>
            {timeline.length ? (
              <ol className="space-y-2">
                {timeline.map((event) => (
                  <li key={event.id} className="flex gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                    <div className="flex min-w-[52px] flex-col items-center">
                      <span className="font-data-mono text-[11px] font-bold text-on-surface-variant">{event.time}</span>
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-error" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words font-bold text-primary">{event.title}</p>
                      <p className="mt-1 break-words text-sm text-on-surface-variant">{event.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">No active incidents in the timeline.</p>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="response-board-title">
            <div className="mb-4">
              <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Field coordination</p>
              <h3 id="response-board-title" className="mt-1 text-lg font-bold text-primary">RESPONSE BOARD</h3>
            </div>
            <div className="space-y-2">
              {responseBoard.map((item) => (
                <div key={item.label} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <div className="min-w-0">
                    <p className="font-data-mono text-[10px] uppercase text-on-surface-variant">{item.label}</p>
                    <p className="mt-1 break-words text-sm font-bold text-primary">{item.value}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-label-caps text-[10px] font-bold uppercase ${item.badgeStyle}`}>{item.badge}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="escalations-title">
            <div className="mb-4">
              <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Escalation status</p>
              <h3 id="escalations-title" className="mt-1 text-lg font-bold text-primary">ESCALATIONS PANEL</h3>
            </div>
            <div className="space-y-2">
              {escalations.map((item) => (
                <div key={item.level} className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <div>
                    <p className="font-data-mono text-[10px] uppercase text-on-surface-variant">{item.level}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{item.title}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-label-caps text-[10px] font-bold uppercase ${item.tone}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5" aria-labelledby="team-assignments-title">
            <div className="mb-4">
              <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Available response units</p>
              <h3 id="team-assignments-title" className="mt-1 text-lg font-bold text-primary">TEAM ASSIGNMENT CARDS</h3>
            </div>
            {teamAssignments.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {teamAssignments.map((team) => (
                  <div key={team.name} className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-primary">{team.name}</p>
                      <span className={`font-data-mono text-[10px] font-bold uppercase ${team.color}`}>{team.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-on-surface-variant">{team.role}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">No response units are available yet.</p>
            )}
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-5 xl:col-span-2" aria-labelledby="action-queue-title">
            <div className="mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">task_alt</span>
              <div>
                <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">Operational checklist</p>
                <h3 id="action-queue-title" className="mt-1 text-lg font-bold text-primary">CHECKLIST / ACTION QUEUE</h3>
              </div>
            </div>
            <ol className="grid gap-2 md:grid-cols-3">
              {actionQueue.map((task, index) => (
                <li key={task} className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-data-mono text-xs font-bold text-white">{index + 1}</span>
                  <p className="text-sm leading-5 text-on-surface-variant">{task}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
      <BottomNav role={profile.role} alertCount={openCount} />
    </div>
  );
}

function StatusMetric({ label, value, tone }: { label: string; value: string; tone: "danger" | "warning" | "normal" }) {
  const styles = {
    danger: "border-error/25 bg-error-container/60 text-error",
    warning: "border-warning-yellow/30 bg-warning-yellow/10 text-on-surface",
    normal: "border-outline-variant bg-surface-container-low text-primary",
  };

  return (
    <div className={`min-w-0 rounded-lg border p-3 ${styles[tone]}`}>
      <p className="font-label-caps text-[10px] font-bold uppercase text-on-surface-variant">{label}</p>
      <p className="mt-2 break-words font-data-mono text-sm font-bold">{value}</p>
    </div>
  );
}
