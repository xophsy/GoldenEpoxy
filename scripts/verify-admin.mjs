import assert from "node:assert/strict";

const origin = process.env.ADMIN_TEST_ORIGIN ?? "http://localhost:3017";
const request = (path, init) => fetch(new URL(path, origin), { redirect: "manual", ...init });

const anonymousTools = await request("/Tools");
assert.equal(anonymousTools.status, 307);
assert.equal(new URL(anonymousTools.headers.get("location"), origin).pathname, "/tools");

const anonymousMenu = await request("/tools");
assert.equal(anonymousMenu.status, 307);
assert.equal(new URL(anonymousMenu.headers.get("location"), origin).pathname, "/admin");

const anonymousBuilder = await request("/tools/estimate-builder");
assert.equal(anonymousBuilder.status, 307);
assert.equal(new URL(anonymousBuilder.headers.get("location"), origin).pathname, "/admin");

const anonymousCounter = await request("/admin/number");
assert.equal(anonymousCounter.status, 401);

const invalid = await request("/admin/login", { method: "POST", body: new URLSearchParams({ password: "wrong-password" }) });
assert.equal(invalid.status, 303);
assert.equal(new URL(invalid.headers.get("location")).searchParams.get("error"), "invalid");

const login = await request("/admin/login", { method: "POST", body: new URLSearchParams({ password: process.env.GE_ADMIN_PASSWORD }) });
assert.equal(login.status, 303);
assert.equal(new URL(login.headers.get("location")).pathname, "/tools");
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie);

const menu = await request("/tools", { headers: { cookie } });
assert.equal(menu.status, 200);
assert.match(await menu.text(), /href="\/tools\/estimate-builder"/);

const builder = await request("/tools/estimate-builder", { headers: { cookie } });
assert.equal(builder.status, 200);
assert.match(await builder.text(), /Golden Epoxy · Builder/);
assert.match(builder.headers.get("x-robots-tag"), /noindex/);

const counter = await request("/admin/number", { headers: { cookie } });
assert.ok([200, 501].includes(counter.status));

const logout = await request("/admin/logout", { method: "POST", headers: { cookie } });
assert.equal(logout.status, 303);
assert.equal(new URL(logout.headers.get("location")).pathname, "/admin");

console.log("Admin access, tools menu, nested builder, counter guard, and logout checks passed.");
