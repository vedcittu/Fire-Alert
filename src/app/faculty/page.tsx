import { BottomNav } from "@/components/BottomNav";
import { LiveTelemetryBoard } from "@/components/LiveTelemetryBoard";
import { SensorMap } from "@/components/SensorMap";
import { FacultyAlertsPanel } from "@/components/faculty/FacultyAlertsPanel";
import { FacultyStatGrid } from "@/components/faculty/FacultyStatGrid";
import { FacultyStatusHero } from "@/components/faculty/FacultyStatusHero";
import { RevealOnScroll } from "@/components/faculty/RevealOnScroll";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert, Building, SensorNode } from "@/lib/types";

/**
 * Captures the request clock once per render pass. Kept in a module-scope
 * helper so the dashboard reads time in one place rather than inline.
 */
function currentTimestamp() {
  return Date.now();
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-lg font-bold tracking-[-0.03em] text-slate-900 sm:text-xl">{title}</h2>
      {hint ? <p className="text-right text-xs font-semibold text-slate-500 sm:text-sm">{hint}</p> : null}
    </div>
  );
}

export default async function FacultyDashboard() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: nodes }, { data: alerts }, { data: buildings }] = await Promise.all([
    supabase.from("sensor_nodes").select("*").order("code"),
    supabase.from("alerts").select("*").neq("status", "resolved").order("created_at", { ascending: false }),
    supabase.from("buildings").select("*").order("name"),
  ]);

  const nodeList = (nodes as SensorNode[] | null) ?? [];
  const openAlerts = (alerts as Alert[] | null) ?? [];
  const buildingList = (buildings as Building[] | null) ?? [];
  const online = nodeList.filter((n) => n.status === "online").length;
  const offline = nodeList.filter((n) => n.status === "offline").length;
  const renderedAt = currentTimestamp();

  const criticalAlerts = openAlerts.filter(
    (alert) => alert.severity === "critical" || alert.severity === "emergency",
  ).length;
  const campusState = criticalAlerts > 0 ? "emergency" : openAlerts.length > 0 ? "watch" : "calm";
  const heroCopy = {
    calm: {
      title: "All systems nominal",
      message:
        "Every monitored lab is reporting normal conditions and no incidents are open. Telemetry is streaming live from the campus sensor network.",
    },
    watch: {
      title: `${openAlerts.length} open alert${openAlerts.length === 1 ? "" : "s"} to review`,
      message:
        "Active incidents are being tracked below. Confirm the affected zones and verify that response owners have acknowledged them.",
    },
    emergency: {
      title: "Critical incident active",
      message:
        "A critical alert is open on campus. Review the incident detail, confirm responder assignment, and validate evacuation routes for the affected buildings.",
    },
  }[campusState];


  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Faculty · Operations</p>
            <h1 className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-900 sm:text-2xl">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-slate-600 sm:block">
              {profile.full_name ?? profile.email}
            </span>
            <span className="status-pill bg-slate-100 text-slate-700">Faculty</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
        <FacultyStatusHero
          state={campusState}
          title={heroCopy.title}
          message={heroCopy.message}
          onlineCount={online}
          totalCount={nodeList.length}
          activeAlerts={openAlerts.length}
        />

        <section className="mt-6 sm:mt-8" aria-label="Sensor node summary">
          <FacultyStatGrid
            stats={[
              {
                label: "Total nodes",
                value: nodeList.length,
                tone: "total",
                icon: "sensors",
                hint: "Registered on campus",
              },
              { label: "Online", value: online, tone: "online", icon: "wifi", hint: "Streaming live telemetry" },
              { label: "Offline", value: offline, tone: "offline", icon: "wifi_off", hint: "Awaiting telemetry" },
              {
                label: "Active alerts",
                value: openAlerts.length,
                tone: "alert",
                icon: "notifications_active",
                hint: criticalAlerts > 0 ? `${criticalAlerts} critical` : "No critical incidents",
              },
            ]}
          />
        </section>


        <div className="mt-10">
          <FacultyAlertsPanel alerts={openAlerts} renderedAt={renderedAt} />
        </div>

        <RevealOnScroll className="mt-10">
          <SectionHeading title="Live telemetry" hint={`${nodeList.length} node${nodeList.length === 1 ? "" : "s"} reporting`} />
          <LiveTelemetryBoard nodes={nodeList} title="Faculty live telemetry board" />
        </RevealOnScroll>

        <RevealOnScroll className="mt-10">
          <SectionHeading
            title="Monitored labs"
            hint={`${buildingList.length} building${buildingList.length === 1 ? "" : "s"} supervised`}
          />
          {buildingList.length === 0 ? (
            <div className="faculty-card rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-600">No buildings are registered yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {buildingList.map((building, index) => {
                const status =
                  building.status === "critical" ? "critical" : building.status === "warning" ? "warning" : "nominal";
                const dot =
                  status === "critical"
                    ? "bg-critical-red"
                    : status === "warning"
                      ? "bg-warning-yellow"
                      : "bg-safety-green";
                const iconColor =
                  status === "critical"
                    ? "text-critical-red"
                    : status === "warning"
                      ? "text-warning-yellow"
                      : "text-safety-green";
                const icon = status === "critical" ? "error" : status === "warning" ? "warning" : "check_circle";
                const label = status === "critical" ? "Critical" : status === "warning" ? "Warning" : "Nominal";
                const related = openAlerts.find((a) => a.building_id === building.id);

                return (
                  <article
                    key={building.id}
                    className="faculty-card faculty-card-hover faculty-rise flex items-start justify-between gap-4 rounded-[24px] border border-slate-200 bg-white p-5"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                      </div>
                      <h3 className="mt-3 font-building-id text-slate-900">{building.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{related ? related.title : "All systems nominal"}</p>
                    </div>
                    <span className={`material-symbols-outlined text-[22px] ${iconColor}`} aria-hidden="true">
                      {icon}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </RevealOnScroll>

        <RevealOnScroll className="mt-10">
          <SectionHeading title="Campus map" hint="Select a sensor marker for readings" />
          <div className="faculty-card overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 sm:p-4">
            <SensorMap nodes={nodeList} alerts={openAlerts} size="compact" />
          </div>
        </RevealOnScroll>
      </main>
      <BottomNav role={profile.role} alertCount={openAlerts.length} />
    </div>
  );
}
