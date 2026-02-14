import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateViewerIdentity,
  getViewerIdentity,
  GUEST_USER_COOKIE,
  GUEST_USER_COOKIE_OPTIONS,
} from "@/lib/viewer";

export async function GET() {
  const viewer = await getViewerIdentity();
  if (!viewer.userId) {
    return NextResponse.json({ projects: [] });
  }

  const projects = await prisma.project.findMany({
    where: { userId: viewer.userId },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const viewer = await getOrCreateViewerIdentity();

  let body: { title?: string; content?: unknown };
  try {
    body = (await request.json()) as { title?: string; content?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      userId: viewer.userId!,
      title,
      content:
        body.content === undefined
          ? undefined
          : (body.content as Prisma.InputJsonValue),
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });

  const response = NextResponse.json({ project }, { status: 201 });

  if (viewer.shouldSetGuestCookie) {
    response.cookies.set(
      GUEST_USER_COOKIE,
      viewer.userId!,
      GUEST_USER_COOKIE_OPTIONS
    );
  }

  return response;
}
