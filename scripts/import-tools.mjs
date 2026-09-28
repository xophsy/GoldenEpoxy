import { readFile, mkdir, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(process.env.GOLDEN_EPOXY_TOOLS_SOURCE ?? path.join(root, "../golden-epoxy-tools"));
let html = await readFile(path.join(source, "index.html"), "utf8");

const replacements = [
  ['src="golden_epoxy_logo_transparent.png"', 'src="/tools-logo.png"'],
  ["fetch('/api/number'", "fetch('/admin/number'"],
  ['<span class="brand">Golden Epoxy · Builder</span>', '<span class="brand">Golden Epoxy · Builder</span><a href="/tools" class="no-print" style="color:#fff;text-decoration:none;padding:8px 12px;border:1px solid #444851;border-radius:8px">All tools</a><form action="/admin/logout" method="post" class="no-print"><button type="submit" aria-label="Sign out of staff tools">Sign out</button></form>'],
];

for (const [before, after] of replacements) {
  if (!html.includes(before)) throw new Error(`Source tool changed; could not find: ${before}`);
  html = html.replace(before, after);
}

await mkdir(path.join(root, "private"), { recursive: true });
await writeFile(path.join(root, "private", "tools.html"), html);
await copyFile(path.join(source, "golden_epoxy_logo_transparent.png"), path.join(root, "public", "tools-logo.png"));
console.log("Imported the staff builder into private/tools.html");
