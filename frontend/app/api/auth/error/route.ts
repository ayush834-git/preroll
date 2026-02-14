import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error") || "Unknown";
  const url = new URL("/auth/login", request.url);

  url.searchParams.set("error", error);

  return NextResponse.redirect(url);
}
