import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 pb-12 pt-32 sm:px-6 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute -right-20 bottom-4 h-80 w-80 rounded-full bg-slate-300/50 blur-3xl" />
      </div>

      <AuthForm mode="login" error={params.error} notice={params.notice} nextPath={params.next} />
    </div>
  );
}
