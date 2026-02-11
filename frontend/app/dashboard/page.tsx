import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Server-side route protection: unauthenticated users cannot load dashboard.
  if (!userId) {
    redirect("/auth");
  }

  const projects = await prisma.project.findMany({
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

  return (
    <DashboardClient
      userEmail={session.user?.email ?? ""}
      projects={projects}
    />
  );
}
