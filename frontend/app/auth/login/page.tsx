import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions, getAuthEnvStatus } from "@/lib/auth";
import LoginClient from "./login-client";

function mapAuthError(errorCode: string | undefined) {
  switch (errorCode) {
    case "Verification":
      return "This magic link is invalid or expired. Request a new login link.";
    case "Configuration":
      return "Authentication server configuration is invalid. Check server environment variables.";
    case "AccessDenied":
      return "Access denied for this sign-in request.";
    case "Unknown":
      return "Sign-in failed. Request a new magic link and try again.";
    default:
      return errorCode
        ? `Sign-in failed (${errorCode}). Request a new magic link and try again.`
        : "";
  }
}

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const authEnvStatus = getAuthEnvStatus();
  const { error } = await searchParams;
  let configError = "";
  const authError = mapAuthError(error);

  if (!authEnvStatus.hasSecret) {
    configError =
      "Server auth is not configured. Set NEXTAUTH_SECRET in Vercel env.";
  } else if (!authEnvStatus.hasDatabaseUrl) {
    configError =
      "Database is not configured. Set DATABASE_URL in Vercel env.";
  }

  let session: Session | null = null;

  if (!configError) {
    try {
      session = await getServerSession(authOptions);
    } catch {
      configError =
        "Auth session failed to initialize. Check Vercel auth environment variables.";
    }
  }

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <LoginClient
      configError={configError}
      emailProviderReady={authEnvStatus.hasEmailProvider}
      authError={authError}
    />
  );
}
