"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";
import { PeekCharacter } from "@/components/PeekCharacter";
import type { UserRole } from "@/lib/types";

const roles: { id: UserRole; title: string; subtitle: string; icon: string; tone: string }[] = [
  {
    id: "student",
    title: "Student",
    subtitle: "Campus alerts & emergency guidance",
    icon: "school",
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "faculty",
    title: "Faculty / Staff",
    subtitle: "Operational oversight and response tools",
    icon: "work",
    tone: "bg-slate-900 text-white",
  },
  {
    id: "rescue",
    title: "Rescue Personnel",
    subtitle: "Critical response and live triage",
    icon: "local_hospital",
    tone: "bg-red-100 text-red-600",
  },
];

const stats: [string, string][] = [
  ["12", "Live nodes"],
  ["3", "Active buildings"],
  ["24/7", "Coverage"],
];

const labelClass = "block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600";
const inputClass =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5";
const submitClass =
  "flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70";

/**
 * Renders the mascot in a clipped band sitting just above the card, so the
 * creature rises out from behind the card's top edge with its paws resting on it.
 */
function PeekStage({ peekKey }: { peekKey: number }) {
  return (
    <div
      key={peekKey}
      className="pointer-events-none absolute inset-x-0 z-20 flex items-end justify-center overflow-hidden"
      style={{ bottom: "100%", height: "120px" }}
    >
      <PeekCharacter />
    </div>
  );
}

export function AuthForm({
  mode,
  error,
  notice,
  nextPath,
  adminOnly = false,
}: {
  mode: "login" | "signup";
  error?: string;
  notice?: string;
  nextPath?: string;
  adminOnly?: boolean;
}) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [pending, setPending] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginType, setLoginType] = useState<"admin" | "user">("user");
  const [peekKey, setPeekKey] = useState(0);

  const placeholders: Record<UserRole, string> = {
    student: "your.email@example.com",
    faculty: "your.email@example.com",
    admin: "admin@example.com",
    rescue: "your.email@example.com",
  };

  const popPeek = () => setPeekKey((current) => current + 1);

  if (adminOnly || showAdminLogin) {
    return (
      <div className="relative w-full max-w-xl">
        <PeekStage peekKey={peekKey} />

        <main className="rise-in relative z-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
          <header className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1220_0%,#16233a_55%,#1e293b_100%)] px-6 py-6 text-white sm:px-8">
            <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                  security
                </span>
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">Admin access</p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.05em]">Campus Safe</h1>
              </div>
            </div>
          </header>

          <div className="p-6 sm:p-8">
            {error ? (
              <p className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  error
                </span>
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mb-4 flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  info
                </span>
                {notice}
              </p>
            ) : null}

            <form
              className="space-y-5"
              action={async (formData) => {
                setPending(true);
                if (mode === "login") await signIn(formData);
                else await signUp(formData);
              }}
            >
              <div>
                <label className={labelClass} htmlFor="admin-email">
                  Admin email
                </label>
                <input
                  className={inputClass}
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="admin-password">
                  Password
                </label>
                <input
                  className={inputClass}
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>

              <button className={submitClass} type="submit" disabled={pending}>
                <span>{pending ? "Authenticating..." : "Login as admin"}</span>
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  login
                </span>
              </button>

              {!adminOnly ? (
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    arrow_back
                  </span>
                  Back to user access
                </button>
              ) : null}
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl">
      <PeekStage peekKey={peekKey} />

      <main className="rise-in relative z-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative isolate flex flex-col overflow-hidden bg-[linear-gradient(135deg,#0b1220_0%,#16233a_52%,#1e293b_100%)] p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-white/[0.06] blur-3xl" />

            <div className="relative z-10 flex h-full flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-100 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  shield
                </span>
                Campus Safe
              </span>

              <h1 className="mt-6 max-w-lg text-[2rem] font-black leading-[1.06] tracking-[-0.05em] text-white sm:text-4xl lg:text-[3rem]">
                Smart fire monitoring for every campus role.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Detect hazards early, coordinate fast responses, and keep students, faculty, and rescue teams
                aligned in real time.
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:mt-auto">
                {stats.map(([value, label], index) => (
                  <div
                    key={label}
                    className="rise-in rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"
                    style={{ animationDelay: `${180 + index * 70}ms` }}
                  >
                    <p className="text-2xl font-black tracking-[-0.04em] text-white">{value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Secure access</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900 sm:text-[1.75rem]">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/25">
                <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                  shield
                </span>
              </span>
            </div>

            {mode === "login" ? (
              <div
                className="mb-6 grid grid-cols-2 gap-1.5 rounded-full bg-slate-100 p-1.5"
                role="tablist"
                aria-label="Login type"
              >
                {(
                  [
                    ["admin", "Admin login"],
                    ["user", "User login"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={loginType === value}
                    onClick={() => {
                      setLoginType(value);
                      popPeek();
                    }}
                    className={`rounded-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition ${
                      loginType === value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            {error ? (
              <p className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  error
                </span>
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="mb-4 flex items-start gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  info
                </span>
                {notice}
              </p>
            ) : null}

            {mode === "login" && loginType === "admin" ? (
              <form
                className="space-y-5"
                action={async (formData) => {
                  setPending(true);
                  formData.set("role", "admin");
                  await signIn(formData);
                }}
              >
                <input type="hidden" name="role" value="admin" />
                <div>
                  <label className={labelClass} htmlFor="admin-login-email">
                    Admin email
                  </label>
                  <input
                    className={inputClass}
                    id="admin-login-email"
                    name="email"
                    type="email"
                    required
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="admin-login-password">
                    Password
                  </label>
                  <input
                    className={inputClass}
                    id="admin-login-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </div>

                {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

                <button className={submitClass} type="submit" disabled={pending}>
                  <span>{pending ? "Authenticating..." : "Login as admin"}</span>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    login
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginType("user");
                    popPeek();
                  }}
                  className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    arrow_back
                  </span>
                  Back to user access
                </button>
              </form>
            ) : !role ? (
              <div className="space-y-3">
                {roles.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRole(item.id);
                      popPeek();
                    }}
                    className="rise-in group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_-16px_rgba(15,23,42,0.25)]"
                    style={{ animationDelay: `${120 + index * 70}ms` }}
                  >
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                      <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                        {item.icon}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-slate-900">{item.title}</span>
                      <span className="block text-sm text-slate-500">{item.subtitle}</span>
                    </span>
                    <span
                      className="material-symbols-outlined text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
                      aria-hidden="true"
                    >
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            ) : (

              <form
                className="space-y-4"
                action={async (formData) => {
                  setPending(true);
                  if (mode === "login") await signIn(formData);
                  else await signUp(formData);
                }}
              >
                <input type="hidden" name="role" value={role} />
                {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

                <div className="mb-2 flex items-center justify-between gap-2">
                  <button
                    className="flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                    type="button"
                    onClick={() => {
                      setRole(null);
                      popPeek();
                    }}
                  >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">
                      arrow_back
                    </span>
                    Change role
                  </button>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
                    {role === "faculty" ? "Faculty" : role === "rescue" ? "Rescue" : "Student"}
                  </span>
                </div>

                {mode === "signup" ? (
                  <label className={labelClass}>
                    Full name
                    <input
                      className={inputClass}
                      name="full_name"
                      required
                      placeholder="Your full name"
                    />
                  </label>
                ) : null}

                <label className={labelClass}>
                  University email
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    required
                    placeholder={placeholders[role]}
                  />
                </label>

                <label className={labelClass}>
                  Password
                  <input
                    className={inputClass}
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </label>

                <button className={submitClass} type="submit" disabled={pending}>
                  <span>{pending ? "Authenticating..." : mode === "login" ? "Login" : "Create account"}</span>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">
                    {mode === "login" ? "login" : "person_add"}
                  </span>
                </button>
              </form>
            )}

            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
              {mode === "login" ? (
                <>
                  New to Campus Safe?{" "}
                  <Link className="font-semibold text-slate-900 transition hover:text-slate-600" href="/signup">
                    Sign up with email
                  </Link>
                </>
              ) : (
                <>
                  Already have access?{" "}
                  <Link className="font-semibold text-slate-900 transition hover:text-slate-600" href="/login">
                    Login
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}


