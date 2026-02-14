import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let body: { title?: string; content?: unknown };
  try {
    body = (await request.json()) as { title?: string; content?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title =
    typeof body.title === "string" ? body.title.trim() : undefined;

  let project: {
    id: string;
    title: string;
    content: Prisma.JsonValue | null;
    updatedAt: Date;
  };
  try {
    project = await prisma.project.update({
      where: { id },
      data: {
        title: title && title.length > 0 ? title : undefined,
        content:
          body.content === undefined
            ? undefined
            : body.content === null
              ? Prisma.JsonNull
              : (body.content as Prisma.InputJsonValue),
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}
