import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.delete(adminCookieName);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
