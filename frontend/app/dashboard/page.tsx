import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions, getAuthEnvStatus } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const authEnvStatus = getAuthEnvStatus();
  if (!authEnvStatus.hasSecret || !authEnvStatus.hasUsableDatabaseUrl) {
    redirect("/auth/login");
  }

  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    redirect("/auth/login");
  }

  const userId = session?.user?.id;

  if (!userId) {
    redirect("/auth/login");
  }

  let projects: { id: string; title: string; updatedAt: Date }[] = [];
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

  return (
    <DashboardClient
      userEmail={session?.user?.email ?? ""}
      projects={projects}
    />
  );
}
