"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Alert } from "@/lib/types";

const severityStyles: Record<
  Alert["severity"],
  { chip: string; label: string; icon: string; text: string }
> = {
  critical: {
    chip: "border-red-200 bg-red-50 text-red-700",
    label: "Critical",
    icon: "local_fire_department",
    text: "text-red-500",
  },
  emergency: {
    chip: "border-red-200 bg-red-50 text-red-700",
    label: "Emergency",
    icon: "local_fire_department",
    text: "text-red-500",
  },
  warning: {
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Warning",
    icon: "warning",
    text: "text-warning-yellow",
  },
  safe: {
    chip: "border-slate-200 bg-slate-50 text-slate-600",
    label: "Safe",
    icon: "check_circle",
    text: "text-slate-400",
  },
};

function timeAgo(iso: string, now: number) {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  return mins < 1 ? "just now" : `${mins}m ago`;
}

export function FacultyAlertsPanel({
  alerts,
  renderedAt,
  title = "Active alerts",
  emptyTitle = "All clear",
  emptyMessage = "No active incidents are being reported across the monitored labs.",
  emptyIcon = "verified",
}: {
  alerts: Alert[];
  renderedAt: number;
  title?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: string;
}) {
  const [now, setNow] = useState(renderedAt);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const hasAlerts = alerts.length > 0;

  return (
    <section
      className="faculty-card faculty-rise overflow-hidden rounded-[24px] border border-slate-200 bg-white"
      style={{ animationDelay: "240ms" }}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full faculty-live-dot ${
              hasAlerts ? "bg-critical-red faculty-live-dot--alert" : "bg-safety-green"
            }`}
            aria-hidden="true"
          />
          <h2 className="text-base font-bold tracking-[-0.02em] text-slate-900">{title}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              hasAlerts ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
            }`}
            aria-live="polite"
          >
            {alerts.length}
          </span>
        </div>

        <Link
          href="/alerts"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-900"
        >
          View all
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

      {hasAlerts ? (
        <ul className="divide-y divide-slate-100">
          {alerts.map((alert, index) => {
            const severity = severityStyles[alert.severity];

            return (
              <li key={alert.id} className="faculty-rise" style={{ animationDelay: `${300 + index * 50}ms` }}>
                <Link
                  href="/alerts"
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 text-[18px] ${severity.text}`} aria-hidden="true">
                      {severity.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-900">{alert.title}</p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${severity.chip}`}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">{alert.location}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                      {timeAgo(alert.created_at, now)}
                    </span>
                    <span
                      className="material-symbols-outlined text-[16px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                      aria-hidden="true"
                    >
                      chevron_right
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
              {emptyIcon}
            </span>
          </div>
          <p className="text-base font-bold text-slate-900">{emptyTitle}</p>
          <p className="max-w-sm text-sm leading-6 text-slate-500">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}
