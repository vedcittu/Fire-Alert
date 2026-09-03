"use client";

import { useTransition } from "react";
import { updateAlertStatus } from "@/app/actions/alerts";
import type { Alert, AlertStatus } from "@/lib/types";

export function AlertActions({ alert }: { alert: Alert }) {
  const [pending, start] = useTransition();

  function run(status: AlertStatus) {
    start(async () => {
      await updateAlertStatus(alert.id, status);
    });
  }

  if (alert.status === "resolved") {
    return <p className="font-label-caps text-safety-green">Resolved</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {alert.status === "open" ? (
        <button
          disabled={pending}
          onClick={() => run("acknowledged")}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-error py-3.5 font-label-caps text-[14px] font-bold uppercase text-on-error hover:bg-error/90 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">done_all</span>
          Acknowledge Alert
        </button>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={pending}
          onClick={() => run("responding")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-warning-yellow/30 bg-warning-yellow/10 py-3 font-label-caps text-[13px] font-bold uppercase text-warning-yellow hover:bg-warning-yellow/20"
        >
          <span className="material-symbols-outlined text-[18px]">airport_shuttle</span>
          Responding
        </button>
        <button
          disabled={pending}
          onClick={() => run("on_site")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-safety-green/30 bg-safety-green/10 py-3 font-label-caps text-[13px] font-bold uppercase text-safety-green hover:bg-safety-green/20"
        >
          <span className="material-symbols-outlined text-[18px]">pin_drop</span>
          On Site
        </button>
      </div>
      <button
        disabled={pending}
        onClick={() => run("resolved")}
        className="w-full rounded-lg border border-outline-variant bg-surface-container py-3 font-label-caps text-[13px] font-bold uppercase text-on-surface-variant hover:bg-surface-container-high"
      >
        Mark Resolved
      </button>
    </div>
  );
}
