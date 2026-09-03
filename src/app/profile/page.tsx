import { BottomNav } from "@/components/BottomNav";
import { requireProfile } from "@/lib/auth";
import { signOut, updateProfile } from "@/app/actions/auth";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface p-margin-mobile">
        <h1 className="text-center font-headline-display text-headline-display text-on-surface">Settings & Profile</h1>
      </header>
      <main className="mx-auto max-w-xl space-y-4 p-margin-mobile">
        {params.error ? (
          <p className="rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">{params.error}</p>
        ) : null}
        {params.notice ? (
          <p className="rounded-lg bg-secondary-container px-3 py-2 text-sm text-on-secondary-container">{params.notice}</p>
        ) : null}

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary">
              <span className="material-symbols-outlined text-[28px]">person</span>
            </div>
            <div>
              <h2 className="font-building-id text-building-id">{profile.full_name ?? "Campus user"}</h2>
              <p className="text-sm text-on-surface-variant">{profile.email}</p>
              <p className="mt-1 font-label-caps text-label-caps uppercase text-secondary">{profile.role}</p>
            </div>
          </div>
          <form action={updateProfile} className="space-y-3">
            <label className="block font-label-caps text-label-caps text-on-surface">
              Display name
              <input
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-main"
              />
            </label>
            <label className="block font-label-caps text-label-caps text-on-surface">
              Building
              <input
                name="building"
                defaultValue={profile.building ?? ""}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-main"
              />
            </label>
            <label className="block font-label-caps text-label-caps text-on-surface">
              Department
              <input
                name="department"
                defaultValue={profile.department ?? ""}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-main"
              />
            </label>
            <button className="w-full rounded-lg bg-primary-container py-3 font-building-id text-on-primary" type="submit">
              Save profile
            </button>
          </form>
        </div>

        <details className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">history</span>
              <div>
                <h2 className="font-bold">Monitoring & History</h2>
                <p className="text-xs text-on-surface-variant">Logs, incident reports, analytics</p>
              </div>
            </div>
            <span className="material-symbols-outlined">expand_more</span>
          </summary>
          <a href="/history" className="mt-3 flex items-center justify-between rounded-lg px-2 py-3 hover:bg-surface-container">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="material-symbols-outlined">analytics</span>
              Sensor Data / Readings
            </span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </a>
        </details>

        <form action={signOut}>
          <button className="w-full rounded-lg border border-outline-variant py-3 font-label-caps uppercase text-error" type="submit">
            Sign out
          </button>
        </form>
      </main>
      <BottomNav role={profile.role} />
    </div>
  );
}
