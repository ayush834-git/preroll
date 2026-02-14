import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectPageClient from "./project-page-client";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
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
