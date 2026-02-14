"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

export default function AuthClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const normalizedEmail = email.trim().toLowerCase();

  const sendOtp = async () => {
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      // Auth.js email provider generates + stores the OTP token server-side and sends it via SMTP.
      const result = await signIn("email", {
        email: normalizedEmail,
        redirect: false,
        callbackUrl: "/app/dashboard",
      });

      if (result?.error) {
        setError("Unable to send OTP right now. Please try again.");
        return;
      }

      setStep("otp");
      setNotice("OTP sent. Check your inbox.");
    } catch {
      setError("Unable to send OTP right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.trim();
    if (!OTP_REGEX.test(code)) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      // Credentials provider validates OTP against DB hash, expiry, and single-use semantics.
      const result = await signIn("otp", {
        email: normalizedEmail,
        otp: code,
        redirect: false,
        callbackUrl: "/app/dashboard",
      });

      if (result?.error) {
        setError("Invalid or expired OTP. Request a new code.");
        return;
      }

      router.push("/app/dashboard");
      router.refresh();
    } catch {
      setError("Verification failed. Please try again.");
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
            {step === "email"
              ? "Enter your email and we will send a one-time passcode."
              : "Enter the 6-digit OTP sent to your email."}
          </p>

          {step === "email" ? (
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl glass-input px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                autoComplete="email"
              />

              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={loading}
                className="w-full mt-4 glass-interactive text-white py-3.5 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl glass-input px-4 py-3.5 text-sm text-white/70"
                disabled
              />
              <input
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-xl glass-input px-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors tracking-[0.3em]"
              />

              <button
                type="button"
                onClick={() => void verifyOtp()}
                disabled={loading}
                className="w-full mt-4 glass-interactive text-white py-3.5 rounded-xl transition-all shadow-glow btn-animated btn-amber btn-cta disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <button
                type="button"
                onClick={() => void sendOtp()}
                disabled={loading}
                className="w-full glass-outline text-white/80 py-3 rounded-xl transition-all btn-animated btn-sky btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>
          )}

          {notice && (
            <p className="mt-6 text-xs text-emerald-300/80">{notice}</p>
          )}
          {error && <p className="mt-6 text-xs text-red-300/80">{error}</p>}
        </div>
      </div>
    </main>
  );
}
