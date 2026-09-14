"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";
import type { UserRole } from "@/lib/types";

const roles: { id: UserRole; title: string; subtitle: string; icon: string; tone: string }[] = [
  {
    id: "student",
    title: "Student",
    subtitle: "Campus alerts & emergency guidance",
    icon: "school",
    tone: "bg-secondary-container text-on-secondary-container",
  },
  {
    id: "faculty",
    title: "Faculty / Staff",
    subtitle: "Operational oversight and response tools",
    icon: "work",
    tone: "bg-primary-container text-on-primary",
  },
  {
    id: "rescue",
    title: "Rescue Personnel",
    subtitle: "Critical response and live triage",
    icon: "local_hospital",
    tone: "bg-error-container text-on-error-container",
  },
];

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

  const placeholders: Record<UserRole, string> = {
    student: "your.email@example.com",
    faculty: "your.email@example.com",
    admin: "admin@example.com",
    rescue: "your.email@example.com",
  };

  if (adminOnly || showAdminLogin) {
    return (
      <main className="w-full max-w-xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800">
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">Admin access</p>
              <h1 className="mt-1 text-2xl font-black tracking-[-0.05em]">Campus Safe</h1>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {error ? (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{error}</p>
          ) : null}
          {notice ? (
            <p className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-medium text-sky-700">{notice}</p>
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
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Admin email
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Password
              </label>
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={pending}
            >
              <span>{pending ? "Authenticating..." : "Login as admin"}</span>
              <span className="material-symbols-outlined text-base">login</span>
            </button>

            {!adminOnly ? (
              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to user access
              </button>
            ) : null}
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/50 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.18),transparent_30%),linear-gradient(135deg,#0f172a_0%,#1e293b_35%,#334155_100%)] p-6 sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-100">
              <span className="material-symbols-outlined text-sm">shield</span>
              Campus Safe
            </div>

            <h1 className="max-w-lg text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl lg:text-[3rem]">
              Smart fire monitoring for every campus role.
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-200">
              Detect hazards early, coordinate fast responses, and keep students, faculty, and rescue teams aligned in real time.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["12", "Live nodes"],
                ["3", "Active buildings"],
                ["24/7", "Coverage"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-sm">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-200">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-7 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Secure access</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
          </div>

          {mode === "login" ? (
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                  loginType === "admin"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType("user")}
                className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition ${
                  loginType === "user"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                User Login
              </button>
            </div>
          ) : null}

          {error ? (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">{error}</p>
          ) : null}
          {notice ? (
            <p className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-medium text-sky-700">{notice}</p>
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
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">Admin email</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">Password</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>

              {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={pending}
              >
                <span>{pending ? "Authenticating..." : "Login as admin"}</span>
                <span className="material-symbols-outlined text-base">login</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginType("user")}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to user access
              </button>
            </form>
          ) : !role ? (
            <div className="space-y-3">
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-lg"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-600">{item.subtitle}</div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 transition-transform group-hover:translate-x-1">chevron_right</span>
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
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                  type="button"
                  onClick={() => setRole(null)}
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Change role
                </button>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
                  {role === "faculty" ? "Faculty" : role === "rescue" ? "Rescue" : "Student"}
                </span>
              </div>

              {mode === "signup" ? (
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                  Full name
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                    id="full_name"
                    name="full_name"
                    required
                    placeholder="Your full name"
                  />
                </label>
              ) : null}

              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                University email
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={placeholders[role]}
                />
              </label>

              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                Password
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </label>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={pending}
              >
                <span>{pending ? "Authenticating..." : mode === "login" ? "Login" : "Create account"}</span>
                <span className="material-symbols-outlined text-base">{mode === "login" ? "login" : "person_add"}</span>
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
            {mode === "login" ? (
              <>
                New to Campus Safe?{" "}
                <Link className="font-semibold text-slate-900 hover:text-slate-700" href="/signup">
                  Sign up with email
                </Link>
              </>
            ) : (
              <>
                Already have access?{" "}
                <Link className="font-semibold text-slate-900 hover:text-slate-700" href="/login">
                  Login
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
