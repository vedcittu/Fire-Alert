import { AlertActions } from "@/components/AlertActions";
import { BottomNav } from "@/components/BottomNav";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Alert } from "@/lib/types";

export default async function AlertsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false });
  const alerts = (data as Alert[] | null) ?? [];
  const openCount = alerts.filter((a) => a.status !== "resolved").length;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface p-margin-mobile">
        <h1 className="text-center font-headline-display text-headline-display">Alerts</h1>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-margin-mobile">
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">notifications_paused</span>
            <p className="mt-3 font-building-id">No alerts yet</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <article key={alert.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">{alert.severity}</p>
                  <h2 className="font-building-id text-building-id text-on-surface">{alert.title}</h2>
                  <p className="text-sm text-on-surface-variant">{alert.location}</p>
                </div>
                <span className="rounded-full bg-surface-container-high px-2 py-1 font-label-caps text-[11px] uppercase">
                  {alert.status}
                </span>
              </div>
              {profile.role !== "student" ? (
                <div className="mt-4">
                  <AlertActions alert={alert} />
                </div>
              ) : null}
            </article>
          ))
        )}
      </main>
      <BottomNav role={profile.role} alertCount={openCount} />
    </div>
  );
}
