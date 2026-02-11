import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Server-side ownership check blocks cross-user project access.
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId,
    },
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
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fail fast if project does not belong to authenticated user.
  const existing = await prisma.project.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { title?: string; content?: unknown };
  try {
    body = (await request.json()) as { title?: string; content?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title =
    typeof body.title === "string" ? body.title.trim() : undefined;

  const project = await prisma.project.update({
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

  return NextResponse.json({ project });
}
