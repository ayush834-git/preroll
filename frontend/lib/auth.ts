import { createHash, randomInt } from "crypto";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const OTP_TTL_SECONDS = 10 * 60;
const OTP_REGEX = /^\d{6}$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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

function getAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for OTP hashing.");
  }
  return secret;
}

function hashVerificationToken(token: string) {
  return createHash("sha256")
    .update(`${token}${getAuthSecret()}`)
    .digest("hex");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // JWT session keeps auth stateless on Vercel while user/project data remains in DB.
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  providers: [
    EmailProvider({
      // SMTP config works with Gmail app password or any SMTP free tier.
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        secure: Number(process.env.EMAIL_SERVER_PORT || 587) === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: OTP_TTL_SECONDS,
      // Generate six-digit numeric OTP instead of a long magic-link token.
      generateVerificationToken: async () =>
        randomInt(100000, 1000000).toString(),
      async sendVerificationRequest({ identifier, token }) {
        const transport = nodemailer.createTransport(getSmtpConfig());
        const from = getRequiredEnv("EMAIL_FROM");
        const appName = "Preroll";
        const subject = `${appName} login code: ${token}`;
        const text = [
          `Your ${appName} one-time passcode is: ${token}`,
          "",
          `This code expires in ${Math.floor(OTP_TTL_SECONDS / 60)} minutes.`,
          "If you did not request this, you can ignore this email.",
        ].join("\n");

        const html = `
          <div style="font-family: Inter, Arial, sans-serif; color: #1f130d;">
            <p style="font-size: 16px; margin-bottom: 8px;">Your <strong>${appName}</strong> one-time passcode:</p>
            <p style="font-size: 32px; letter-spacing: 8px; margin: 12px 0; font-weight: 700;">${token}</p>
            <p style="font-size: 14px; margin-top: 8px;">This code expires in ${Math.floor(
              OTP_TTL_SECONDS / 60
            )} minutes.</p>
            <p style="font-size: 12px; color: #6b5a4f;">If you did not request this, ignore this email.</p>
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
    CredentialsProvider({
      id: "otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email || ""));
        const otp = String(credentials?.otp || "").trim();

        if (!email || !OTP_REGEX.test(otp)) {
          return null;
        }

        // Verify token server-side against DB, enforce expiry, then delete for single-use.
        const hashedOtp = hashVerificationToken(otp);
        const storedToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: hashedOtp,
          },
          orderBy: {
            expires: "desc",
          },
        });

        if (!storedToken) return null;

        if (storedToken.expires < new Date()) {
          await prisma.verificationToken.deleteMany({
            where: { identifier: email, token: hashedOtp },
          });
          return null;
        }

        await prisma.verificationToken.deleteMany({
          where: { identifier: email, token: hashedOtp },
        });

        // First login creates user; subsequent logins reuse existing user by email.
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });
        const user =
          existingUser ??
          (await prisma.user.create({
            data: { email },
          }));

        return { id: user.id, email: user.email };
      },
    }),
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
      return `${baseUrl}/app/dashboard`;
    },
  },
};
