import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectPageClient from "./project-page-client";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Server-side protection: users must be authenticated before viewing any project.
  if (!userId) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // Server-side authorization: only load project owned by the authenticated user.
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      title: true,
      content: true,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <ProjectPageClient
      id={project.id}
      title={project.title}
      initialContent={project.content}
    />
  );
}
