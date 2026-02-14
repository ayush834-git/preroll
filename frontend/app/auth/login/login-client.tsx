"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginClientProps = {
  configError?: string;
  emailProviderReady?: boolean;
  authError?: string;
};

export default function LoginClient({
  configError = "",
  emailProviderReady = true,
  authError = "",
}: LoginClientProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const normalizedEmail = email.trim().toLowerCase();
  const setupIssue =
    configError ||
    (emailProviderReady
      ? ""
      : "Email login is not configured. Set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, and EMAIL_FROM in server environment variables.");
  const flowDisabled = Boolean(setupIssue);

  const sendMagicLink = async () => {
    if (setupIssue) {
      setError(setupIssue);
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const result = await signIn("email", {
        email: normalizedEmail,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Unable to send login link right now. Please try again.");
        return;
      }

      setNotice("Check your email for the login link.");
    } catch {
      setError("Unable to send login link right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen text-white flex items-center justify-center px-6 overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 mb-8 transition-colors"
        >
          {"<- Back"}
        </Link>

        <div className="rounded-2xl p-8 glass-panel-strong">
          <h1 className="text-2xl font-light text-white mb-2">
            Login to <span className="text-primary">Preroll</span>
          </h1>
          <p className="text-sm text-white/60 mb-8">
            Enter your email and we will send a magic login link.
          </p>

          {setupIssue && (
            <p className="mb-4 text-xs text-amber-300/90">{setupIssue}</p>
          )}
          {authError && (
            <p className="mb-4 text-xs text-red-300/90">{authError}</p>
          )}

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl glass-input px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
              autoComplete="email"
              disabled={flowDisabled || loading}
            />

            <button
              type="button"
              onClick={() => void sendMagicLink()}
              disabled={loading || flowDisabled}
              className="w-full mt-4 glass-interactive text-white py-3.5 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending link..." : "Send Login Link"}
            </button>
          </div>

          {notice && (
            <p className="mt-6 text-xs text-emerald-300/80">{notice}</p>
          )}
          {error && <p className="mt-6 text-xs text-red-300/80">{error}</p>}
        </div>
      </div>
    </main>
  );
}
