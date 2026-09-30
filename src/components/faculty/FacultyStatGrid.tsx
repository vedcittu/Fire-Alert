"use client";

import { useEffect, useState } from "react";

export type FacultyStatTone = "total" | "online" | "offline" | "alert";

export type FacultyStat = {
  label: string;
  value: number;
  tone: FacultyStatTone;
  icon: string;
  hint: string;
};

const tones: Record<FacultyStatTone, { value: string; dot: string; icon: string }> = {
  total: {
    value: "text-slate-900",
    dot: "bg-slate-900",
    icon: "text-slate-400",
  },
  online: {
    value: "text-emerald-600",
    dot: "bg-safety-green",
    icon: "text-emerald-500",
  },
  offline: {
    value: "text-slate-500",
    dot: "bg-node-offline",
    icon: "text-slate-400",
  },
  alert: {
    value: "text-red-600",
    dot: "bg-critical-red",
    icon: "text-red-500",
  },
};

/** Counts from zero up to the target once, after the component mounts. */
function useCountUp(target: number, enabled: boolean, duration = 900) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!enabled) return;

    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, target, duration]);

  return value;
}

export function FacultyStatGrid({ stats }: { stats: FacultyStat[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatTile key={stat.label} stat={stat} mounted={mounted} index={index} />
      ))}
    </div>
  );
}

function StatTile({ stat, mounted, index }: { stat: FacultyStat; mounted: boolean; index: number }) {
  const tone = tones[stat.tone];
  const value = useCountUp(stat.value, mounted);

  return (
    <article
      className="faculty-card faculty-card-hover faculty-rise flex flex-col justify-between gap-5 rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
        <span className={`material-symbols-outlined text-[20px] ${tone.icon}`} aria-hidden="true">
          {stat.icon}
        </span>
      </div>

      <div>
        <p className={`text-3xl font-black tracking-[-0.06em] sm:text-4xl ${tone.value}`}>{value}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
          <p className="text-[11px] font-semibold text-slate-500">{stat.hint}</p>
        </div>
      </div>
    </article>
  );
}
