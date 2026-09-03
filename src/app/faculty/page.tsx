import { BottomNav } from "@/components/BottomNav";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert, Building, SensorNode } from "@/lib/types";

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return mins < 1 ? "just now" : `${mins}m ago`;
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

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-variant bg-surface p-margin-mobile">
        <h2 className="flex-1 text-center font-headline-display text-headline-display text-on-surface">
          Faculty Dashboard
        </h2>
      </header>

      <main className="flex-1">
        <section className="grid grid-cols-2 gap-gutter p-margin-mobile">
          <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safety-green opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-safety-green" />
              </span>
              <h3 className="font-label-caps text-on-surface-variant">ONLINE NODES</h3>
            </div>
            <p className="font-emergency-hero-mobile text-primary">{online}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-node-offline" />
              <h3 className="font-label-caps text-on-surface-variant">OFFLINE NODES</h3>
            </div>
            <p className="font-emergency-hero-mobile text-on-surface-variant">{offline}</p>
          </div>
        </section>

        <section className="px-margin-mobile py-stack-sm">
          <div className="flex flex-col gap-3 rounded-xl border border-error/20 bg-error-container p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-label-caps text-on-error-container">
                <span className="material-symbols-outlined text-sm">warning</span> ACTIVE ALERTS
              </h3>
              <span className="rounded-full bg-error px-2 py-0.5 text-xs font-bold text-on-error">
                {openAlerts.length}
              </span>
            </div>
            {openAlerts.length === 0 ? (
              <p className="text-sm text-on-error-container">No active incidents.</p>
            ) : (
              openAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-on-error-container">{alert.location}</span>
                  <span className="font-bold text-error">{timeAgo(alert.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="px-margin-mobile py-stack-md">
          <h3 className="mb-stack-md font-headline-display text-lg font-bold text-on-surface">Monitored Labs</h3>
          <div className="flex flex-col gap-stack-md">
            {buildingList.map((building) => {
              const bar =
                building.status === "critical"
                  ? "bg-critical-red"
                  : building.status === "warning"
                    ? "bg-warning-yellow"
                    : "bg-safety-green";
              const icon =
                building.status === "critical" ? "error" : building.status === "warning" ? "warning" : "check_circle";
              const iconColor =
                building.status === "critical"
                  ? "text-critical-red"
                  : building.status === "warning"
                    ? "text-warning-yellow"
                    : "text-safety-green";
              const related = openAlerts.find((a) => a.building_id === building.id);
              return (
                <div
                  key={building.id}
                  className="relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                >
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${bar}`} />
                  <div className="flex items-start justify-between pl-2">
                    <div>
                      <h4 className="font-building-id text-on-surface">{building.name}</h4>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {related ? related.title : "All systems nominal"}
                      </p>
                    </div>
                    <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-margin-mobile py-stack-md">
          <h3 className="mb-stack-sm font-headline-display text-lg font-bold text-on-surface">Main Campus Status</h3>
          <div
            className="relative flex flex-col justify-end overflow-hidden rounded-xl pt-[200px] shadow-md"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnrHnP3U6skscCwqT3j-f2-H7RqWNUgG7BxqSH7g3vt0uvVUAbCC_4diEvW23aYfaePdyVgaw04va8bTOXID8BjGUbMyBq2y6oFfMENBq9DDRS8qn1vs1qpRHQSDPP4uvgn1P44J3ZXiYG-A2vh9HuTevnklK-XImdiLNEPWJ0T9vDy-QYsWkQsI4vWJiYGyl3us0o8tF2H60GQSP_kvI0I7cGR79PAiHlQ_Pxpbm4vgjKKH9KBwx3')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="relative z-10 p-4 text-white">
              <p className="font-semibold">Live Camera Feed</p>
              <p className="mt-1 text-sm opacity-80">Quad Area - Sector A</p>
            </div>
          </div>
        </section>
      </main>
      <BottomNav role={profile.role} alertCount={openAlerts.length} />
    </div>
  );
}
