import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim());
}

export function getAuthEnvStatus() {
  const isVercel = hasValue(process.env.VERCEL);
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  const hasSecret = hasValue(secret);
  const hasDatabaseUrl = hasValue(databaseUrl);
  const usesLocalDatabase =
    /(?:^|[@/])localhost(?::\d+)?(?:[/?]|$)/i.test(databaseUrl) ||
    /(?:^|[@/])127\.0\.0\.1(?::\d+)?(?:[/?]|$)/.test(databaseUrl);
  const hasUsableDatabaseUrl = hasDatabaseUrl && !(isVercel && usesLocalDatabase);
  const hasSmtpConfig =
    hasValue(process.env.EMAIL_SERVER_HOST) &&
    hasValue(process.env.EMAIL_SERVER_PORT) &&
    hasValue(process.env.EMAIL_SERVER_USER) &&
    hasValue(process.env.EMAIL_SERVER_PASSWORD) &&
    hasValue(process.env.EMAIL_FROM);

  return {
    isVercel,
    hasSecret,
    hasDatabaseUrl,
    hasUsableDatabaseUrl,
    usesLocalDatabase,
    hasSmtpConfig,
    hasEmailProvider: hasUsableDatabaseUrl && hasSmtpConfig,
  };
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function getSmtpConfig() {
  const host = getRequiredEnv("EMAIL_SERVER_HOST");
  const port = Number(getRequiredEnv("EMAIL_SERVER_PORT"));
  const user = getRequiredEnv("EMAIL_SERVER_USER");
  const pass = getRequiredEnv("EMAIL_SERVER_PASSWORD");

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("EMAIL_SERVER_PORT must be a positive number.");
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  };
}

const authEnvStatus = getAuthEnvStatus();
const APP_NAME = "Preroll";

export const authOptions: NextAuthOptions = {
  adapter: authEnvStatus.hasUsableDatabaseUrl ? PrismaAdapter(prisma) : undefined,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    // JWT session keeps auth stateless on Vercel while user/project data remains in DB.
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    ...(authEnvStatus.hasEmailProvider
      ? [
          EmailProvider({
            // Auth.js email provider sends a one-click magic link to the inbox.
            server: getSmtpConfig(),
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier, url }) {
              const transport = nodemailer.createTransport(getSmtpConfig());
              const from = getRequiredEnv("EMAIL_FROM");
              const subject = `Sign in to ${APP_NAME}`;
              const text = [
                `Sign in to ${APP_NAME}:`,
                url,
                "",
                "If you did not request this email, you can safely ignore it.",
              ].join("\n");

              const html = `
                <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
                  <h2 style="margin: 0 0 12px;">Sign in to ${APP_NAME}</h2>
                  <p style="margin: 0 0 16px;">Click the button below to log in:</p>
                  <p style="margin: 0 0 16px;">
                    <a href="${url}" style="display: inline-block; background: #111827; color: #ffffff; padding: 10px 16px; border-radius: 8px; text-decoration: none;">Log in to ${APP_NAME}</a>
                  </p>
                  <p style="margin: 0 0 8px;">If the button does not work, copy and paste this URL:</p>
                  <p style="margin: 0; word-break: break-all;"><a href="${url}">${url}</a></p>
                </div>
              `;

              await transport.sendMail({
                to: identifier,
                from,
                subject,
                text,
                html,
              });
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) {
          return url;
        }
      } catch {
        // Fall through to default target.
      }
      return `${baseUrl}/dashboard`;
    },
  },
};
