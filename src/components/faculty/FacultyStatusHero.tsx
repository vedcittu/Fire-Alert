"use client";

import { useEffect, useState } from "react";

export type CampusState = "calm" | "watch" | "emergency";

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const tones: Record<
  CampusState,
  { border: string; eyebrow: string; ring: string; dot: string; pill: string; wash: string }
> = {
  calm: {
    border: "border-emerald-100",
    eyebrow: "Campus status · All clear",
    ring: "#16a34a",
    dot: "bg-safety-green",
    pill: "bg-emerald-50 text-emerald-700",
    wash: "radial-gradient(120% 140% at 100% 0%, rgba(22, 163, 74, 0.08), transparent 62%)",
  },
  watch: {
    border: "border-amber-100",
    eyebrow: "Campus status · Needs review",
    ring: "#eab308",
    dot: "bg-warning-yellow",
    pill: "bg-amber-50 text-amber-700",
    wash: "radial-gradient(120% 140% at 100% 0%, rgba(234, 179, 8, 0.1), transparent 62%)",
  },
  emergency: {
    border: "border-red-100",
    eyebrow: "Campus status · Critical",
    ring: "#dc2626",
    dot: "bg-critical-red faculty-live-dot--alert",
    pill: "bg-red-50 text-red-700",
    wash: "radial-gradient(120% 140% at 100% 0%, rgba(220, 38, 38, 0.1), transparent 62%)",
  },
};

export function FacultyStatusHero({
  state,
  title,
  message,
  onlineCount,
  totalCount,
  activeAlerts,
}: {
  state: CampusState;
  title: string;
  message: string;
  onlineCount: number;
  totalCount: number;
  activeAlerts: number;
}) {
  const tone = tones[state];
  const [clock, setClock] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

    const frame = requestAnimationFrame(tick);
    const interval = window.setInterval(tick, 20000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const ratio = totalCount > 0 ? onlineCount / totalCount : 0;
  const percentage = Math.round(ratio * 100);
  const dashOffset = filled ? CIRCUMFERENCE * (1 - ratio) : CIRCUMFERENCE;

  return (
    <section
      className={`faculty-card faculty-rise relative overflow-hidden rounded-[28px] border bg-white p-6 sm:p-8 ${tone.border}`}
      style={{ backgroundImage: tone.wash }}
    >
      <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full faculty-live-dot ${tone.dot}`} aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{tone.eyebrow}</p>
          </div>

          <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-900 sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{message}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="status-pill bg-slate-50 text-slate-600">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                schedule
              </span>
              {clock ?? "--:--"} local
            </span>
            <span className="status-pill bg-slate-50 text-slate-600">Live telemetry</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 sm:items-end">
          <div className="relative">
            <svg
              viewBox="0 0 120 120"
              className="h-28 w-28 -rotate-90"
              role="img"
              aria-label={`${onlineCount} of ${totalCount} sensor nodes online`}
            >
              <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={tone.ring}
                strokeWidth="8"
                strokeLinecap="round"
                className="faculty-ring"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black tracking-[-0.05em] text-slate-900">{percentage}%</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">online</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span className="status-pill bg-slate-100 text-slate-600">
              {onlineCount}/{totalCount} nodes online
            </span>
            <span className={`status-pill ${tone.pill}`}>
              {activeAlerts} active {activeAlerts === 1 ? "alert" : "alerts"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
