import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { LiveTelemetryBoard } from "@/components/LiveTelemetryBoard";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert, SensorNode } from "@/lib/types";

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  return `${mins}m ago`;
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
  const campusSafe = openAlerts.filter((a) => a.severity === "critical" || a.severity === "emergency").length === 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Welcome back</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.05em] text-slate-900 sm:text-3xl">
              {profile.full_name ?? "Student"}
            </h1>
          </div>
          <span className="status-pill bg-sky-50 text-sky-700">Student</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6">
        <section className="rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div
            className={`rounded-[24px] border p-5 sm:p-6 ${
              campusSafe
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {campusSafe ? "Campus status" : "Evacuation advisory"}
            </p>
            <h2 className={`mt-3 text-2xl font-black tracking-[-0.05em] sm:text-3xl ${campusSafe ? "text-emerald-700" : "text-red-700"}`}>
              {campusSafe ? "You are safe" : "Follow emergency exits"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {campusSafe
                ? "No confirmed fire incidents on campus right now. Conditions are stable and monitored live."
                : "A critical alert is active. Move to the nearest safe zone and follow response instructions."}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-4 text-xl font-black tracking-[-0.04em] text-slate-900">Live conditions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon="device_thermostat" label="Temperature" value={campusNode ? `${campusNode.temperature_c}°C` : "—"} />
            <Metric
              icon="air"
              label="Smoke"
              value={campusNode?.smoke_level === "high" ? "High" : "Normal"}
              ok={campusNode?.smoke_level !== "high"}
            />
            <Metric icon="water_drop" label="Humidity" value={campusNode ? `${campusNode.humidity_pct}%` : "—"} />
            <Metric
              icon="local_fire_department"
              label="Flame"
              value={campusNode?.flame_detected ? "Detected" : "Not Detected"}
              ok={!campusNode?.flame_detected}
            />
          </div>
        </section>

        <div className="mt-6">
          <LiveTelemetryBoard nodes={nodes as SensorNode[]} title="Student live telemetry board" />
        </div>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-[-0.04em] text-slate-900">Campus map</h2>
            <Link className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-slate-900" href="/map">
              View full map <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          <div className="relative h-56 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.05)] sm:h-72">
            <img
              className="h-full w-full object-cover opacity-80"
              alt="Campus map"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3qd4ORHaDdJn_zVKWF6WVQwcb7JxqusDolum_Ibq-y5GooTmbSR2XIz_LAMnbUAmsAhjVywIfJbbMmRvQMpsrd7v2q5IkGnHu8Ydf8dxUFpXnlvjSuUVDryamSV_BGZ1bovLhLSizqh5U_izgV0NEvfBv-YoRkB7L-p7wvOOptqx83pJCTfesXDfYTOPZDlTvDS0bHqF1f4TW3KoLxYqMuS_6tmsD7idRLG3b76xql6Guodvx2qx-"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined rounded-full bg-white/90 p-3 text-4xl text-emerald-600 shadow-xl">
                my_location
              </span>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-4 text-xl font-black tracking-[-0.04em] text-slate-900">Recent alerts</h2>
          {openAlerts.length === 0 ? (
            <div className="flex flex-col items-center rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_40px_rgba(15,23,42,0.04)]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <span className="material-symbols-outlined text-[30px]">notifications_paused</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">No active alerts</h3>
              <p className="mt-2 max-w-sm text-sm text-slate-600">There have been no recent incidents on campus.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  href="/alerts"
                  className="block rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_15px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_35px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{alert.location}</p>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{timeAgo(alert.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
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
}: {
  icon: string;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          ok === false ? "bg-red-50 text-red-600" : ok ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <div className="mt-4">
        <h3 className={`text-xl font-black tracking-[-0.04em] ${ok === false ? "text-red-600" : ok ? "text-emerald-600" : "text-slate-900"}`}>
          {value}
        </h3>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
