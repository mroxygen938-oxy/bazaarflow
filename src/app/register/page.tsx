import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialRole = role?.toUpperCase() === "SELLER" ? "SELLER" : "CUSTOMER";
  return (
    <AuthShell title="Create your account" subtitle="Join the marketplace in under a minute.">
      <RegisterForm initialRole={initialRole} />
    </AuthShell>
  );
}
