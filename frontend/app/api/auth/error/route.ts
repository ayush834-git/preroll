import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const url = new URL("/auth/login", request.url);

  if (error) {
    url.searchParams.set("error", error);
  }

  return NextResponse.redirect(url);
}
