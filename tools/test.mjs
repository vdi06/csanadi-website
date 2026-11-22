/** Önálló, megismételhető kód- és viselkedésteszt a kapura és egy kezdőlapra. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const staticFiles = [
  "index.html", "js/entry.js", "shared/data/site.json", "shared/js/dom.js",
  "shared/js/gate.js", "shared/css/base.css",
  "shared/assets/media/logo/csanadi-crest-512.webp",
  "mobile/app.js", "mobile/styles.css", "desktop/app.js", "desktop/styles.css",
  "tools/test.mjs", "docs/ELLENORZES.md"
];
const assetPaths = [];
for (let i = 0; i < 9; i++) {
  const number = String(i).padStart(2, "0");
  for (const suffix of ["", "-mobile"]) assetPaths.push(`shared/assets/media/web/gate-frames/gate-${number}${suffix}.webp`);
}
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [relative(root, file).split(sep).join("/")];
  });
}
assert.deepEqual(files(root).sort(), [...staticFiles, ...assetPaths].sort(), "Semmilyen régi funkció nem kerülhet az aktív csomagba.");
const config = JSON.parse(readFileSync(join(root, "shared/data/site.json"), "utf8"));
assert.equal(config.schemaVersion, "2.02");
assert.deepEqual(config.routes, { gate: "#/", home: "#/kezdolap" });
assert.equal(config.gate.frames, 9);
assert.ok(config.gate.desktopDurationMs > 0 && config.gate.mobileDurationMs > 0);
for (const file of assetPaths) {
  const buffer = readFileSync(join(root, file));
  assert.equal(buffer.subarray(0, 4).toString(), "RIFF", file);
  assert.equal(buffer.subarray(8, 12).toString(), "WEBP", file);
  assert.ok(buffer.length > 5000, file);
}
const crest = readFileSync(join(root, "shared/assets/media/logo/csanadi-crest-512.webp"));
assert.equal(createHash("sha256").update(crest).digest("hex"),
  "bf32c83b51a4d7fd6a079a73dc9488e3e70720f26a45f604c1f1bcfc84ec8c16");
const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /<div id="app"><\/div>/);
assert.doesNotMatch(html, /<h[1-6]|<p[ >]|<nav|<article|<img/i);
const src = ["js/entry.js", "shared/js/dom.js", "shared/js/gate.js", "mobile/app.js", "desktop/app.js"]
  .map((path) => readFileSync(join(root, path), "utf8"));
for (const source of src) assert.doesNotMatch(source, /innerHTML|eval\s*\(|carousel|slideshow|fetch\([^)]*pages/i);
assert.match(src[0], /import\(`\.\.\/\$\{platform\}\/app\.js`\)/);
assert.match(src[0], /window\.addEventListener\("hashchange"/);
assert.match(src[0], /breakpoint\.addEventListener\("change"/);
console.log("✓ Kizárólag kapu és kezdőlap: 18 képkocka, 1 címer, adatmentes HTML, külön platformok");

class FakeNode {
  constructor(tag) {
    this.tag = tag; this.children = []; this.attributes = {}; this.className = "";
    this.textContent = ""; this.events = new Map(); this.complete = true; this.naturalWidth = 1600;
    this.dataset = {}; this.parentNode = null;
    this.classList = {
      add: (name) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), name])].join(" "); },
      remove: (name) => { this.className = this.className.split(/\s+/).filter((value) => value !== name).join(" "); }
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...children) { for (const child of children) { if (typeof child === "object") child.parentNode = this; this.children.push(child); } }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  addEventListener(name, callback) { this.events.set(name, callback); }
  emit(name) { this.events.get(name)?.(); }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((node) => node !== this); }
  querySelector(selector) {
    return scan(this).find((node) => selector.startsWith(".")
      ? node.className.split(/\s+/).includes(selector.slice(1)) : node.tag === selector) || null;
  }
  focus() { this.focused = true; }
}
globalThis.document = { createElement: (tag) => new FakeNode(tag),
  createElementNS: (_ns, tag) => new FakeNode(tag) };
globalThis.location = { hash: "#/" };
let reducedMotion = false;
globalThis.window = { matchMedia: () => ({ matches: reducedMotion }) };
const queue = [];
globalThis.requestAnimationFrame = (callback) => { queue.push(callback); return queue.length; };
globalThis.cancelAnimationFrame = () => {};
const scan = (node) => [node, ...node.children.flatMap((item) => typeof item === "object" ? scan(item) : [])];
const mobile = await import(new URL("../mobile/app.js", import.meta.url));
const desktop = await import(new URL("../desktop/app.js", import.meta.url));

for (const [platform, app] of [["mobile", mobile], ["desktop", desktop]]) {
  const parent = new FakeNode("root");
  location.hash = config.routes.gate;
  const dispose = app.mount(parent, config, "gate");
  let nodes = scan(parent);
  assert.equal(nodes.filter((n) => n.tag === "main").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "button").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "img" && n.className.includes("gate-frame")).length, 9);
  assert.equal(nodes.filter((n) => n.tag === "svg").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "ellipse" || n.tag === "rect").length, 0, "A címer mögött nem lehet ovális.");
  const images = nodes.filter((n) => n.tag === "img" && n.className.includes("gate-frame"));
  for (let i = 0; i < 9; i++) {
    const suffix = platform === "mobile" ? "-mobile" : "";
    assert.equal(images[i].attributes.src, `${config.gate.assetDirectory}gate-${String(i).padStart(2, "0")}${suffix}.webp`);
  }
  const button = nodes.find((n) => n.tag === "button");
  assert.equal(button.attributes["aria-label"], config.gate.actionLabel);
  button.emit("click");
  button.emit("click");
  assert.equal(button.disabled, true, "A kapu nyitás közben nem kattintható újra.");
  const duration = platform === "mobile" ? config.gate.mobileDurationMs : config.gate.desktopDurationMs;
  for (const time of [0, duration / 4, duration / 2, duration * .75, duration]) {
    const next = queue.shift();
    assert.ok(next, "A kapuanimáció időzítője nem fut.");
    next(time);
  }
  assert.equal(location.hash, config.routes.home, `${platform}: a kapu nem a kezdőlapra vezet.`);
  assert.ok(images[8].className.includes("is-visible"), `${platform}: a kapu nem a nyitott képnél fejeződik be.`);
  dispose();

  app.mount(parent, config, "home");
  nodes = scan(parent);
  assert.equal(nodes.filter((n) => n.tag === "main").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "h1").length, 1);
  assert.equal(nodes.find((n) => n.tag === "h1").textContent, config.home.title);
  assert.equal(nodes.filter((n) => n.tag === "img").length, 1, "A kezdőlap kizárólag a címert mutatja.");
  assert.equal(nodes.filter((n) => n.tag === "button").length, 0);
  assert.equal(nodes.filter((n) => n.tag === "a").length, 1);
  assert.equal(nodes.find((n) => n.tag === "a").attributes.href, config.routes.gate);
  assert.equal(nodes.filter((n) => n.className?.includes("gate-frame")).length, 0);
  console.log(`✓ ${platform}: kapunyitás, 9 képkocka, kattintásvédelem, kezdőlap és visszaút`);
}

// Külön ellenőrzés: a mozgáscsökkentés azonnal a működő oldalra visz.
reducedMotion = true;
location.hash = config.routes.gate;
const reducedRoot = new FakeNode("root");
const reducedDispose = mobile.mount(reducedRoot, config, "gate");
scan(reducedRoot).find((n) => n.tag === "button").emit("click");
assert.equal(location.hash, config.routes.home);
reducedDispose();
console.log("✓ Mozgáscsökkentés: közvetlen, animációmentes belépés");

const baseCss = readFileSync(join(root, "shared/css/base.css"), "utf8");
const mobileCss = readFileSync(join(root, "mobile/styles.css"), "utf8");
const desktopCss = readFileSync(join(root, "desktop/styles.css"), "utf8");
function block(css, selector) {
  const pos = css.indexOf(`${selector} {`);
  assert.ok(pos >= 0, `CSS-hiba: ${selector}`);
  return css.slice(pos, css.indexOf("}", pos));
}
assert.match(block(baseCss, ".gate-stage"), /width:\s*max\(100vw,\s*177\.77778dvh\);/);
assert.match(block(baseCss, ".gate-stage"), /aspect-ratio:\s*16\s*\/\s*9;/);
assert.match(block(baseCss, ".gate-door-button"), /left:\s*41\.6%;\s*top:\s*33%;\s*width:\s*16\.8%;\s*height:\s*54%;/);
assert.match(block(baseCss, ".gate-glass-crest"), /left:\s*50%;/);
assert.match(block(mobileCss, ".mobile-home-content"), /align-items:\s*center;/);
assert.match(block(mobileCss, ".mobile-home-content"), /gap:\s*19px;/);
assert.match(block(desktopCss, ".desktop-home-content"), /gap:\s*24px;/);
assert.match(block(desktopCss, ".desktop-home-content"), /width:\s*min\(100%,\s*920px\);/);
for (const [width, height] of [[320, 720], [375, 812], [390, 844], [430, 932], [768, 800], [1024, 768], [1440, 900]]) {
  const stageWidth = Math.max(width, height * 16 / 9);
  const left = (stageWidth * .416) - (stageWidth - width) / 2;
  const right = (stageWidth * .584) - (stageWidth - width) / 2;
  assert.ok(left >= 0 && right <= width && right - left >= 44,
    `${width}×${height}: a kattintható kapu kívül kerülne a képernyőn.`);
  assert.ok(Math.abs((left + right) / 2 - width / 2) < 1);
}
console.log("✓ CSS-geometria: a kapu és kattintható területe hét képernyőméretnél középen marad");

// A teljes közös belépési pontot is futtatjuk, nem csupán a két oldal modulját.
const applicationRoot = new FakeNode("root");
const head = new FakeNode("head");
const originalAppend = head.append.bind(head);
head.append = (...children) => {
  originalAppend(...children);
  for (const child of children) Promise.resolve().then(() => child.emit("load"));
};
const documentRoot = { dataset: {}, style: { setProperty: () => {} } };
globalThis.document = {
  createElement: (tag) => new FakeNode(tag),
  createElementNS: (_ns, tag) => new FakeNode(tag),
  getElementById: (id) => id === "app" ? applicationRoot : null,
  querySelectorAll: (selector) => selector === "link[data-platform-style]"
    ? head.children.filter((node) => node.dataset.platformStyle) : [],
  head, documentElement: documentRoot, title: ""
};
const windowEvents = new Map();
let viewportIsMobile = true;
let breakpointChange;
globalThis.window = {
  matchMedia: (query) => query.includes("prefers-reduced-motion")
    ? { matches: true }
    : { get matches() { return viewportIsMobile; }, addEventListener: (_event, callback) => { breakpointChange = callback; } },
  addEventListener: (name, callback) => windowEvents.set(name, callback)
};
globalThis.fetch = async () => ({ ok: true, json: async () => config });
location.hash = config.routes.gate;
await import(new URL("../js/entry.js", import.meta.url));
const nextTick = () => new Promise((done) => setImmediate(done));
await nextTick();
assert.equal(documentRoot.dataset.platform, "mobile");
assert.equal(documentRoot.dataset.route, "gate");
assert.ok(applicationRoot.querySelector(".gate-door-button"));
assert.equal(head.children.length, 1);
applicationRoot.querySelector(".gate-door-button").emit("click");
assert.equal(location.hash, config.routes.home);
windowEvents.get("hashchange")();
await nextTick();
assert.equal(documentRoot.dataset.route, "home");
assert.ok(applicationRoot.querySelector("h1").focused, "A kezdőlapra lépés után fókuszt kell átadni.");
location.hash = config.routes.gate;
windowEvents.get("hashchange")();
await nextTick();
assert.ok(applicationRoot.querySelector(".gate-door-button").focused, "Visszalépés után a kapu fókuszt kap.");
viewportIsMobile = false;
breakpointChange();
await nextTick();
assert.equal(documentRoot.dataset.platform, "desktop");
assert.equal(head.children.length, 1, "Csak az éppen aktív platform CSS-e maradhat.");
assert.equal(scan(applicationRoot).filter((n) => n.className === "mobile-app").length, 0);
assert.equal(scan(applicationRoot).filter((n) => n.className === "desktop-app").length, 1);
console.log("✓ Teljes belépési pont: kapu → kezdőlap → vissza, fókusz és mobil/asztali CSS-csere");

let chromium;
try { ({ chromium } = createRequire(import.meta.url)("playwright")); }
catch { console.warn("⚠ Playwright hiányzik: élő böngészőteszt nem futott."); }
if (chromium) {
  const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp" };
  const server = createServer((request, response) => {
    const target = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = resolve(root, `.${target === "/" ? "/index.html" : target}`);
    if (!file.startsWith(`${root}${sep}`) || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end(); return;
    }
    response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
    response.end(readFileSync(file));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  let browser;
  try {
    try {
      browser = await chromium.launch({ executablePath: process.env.CHROMIUM_BIN || "/usr/bin/chromium",
        headless: true, args: ["--no-sandbox"] });
    } catch (error) {
      if (!/Operation not permitted|socket\(\) failed/.test(String(error))) throw error;
      console.warn("⚠ A környezet blokkolta a Chromiumot; valódi képernyőteszt nem futott.");
    }
    if (browser) {
      const url = `http://127.0.0.1:${server.address().port}/index.html`;
      for (const width of [320, 390, 768, 1024, 1440]) {
        const page = await browser.newPage({ viewport: { width, height: 844 } });
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForSelector(".gate-door-button");
        assert.equal(await page.locator(".gate-frame").count(), 9);
        const before = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(before <= 1, `${width}px: vízszintes túllógás`);
        await page.locator(".gate-door-button").click();
        await page.waitForURL(/#\/kezdolap$/, { timeout: 7000 });
        assert.equal(await page.locator(".home-return").count(), 1);
        await page.locator(".home-return").click();
        await page.waitForSelector(".gate-door-button");
        await page.close();
        console.log(`✓ ${width}px: élő kapunyitás, átmenet és visszalépés`);
      }
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((done) => server.close(done));
  }
}
console.log("\nA kód- és viselkedéstesztek sikeresek; a böngészőteszt állapota fent látható.");
