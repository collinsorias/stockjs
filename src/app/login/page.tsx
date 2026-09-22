import { LoginForm } from "@/components/login-form";

const INACTIVE_NOTICE =
  "";

type LoginPageProps = {
  searchParams: Promise<{ reason?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;

  return <LoginForm notice={reason === "inactive" ? INACTIVE_NOTICE : undefined} />;
}
