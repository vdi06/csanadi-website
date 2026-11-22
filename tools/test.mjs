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
  "index.html", "shared/js/entry.js", "shared/data/site.json", "shared/js/dom.js",
  "shared/js/gate.js", "shared/js/shell.js", "shared/js/appearance.js", "shared/css/base.css",
  "shared/assets/media/logo/csanadi-crest-512.webp",
  "mobile/app.js", "mobile/header.js", "mobile/styles.css",
  "desktop/app.js", "desktop/header.js", "desktop/styles.css",
  "tools/test.mjs", "docs/ELLENORZES.md"
];
const assetPaths = [];
for (let i = 0; i < 30; i++) {
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
assert.deepEqual(files(root).filter((path) => path.endsWith(".html")), ["index.html"]);
const config = JSON.parse(readFileSync(join(root, "shared/data/site.json"), "utf8"));
assert.equal(config.schemaVersion, "2.06");
assert.equal(config.release, "2.09");
assert.equal(config.appearance.defaultMode, "auto");
assert.deepEqual(config.appearance.cycle, ["auto", "light", "dark"]);
assert.deepEqual(Object.keys(config.appearance.shortLabels).sort(), ["auto", "dark", "light"]);
assert.equal(config.appearance.glyphs.auto, "⚙");
assert.equal(config.gate.skipSymbol, "⏭");
assert.ok(!Object.hasOwn(config.gate, "desktopHint") && !Object.hasOwn(config.gate, "mobileHint"));
assert.deepEqual(config.routes, { gate: "#/", home: "#/kezdolap" });
assert.equal(config.gate.frames, 30);
assert.equal(config.gate.desktopDurationMs, 2250);
assert.equal(config.gate.mobileDurationMs, 1750);
assert.ok(config.gate.finishFadeMs > 0 && config.gate.homeRevealMs > 0);
assert.equal(config.gate.finishBlurPx, 18);
assert.equal(config.home.header.social.length, 3);
assert.equal(config.home.navigation.length, 2);
assert.ok(config.home.footer.email.includes("@"));
const frameHashes = new Set();
for (const file of assetPaths) {
  const buffer = readFileSync(join(root, file));
  assert.equal(buffer.subarray(0, 4).toString(), "RIFF", file);
  assert.equal(buffer.subarray(8, 12).toString(), "WEBP", file);
  assert.ok(buffer.length > 5000, file);
  const fingerprint = createHash("sha256").update(buffer).digest("hex");
  assert.ok(!frameHashes.has(fingerprint), `Két egyforma kép lenne a 30 fázis között: ${file}`);
  frameHashes.add(fingerprint);
}
const crest = readFileSync(join(root, "shared/assets/media/logo/csanadi-crest-512.webp"));
assert.equal(createHash("sha256").update(crest).digest("hex"),
  "bf32c83b51a4d7fd6a079a73dc9488e3e70720f26a45f604c1f1bcfc84ec8c16");
const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /<div id="app"><\/div>/);
assert.match(html, /src="\.\/shared\/js\/entry\.js"/);
assert.match(html, /name="color-scheme" content="light dark"/);
assert.doesNotMatch(html, /<h[1-6]|<p[ >]|<nav|<article|<img/i);
const src = ["shared/js/entry.js", "shared/js/dom.js", "shared/js/gate.js", "shared/js/shell.js",
  "shared/js/appearance.js", "mobile/app.js", "mobile/header.js", "desktop/app.js", "desktop/header.js"]
  .map((path) => readFileSync(join(root, path), "utf8"));
for (const source of src) assert.doesNotMatch(source, /innerHTML|eval\s*\(|carousel|slideshow|fetch\([^)]*pages/i);
assert.match(src[0], /import\(`\.\.\/\.\.\/\$\{platform\}\/app\.js`\)/);
assert.match(src[0], /window\.addEventListener\("hashchange"/);
assert.match(src[0], /breakpoint\.addEventListener\("change"/);
assert.doesNotMatch(src[3], /makeHeaderTools|createElement\("header"|element\("header"/);
assert.match(src[6], /makeMobileHeader/);
assert.match(src[8], /makeDesktopHeader/);
assert.doesNotMatch(src[6], /desktop\/|makeDesktopHeader/);
assert.doesNotMatch(src[8], /mobile\/|makeMobileHeader/);
console.log("✓ 30+30 eltérő kapukép, adatmentes HTML, csak fejléc és lábléc a főoldalon");

let failDesktopFrame = false;
let failMobileFrame = false;
let systemDark = true;
const systemListeners = new Set();
const preferenceMemory = new Map();
globalThis.localStorage = {
  getItem: (key) => preferenceMemory.get(key) ?? null,
  setItem: (key, value) => preferenceMemory.set(key, String(value))
};
class FakeNode {
  constructor(tag) {
    this.tag = tag; this.children = []; this.attributes = {}; this.className = "";
    this.textContent = ""; this.events = new Map(); this.complete = true; this.naturalWidth = 1600;
    this.tagName = tag.toUpperCase();
    this.dataset = {}; this.parentNode = null;
    this.style = { setProperty: (key, value) => { this.style[key] = value; } };
    this.classList = {
      add: (name) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), name])].join(" "); },
      remove: (name) => { this.className = this.className.split(/\s+/).filter((value) => value !== name).join(" "); }
    };
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "src") this.src = String(value);
  }
  decode() {
    if (this.tag === "img" && ((failDesktopFrame && this.src?.endsWith("gate-12.webp")) ||
      (failMobileFrame && this.src?.endsWith("gate-14-mobile.webp")))) {
      return Promise.reject(new Error("Tesztelt hiányzó képkocka"));
    }
    return Promise.resolve();
  }
  append(...children) { for (const child of children) { if (typeof child === "object") child.parentNode = this; this.children.push(child); } }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  addEventListener(name, callback) { this.events.set(name, callback); }
  removeEventListener(name, callback) { if (this.events.get(name) === callback) this.events.delete(name); }
  emit(name, event) { this.events.get(name)?.(event); }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((node) => node !== this); }
  querySelector(selector) {
    return scan(this).find((node) => selector.startsWith(".")
      ? node.className.split(/\s+/).includes(selector.slice(1)) : node.tag === selector) || null;
  }
  focus() { this.focused = true; document.activeElement = this; }
}
globalThis.document = { createElement: (tag) => new FakeNode(tag),
  createElementNS: (_ns, tag) => new FakeNode(tag) };
globalThis.location = { hash: "#/" };
let reducedMotion = false;
globalThis.window = { matchMedia: (query) => query.includes("prefers-color-scheme")
  ? { get matches() { return systemDark; },
    addEventListener: (_event, callback) => systemListeners.add(callback),
    removeEventListener: (_event, callback) => systemListeners.delete(callback) }
  : { matches: reducedMotion } };
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
  assert.equal(nodes.filter((n) => n.tag === "button").length, 2);
  assert.equal(nodes.filter((n) => n.tag === "p").length, 0, "A kapun nem lehet új magyarázó szöveg.");
  assert.equal(nodes.find((n) => n.tag === "h1").textContent, config.site.gateCaption);
  assert.equal(nodes.filter((n) => n.tag === "img" && n.className.includes("gate-frame")).length, 30);
  assert.equal(nodes.filter((n) => n.tag === "svg").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "ellipse" || n.tag === "rect").length, 0, "A címer mögött nem lehet ovális.");
  const images = nodes.filter((n) => n.tag === "img" && n.className.includes("gate-frame"));
  for (let i = 0; i < 30; i++) {
    const suffix = platform === "mobile" ? "-mobile" : "";
    assert.equal(images[i].attributes.src, `${config.gate.assetDirectory}gate-${String(i).padStart(2, "0")}${suffix}.webp`);
  }
  const button = nodes.find((n) => n.className === "gate-door-button");
  assert.equal(button.attributes["aria-label"], config.gate.actionLabel);
  assert.equal(nodes.find((n) => n.className === "gate-skip").textContent, "⏭");
  button.emit("click");
  button.emit("click");
  assert.equal(button.disabled, true, "A kapu nyitás közben nem kattintható újra.");
  assert.equal(queue.length, 0, "A kapu nem indulhat a képek előzetes dekódolása előtt.");
  await new Promise((done) => setImmediate(done));
  const duration = platform === "mobile" ? config.gate.mobileDurationMs : config.gate.desktopDurationMs;
  for (const time of [0, duration / 4, duration / 2, duration * .75, duration]) {
    const next = queue.shift();
    assert.ok(next, "A kapuanimáció időzítője nem fut.");
    next(time);
    if (time === duration / 2) {
      assert.equal(images[14].style.opacity, "1", `${platform}: a két kép nem fed át folyamatosan.`);
      assert.ok(Number(images[15].style.opacity) > .49 && Number(images[15].style.opacity) < .51,
        `${platform}: nem részleges az áttűnés a szomszédos képek között.`);
      assert.equal(images[13].style.opacity, "0", "A korábbi képnek ki kell kapcsolnia a kompozitálásból.");
    }
  }
  assert.equal(location.hash, config.routes.gate, "A záróképet nem szabad azonnal lecserélni.");
  assert.ok(scan(parent).some((n) => n.className.includes("is-finishing")));
  assert.equal(images[29].style.opacity, "1", `${platform}: az utolsó, teljesen nyitott képkocka hiányzik.`);
  await new Promise((done) => setTimeout(done, config.gate.finishFadeMs + 15));
  assert.equal(location.hash, config.routes.home, `${platform}: a kapu nem a kezdőlapra vezet.`);
  dispose();

  location.hash = config.routes.gate;
  const skipDispose = app.mount(parent, config, "gate");
  scan(parent).find((n) => n.className === "gate-skip").emit("click");
  assert.equal(location.hash, config.routes.home, `${platform}: a régi kihagyásgomb nem működik.`);
  skipDispose();

  const homeDispose = app.mount(parent, config, "home");
  nodes = scan(parent);
  assert.equal(nodes.filter((n) => n.tag === "header").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "main").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "footer").length, 1);
  assert.equal(nodes.find((n) => n.tag === "main").children.length, 0, "Még egyetlen középső blokk sem engedélyezett.");
  assert.equal(nodes.filter((n) => n.tag === "h1").length, 0);
  assert.equal(nodes.filter((n) => n.tag === "img").length, 1, "Csak a fejléc címerképe engedélyezett.");
  assert.equal(nodes.filter((n) => n.tag === "button").length, platform === "mobile" ? 5 : 3);
  assert.equal(nodes.filter((n) => n.className?.includes(`${platform}-social`)).length, 3);
  assert.equal(nodes.filter((n) => n.tag === "svg").length, 2, "A két közösségi ikon nem függhet betűkészlettől.");
  assert.equal(nodes.filter((n) => n.tag === "path").length, 1, "A Facebook jelének SVG-ként kell megjelennie.");
  assert.equal(nodes.filter((n) => n.className === "home-brand" || n.className?.includes("home-brand ")).length, 1);
  const footer = nodes.find((n) => n.tag === "footer");
  assert.equal(scan(footer).filter((n) => n.tag === "a").length,
    platform === "mobile" ? 3 : 1,
    "Asztalon nem lehetnek ideiglenes főoldal-/kapu-linkek a láblécben.");
  assert.ok(scan(footer).some((n) => n.textContent === config.home.footer.address));
  const informationColumn = scan(footer).find((n) => n.className === "footer-links");
  const versionRow = informationColumn.children.at(-1);
  assert.equal(versionRow.className, "footer-version", "A verziószámnak a Tájékoztatás oszlop legalsó sorában kell állnia.");
  assert.equal(versionRow.textContent, `${config.home.footer.versionLabel}: ${config.release}`,
    "A lábléc verziószáma kizárólag a JSON release mezőjéből származhat.");
  const searchToggle = nodes.find((n) => n.className.includes("search-toggle"));
  const themeToggle = nodes.find((n) => n.className.includes("theme-toggle"));
  const homeNode = nodes.find((n) => n.className === `${platform}-home`);
  const checkThemeButton = (mode) => {
    assert.equal(themeToggle.dataset.themeMode, mode, "A témagomb külön állapotjelzést igényel.");
    assert.equal(themeToggle.children.length, 2, "A mód ikonja és jelölése is látható legyen.");
    assert.equal(themeToggle.children[0].className, "theme-mode-icon");
    assert.equal(themeToggle.children[0].textContent, config.appearance.glyphs[mode]);
    assert.equal(themeToggle.children[1].className, "theme-mode-mark");
    assert.equal(themeToggle.children[1].textContent, config.appearance.shortLabels[mode]);
    assert.equal(themeToggle.attributes["aria-label"],
      `${config.home.header.themeLabel}: ${config.appearance.labels[mode]}`);
  };
  assert.equal(homeNode.dataset.themePreference, "auto", "Alapértelmezésben automatikus téma kell.");
  assert.equal(homeNode.dataset.theme, "dark", "A rendszer sötét módját követnie kell.");
  assert.equal(homeNode.style["color-scheme"], "dark", "A beviteli elemek színmódja is a témát kövesse.");
  checkThemeButton("auto");

  if (platform === "mobile") {
    const crestToggle = nodes.find((n) => n.className.includes("mobile-crest-toggle"));
    const menuOverlay = nodes.find((n) => n.className === "mobile-menu-overlay");
    const menuDialog = nodes.find((n) => n.className === "mobile-menu-dialog");
    assert.ok(menuOverlay && menuDialog);
    assert.equal(menuOverlay.hidden, true);
    assert.equal(nodes.filter((n) => n.className === "desktop-primary-nav").length, 0);
    crestToggle.emit("click");
    assert.equal(menuOverlay.hidden, false);
    assert.equal(crestToggle.attributes["aria-expanded"], "true");
    assert.deepEqual(scan(menuDialog).filter((n) => n.className === "mobile-menu-link").map((n) => n.attributes.href),
      config.home.navigation.map((item) => item.href));
    menuDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
    assert.equal(menuOverlay.hidden, true);
    assert.ok(crestToggle.focused);
  } else {
    assert.equal(nodes.filter((n) => n.className === "desktop-primary-nav").length, 0,
      "Nem jelenhet meg a két tesztnavigációs gomb az asztali fejlécben.");
    assert.equal(nodes.filter((n) => n.className === "desktop-primary-link").length, 0);
    assert.equal(nodes.filter((n) => n.tag === "a" && n.attributes.href === config.routes.gate).length, 0,
      "Asztalon sehol nem szerepelhet Vissza a kapuhoz hivatkozás.");
    assert.equal(nodes.filter((n) => n.className === "mobile-menu-overlay").length, 0);
    assert.equal(nodes.filter((n) => n.className === "desktop-crest-home shell-crest-toggle").length, 1);
  }

  const searchOverlay = nodes.find((n) => n.className === `${platform}-search-overlay`);
  const searchDialog = nodes.find((n) => n.className === `${platform}-search-dialog`);
  assert.ok(searchOverlay && searchDialog);
  assert.equal(searchOverlay.hidden, true);
  assert.equal(searchDialog.attributes["aria-modal"], "true");
  searchToggle.emit("click");
  assert.equal(searchOverlay.hidden, false);
  const searchInput = searchDialog.querySelector("input");
  assert.ok(searchInput.focused);
  searchInput.value = "kapu";
  searchInput.emit("input");
  const resultList = nodes.find((n) => n.className === `${platform}-search-results`);
  assert.equal(resultList.children.length, 1);
  if (platform === "mobile") assert.equal(resultList.children[0].attributes.href, config.routes.gate);
  else assert.equal(resultList.children[0].textContent, config.home.header.searchNoResults,
    "Asztali keresőben sem lehetnek ideiglenes kapu-hivatkozások.");
  searchInput.value = "Facebook";
  searchInput.emit("input");
  assert.equal(resultList.children[0].attributes.target, "_blank");
  searchDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
  assert.equal(searchOverlay.hidden, true);
  assert.ok(searchToggle.focused);

  themeToggle.emit("click");
  assert.equal(homeNode.dataset.themePreference, "light");
  assert.equal(homeNode.dataset.theme, "light");
  assert.equal(homeNode.style["color-scheme"], "light");
  checkThemeButton("light");
  themeToggle.emit("click");
  assert.equal(homeNode.dataset.themePreference, "dark");
  assert.equal(homeNode.dataset.theme, "dark");
  assert.equal(homeNode.style["color-scheme"], "dark");
  checkThemeButton("dark");
  themeToggle.emit("click");
  assert.equal(homeNode.dataset.themePreference, "auto");
  assert.equal(homeNode.dataset.theme, "dark");
  checkThemeButton("auto");
  assert.equal(preferenceMemory.get(config.appearance.storageKey), "auto");
  systemDark = false;
  for (const listener of systemListeners) listener();
  assert.equal(homeNode.dataset.theme, "light", "Automatikus módban a rendszer témájának változását is követni kell.");
  checkThemeButton("auto");
  systemDark = true;
  for (const listener of systemListeners) listener();
  assert.equal(homeNode.dataset.theme, "dark");
  assert.equal(nodes.filter((n) => n.className?.includes("gate-frame")).length, 0);
  homeDispose();
  assert.equal(systemListeners.size, 0, "A platformváltás nem hagyhat témaváltó eseménykezelőt.");
  console.log(`✓ ${platform}: saját fejléc, külön kereső, automatikus/világos/sötét téma és lábléc`);
}

// Hibás nagy felbontású fotó esetén a mobil változat szolgál tartalékként.
failDesktopFrame = true;
const fallbackRoot = new FakeNode("root");
const fallbackDispose = desktop.mount(fallbackRoot, config, "gate");
await new Promise((done) => setImmediate(done));
const fallbackFrame = scan(fallbackRoot).find((node) => node.attributes.src?.endsWith("gate-12.webp"));
assert.ok(fallbackFrame);
assert.ok(fallbackFrame.src.endsWith("gate-12-mobile.webp"));
fallbackDispose();
failDesktopFrame = false;

// Hibás mobilfotónál is látható marad egy érvényes szomszédos képkocka.
failMobileFrame = true;
const brokenMobileRoot = new FakeNode("root");
const brokenMobileDispose = mobile.mount(brokenMobileRoot, config, "gate");
scan(brokenMobileRoot).find((node) => node.className === "gate-door-button").emit("click");
await new Promise((done) => setImmediate(done));
for (const instant of [0, config.gate.mobileDurationMs / 2]) {
  const next = queue.shift();
  assert.ok(next); next(instant);
}
assert.equal(scan(brokenMobileRoot).find((node) => node.attributes.src?.endsWith("gate-15-mobile.webp")).style.opacity, "1");
brokenMobileDispose();
queue.length = 0;
failMobileFrame = false;
console.log("✓ Sérült képkocka: asztali tartalékkép és villogásmentes mobilos továbblépés");

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
for (const mode of config.appearance.cycle) {
  assert.match(baseCss, new RegExp(`\\.shell-theme-toggle\\[data-theme-mode="${mode}"\\] \\{`),
    `A(z) ${mode} módnak saját szín- és keretstílust kell adni.`);
}
assert.match(mobileCss, /\.mobile-theme-toggle \.theme-mode-mark/);
assert.match(desktopCss, /\.desktop-theme-toggle \.theme-mode-mark/);
assert.doesNotMatch(baseCss + desktopCss + mobileCss,
  /\.shell-panel|\.shell-search-input|\.shell-search-results|\.shell-nav-link/,
  "Nem maradhat meg a korábbi, már nem használt menü-/kereső-CSS.");
function block(css, selector) {
  const pos = css.indexOf(`${selector} {`);
  assert.ok(pos >= 0, `CSS-hiba: ${selector}`);
  return css.slice(pos, css.indexOf("}", pos));
}
assert.match(block(baseCss, ".gate-stage"), /width:\s*max\(100vw,\s*177\.77778dvh\);/);
assert.match(block(baseCss, ".gate-stage"), /aspect-ratio:\s*16\s*\/\s*9;/);
assert.match(block(baseCss, ".gate-door-button"), /left:\s*50%;\s*top:\s*59\.6%;\s*width:\s*16%;\s*height:\s*53\.5%;/);
assert.match(block(baseCss, ".gate-glass-crest"), /left:\s*50%;/);
assert.match(block(baseCss, ".gate-glass-crest"), /width:\s*9\.1125%;/);
assert.match(baseCss, /\.gate-stage:has\(\.gate-door-button:hover\) \.gate-outline/);
assert.doesNotMatch(block(baseCss, ".gate-frame"), /transition:\s*opacity/);
assert.match(block(baseCss, ".gate-screen::after"), /transition:\s*opacity/);
assert.match(block(baseCss, ".gate-screen.is-finishing .gate-frames"), /filter:\s*blur/);
assert.match(block(mobileCss, ".mobile-home"), /animation:\s*home-reveal/);
assert.match(block(desktopCss, ".desktop-home"), /animation:\s*home-reveal/);
assert.match(baseCss, /\.gate-bottom-bar/);
assert.match(baseCss, /\.gate-school-name/);
assert.doesNotMatch(baseCss, /\.gate-hint|\.gate-subtitle/);
assert.match(block(mobileCss, ".mobile-toolbar"), /grid-template-columns:\s*minmax\(0,1fr\) 58px minmax\(0,1fr\);/);
assert.match(block(mobileCss, ".mobile-links-left"), /repeat\(3,minmax\(0,1fr\)\)/);
assert.match(mobileCss, /\.mobile-links-right\s*\{\s*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(block(desktopCss, ".desktop-toolbar"), /grid-template-columns:\s*minmax\(0,1fr\) 84px minmax\(0,1fr\);/);
assert.doesNotMatch(desktopCss, /\.desktop-primary-nav|\.desktop-primary-link/,
  "Az eltávolított navigációhoz tartozó CSS-t is ki kell venni.");
assert.match(block(mobileCss, ".mobile-overlay-backdrop"), /backdrop-filter:blur\(22px\)/);
assert.match(block(desktopCss, ".desktop-search-backdrop"), /backdrop-filter:blur\(25px\)/);
assert.match(block(desktopCss, ".desktop-search-dialog"), /width:94vw;\s*height:90dvh;/);
assert.match(block(mobileCss, ".mobile-menu-overlay, .mobile-search-overlay"), /position:fixed;\s*inset:0;/);
assert.match(mobileCss, /\.mobile-menu-dialog, \.mobile-search-dialog\s*\{[\s\S]*?width:100%;\s*height:100%;/);
assert.match(block(desktopCss, ".desktop-footer .footer-inner"), /grid-template-columns:\s*minmax\(0,1\.7fr\) minmax\(230px,\.8fr\);/);
assert.match(block(mobileCss, ".mobile-home"), /display:\s*flex;\s*flex-direction:\s*column;/);
assert.match(block(mobileCss, ".mobile-main"), /flex:\s*1 1 auto;/);
assert.match(block(desktopCss, ".desktop-main"), /flex:\s*1 1 auto;/);
assert.match(block(mobileCss, ".mobile-brand"), /margin:\s*0 auto 14px;/);
for (const width of [280, 320, 359, 375, 390, 430, 650, 767]) {
  const compact = width <= 359;
  const innerWidth = Math.min(650, width - (compact ? 14 : 20));
  const center = compact ? 54 : 58;
  const gap = compact ? 3 : 4;
  const side = (innerWidth - center - 2 * gap) / 2;
  const leftCell = (side - 2 * 3) / 3;
  const rightCell = (side - 3) / 2;
  assert.ok(leftCell >= 30 && rightCell >= 30, `${width}px: a fejléc elemei túlcsordulnának.`);
  assert.ok(Math.abs((side + gap + center / 2) - innerWidth / 2) < .01,
    `${width}px: a címer nem lenne középen.`);
}
console.log("✓ Fejlécgeometria: 8 mobil szélességen középre tett címer, 3+2 elférő vezérlő és lábléc-aljhoz igazítás");
for (const [width, height] of [[320, 720], [375, 812], [390, 844], [430, 932], [768, 800], [1024, 768], [1440, 900]]) {
  const stageWidth = Math.max(width, height * 16 / 9);
  const left = (stageWidth * .42) - (stageWidth - width) / 2;
  const right = (stageWidth * .58) - (stageWidth - width) / 2;
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
    : query.includes("prefers-color-scheme")
      ? { get matches() { return systemDark; },
        addEventListener: (_event, callback) => systemListeners.add(callback),
        removeEventListener: (_event, callback) => systemListeners.delete(callback) }
      : { get matches() { return viewportIsMobile; }, addEventListener: (_event, callback) => { breakpointChange = callback; } },
  addEventListener: (name, callback) => windowEvents.set(name, callback)
};
globalThis.fetch = async () => ({ ok: true, json: async () => config });
location.hash = config.routes.gate;
await import(new URL("../shared/js/entry.js", import.meta.url));
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
assert.ok(applicationRoot.querySelector(".home-brand").focused, "A kezdőlap fejlécére fókuszt kell átadni.");
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
        assert.equal(await page.locator(".gate-frame").count(), 30);
        const before = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(before <= 1, `${width}px: vízszintes túllógás`);
        await page.locator(".gate-door-button").click();
        await page.waitForURL(/#\/kezdolap$/, { timeout: 7000 });
        assert.equal(await page.locator("header").count(), 1);
        assert.equal(await page.locator("footer").count(), 1);
        assert.equal(await page.locator("main").locator(":scope > *").count(), 0);
        await page.locator(".footer-links a").last().click();
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
