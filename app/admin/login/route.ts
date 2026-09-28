import { NextResponse, type NextRequest } from "next/server";
import { adminCookieName, createAdminSession, validAdminPassword } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = form.get("password");
  if (typeof password !== "string" || !validAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), 303);
  }

  const session = createAdminSession();
  const response = NextResponse.redirect(new URL("/tools", request.url), 303);
  response.cookies.set(adminCookieName, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
