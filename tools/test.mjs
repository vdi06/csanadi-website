/**
 * Első mérföldkő tesztje: forrásfájlok, JSON, elrendezési geometria és navigáció.
 * Futtatás: node tools/test.mjs
 * A böngészős részhez Playwright és Chromium szükséges.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const expectFiles = [
  "index.html", "js/entry.js", "shared/data/site.json", "shared/js/dom.js",
  "shared/css/base.css", "shared/assets/media/logo/csanadi-crest-512.webp",
  "mobile/app.js", "mobile/styles.css", "desktop/app.js", "desktop/styles.css",
  "tools/test.mjs", "docs/ELLENORZES.md"
];

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [relative(root, path).split(sep).join("/")];
  });
}

const actualFiles = files(root).sort();
assert.deepEqual(actualFiles, [...expectFiles].sort(), "Csak a 2.00 minimális fájlkészlete lehet jelen.");
const config = JSON.parse(readFileSync(join(root, "shared/data/site.json"), "utf8"));
assert.equal(config.schemaVersion, "2.00");
assert.equal(Object.hasOwn(config, "review"), false, "A beszélgetés választója nem része a honlapnak.");
const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /<div id="app"><\/div>/);
assert.doesNotMatch(html, /<h[1-6]|<p[ >]|<nav|<article|<img/i, "A HTML nem tartalmazhat szerkesztett tartalmat.");

const mediaPath = join(root, "shared/assets/media/logo/csanadi-crest-512.webp");
const media = readFileSync(mediaPath);
assert.equal(media.subarray(0, 4).toString(), "RIFF");
assert.equal(media.subarray(8, 12).toString(), "WEBP");
assert.equal(createHash("sha256").update(media).digest("hex"),
  "bf32c83b51a4d7fd6a079a73dc9488e3e70720f26a45f604c1f1bcfc84ec8c16");
assert.equal(config.site.crest, "./shared/assets/media/logo/csanadi-crest-512.webp");

const mobileJs = readFileSync(join(root, "mobile/app.js"), "utf8");
const desktopJs = readFileSync(join(root, "desktop/app.js"), "utf8");
const entryJs = readFileSync(join(root, "js/entry.js"), "utf8");
const mobileCss = readFileSync(join(root, "mobile/styles.css"), "utf8");
const desktopCss = readFileSync(join(root, "desktop/styles.css"), "utf8");
for (const source of [mobileJs, desktopJs, entryJs]) {
  assert.doesNotMatch(source, /innerHTML|eval\s*\(|localStorage|import\s+[^;]+old/i);
}
assert.doesNotMatch(mobileJs + mobileCss, /desktop-|slideshow|carousel|slideIndex/i);
assert.doesNotMatch(desktopJs + desktopCss, /mobile-|slideshow|carousel|slideIndex/i);
assert.match(entryJs, /import\(`\.\.\/\$\{platform\}\/app\.js`\)/);
assert.match(entryJs, /breakpoint\.addEventListener\("change"/);
assert.doesNotMatch(entryJs, /review|preview|valaszto/i);
assert.match(desktopJs, /footer\(config, "desktop-footer"\)/);
console.log("✓ Minimális fájlkészlet, biztonságos JSON, címer SHA-256 és tiszta forráskód");

// A két DOM-építő önálló tesztje valódi böngésző nélkül is lefut.
class TestNode {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.className = ""; this.textContent = ""; }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
}
globalThis.document = { createElement: (tag) => new TestNode(tag) };
const mobileApp = await import(new URL("../mobile/app.js", import.meta.url));
const desktopApp = await import(new URL("../desktop/app.js", import.meta.url));
function all(rootNode) {
  return [rootNode, ...rootNode.children.flatMap((child) => typeof child === "object" ? all(child) : [])];
}
const mobileRoot = new TestNode("root");
const desktopRoot = new TestNode("root");
mobileApp.mount(mobileRoot, config);
desktopApp.mount(desktopRoot, config);
const mobileTree = all(mobileRoot);
const desktopTree = all(desktopRoot);
for (const tree of [mobileTree, desktopTree]) {
  for (const tag of ["header", "main", "footer", "h1", "img"]) {
    assert.equal(tree.filter((node) => node.tag === tag).length, 1, `Pontosan egy ${tag} szükséges.`);
  }
  assert.equal(tree.find((node) => node.tag === "img").attributes.src, config.site.crest);
  assert.equal(tree.find((node) => node.tag === "img").attributes.alt, config.site.crestAlt);
  assert.equal(tree.find((node) => node.tag === "footer").children[1].attributes.href, "#app");
  assert.equal(tree.filter((node) => node.tag === "script" || node.tag === "iframe").length, 0);
}
assert.equal(mobileTree.some((node) => node.className === "golden-gate"), false);
assert.equal(desktopTree.some((node) => node.className === "golden-gate"), true);
assert.equal(mobileTree.find((node) => node.tag === "h1").textContent, config.mobile.title);
assert.equal(desktopTree.find((node) => node.tag === "h1").textContent, config.desktop.title);
assert.equal(mobileTree.find((node) => node.className === "mobile-home-link").attributes.href, "./index.html");
assert.equal(desktopTree.filter((node) => node.className === "mobile-home-link").length, 0);
console.log("✓ Valódi modulokból felépített két külön DOM-fa, működő hivatkozási célok");

const block = (css, selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Hiányzó CSS: ${selector}`);
  return css.slice(start, css.indexOf("}", start));
};
assert.match(block(mobileCss, ".mobile-welcome"), /align-items:\s*center;/);
assert.match(block(mobileCss, ".mobile-welcome"), /text-align:\s*center;/);
assert.match(block(mobileCss, ".mobile-welcome"), /gap:\s*18px;/);
assert.match(block(mobileCss, ".mobile-main"), /max-width:\s*600px;/);
assert.match(block(mobileCss, ".mobile-crest"), /margin-inline:\s*auto;/);
assert.match(block(desktopCss, ".desktop-page"), /grid-template-rows:\s*auto\s+1fr\s+auto;/);
assert.match(block(desktopCss, ".gate-content"), /gap:\s*20px;/);
assert.match(block(desktopCss, ".desktop-welcome"), /text-align:\s*center;/);
assert.match(block(desktopCss, ".golden-gate"), /border:\s*3px\s+solid\s+var\(--accent\);/);
console.log("✓ A középre igazítás, térközök és arany keret külön CSS-szabályokkal rendelkeznek");

let chromium;
try {
  const require = createRequire(import.meta.url);
  ({ chromium } = require("playwright"));
} catch {
  console.log("⚠ Playwright nincs telepítve: böngészős elrendezésteszt nem futott.");
}

if (chromium) {
  const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp" };
  const server = createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!(file === root || file.startsWith(`${root}${sep}`)) || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": mime[extname(file)] || "application/octet-stream" });
    response.end(readFileSync(file));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const port = server.address().port;
  let browser;
  try {
    try {
      browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_BIN || "/usr/bin/chromium", args: ["--no-sandbox"] });
    } catch (error) {
      if (!/Operation not permitted|socket\(\) failed/.test(String(error))) throw error;
      console.warn("⚠ A környezet blokkolta a Chromium indítását: geometriai böngészőteszt nem futott.");
    }
    if (browser) {
    const errors = [];
    for (const width of [320, 375, 390, 430, 767, 768, 800, 1024, 1280, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 800 }, deviceScaleFactor: 1 });
      page.on("pageerror", (error) => errors.push(`${width}px: ${error.message}`));
      page.on("response", (response) => {
        if (response.status() >= 400) errors.push(`${width}px: HTTP ${response.status()} ${response.url()}`);
      });
      await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
      const expectedPlatform = width <= 767 ? "mobile" : "desktop";
      await page.waitForFunction((platform) => document.documentElement.dataset.platform === platform,
        expectedPlatform);
      const dimensions = await page.evaluate(() => {
        const platform = document.documentElement.dataset.platform;
        const header = document.querySelector("header");
        const main = document.querySelector("main");
        const footer = document.querySelector("footer");
        const crest = document.querySelector("img.crest");
        const rect = (element) => {
          const { x, y, width, height, bottom } = element.getBoundingClientRect();
          return { x, y, width, height, bottom };
        };
        return {
          platform,
          header: rect(header), main: rect(main), footer: rect(footer), crest: rect(crest),
          title: document.querySelector("h1").textContent,
          bodyWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          assetLoaded: crest.complete && crest.naturalWidth > 0,
          crestBackground: getComputedStyle(crest).backgroundColor,
          linkCount: document.querySelectorAll("link[data-platform-style]").length,
          largeImages: document.querySelectorAll("main img:not(.crest)").length,
          inactivePlatformCount: document.querySelectorAll(platform === "mobile" ? ".desktop-page" : ".mobile-page").length,
          gateCount: document.querySelectorAll(".golden-gate").length,
          navigationCount: document.querySelectorAll("nav, .carousel, .slideshow").length,
          homeLink: document.querySelector(".mobile-home-link")?.getAttribute("href"),
          topLink: footer.querySelector("a")?.getAttribute("href")
        };
      });
      assert.equal(dimensions.platform, expectedPlatform);
      assert.ok(dimensions.assetLoaded, `${width}px: a címer nem töltődött be`);
      assert.equal(dimensions.crestBackground, "rgba(0, 0, 0, 0)", `${width}px: a címer mögött nincs háttéralakzat`);
      assert.equal(dimensions.linkCount, 1, `${width}px: pontosan egy felületspecifikus CSS`);
      assert.equal(dimensions.largeImages, 0, `${width}px: nincs nagy nyitókép`);
      assert.equal(dimensions.inactivePlatformCount, 0, `${width}px: nem keveredhetnek a felületek`);
      assert.equal(dimensions.navigationCount, 0, `${width}px: régi navigáció nem jelenhet meg`);
      assert.ok(dimensions.bodyWidth <= width + 1, `${width}px: vízszintes túllógás: ${dimensions.bodyWidth}`);
      assert.ok(dimensions.header.bottom <= dimensions.main.y + 1, `${width}px: a felső sáv a tartalomra csúszik`);
      assert.ok(dimensions.main.bottom <= dimensions.footer.y + 1, `${width}px: az alsó sáv a tartalomra csúszik`);
      assert.ok(Math.abs(dimensions.crest.x + dimensions.crest.width / 2 - width / 2) < 2,
        `${width}px: a címer nem középen van`);
      assert.equal(dimensions.topLink, "#app", `${width}px: a tetejére mutató link működő célpont`);
      if (expectedPlatform === "mobile") {
        assert.equal(dimensions.homeLink, "./index.html");
        assert.equal(dimensions.gateCount, 0, `${width}px: mobilon nincs asztali kapu`);
        assert.equal(dimensions.title, config.mobile.title);
      } else {
        assert.equal(dimensions.homeLink, undefined);
        assert.equal(dimensions.gateCount, 1);
        assert.equal(dimensions.title, config.desktop.title);
      }
      if (width === 390) {
        await page.locator(".mobile-home-link").click();
        await page.waitForURL(/\/index\.html$/);
        assert.equal(await page.locator(".mobile-page").count(), 1);
      }
      await page.close();
      console.log(`✓ ${width}px: ${expectedPlatform} – méretek, hézagok, címer, linkek és fájlizoláció`);
    }

    const page = await browser.newPage({ viewport: { width: 390, height: 800 } });
    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForFunction(() => document.documentElement.dataset.platform === "desktop");
    assert.equal(await page.locator(".mobile-page").count(), 0);
    assert.equal(await page.locator(".desktop-page").count(), 1);
    assert.equal(await page.locator('link[data-platform-style="mobile"]').count(), 0);
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForFunction(() => document.documentElement.dataset.platform === "mobile");
    assert.equal(await page.locator(".desktop-page").count(), 0);
    assert.equal(await page.locator('link[data-platform-style="desktop"]').count(), 0);
    await page.close();
    assert.deepEqual(errors, [], "Nem lehet böngészős vagy hálózati hiba.");
    console.log("✓ Dinamikus mobil ↔ asztali váltás: régi DOM és CSS eltávolítva");
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((done) => server.close(done));
  }
  console.log("\nFORRÁS- ÉS DOM-TESZTEK SIKERESEK. A böngészős tesztek állapota fent látható.");
}
