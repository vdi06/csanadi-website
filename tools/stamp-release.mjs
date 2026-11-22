/** A JSON release az egyetlen forrás: a webmodulok cache-kulcsait ebből írjuk elő.
 * Futtatás kiadás előtt: node tools/stamp-release.mjs
 * Idempotens: ismételt futás nem halmoz kérdőjeles verziókat. */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const { release } = JSON.parse(readFileSync(join(root, "shared/data/site.json"), "utf8"));
if (!/^\d+\.\d+$/.test(release)) throw new Error("Érvénytelen kiadási verzió.");

for (const directory of ["shared/js", "desktop", "mobile"]) {
  const base = join(root, directory);
  for (const name of readdirSync(base).filter((entry) => entry.endsWith(".js"))) {
    const file = join(base, name);
    const before = readFileSync(file, "utf8");
    const after = before.replace(
      /(\bfrom\s+["'])(\.\.?\/[^"'?]+\.js)(?:\?v=\d+\.\d+)?(["'])/g,
      (_all, start, path, end) => `${start}${path}?v=${release}${end}`);
    if (after !== before) writeFileSync(file, after);
  }
}
const indexFile = join(root, "index.html");
const before = readFileSync(indexFile, "utf8");
const after = before
  .replace(/(href="\.\/shared\/css\/base\.css)(?:\?v=\d+\.\d+)?"/,
    (_all, path) => `${path}?v=${release}"`)
  .replace(/(src="\.\/shared\/js\/entry\.js)(?:\?v=\d+\.\d+)?"/,
    (_all, path) => `${path}?v=${release}"`);
if (after !== before) writeFileSync(indexFile, after);
console.log(`Kiadási gyorsítótár-kulcsok: ${release}`);
