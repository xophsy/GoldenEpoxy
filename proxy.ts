import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/Tools") {
    return NextResponse.redirect(new URL("/tools", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/Tools", "/tools"] };
