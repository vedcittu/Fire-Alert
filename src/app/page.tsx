import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { LiveTelemetryBoard } from "@/components/LiveTelemetryBoard";
import { getProfile } from "@/lib/auth";
import { dashboardPath, type SensorNode } from "@/lib/types";

async function getHomePageNodes() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return [] as SensorNode[];
  }

  const supabase = createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.from("sensor_nodes").select("*").order("code");

  if (error) {
    console.error("Home page live data fetch failed:", error.message);
    return [] as SensorNode[];
  }

  return (data as SensorNode[] | null) ?? [];
}

export default async function HomePage() {
  const profile = await getProfile();
  const nodeList = await getHomePageNodes();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile py-4 md:px-margin-desktop">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <span className="font-headline-display text-[18px] font-bold uppercase tracking-wide text-primary">
            Campus Safe
          </span>
        </div>
        <Link
          href={profile ? dashboardPath(profile.role) : "/login"}
          className="rounded-lg bg-primary-container px-4 py-2 font-data-mono text-data-mono text-on-primary"
        >
          {profile ? "Open dashboard" : "Login"}
        </Link>
      </header>

      <section className="mx-auto max-w-7xl px-margin-mobile py-12 md:px-margin-desktop">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container">
              <span className="material-symbols-outlined text-sm">science</span>
              <span className="font-label-caps text-label-caps uppercase">IoT Project 2026</span>
            </div>
            <h1 className="font-emergency-hero-mobile text-emergency-hero-mobile font-extrabold text-primary md:text-emergency-hero">
              Smart Fire Detection & Alert System
            </h1>
            <p className="mt-4 font-body-main text-body-main text-on-surface-variant">
              IoT-based early warning and intelligent emergency response for modern campuses. Multi-sensor
              correlation detects smoke, flame, and abnormal temperatures, then routes alerts to students,
              faculty, and fire rescue.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={profile ? dashboardPath(profile.role) : "/login"}
                className="rounded-lg bg-primary-container px-6 py-3 font-data-mono text-data-mono text-on-primary shadow-md hover:bg-primary"
              >
                View Live Dashboard
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-outline-variant bg-surface-variant px-6 py-3 font-data-mono text-data-mono text-on-surface hover:bg-surface-container-high"
              >
                Create account
              </Link>
            </div>
          </div>
          <div className="relative h-64 overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-sm md:h-96">
            <img
              alt="System architecture overview"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5TMrefSj9HvMpc2mzhj5CATHxGZ_8OLNvF6QuG4WtqUdBjsVxDdpqquMeNeMo6fPqalH0b1wRXjAbB9c6dMRvkXI11J3cDKAOMTrJShvh61JJYn6uZ_MzrrhZ7g05m2bxIV1KLNI0UQT2duANF1nRsCnvRc8-6ughYte_Q8i3MzS5xGU0oVcsQcsPufBg9ayICjqVpYalKldqwWywFSaLNA39E7QorJY4JRObp8gR2BO0FETmbk79SG3b2MJwa8kl_g"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4">
              <span className="rounded bg-primary-container/80 px-2 py-1 font-label-caps text-label-caps uppercase text-white">
                System Architecture Overview
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-7xl flex-col gap-stack-lg px-margin-mobile pb-16 md:px-margin-desktop">
        <div className="mt-6">
          <LiveTelemetryBoard nodes={nodeList} title="Home live telemetry board" />
        </div>

        <div className="grid gap-stack-md md:grid-cols-2">
          <div className="flex flex-col gap-stack-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">warning</span>
              <h3 className="font-building-id text-building-id">01. Problem Statement</h3>
            </div>
            <p className="font-body-main text-body-main text-on-surface-variant">
              Fire incidents can cause serious damage when not detected early. Conventional systems provide only
              local warnings. This IoT approach sends immediate remote alerts to the right campus roles.
            </p>
          </div>
          <div className="flex flex-col gap-stack-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">track_changes</span>
              <h3 className="font-building-id text-building-id">02. Objective</h3>
            </div>
            <p className="font-body-main text-body-main text-on-surface-variant">
              Detect smoke, flame, and temperature via an ESP32 hub, calculate risk scores, and generate
              role-based alerts for rapid campus response.
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-outline-variant bg-surface-container p-stack-lg shadow-sm">
          <h2 className="mb-6 border-b border-outline-variant pb-2 font-headline-display text-headline-display text-primary">
            Working Principle
          </h2>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["sensors", "Sense", "Smoke / Flame / Temp"],
              ["memory", "Process", "ESP32 Reads Data"],
              ["account_tree", "Decide", "Risk Score Calc"],
              ["notifications_active", "Alert", "Buzzer / LED / Remote"],
              ["dashboard", "Monitor", "IoT Dashboard"],
            ].map(([icon, title, caption]) => (
              <div
                key={title}
                className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-center shadow-sm"
              >
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className="font-building-id text-building-id text-primary">{title}</span>
                <span className="mt-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
                  {caption}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-stack-md md:grid-cols-3">
          <div className="relative flex flex-col items-center overflow-hidden rounded-xl border border-safety-green bg-surface-container-lowest p-stack-md text-center shadow-sm">
            <div className="absolute top-0 left-0 h-1 w-full bg-safety-green" />
            <span className="material-symbols-outlined mb-2 text-4xl text-safety-green">check_circle</span>
            <h3 className="font-building-id text-building-id text-safety-green">SAFE</h3>
            <p className="mt-2 font-label-caps text-label-caps text-on-surface-variant">Normal sensor readings</p>
          </div>
          <div className="relative flex flex-col items-center overflow-hidden rounded-xl border border-warning-yellow bg-surface-container-lowest p-stack-md text-center shadow-sm">
            <div className="absolute top-0 left-0 h-1 w-full bg-warning-yellow" />
            <span className="material-symbols-outlined mb-2 text-4xl text-warning-yellow">warning</span>
            <h3 className="font-building-id text-building-id text-warning-yellow">WARNING</h3>
            <p className="mt-2 font-label-caps text-label-caps text-on-surface-variant">Abnormal sensor reading</p>
          </div>
          <div className="pulse-critical relative flex flex-col items-center overflow-hidden rounded-xl border-2 border-critical-red bg-surface-container-lowest p-stack-md text-center shadow-md">
            <div className="absolute top-0 left-0 h-2 w-full bg-critical-red" />
            <span className="material-symbols-outlined mb-2 text-4xl text-critical-red">local_fire_department</span>
            <h3 className="font-building-id text-building-id text-critical-red">FIRE ALERT</h3>
            <p className="mt-2 font-label-caps text-label-caps text-on-surface-variant">Potential fire detected</p>
          </div>
        </section>
      </main>
    </div>
  );
}
