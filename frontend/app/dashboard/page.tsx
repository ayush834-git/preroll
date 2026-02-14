import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions, getAuthEnvStatus } from "@/lib/auth";

export default async function DashboardPreviewPage() {
  const authEnvStatus = getAuthEnvStatus();
  let session: Session | null = null;

  if (authEnvStatus.hasSecret) {
    try {
      session = await getServerSession(authOptions);
    } catch {
      // Keep preview page public even if server auth is misconfigured.
      session = null;
    }
  }

  if (session?.user?.id) {
    redirect("/app/dashboard");
  }

  return (
    <main className="relative min-h-screen text-white px-6 md:px-10 py-12 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="glass-panel-strong rounded-3xl p-8 md:p-12">
          <p className="text-xs tracking-[0.3em] text-primary mb-3">
            PUBLIC PREVIEW
          </p>
          <h1 className="text-3xl md:text-5xl font-light text-white">
            Dashboard Preview
          </h1>
          <p className="mt-5 text-white/70 max-w-2xl">
            This route is public so visitors can preview the dashboard
            experience. Real user projects are available after email OTP login.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="glass-outline rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                After Login
              </p>
              <p className="mt-2 text-sm text-white/80">
                Access your protected workspace at <code>/app/dashboard</code>.
              </p>
            </div>
            <div className="glass-outline rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Auth Model
              </p>
              <p className="mt-2 text-sm text-white/80">
                OTP verification creates first-time users and restores existing
                accounts by email.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/auth"
              className="glass-button glass-button-primary text-white px-6 py-3 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta"
            >
              Continue with Email OTP
            </Link>
            <Link
              href="/"
              className="glass-button glass-button-secondary text-white/85 px-6 py-3 rounded-xl transition-all btn-animated btn-sky btn-ghost"
            >
              Back Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
