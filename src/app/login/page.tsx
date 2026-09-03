import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-margin-mobile md:p-margin-desktop">
      <AuthForm mode="login" error={params.error} notice={params.notice} nextPath={params.next} />
    </div>
  );
}
