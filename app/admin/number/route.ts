import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
const counterKey = "ge:counter";
const baseNumber = 1000;

function redisCredentials() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redis(credentials: { url: string; token: string }, ...parts: string[]) {
  const path = parts.map(encodeURIComponent).join("/");
  const response = await fetch(`${credentials.url}/${path}`, {
    headers: { Authorization: `Bearer ${credentials.token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Counter store returned ${response.status}`);
  const data = await response.json();
  return data.result;
}

async function handleNumber(method: "GET" | "POST") {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const credentials = redisCredentials();
  if (!credentials) return NextResponse.json({ error: "Counter store not configured" }, { status: 501 });

  try {
    await redis(credentials, "setnx", counterKey, String(baseNumber));
    if (method === "POST") {
      const number = Number(await redis(credentials, "incr", counterKey));
      return NextResponse.json({ number }, { headers: { "Cache-Control": "no-store" } });
    }
    const current = Number(await redis(credentials, "get", counterKey));
    return NextResponse.json({ next: current + 1 }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Counter store unavailable" }, { status: 502 });
  }
}

export async function GET() { return handleNumber("GET"); }
export async function POST() { return handleNumber("POST"); }
