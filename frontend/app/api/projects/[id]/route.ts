import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateViewerIdentity,
  getViewerIdentity,
  GUEST_USER_COOKIE,
  GUEST_USER_COOKIE_OPTIONS,
} from "@/lib/viewer";

type Params = {
  params: Promise<{ id: string }>;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function legacyIdToTitle(id: string) {
  const decoded = decodeURIComponent(id);
  return decoded.replace(/[-_]+/g, " ").trim() || decoded;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;

  let project: {
    id: string;
    title: string;
    content: Prisma.JsonValue | null;
    updatedAt: Date;
  } | null = null;
  let shouldSetGuestCookie = false;
  let guestUserId = "";

  if (UUID_REGEX.test(id)) {
    project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });
  } else {
    const viewer = await getViewerIdentity();
    if (!viewer.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    shouldSetGuestCookie = viewer.shouldSetGuestCookie;
    guestUserId = viewer.userId;

    project = await prisma.project.findFirst({
      where: {
        userId: viewer.userId,
        title: legacyIdToTitle(id),
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({ project });
  if (shouldSetGuestCookie && guestUserId) {
    response.cookies.set(
      GUEST_USER_COOKIE,
      guestUserId,
      GUEST_USER_COOKIE_OPTIONS
    );
  }
  return response;
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
  const contentValue =
    body.content === undefined
      ? undefined
      : body.content === null
        ? Prisma.JsonNull
        : (body.content as Prisma.InputJsonValue);
  const fallbackTitle = (title && title.length > 0 ? title : legacyIdToTitle(id)).trim();
  let targetId = id;
  let shouldSetGuestCookie = false;
  let guestUserId = "";

  if (!UUID_REGEX.test(id)) {
    const viewer = await getOrCreateViewerIdentity();
    if (!viewer.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    shouldSetGuestCookie = viewer.shouldSetGuestCookie;
    guestUserId = viewer.userId;

    const existing = await prisma.project.findFirst({
      where: {
        userId: viewer.userId,
        title: fallbackTitle,
      },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      targetId = existing.id;
    } else {
      const created = await prisma.project.create({
        data: {
          userId: viewer.userId,
          title: fallbackTitle,
          content: contentValue,
        },
        select: { id: true },
      });
      targetId = created.id;
    }
  }

  let project: {
    id: string;
    title: string;
    content: Prisma.JsonValue | null;
    updatedAt: Date;
  };
  try {
    project = await prisma.project.update({
      where: { id: targetId },
      data: {
        title: title && title.length > 0 ? title : undefined,
        content: contentValue,
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

  const response = NextResponse.json({ project });
  if (shouldSetGuestCookie && guestUserId) {
    response.cookies.set(
      GUEST_USER_COOKIE,
      guestUserId,
      GUEST_USER_COOKIE_OPTIONS
    );
  }
  return response;
}
