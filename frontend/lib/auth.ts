import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim());
}

export function getAuthEnvStatus() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  const hasSecret = hasValue(secret);
  const hasDatabaseUrl = hasValue(process.env.DATABASE_URL);
  const hasSmtpConfig =
    hasValue(process.env.EMAIL_SERVER_HOST) &&
    hasValue(process.env.EMAIL_SERVER_PORT) &&
    hasValue(process.env.EMAIL_SERVER_USER) &&
    hasValue(process.env.EMAIL_SERVER_PASSWORD) &&
    hasValue(process.env.EMAIL_FROM);

  return {
    hasSecret,
    hasDatabaseUrl,
    hasSmtpConfig,
    hasEmailProvider: hasDatabaseUrl && hasSmtpConfig,
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

export const authOptions: NextAuthOptions = {
  adapter: authEnvStatus.hasDatabaseUrl ? PrismaAdapter(prisma) : undefined,
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
