import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage orders, bundles and wishlists.">
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
