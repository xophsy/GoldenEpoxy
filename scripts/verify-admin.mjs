import assert from "node:assert/strict";

const origin = process.env.ADMIN_TEST_ORIGIN ?? "http://localhost:3017";
const request = (path, init) => fetch(new URL(path, origin), { redirect: "manual", ...init });

const anonymousTools = await request("/Tools");
assert.equal(anonymousTools.status, 307);
assert.equal(new URL(anonymousTools.headers.get("location")).pathname, "/admin");

const anonymousCounter = await request("/admin/number");
assert.equal(anonymousCounter.status, 401);

const invalid = await request("/admin/login", { method: "POST", body: new URLSearchParams({ password: "wrong-password" }) });
assert.equal(invalid.status, 303);
assert.equal(new URL(invalid.headers.get("location")).searchParams.get("error"), "invalid");

const login = await request("/admin/login", { method: "POST", body: new URLSearchParams({ password: process.env.GE_ADMIN_PASSWORD }) });
assert.equal(login.status, 303);
assert.equal(new URL(login.headers.get("location")).pathname, "/Tools");
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie);

const tools = await request("/Tools", { headers: { cookie } });
assert.equal(tools.status, 200);
assert.match(await tools.text(), /Golden Epoxy · Builder/);
assert.match(tools.headers.get("x-robots-tag"), /noindex/);

const counter = await request("/admin/number", { headers: { cookie } });
assert.ok([200, 501].includes(counter.status));

const logout = await request("/admin/logout", { method: "POST", headers: { cookie } });
assert.equal(logout.status, 303);
assert.equal(new URL(logout.headers.get("location")).pathname, "/admin");

console.log("Admin access, password, builder, counter guard, and logout checks passed.");
