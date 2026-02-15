import { prisma } from "@/lib/prisma";
import ProjectPageClient from "./project-page-client";

type Props = { params: Promise<{ id: string }> };
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  // Support legacy slug routes (e.g. /projects/midnight) without crashing.
  if (!UUID_REGEX.test(id)) {
    return <ProjectPageClient id={id} title={id} initialContent={null} />;
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
    },
  });

  if (!project) {
    return <ProjectPageClient id={id} title={id} initialContent={null} />;
  }

  return (
    <ProjectPageClient
      id={project.id}
      title={project.title}
      initialContent={project.content}
    />
  );
}
