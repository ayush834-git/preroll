import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions, getAuthEnvStatus } from "@/lib/auth";
import AuthClient from "./auth-client";

export default async function AuthPage() {
  const authEnvStatus = getAuthEnvStatus();
  let configError = "";

  if (!authEnvStatus.hasSecret) {
    configError =
      "Server auth is not configured. Set NEXTAUTH_SECRET in Vercel env.";
  } else if (!authEnvStatus.hasDatabaseUrl) {
    configError =
      "Database is not configured. Set DATABASE_URL in Vercel env.";
  }

  let session: Awaited<ReturnType<typeof getServerSession>> = null;

  if (!configError) {
    try {
      session = await getServerSession(authOptions);
    } catch {
      configError =
        "Auth session failed to initialize. Check Vercel auth environment variables.";
    }
  }

  if (session?.user?.id) {
    redirect("/app/dashboard");
  }

  return (
    <AuthClient
      configError={configError}
      emailProviderReady={authEnvStatus.hasEmailProvider}
    />
  );
}
