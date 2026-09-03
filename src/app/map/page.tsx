import { BottomNav } from "@/components/BottomNav";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SensorNode } from "@/lib/types";

export default async function MapPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.from("sensor_nodes").select("*").order("code");
  const nodes = (data as SensorNode[] | null) ?? [];

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface p-margin-mobile">
        <h1 className="text-center font-headline-display text-headline-display">Campus Map</h1>
      </header>
      <main className="mx-auto max-w-4xl p-margin-mobile">
        <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-outline-variant bg-map-bg">
          <img
            alt="Campus map"
            className="h-full w-full object-cover opacity-70"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3qd4ORHaDdJn_zVKWF6WVQwcb7JxqusDolum_Ibq-y5GooTmbSR2XIz_LAMnbUAmsAhjVywIfJbbMmRvQMpsrd7v2q5IkGnHu8Ydf8dxUFpXnlvjSuUVDryamSV_BGZ1bovLhLSizqh5U_izgV0NEvfBv-YoRkB7L-p7wvOOptqx83pJCTfesXDfYTOPZDlTvDS0bHqF1f4TW3KoLxYqMuS_6tmsD7idRLG3b76xql6Guodvx2qx-"
          />
        </div>
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
