import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GUEST_EMAIL_DOMAIN = "guest.preroll.local";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const GUEST_USER_COOKIE = "preroll_guest_user_id";
export const GUEST_USER_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export type ViewerIdentity = {
  userId: string | null;
  email: string;
  isAuthenticated: boolean;
  shouldSetGuestCookie: boolean;
};

function isUuid(value: string | undefined) {
  return Boolean(value && UUID_REGEX.test(value));
}

async function getSessionIdentity(): Promise<ViewerIdentity | null> {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return null;
    }

    return {
      userId,
      email: session?.user?.email ?? "",
      isAuthenticated: true,
      shouldSetGuestCookie: false,
    };
  } catch {
    return null;
  }
}

export async function getViewerIdentity(): Promise<ViewerIdentity> {
  const sessionIdentity = await getSessionIdentity();
  if (sessionIdentity) {
    return sessionIdentity;
  }

  const cookieStore = await cookies();
  const guestUserId = cookieStore.get(GUEST_USER_COOKIE)?.value;

  if (isUuid(guestUserId)) {
    const guestUser = await prisma.user.findUnique({
      where: { id: guestUserId },
      select: { id: true },
    });

    if (guestUser) {
      return {
        userId: guestUser.id,
        email: "",
        isAuthenticated: false,
        shouldSetGuestCookie: false,
      };
    }
  }

  return {
    userId: null,
    email: "",
    isAuthenticated: false,
    shouldSetGuestCookie: false,
  };
}

export async function getOrCreateViewerIdentity(): Promise<ViewerIdentity> {
  const viewer = await getViewerIdentity();
  if (viewer.userId) {
    return viewer;
  }

  const guestUser = await prisma.user.create({
    data: {
      email: `guest-${crypto.randomUUID()}@${GUEST_EMAIL_DOMAIN}`,
    },
    select: {
      id: true,
    },
  });

  return {
    userId: guestUser.id,
    email: "",
    isAuthenticated: false,
    shouldSetGuestCookie: true,
  };
}
