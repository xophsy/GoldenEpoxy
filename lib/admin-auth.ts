import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "ge_admin_session";
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

function config() {
  const password = process.env.GE_ADMIN_PASSWORD;
  const secret = process.env.GE_ADMIN_SESSION_SECRET;
  return password && secret ? { password, secret } : null;
}

function sign(expires: string, secret: string, password: string) {
  return createHmac("sha256", secret).update(`${expires}:${password}`).digest("hex");
}

export function adminIsConfigured() {
  return config() !== null;
}

export function validAdminPassword(candidate: string) {
  const settings = config();
  if (!settings) return false;
  const expected = createHmac("sha256", settings.secret).update(settings.password).digest();
  const actual = createHmac("sha256", settings.secret).update(candidate).digest();
  return timingSafeEqual(expected, actual);
}

export function createAdminSession() {
  const settings = config();
  if (!settings) throw new Error("Staff access is not configured");
  const expires = String(Math.floor(Date.now() / 1000) + sessionLifetimeSeconds);
  return { value: `${expires}.${sign(expires, settings.secret, settings.password)}`, maxAge: sessionLifetimeSeconds };
}

export async function hasAdminSession() {
  const settings = config();
  if (!settings) return false;
  const token = (await cookies()).get(adminCookieName)?.value;
  if (!token) return false;
  const [expires, signature, extra] = token.split(".");
  if (extra || !/^\d+$/.test(expires ?? "") || !/^[a-f0-9]{64}$/.test(signature ?? "")) return false;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(expires, settings.secret, settings.password), "hex");
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
