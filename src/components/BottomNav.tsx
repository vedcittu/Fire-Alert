"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";

type Item = { href: string; label: string; icon: string };

const studentItems: Item[] = [
  { href: "/student", label: "Home", icon: "home" },
  { href: "/map", label: "Map", icon: "map" },
  { href: "/alerts", label: "Alerts", icon: "notifications" },
  { href: "/profile", label: "Profile", icon: "person" },
];

const facultyItems: Item[] = [
  { href: "/faculty", label: "Dashboard", icon: "dashboard" },
  { href: "/map", label: "Map", icon: "map" },
  { href: "/alerts", label: "Alerts", icon: "notifications" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/profile", label: "Profile", icon: "person" },
];

const adminItems: Item[] = [
  { href: "/admin", label: "Home", icon: "dashboard" },
  { href: "/map", label: "Map", icon: "map" },
  { href: "/alerts", label: "Alerts", icon: "notifications" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/profile", label: "Profile", icon: "person" },
];

const rescueItems: Item[] = [
  { href: "/rescue", label: "Command", icon: "shield" },
  { href: "/map", label: "Map", icon: "map" },
  { href: "/alerts", label: "Alerts", icon: "notifications" },
  { href: "/profile", label: "Profile", icon: "person" },
];

export function BottomNav({ role, alertCount = 0 }: { role: UserRole; alertCount?: number }) {
  const pathname = usePathname();
  const items =
    role === "admin"
      ? adminItems
      : role === "faculty"
        ? facultyItems
        : role === "rescue"
          ? rescueItems
          : studentItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/90 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all ${
                active ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              {item.label === "Alerts" && alertCount > 0 ? (
                <span className="absolute right-2 top-1.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
              ) : null}
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
