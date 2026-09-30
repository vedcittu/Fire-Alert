import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { LiveTelemetryBoard } from "@/components/LiveTelemetryBoard";
import { SensorMap } from "@/components/SensorMap";
import { FacultyAlertsPanel } from "@/components/faculty/FacultyAlertsPanel";
import { FacultyStatusHero } from "@/components/faculty/FacultyStatusHero";
import { RevealOnScroll } from "@/components/faculty/RevealOnScroll";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert, SensorNode } from "@/lib/types";

/** Captures the request clock once, in a single place, per render pass. */
function currentTimestamp() {
  return Date.now();
}

function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-lg font-bold tracking-[-0.03em] text-slate-900 sm:text-xl">{title}</h2>
      {action ?? (hint ? <p className="text-right text-xs font-semibold text-slate-500 sm:text-sm">{hint}</p> : null)}
    </div>
  );
}

export default async function StudentDashboard() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: nodes }, { data: alerts }] = await Promise.all([
    supabase.from("sensor_nodes").select("*").order("code"),
    supabase.from("alerts").select("*").neq("status", "resolved").order("created_at", { ascending: false }),
  ]);

  const campusNode =
    (nodes as SensorNode[] | null)?.find((n) => n.status === "online" && !n.flame_detected) ??
    (nodes as SensorNode[] | null)?.[0];
  const openAlerts = (alerts as Alert[] | null) ?? [];
  const nodeList = (nodes as SensorNode[] | null) ?? [];
  const campusSafe = openAlerts.filter((a) => a.severity === "critical" || a.severity === "emergency").length === 0;
  const campusState = !campusSafe ? "emergency" : openAlerts.length > 0 ? "watch" : "calm";
  const onlineCount = nodeList.filter((n) => n.status === "online").length;
  const renderedAt = currentTimestamp();

  const heroCopy = {
    calm: {
      title: "You are safe",
      message: "No confirmed fire incidents on campus right now. Conditions are stable and monitored live.",
    },
    watch: {
      title: "Stay alert",
      message:
        "Open alerts are being tracked on campus. No evacuation is required — follow updates and the guidance of faculty until conditions clear.",
    },
    emergency: {
      title: "Follow emergency exits",
      message: "A critical alert is active. Move to the nearest safe zone and follow response instructions.",
    },
  }[campusState];

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Welcome back</p>
            <h1 className="mt-1 text-xl font-black tracking-[-0.05em] text-slate-900 sm:text-2xl">
              {profile.full_name ?? "Student"}
            </h1>
          </div>
          <span className="status-pill bg-sky-50 text-sky-700">Student</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
        <FacultyStatusHero
          state={campusState}
          title={heroCopy.title}
          message={heroCopy.message}
          onlineCount={onlineCount}
          totalCount={nodeList.length}
          activeAlerts={openAlerts.length}
        />

        <section className="mt-10" aria-label="Live conditions">
          <SectionHeading
            title="Live conditions"
            hint={campusNode ? `Reference node ${campusNode.code}` : "Awaiting first reading"}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              index={0}
              icon="device_thermostat"
              label="Temperature"
              value={campusNode ? `${campusNode.temperature_c}°C` : "—"}
            />
            <Metric
              index={1}
              icon="air"
              label="Smoke"
              value={campusNode?.smoke_level === "high" ? "High" : "Normal"}
              ok={campusNode?.smoke_level !== "high"}
            />
            <Metric
              index={2}
              icon="water_drop"
              label="Humidity"
              value={campusNode ? `${campusNode.humidity_pct}%` : "—"}
            />
            <Metric
              index={3}
              icon="local_fire_department"
              label="Flame"
              value={campusNode?.flame_detected ? "Detected" : "Not Detected"}
              ok={!campusNode?.flame_detected}
            />
          </div>
        </section>

        <RevealOnScroll className="mt-10">
          <SectionHeading
            title="Live telemetry"
            hint={`${nodeList.length} node${nodeList.length === 1 ? "" : "s"} reporting`}
          />
          <LiveTelemetryBoard nodes={nodeList} title="Student live telemetry board" />
        </RevealOnScroll>

        <RevealOnScroll className="mt-10">
          <SectionHeading
            title="Campus map"
            action={
              <Link
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-900 sm:text-sm"
                href="/map"
              >
                View full map
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
            }
          />
          <div className="faculty-card overflow-hidden rounded-[24px] border border-slate-200 bg-white p-3 sm:p-4">
            <SensorMap nodes={nodeList} alerts={openAlerts} size="compact" />
          </div>
        </RevealOnScroll>

        <div className="mt-10">
          <FacultyAlertsPanel
            alerts={openAlerts}
            renderedAt={renderedAt}
            title="Recent alerts"
            emptyTitle="No active alerts"
            emptyMessage="There have been no recent incidents on campus."
            emptyIcon="notifications_paused"
          />
        </div>
      </main>
      <BottomNav role={profile.role} alertCount={openAlerts.length} />
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  ok,
  index = 0,
}: {
  icon: string;
  label: string;
  value: string;
  ok?: boolean;
  index?: number;
}) {
  const iconTone =
    ok === false ? "bg-red-50 text-red-600" : ok ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600";
  const valueTone = ok === false ? "text-red-600" : ok ? "text-emerald-600" : "text-slate-900";

  return (
    <article
      className="faculty-card faculty-card-hover faculty-rise rounded-[22px] border border-slate-200 bg-white p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconTone}`}>
        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="mt-4">
        <h3 className={`text-xl font-black tracking-[-0.04em] ${valueTone}`}>{value}</h3>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
    </article>
  );
}
