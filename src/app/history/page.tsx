import { BottomNav } from "@/components/BottomNav";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert, SensorNode } from "@/lib/types";

export default async function HistoryPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data: alerts }, { data: nodes }] = await Promise.all([
    supabase.from("alerts").select("*").order("created_at", { ascending: false }),
    supabase.from("sensor_nodes").select("*").order("code"),
  ]);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface p-margin-mobile">
        <h1 className="text-center font-headline-display text-headline-display">History</h1>
      </header>
      <main className="mx-auto max-w-2xl space-y-6 p-margin-mobile">
        <section>
          <h2 className="mb-3 font-building-id">Incident log</h2>
          <div className="space-y-3">
            {((alerts as Alert[] | null) ?? []).map((alert) => (
              <div key={alert.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <p className="font-building-id">{alert.title}</p>
                <p className="text-sm text-on-surface-variant">{alert.location}</p>
                <p className="mt-1 font-data-mono text-xs uppercase text-on-surface-variant">
                  {alert.severity} · {alert.status} · {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 font-building-id">Sensor readings</h2>
          <div className="space-y-3">
            {((nodes as SensorNode[] | null) ?? []).map((node) => (
              <div key={node.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <p className="font-data-mono">{node.code}</p>
                <p className="text-sm">
                  Temp {node.temperature_c}°C · Smoke {node.smoke_level} · Flame{" "}
                  {node.flame_detected ? "yes" : "no"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav role={profile.role} />
    </div>
  );
}
