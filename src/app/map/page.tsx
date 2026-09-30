import { BottomNav } from "@/components/BottomNav";
import { SensorMap } from "@/components/SensorMap";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert, SensorNode } from "@/lib/types";

export default async function MapPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [{ data }, { data: alerts }] = await Promise.all([
    supabase.from("sensor_nodes").select("*").order("code"),
    supabase.from("alerts").select("*").neq("status", "resolved").order("created_at", { ascending: false }),
  ]);
  const nodes = (data as SensorNode[] | null) ?? [];
  const openAlerts = (alerts as Alert[] | null) ?? [];

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface p-margin-mobile">
        <h1 className="text-center font-headline-display text-headline-display">Campus Map</h1>
      </header>
      <main className="mx-auto max-w-6xl space-y-4 p-margin-mobile">
        <SensorMap nodes={nodes} alerts={openAlerts} />
        <div className="mt-4 grid gap-3">
          {nodes.map((node) => (
            <div key={node.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant">{node.code}</p>
                  <h2 className="font-building-id">{node.location}</h2>
                </div>
                <span
                  className={`rounded-full px-2 py-1 font-label-caps text-[11px] ${
                    node.status === "online" ? "bg-safety-green/10 text-safety-green" : "bg-surface-variant text-node-offline"
                  }`}
                >
                  {node.status}
                </span>
              </div>
              <p className="mt-2 font-data-mono text-data-mono text-on-surface-variant">
                {node.temperature_c}°C · humidity {node.humidity_pct}% · smoke {node.smoke_level}
              </p>
            </div>
          ))}
        </div>
      </main>
      <BottomNav role={profile.role} />
    </div>
  );
}
