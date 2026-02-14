import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions, getAuthEnvStatus } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const authEnvStatus = getAuthEnvStatus();
  let session: Session | null = null;

  if (authEnvStatus.hasSecret && authEnvStatus.hasUsableDatabaseUrl) {
    try {
      session = await getServerSession(authOptions);
    } catch {
      session = null;
    }
  }

  const userId = session?.user?.id;
  const isAuthenticated = Boolean(userId);
  let projects: { id: string; title: string; updatedAt: Date }[] = [];

  if (userId) {
    try {
      projects = await prisma.project.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } catch {
      projects = [];
    }
  }

  return (
    <DashboardClient
      isAuthenticated={isAuthenticated}
      userEmail={session?.user?.email ?? ""}
      projects={projects}
    />
  );
}
