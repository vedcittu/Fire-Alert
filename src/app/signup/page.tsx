import { AuthForm } from "@/components/AuthForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-margin-mobile md:p-margin-desktop">
      <AuthForm mode="signup" error={params.error} />
    </div>
  );
}
