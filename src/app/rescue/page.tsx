import { AlertActions } from "@/components/AlertActions";
import { BottomNav } from "@/components/BottomNav";
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
  const { critical, focus, quickStats, timeline, escalations, actionQueue, mapZones, teamAssignments, responseBoard } =
    buildRescueViewData(nodeList, alertList);
  const openCount = alertList.filter((a) => a.status !== "resolved").length;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile shadow-sm md:px-margin-desktop">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <span className="font-headline-display text-[18px] font-bold uppercase tracking-wide text-primary">
            Safety Monitoring
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-error-container px-3 py-1.5">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-critical-red" />
          <span className="font-label-caps tracking-wider text-on-error-container">LIVE</span>
        </div>
      </header>

      <main className="mx-auto box-border grid min-h-screen max-w-7xl grid-cols-1 gap-gutter p-margin-mobile pt-24 pb-32 md:grid-cols-12 md:p-margin-desktop md:pb-20">
        <div className="flex h-full flex-col gap-gutter md:col-span-7">
          <section className="relative flex min-h-[350px] flex-grow overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest/90 p-3 backdrop-blur-md">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                {focus?.location ?? "SECTOR ALPHA"}
              </span>
              <span className="font-data-mono text-[12px] text-on-surface-variant">{focus?.code ?? "—"}</span>
            </div>
            <div
              className="absolute inset-0 h-full w-full bg-cover bg-center opacity-60"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjPEuTWu8BfT0vqkKS8WvgoRL2y5ZrwL-1jS9kQu95nl72BZIRLM5DZ0nXF-sACnZymGFJe5JZ_PNOtFPvql9pOuNnebUcNn21RRSpvy25vUOzbgca4jShcd8fXnxL4LPZFzUrB67xQgH-sCn3EM0UD74GAzDj4ZSPD48LF-DVicMotAMx8j6HB0Ch1f-ux6MIA-jgSmNhsn_ppdlOJ7aPCNErbceVxux6PR0ZtfcqSY-0X1Ppi6Am')",
              }}
            />
            <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <div className="pulse-critical relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-error shadow-md">
                <span className="material-symbols-outlined text-[18px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div key={item.label} className={`rounded-xl border p-3 ${item.style}`}>
                <p className="font-label-caps text-[10px] uppercase tracking-[0.16em]">{item.label}</p>
                <p className="mt-2 text-2xl font-black tracking-[-0.05em]">{item.value}</p>
              </div>
            ))}
          </section>

          <section className="flex-shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
            <h3 className="mb-4 px-1 font-label-caps text-label-caps text-on-surface-variant">SENSOR TELEMETRY</h3>
            <div className="grid grid-cols-2 gap-stack-md">
              <div className="rounded-lg border border-outline-variant/50 bg-surface-container p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-data-mono text-[12px] text-on-surface-variant">TEMP_CORE</span>
                  <span className="font-data-mono text-[14px] font-bold text-error">{focus?.temperature_c ?? "—"}°C</span>
                </div>
                <div className="flex h-10 w-full items-end gap-[3px]">
                  <div className="h-[20%] w-full rounded-t-sm bg-outline-variant" />
                  <div className="h-[40%] w-full rounded-t-sm bg-warning-yellow" />
                  <div className="h-[85%] w-full rounded-t-sm bg-error" />
                </div>
              </div>
              <div className="rounded-lg border border-outline-variant/50 bg-surface-container p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-data-mono text-[12px] text-on-surface-variant">SMOKE_DENS</span>
                  <span className="font-data-mono text-[14px] font-bold text-error">
                    {focus?.smoke_level === "high" ? "HIGH" : "OK"}
                  </span>
                </div>
                <div className="flex h-10 w-full items-end gap-[3px]">
                  <div className="h-[15%] w-full rounded-t-sm bg-outline-variant" />
                  <div className="h-[50%] w-full rounded-t-sm bg-warning-yellow" />
                  <div className="h-[90%] w-full rounded-t-sm bg-error" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="flex h-full flex-col gap-gutter md:col-span-5">
          {critical ? (
            <div className="rounded-xl border border-error-container bg-error-container p-stack-lg text-on-error-container shadow-sm">
              <div className="mb-stack-sm flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
                <h2 className="font-headline-display text-[22px] font-bold text-error">CRITICAL ALERT</h2>
              </div>
              <p className="mb-stack-md font-data-mono text-[16px] font-semibold">LOC: {critical.location}</p>
              <div className="mt-stack-md flex items-end justify-between border-t border-error/20 pt-4">
                <div className="flex flex-col gap-1">
                  <span className="font-label-caps text-[11px] text-error">STATUS</span>
                  <span className="font-data-mono text-[18px] font-bold uppercase">{critical.status}</span>
                </div>
                <span className="rounded-full border border-error/30 bg-error/10 px-3 py-1 font-data-mono text-[12px] font-bold text-error">
                  {focus?.code}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-safety-green/30 bg-safety-green/10 p-stack-lg">
              <h2 className="font-headline-display text-[22px] font-bold text-safety-green">ALL CLEAR</h2>
              <p className="mt-2 text-on-surface-variant">No critical incidents are active.</p>
            </div>
          )}

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <div className="mb-stack-md flex items-center justify-between border-b border-outline-variant pb-stack-sm">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">CURRENT STATUS</h3>
              <div className="flex items-center gap-1.5 rounded-full bg-safety-green/10 px-2 py-1">
                <span className="material-symbols-outlined text-[16px] text-safety-green">sensors</span>
                <span className="font-data-mono text-[11px] font-bold text-safety-green">
                  {focus?.status === "online" ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-stack-md">
              <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/50 bg-surface-container p-3">
                <span className="font-label-caps text-[11px] text-on-surface-variant">TEMP</span>
                <span className="font-headline-display text-[24px] font-bold text-error">{focus?.temperature_c ?? "—"}°C</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/50 bg-surface-container p-3">
                <span className="font-label-caps text-[11px] text-on-surface-variant">SMOKE</span>
                <span className="font-headline-display text-[24px] font-bold text-error">
                  {focus?.smoke_level === "high" ? "HIGH" : "NORMAL"}
                </span>
              </div>
              <div className="col-span-2 flex flex-col gap-2 rounded-lg border border-error-container bg-error-container p-4">
                <span className="font-label-caps text-[11px] text-error">FLAME DETECTED</span>
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                  <span className="font-data-mono text-[16px] font-bold tracking-widest">
                    {focus?.flame_detected ? "CONFIRMED" : "NONE"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <h3 className="mb-3 font-label-caps text-[12px] text-on-surface-variant">RESPONSE BOARD</h3>
            <div className="space-y-3">
              {responseBoard.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container p-3">
                  <div>
                    <p className="font-data-mono text-[11px] text-on-surface-variant">{item.label}</p>
                    <p className="mt-1 text-base font-bold text-primary">{item.value}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${item.badgeStyle}`}>
                    {item.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-label-caps text-[12px] text-on-surface-variant">LIVE INCIDENT TIMELINE</h3>
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
            </div>
            <div className="space-y-3">
              {timeline.map((event) => (
                <div key={event.time} className="flex gap-3 rounded-lg border border-outline-variant bg-surface-container p-3">
                  <div className="flex min-w-[52px] flex-col items-center">
                    <span className="font-data-mono text-[11px] text-on-surface-variant">{event.time}</span>
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-error" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">{event.title}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <h3 className="mb-3 font-label-caps text-[12px] text-on-surface-variant">ESCALATIONS PANEL</h3>
            <div className="space-y-3">
              {escalations.map((item) => (
                <div key={item.level} className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container p-3">
                  <div>
                    <p className="font-data-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">{item.level}</p>
                    <p className="mt-1 font-bold text-primary">{item.title}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${item.tone}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-label-caps text-[12px] text-on-surface-variant">CHECKLIST / ACTION QUEUE</h3>
              <span className="material-symbols-outlined text-[18px] text-primary">task_alt</span>
            </div>
            <div className="space-y-2">
              {actionQueue.map((task, index) => (
                <div key={task} className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container p-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-on-surface-variant">{task}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-label-caps text-[12px] text-on-surface-variant">EMERGENCY MAP PANEL</h3>
              <span className="material-symbols-outlined text-[18px] text-primary">map</span>
            </div>
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container p-4">
              <div className="mb-3 h-32 rounded-lg bg-[radial-gradient(circle_at_center,_rgba(234,88,12,0.22),_transparent_30%),linear-gradient(135deg,#dfe7f7_0%,#eef2ff_50%,#f8fafc_100%)]" />
              <div className="space-y-2">
                {mapZones.map((zone) => (
                  <div key={zone.name} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${zone.style}`}>
                    <span className="font-bold text-primary">{zone.name}</span>
                    <span className="font-data-mono text-[10px] uppercase tracking-[0.12em]">{zone.flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-sm">
            <h3 className="mb-3 font-label-caps text-[12px] text-on-surface-variant">TEAM ASSIGNMENT CARDS</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {teamAssignments.map((team) => (
                <div key={team.name} className="rounded-lg border border-outline-variant bg-surface-container p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">{team.name}</p>
                    <span className={`font-data-mono text-[10px] uppercase tracking-[0.12em] ${team.color}`}>{team.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{team.role}</p>
                </div>
              ))}
            </div>
          </div>

          {critical ? (
            <div className="z-40 mt-auto pt-2">
              <h3 className="mb-3 font-label-caps text-[12px] text-on-surface-variant">RESPONSE ACTIONS</h3>
              <AlertActions alert={critical} />
            </div>
          ) : null}
        </section>
      </main>
      <BottomNav role={profile.role} alertCount={openCount} />
    </div>
  );
}
