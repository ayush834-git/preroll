import { prisma } from "@/lib/prisma";
import { getViewerIdentity } from "@/lib/viewer";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const viewer = await getViewerIdentity();
  const userId = viewer.userId;
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
      isAuthenticated={viewer.isAuthenticated}
      userEmail={viewer.email}
      projects={projects}
    />
  );
}
