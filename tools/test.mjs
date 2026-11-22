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
  "shared/js/gate.js", "shared/js/offline.js", "shared/js/shell.js", "shared/js/appearance.js", "shared/js/successes-data.js",
  "shared/js/focus.js", "shared/js/menu-data.js", "shared/js/edit-mode.js", "shared/js/footer.js", "shared/css/base.css",
  "shared/assets/media/logo/csanadi-crest-512.webp",
  "mobile/app.js", "mobile/header.js", "mobile/menu.js", "mobile/search.js", "mobile/page.js", "mobile/story.js", "mobile/successes.js", "mobile/styles.css",
  "desktop/app.js", "desktop/header.js", "desktop/hero.js", "desktop/menu.js", "desktop/search.js", "desktop/page.js", "desktop/successes.js", "desktop/styles.css",
  "tools/test.mjs", "tools/stamp-release.mjs", "docs/ELLENORZES.md"
];
const assetPaths = [];
for (let i = 0; i < 30; i++) {
  const number = String(i).padStart(2, "0");
  for (const suffix of ["", "-mobile"]) assetPaths.push(`shared/assets/media/web/gate-frames/gate-${number}${suffix}.webp`);
}
const desktopHeroAssets = [
  "hero-sport-2026.webp", "hero-oktatas-2026.webp", "hero-community-2026.webp",
  "sport2-1600.webp", "swimming-1600.webp", "oktatas2-1600.webp",
  "digital-1600.webp", "community2-1600.webp", "bejarat-1600.webp",
  "hero-athletics-new.webp", "hero-digital-new.webp", "hero-volleyball-new.webp",
  "hero-football-new.webp", "hero-handball-new.webp", "hero-gymnastics-new.webp",
  "hero-laboratory-new.webp", "hero-library-new.webp", "hero-table-tennis-new.webp",
  "hero-nature-new.webp", "hero-workshop-new.webp"
].map((name) => `shared/assets/media/web/desktop-hero/${name}`);
const mobileStoryAssets = [
  "sport-01-futsal.webp", "sport-02-athletics.webp", "sport-03-basketball.webp",
  "sport-04-swimming.webp", "sport-05-volleyball.webp", "sport-06-table-tennis.webp",
  "tudas-01-digital.webp", "tudas-02-biomechanics.webp", "tudas-03-library.webp",
  "tudas-04-mathematics.webp", "tudas-05-robotics.webp", "tudas-06-geography.webp",
  "kozosseg-01-sportsday.webp", "kozosseg-02-student-council.webp", "kozosseg-03-volunteers.webp",
  "kozosseg-04-corridor.webp", "kozosseg-05-cafeteria.webp", "kozosseg-06-celebration.webp"
].map((name) => `shared/assets/media/web/mobile-story/${name}`);
const sportSuccessAssets = ["atletika.webp", "labdarugas.webp", "uszas.webp", "kosarlabda.webp",
  "roplabda.webp", "asztalitenisz.webp"].map((name) => `shared/assets/media/web/sport-successes/${name}`);
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [relative(root, file).split(sep).join("/")];
  });
}
assert.deepEqual(files(root).sort(), [...staticFiles, ...assetPaths, ...desktopHeroAssets, ...mobileStoryAssets,
  ...sportSuccessAssets].sort(),
  "Csak az ellenőrzött és szándékosan visszaállított funkciók szerepelhetnek az aktív csomagban.");
assert.deepEqual(files(root).filter((path) => path.endsWith(".html")), ["index.html"]);
const config = JSON.parse(readFileSync(join(root, "shared/data/site.json"), "utf8"));
assert.equal(config.schemaVersion, "2.06");
assert.equal(config.release, "2.22");
assert.equal(config.appearance.defaultMode, "auto");
assert.deepEqual(config.appearance.cycle, ["auto", "light", "dark"]);
assert.deepEqual(Object.keys(config.appearance.shortLabels).sort(), ["auto", "dark", "light"]);
assert.equal(config.appearance.glyphs.auto, "◐");
assert.equal(config.home.header.settingsGlyph, "⚙");
assert.equal(config.home.header.finishEditingGlyph, "✓");
assert.equal(config.home.header.searchResultGlyph, "↗");
assert.equal(config.menu.backGlyph, "‹");
assert.equal(config.menu.homeGlyph, "⌂");
assert.equal(config.home.footer.refreshSeconds, 60);
assert.equal(config.home.footer.notices.length, 4);
assert.equal(config.home.footer.modalCloseLabel, "Tájékoztató bezárása");
assert.equal(config.gate.skipSymbol, "⏭");
assert.ok(!Object.hasOwn(config.gate, "desktopHint") && !Object.hasOwn(config.gate, "mobileHint"));
assert.deepEqual(config.routes, { gate: "#/", home: "#/kezdolap" });
assert.equal(config.gate.frames, 30);
assert.equal(config.gate.desktopDurationMs, 2250);
assert.equal(config.gate.mobileDurationMs, 1750);
assert.ok(config.gate.finishFadeMs > 0 && config.gate.homeRevealMs > 0);
assert.equal(config.gate.finishBlurPx, 18);
assert.equal(config.home.desktopHero.slides.length, 20);
assert.equal(config.home.desktopHero.intervalMs, 180000);
assert.equal(config.home.desktopHero.slides.length * config.home.desktopHero.intervalMs, 3600000,
  "Pont egy óra alatt minden képnek sorra kell kerülnie.");
assert.deepEqual(config.home.desktopHero.slides.map((slide) => slide.file).sort(),
  desktopHeroAssets.map((path) => path.split("/").at(-1)).sort());
assert.deepEqual(config.home.mobileStory.topics.map(({id}) => id), ["sport", "tudas", "kozosseg"]);
assert.deepEqual(config.home.mobileStory.topics.flatMap((topic) => topic.photos).sort(),
  mobileStoryAssets.map((path) => path.split("/").at(-1)).sort());
assert.equal(config.home.mobileStory.topics.every((topic) => topic.photos.length === 6), true);
assert.ok(!Object.hasOwn(config.home.mobileStory,"stateLabel") &&
  !Object.hasOwn(config.home.mobileStory,"scrollHint"),
  "A mobilos képsávon nem maradhat állapotszámláló vagy görgetési súgó.");
assert.equal(Object.hasOwn(config.home, "homePreview"), false,
  "Az ideiglenes kezdőlapi felsorolás adatként sem szükséges többé.");
assert.equal(config.home.sportSuccesses.items.length, 6);
assert.equal(config.home.sportSuccesses.items.filter((item) => item.image).length, 4,
  "Négy képes és két fénykép nélküli sportsiker ellenőrzendő.");
assert.deepEqual(config.home.sportSuccesses.items.filter((item) => item.image).map((item) => item.image).sort(),
  ["atletika.webp", "labdarugas.webp", "uszas.webp", "kosarlabda.webp"].sort());
assert.equal(config.home.header.social.length, 3);
assert.ok(!Object.hasOwn(config.home, "navigation"), "A korábbi próbalinkeket végleg ki kell venni.");
assert.equal(config.menu.items.length, 6, "Az 1.53-as hat főcsoportot olvassuk az új JSON-ból.");
const { validateMenu, getMenuPage, menuPageHref } = await import(new URL("../shared/js/menu-data.js", import.meta.url));
const { checkedSportSuccesses } = await import(new URL("../shared/js/successes-data.js", import.meta.url));
assert.equal(checkedSportSuccesses(config), config.home.sportSuccesses);
const invalidSuccess = structuredClone(config);
invalidSuccess.home.sportSuccesses.items[0].image = "../path.webp";
assert.throws(() => checkedSportSuccesses(invalidSuccess), /Érvénytelen sportsiker/);
invalidSuccess.home.sportSuccesses.items[0].image = "atletika.webp";
invalidSuccess.home.sportSuccesses.items[1].id = invalidSuccess.home.sportSuccesses.items[0].id;
assert.throws(() => checkedSportSuccesses(invalidSuccess), /Érvénytelen sportsiker/);
assert.ok(config.home.desktopHero.slides.every((slide) => getMenuPage(config, slide.pageId)),
  "A képekhez kizárólag működő JSON-aloldalak kapcsolódhatnak.");
assert.equal(validateMenu(config), config.menu.items);
assert.equal(Object.keys(config.pagePreview.sections).length, config.menu.items.length);
assert.equal(getMenuPage(config, "sports-results").title, "Sporteredmények");
assert.equal(getMenuPage(config, "education-primary").items.length, 3);
assert.equal(getMenuPage(config, "education-programs"), null, "Az almenükkel rendelkező pont egyelőre menüág marad.");
assert.equal(menuPageHref("school-introduction"), "#/oldal/school-introduction");
assert.throws(() => menuPageHref("../"), /Érvénytelen/);
assert.equal(new Set(config.menu.items.map((item) => item.id)).size, 6);
const duplicateMenu = structuredClone(config);
duplicateMenu.menu.items[1].id = duplicateMenu.menu.items[0].id;
assert.throws(() => validateMenu(duplicateMenu), /Érvénytelen/);
const deepMenu = structuredClone(config);
deepMenu.menu.items[1].children[0].children[0].children = [{ id: "too-deep", label: "Túl mély" }];
assert.throws(() => validateMenu(deepMenu), /Érvénytelen/);
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
const heroImageFingerprints = new Set();
for (const path of [...desktopHeroAssets, ...mobileStoryAssets, ...sportSuccessAssets]) {
  const bytes = readFileSync(join(root, path));
  assert.equal(bytes.subarray(0, 4).toString(), "RIFF", path);
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP", path);
  assert.ok(bytes.length > 20000, path);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (!sportSuccessAssets.includes(path)) {
    assert.ok(!heroImageFingerprints.has(digest), `A 38 képes válogatásban azonos fájl van: ${path}`);
    heroImageFingerprints.add(digest);
  }
}
const html = readFileSync(join(root, "index.html"), "utf8");
assert.match(html, /<div id="app"><\/div>/);
assert.match(html, /src="\.\/shared\/js\/entry\.js\?v=2\.22"/);
assert.match(html, /href="\.\/shared\/css\/base\.css\?v=2\.22"/);
assert.match(html, /name="color-scheme" content="light dark"/);
assert.doesNotMatch(html, /<h[1-6]|<p[ >]|<nav|<article|<img/i);
const src = ["shared/js/entry.js", "shared/js/dom.js", "shared/js/gate.js", "shared/js/offline.js", "shared/js/shell.js",
  "shared/js/appearance.js", "mobile/app.js", "mobile/header.js", "desktop/app.js", "desktop/header.js",
  "desktop/menu.js", "mobile/menu.js", "desktop/search.js", "mobile/search.js",
  "shared/js/edit-mode.js", "shared/js/footer.js", "mobile/page.js", "desktop/page.js", "desktop/hero.js", "mobile/story.js"]
  .map((path) => readFileSync(join(root, path), "utf8"));
for (const source of src) assert.doesNotMatch(source, /innerHTML|eval\s*\(|fetch\([^)]*pages/i);
for (const source of src.slice(0, -1)) assert.doesNotMatch(source, /carousel|slideshow/i);
assert.match(src[0], /import\(`\.\.\/\.\.\/\$\{platform\}\/app\.js\?v=\$\{encodeURIComponent\(config\.release\)\}`\)/);
assert.match(src[0], /fetch\(freshSettings, \{ cache:"no-store", signal:controller\.signal \}\)/);
assert.match(src[0], /stylesheet\.href = `\.\/\$\{platform\}\/styles\.css\?v=/);
assert.match(src[0], /window\.addEventListener\("hashchange"/);
assert.match(src[0], /breakpoint\.addEventListener\("change"/);
assert.doesNotMatch(src[4], /makeHeaderTools|createElement\("header"|element\("header"/);
assert.match(src[7], /makeMobileHeader/);
assert.match(src[9], /makeDesktopHeader/);
assert.doesNotMatch(src[7], /desktop\/|makeDesktopHeader/);
assert.doesNotMatch(src[9], /mobile\/|makeMobileHeader/);
for (const file of [...staticFiles.filter((path) => /^shared\/js\/.*\.js$|^(mobile|desktop)\/.*\.js$/.test(path))]) {
  const source = readFileSync(join(root, file), "utf8");
  const imports = [...source.matchAll(/\bfrom\s+["'](\.\.?\/[^"']+\.js)(?:\?v=(\d+\.\d+))?["']/g)];
  assert.ok(imports.every((match) => match[2] === config.release), `A(z) ${file} importja régi kódot gyorsítótárazhat.`);
}
console.log("✓ 30+30 kapukép, 20 asztali + 3×6 mobilos egyedi fotó, véletlen váltások, adatmentes HTML");

let failDesktopFrame = false;
let failMobileFrame = false;
let failMobilePair = false;
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
  getAttribute(name) { return this.attributes[name] ?? null; }
  closest(selector) {
    if (selector === "a[href]" && this.tagName === "A" && this.attributes.href) return this;
    return this.parentNode?.closest(selector) || null;
  }
  decode() {
    if (this.tag === "img" && ((failDesktopFrame && this.src?.endsWith("gate-12.webp")) ||
      (failMobileFrame && this.src?.endsWith("gate-14-mobile.webp")) ||
      (failMobilePair && /gate-(14|15)-mobile\.webp$/.test(this.src || "")))) {
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
  createElementNS: (_ns, tag) => new FakeNode(tag), body: new FakeNode("body"),
  documentElement: { scrollHeight:1600, clientHeight:900 } };
globalThis.location = { hash: "#/" };
let reducedMotion = false;
const heroWindowEvents = new Map();
globalThis.window = { innerHeight:900, scrollY:0,
  addEventListener: (name, callback) => {
    if (!heroWindowEvents.has(name)) heroWindowEvents.set(name, new Set());
    heroWindowEvents.get(name).add(callback);
  },
  removeEventListener: (name, callback) => heroWindowEvents.get(name)?.delete(callback),
  scrollTo: (options) => { window.scrollY = typeof options === "object" ? options.top : 0; },
  matchMedia: (query) => query.includes("prefers-color-scheme")
  ? { get matches() { return systemDark; },
    addEventListener: (_event, callback) => systemListeners.add(callback),
    removeEventListener: (_event, callback) => systemListeners.delete(callback) }
  : { matches: reducedMotion } };
const queue = [];
globalThis.requestAnimationFrame = (callback) => { queue.push(callback); return queue.length; };
globalThis.cancelAnimationFrame = () => {};
const scan = (node) => [node, ...node.children.flatMap((item) => typeof item === "object" ? scan(item) : [])];
const { trapTab } = await import(new URL("../shared/js/focus.js", import.meta.url));
const focusControls = Array.from({ length:3 }, () => new FakeNode("button"));
document.activeElement = new FakeNode("button");
trapTab({ key:"Tab", shiftKey:true, preventDefault:()=>{} }, focusControls);
assert.equal(document.activeElement, focusControls[2],
  "Shift+Tab esetén a párbeszédablakon kívülről a legutolsó gombra kell lépni.");
document.activeElement = new FakeNode("button");
trapTab({ key:"Tab", shiftKey:false, preventDefault:()=>{} }, focusControls);
assert.equal(document.activeElement, focusControls[0],
  "Tab esetén a párbeszédablakon kívülről az első gombra kell lépni.");
const mobile = await import(new URL("../mobile/app.js", import.meta.url));
const desktop = await import(new URL("../desktop/app.js", import.meta.url));
const { shuffledHeroOrder } = await import(new URL("../desktop/hero.js", import.meta.url));
const { selectMobileStoryPhotos, mobileStoryStateAtScroll } = await import(new URL("../mobile/story.js", import.meta.url));
const { nearestAvailableFrame } = await import(new URL("../shared/js/gate.js", import.meta.url));
assert.equal(nearestAvailableFrame([true,false,false,true],1.5),3,
  "Két szomszédos sérült képnél nem ugorhat vissza az első képre.");
assert.equal(nearestAvailableFrame([false,false,false],1),-1);
assert.deepEqual([0,100,120,260,290,400,460,550,590,700].map((position) =>
  mobileStoryStateAtScroll(position,700)),[0,0,1,2,2,2,3,3,4,4]);
assert.equal(mobileStoryStateAtScroll(500,0),0,
  "Nem görgethető oldalon ne induljon képváltási hiba.");
for (let cycle=0; cycle<10; cycle++) {
  let seed=cycle+284;
  const picks=selectMobileStoryPhotos(config.home.mobileStory.topics,()=>{
    seed=(seed*1664525+1013904223)>>>0;
    return seed/4294967296;
  });
  assert.equal(picks.length,3);
  for (const [i,choice] of picks.entries()) {
    assert.equal(new Set(Object.values(choice)).size,3,
      "Egy témán belül a nyitó, a különálló és a záró állapot képe sem ismétlődhet.");
    assert.ok(Object.values(choice).every((name)=>config.home.mobileStory.topics[i].photos.includes(name)));
  }
}
const allOrderIds = Array.from({length:20}, (_,i)=>i).sort((a,b)=>a-b);
let lastSlide = -1;
for (let cycle=0; cycle<8; cycle++) {
  let seed = cycle + 117;
  const order = shuffledHeroOrder(20, lastSlide, () => {
    seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296;
  });
  assert.deepEqual([...order].sort((a,b)=>a-b), allOrderIds,
    "Véletlen sorrendben is mind a húsz kép pontosan egyszer szerepeljen.");
  assert.notEqual(order[0], lastSlide, "Két órás ciklus határán sem lehet azonos kép egymás után.");
  lastSlide = order.at(-1);
}

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
  assert.equal(nodes.find((n) => n.tag === "main").children.length, 2,
    "Mindkét kezdőlapon a képes nyitás után közvetlenül a valódi sportsiker-rács jelenjen meg.");
  assert.equal(nodes.some((n) => n.className?.includes("home-preview") ||
    n.className === "desktop-hero-continuation"), false,
    "A már nem aktuális kezdőlapi tartalomfelsorolás nem jelenhet meg.");
  assert.equal(nodes.filter((n) => n.tag === "h1").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "img").length, platform === "desktop" ? 9 : 13,
    "A régi nyitóképeken felül négy sportsiker-fotó és egy részletes képhely legyen.");
  if (platform === "mobile") {
    const story=nodes.find((n)=>n.className==="mobile-story-track");
    const storyStage=story?.querySelector(".mobile-story-stage");
    const layers=scan(story).filter((n)=>n.className==="mobile-story-visual");
    const photos=scan(story).filter((n)=>n.className==="mobile-story-photo");
    assert.ok(storyStage && layers.length===2 && photos.length===6);
    assert.equal(storyStage.dataset.storyState,"intro");
    assert.equal(storyStage.dataset.storyMode,"trio");
    assert.equal(layers.filter((layer)=>layer.dataset.active==="true").length,1);
    assert.equal(scan(layers.find((layer)=>layer.dataset.active==="true"))
      .filter((photo)=>photo.className==="mobile-story-photo"&&!photo.hidden).length,3);
    assert.equal(scan(story).filter((node)=>node.className==="mobile-story-bottom").length,0,
      "Nem lehet állapotjelző vagy görgetési súgó a képek alján.");
    assert.ok(!scan(story).some((node)=>node.className.startsWith("mobile-story-state-count") ||
      node.className.startsWith("mobile-story-step") ||
      node.className.startsWith("mobile-story-scroll-hint")));
    const checkpoints=[[155,"sport"],[290,"tudas"],[460,"kozosseg"],[590,"outro"],[0,"intro"]];
    for(const [scrollY,expected] of checkpoints) {
      window.scrollY=scrollY;
      for(const callback of heroWindowEvents.get("scroll") || []) callback();
      queue.shift()?.(0);
      assert.equal(storyStage.dataset.storyState,expected,
        "A mobilos állapotsor pontosan együtt → sport → tudás → közösség → együtt legyen.");
      const active=layers.find((layer)=>layer.dataset.active==="true");
      assert.equal(scan(active).filter((photo)=>photo.className==="mobile-story-photo"&&!photo.hidden).length,
        expected==="intro"||expected==="outro"?3:1);
    }
    assert.equal(nodes.find((n) => n.tag === "main").children[1].className,
      "mobile-successes-section", "A mobilos képsávot közvetlenül a valódi tartalom kövesse.");
  }
  const successGrid = nodes.find((n) => n.className === `${platform}-successes-grid`);
  const successOverlay = nodes.find((n) => n.className === `${platform}-successes-overlay`);
  const successDialog = nodes.find((n) => n.className === `${platform}-successes-dialog`);
  const successBackdrop = nodes.find((n) => n.className === `${platform}-successes-backdrop`);
  const successClose = nodes.find((n) => n.className === `${platform}-successes-close`);
  const successDetailName = nodes.find((n) => n.className === `${platform}-successes-detail-name`);
  const successDetailImage = nodes.find((n) => n.className === `${platform}-successes-detail-image`);
  const successDetailFallback = nodes.find((n) => n.className === `${platform}-successes-detail-fallback`);
  assert.ok(successGrid && successOverlay && successDialog && successBackdrop && successClose);
  assert.equal(successGrid.children.length, 6);
  assert.equal(successOverlay.hidden, true);
  assert.equal(successOverlay.parentNode.className, `${platform}-home`,
    "A lebegő ablak teljes nézetet fedő rétege ne legyen a fejlécbe zárva.");
  assert.equal(successDialog.attributes["aria-modal"], "true");
  const successCards = successGrid.children;
  assert.equal(successCards.filter((card) => scan(card).some((n) =>
    n.className === `${platform}-successes-card-image`)).length, 4);
  assert.equal(successCards.filter((card) => scan(card).some((n) =>
    n.className === `${platform}-successes-card-fallback` && !n.hidden)).length, 2);
  for (const [index, card] of successCards.entries()) {
    assert.equal(card.attributes["aria-expanded"], "false");
    assert.ok(scan(card).some((n) => n.textContent === config.home.sportSuccesses.items[index].name));
    assert.ok(scan(card).some((n) => n.textContent === config.home.sportSuccesses.items[index].result));
  }
  successCards[0].emit("click");
  assert.equal(successOverlay.hidden, false);
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(successCards[0].attributes["aria-expanded"], "true");
  assert.equal(successDetailName.textContent, config.home.sportSuccesses.items[0].name);
  assert.equal(successDetailImage.hidden, false);
  assert.equal(successDetailFallback.hidden, true);
  assert.ok(successClose.focused);
  successClose.emit("click");
  assert.equal(successOverlay.hidden, true);
  assert.equal(document.body.style.overflow, "");
  assert.ok(successCards[0].focused, "Bezárás után a kiválasztott kártyára kerüljön vissza a fókusz.");
  successCards[4].emit("click");
  assert.equal(successOverlay.hidden, false);
  assert.equal(successDetailImage.hidden, true);
  assert.equal(successDetailFallback.hidden, false);
  assert.equal(successDetailName.textContent, config.home.sportSuccesses.items[4].name);
  successDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
  assert.equal(successOverlay.hidden, true);
  successCards[5].emit("click");
  successBackdrop.emit("click");
  assert.equal(successOverlay.hidden, true);
  // A képbetöltés hibája sem hagyhat törött kártyát a rácsban.
  const firstPhoto = scan(successCards[0]).find((n) => n.className === `${platform}-successes-card-image`);
  const firstFallback = scan(successCards[0]).find((n) => n.className === `${platform}-successes-card-fallback`);
  firstPhoto.emit("error");
  assert.equal(firstPhoto.hidden, true);
  assert.equal(firstFallback.hidden, false);
  assert.equal(document.body.style.overflow, "");
  assert.equal(nodes.filter((n) => n.className?.includes(`${platform}-social`)).length, 3);
  assert.equal(nodes.filter((n) => n.tag === "svg").length, 2,
    "A két közösségi ikon saját SVG-képként jelenik meg.");
  assert.equal(nodes.filter((n) => n.tag === "path").length, 1);
  const editToggle = nodes.find((n) => n.className.includes(`${platform}-edit-toggle`));
  assert.ok(editToggle);
  assert.equal(editToggle.textContent, config.home.header.settingsGlyph);
  assert.equal(editToggle.attributes["aria-label"], config.home.header.settingsLabel);
  assert.equal(editToggle.attributes["aria-pressed"], "false");
  const editBar = nodes.find((n) => n.className === `${platform}-edit-bar`);
  assert.ok(editBar && editBar.hidden);
  assert.equal(editBar.children.length, 1, "A lebegő fejlécben nem lehet külön pipa.");
  assert.equal(editBar.children[0].textContent, config.home.editor.title);
  assert.equal(nodes.filter((n) => n.className.includes("settings-overlay")).length, 0,
    "A szerkesztő mód nem nyithat beállítási ablakot.");
  assert.equal(nodes.filter((n) => n.className.includes("contact-link")).length, 0,
    "A korábbi Kapcsolat-próbagomb nem maradhat a fejlécben.");
  assert.equal(nodes.filter((n) => n.className === "home-brand" || n.className?.includes("home-brand ")).length, 1);
  const footer = nodes.find((n) => n.tag === "footer");
  assert.equal(scan(footer).filter((n) => n.tag === "a").length, 1,
    "Egyik láblécben sem maradhatnak ideiglenes próbalinkek.");
  assert.ok(scan(footer).some((n) => n.textContent === config.home.footer.address));
  const informationColumn = scan(footer).find((n) => n.className === "footer-links");
  if (platform === "mobile") {
    const tabList = scan(footer).find((n) => n.className === "footer-mobile-tabs");
    assert.equal(tabList.attributes.role, "tablist");
    assert.equal(tabList.children.length, 2, "Mobilon kompakt, kétfüles lábléc szükséges.");
    const [contactTab, infoTab] = tabList.children;
    const contactPanel = scan(footer).find((n) => n.className === "footer-contact");
    assert.equal(contactPanel.hidden, true);
    assert.equal(informationColumn.hidden, false);
    assert.equal(infoTab.attributes["aria-selected"], "true");
    contactTab.emit("click");
    assert.equal(contactPanel.hidden, false);
    assert.equal(informationColumn.hidden, true);
    infoTab.emit("click");
    assert.equal(contactPanel.hidden, true);
    assert.equal(informationColumn.hidden, false);
    contactTab.emit("keydown", { key:"ArrowRight", preventDefault:()=>{} });
    assert.equal(infoTab.focused, true);
  }
  const noticeRows = scan(informationColumn).filter((n) => n.className === "footer-notice-icon");
  assert.equal(noticeRows.length, 4, "A Tájékoztatás négy betűs ikont tartalmazzon.");
  assert.deepEqual(noticeRows.map((n) => n.textContent), ["I", "D", "A", "M"]);
  assert.equal(new Set(noticeRows.map((n) => n.textContent)).size, 4,
    "Minden láblécgomb önálló betűjelet használjon.");
  assert.equal(noticeRows[0].attributes["aria-label"], "Impresszum");
  assert.equal(noticeRows[3].attributes["aria-label"], "Működés");
  const noticeModal = scan(footer).find((n) => n.className === "footer-notice-modal");
  const modalDialog = scan(footer).find((n) => n.className === "footer-modal-dialog");
  assert.ok(noticeModal.hidden);
  noticeRows[0].emit("click");
  assert.equal(noticeModal.hidden, false, "A betűikon nyissa meg a saját lebegő szövegablakát.");
  assert.equal(scan(modalDialog).find((n) => n.className === "footer-modal-title").textContent, "Impresszum");
  assert.equal(document.body.style.overflow, "hidden");
  modalDialog.emit("keydown", { key:"Escape", preventDefault:()=>{} });
  assert.equal(noticeModal.hidden, true);
  assert.equal(document.body.style.overflow, "");
  assert.ok(noticeRows[0].focused, "Bezárás után a betűikon kapja vissza a fókuszt.");
  noticeRows[3].emit("click");
  assert.equal(scan(modalDialog).find((n) => n.className === "footer-modal-title").textContent,
    "Működés");
  scan(footer).find((n) => n.className === "footer-modal-backdrop").emit("click");
  assert.ok(noticeModal.hidden);
  assert.ok(scan(informationColumn).some((n) => n.textContent ===
    `${config.home.footer.updatedLabel}: 2026. 11. 22.`));
  assert.ok(scan(informationColumn).some((n) => n.textContent === config.home.footer.pendingLabel));
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

  const crestToggle = nodes.find((n) => n.className.includes(`${platform}-crest-toggle`));
  const menuOverlay = nodes.find((n) => n.className === (platform === "mobile"
    ? "mobile-menu-overlay" : "desktop-wheel-overlay"));
  const menuDialog = nodes.find((n) => n.className === (platform === "mobile"
    ? "mobile-menu-dialog" : "desktop-wheel-dialog"));
  assert.ok(crestToggle && menuOverlay && menuDialog);
  assert.equal(menuOverlay.hidden, true);
  if (platform === "desktop") {
    const header = nodes.find((n) => n.className === "desktop-header");
    const searchOverlay = nodes.find((n) => n.className === "desktop-search-overlay");
    assert.equal(menuOverlay.parentNode, homeNode,
      "A körmenü teljes képernyős takarása nem maradhat a szűrt fejlécen belül.");
    assert.equal(searchOverlay.parentNode, homeNode,
      "A kereső takarórétegét is a rögzített fejléc fölé kell emelni.");
    assert.ok(!scan(header).includes(menuOverlay) && !scan(header).includes(searchOverlay));
    const hero = nodes.find((n) => n.className === "desktop-hero-track");
    const photo = scan(hero).find((n) => n.className === "desktop-hero-photo");
    const crest = scan(hero).find((n) => n.className === "desktop-hero-crest");
    assert.equal(scan(crest).find((n) => n.className === "desktop-hero-crest-label"), undefined,
      "A megnagyobbított középső címer alá ne kerüljön MENÜ felirat.");
    const ticker = scan(hero).find((n) => n.className === "desktop-hero-story");
    assert.equal(ticker.tagName, "A", "A teljes alsó hírsáv legyen kattintható hivatkozás.");
    assert.ok(ticker.attributes.href?.startsWith("#/oldal/"));
    assert.ok(scan(ticker).some((n) => n.className === "desktop-hero-story-channel" && n.textContent === "CSANÁDI HÍREK"));
    assert.ok(scan(ticker).some((n) => n.className === "desktop-hero-story-action" && n.textContent === "MEGNYITÁS"));
    const next = scan(hero).find((n) => n.className === "desktop-hero-arrow desktop-hero-arrow--next");
    assert.equal(scan(hero).some((n) => ["desktop-hero-count", "desktop-hero-pause"].includes(n.className)), false,
      "Sem számláló, sem stop/szünet gomb nem jelenhet meg az asztali fotón.");
    const originalPhoto = photo.attributes.src;
    assert.ok(desktopHeroAssets.some((path) => originalPhoto.endsWith(path.split("/").at(-1))));
    assert.equal(crestToggle.attributes.tabindex, "-1",
      "A felső címer csak görgetés után lépjen az asztali fejlécbe.");
    next.emit("click");
    assert.notEqual(photo.attributes.src, originalPhoto, "Egy órán belül a képek nem ismétlődhetnek.");
    crest.emit("click");
    assert.equal(menuOverlay.hidden, false, "A keret nélküli címergomb is a körmenüt nyissa meg.");
    scan(menuDialog).find((n) => n.className === "desktop-wheel-center").emit("click");
    assert.equal(menuOverlay.hidden, true);
    window.scrollY = 550;
    for (const callback of heroWindowEvents.get("scroll")) callback();
    queue.shift()?.(0);
    assert.equal(crestToggle.attributes.tabindex, "0",
      "A felső címernek meg kell jelennie görgetés után.");
    assert.equal(crestToggle.attributes["aria-hidden"], "false");
    const radius=Number.parseFloat(hero.querySelector(".desktop-hero-stage").style["--hero-clip-radius"]);
    assert.ok(radius<=40 && radius>0,
      "A fotónak a felső fejléc címere méretére kell zsugorodnia.");
    assert.equal(scan(hero).some((n)=>n.className==="desktop-hero-scroll"),false,
      "Ne maradjon lefelé mutató gomb az asztali nyitó alján.");
    crestToggle.emit("click");
    assert.equal(menuOverlay.hidden, false,
      "Görgetés után is az egész nézetet takaró menünek kell megnyílnia.");
    assert.equal(menuOverlay.parentNode, homeNode);
    scan(menuDialog).find((n) => n.className === "desktop-wheel-center").emit("click");
    assert.equal(menuOverlay.hidden, true);
    window.scrollY = 0;
    for (const callback of heroWindowEvents.get("scroll")) callback();
    queue.shift()?.(0);
    assert.equal(crestToggle.attributes.tabindex, "-1", "Visszagörgetve a főcímer térjen vissza a képre.");
  }
  crestToggle.emit("click");
  assert.equal(menuOverlay.hidden, false);
  assert.equal(document.body.style.overflow, "hidden", "A menü alatt a háttér nem görgethető.");
  assert.equal(crestToggle.attributes["aria-expanded"], "true");
  assert.equal(crestToggle.attributes["aria-label"], config.home.header.menuCloseLabel);
  if (platform === "mobile") {
    const compass = scan(menuDialog).find((n) => n.className === "mobile-compass-stage");
    const rootButtons = compass.children.filter((n) => n.className === "mobile-compass-node");
    const subSection = scan(menuDialog).find((n) => n.className === "mobile-compass-sub-section");
    const subGrid = scan(menuDialog).find((n) => n.className === "mobile-compass-sub-grid");
    const thirdSection = scan(menuDialog).find((n) => n.className === "mobile-compass-third-section");
    const thirdGrid = scan(menuDialog).find((n) => n.className === "mobile-compass-third-grid");
    const centerButton = scan(menuDialog).find((n) => n.className === "mobile-compass-center");
    const homeLink = scan(menuDialog).find((n) => n.className === "mobile-compass-home");
    assert.equal(rootButtons.length, config.menu.items.length);
    assert.deepEqual(rootButtons.map((n) => n.dataset.sector), ["1","2","3","4","5","6"]);
    assert.ok(subSection.hidden && thirdSection.hidden);
    assert.equal(centerButton.tagName, "BUTTON", "Mobilon is a középső címer zárja a menüt.");
    assert.equal(homeLink.attributes.href, config.routes.home);
    assert.equal(scan(menuDialog).filter((n) => n.className === "mobile-menu-close").length, 0);
    rootButtons[0].emit("click");
    assert.equal(rootButtons[0].attributes["aria-expanded"], "true");
    assert.equal(subSection.hidden, false);
    assert.equal(subGrid.children.length, config.menu.items[0].children.length);
    assert.equal(subGrid.children[0].attributes.href, menuPageHref("school-introduction"));
    rootButtons[0].emit("click");
    assert.ok(subSection.hidden && thirdSection.hidden,
      "Az aktív mobil főmenü második kattintásra becsukódjon.");
    rootButtons[1].emit("click");
    assert.equal(subGrid.children.length, config.menu.items[1].children.length);
    subGrid.children[0].emit("click");
    assert.equal(thirdSection.hidden, false);
    assert.equal(thirdGrid.children.length, 3);
    assert.equal(thirdGrid.children[0].attributes.href, menuPageHref("education-primary"));
    subGrid.children[0].emit("click");
    assert.equal(thirdSection.hidden, true, "Az aktív második szint újabb kattintásra becsukódjon.");
    subGrid.children[0].emit("click");
    rootButtons[2].emit("click");
    assert.equal(thirdSection.hidden, true, "Másik főmenü a harmadik szintet is becsukja.");
    assert.equal(subGrid.children.length, config.menu.items[2].children.length);
    assert.equal(rootButtons[1].attributes["aria-expanded"], "false");
    assert.equal(rootButtons[2].attributes["aria-expanded"], "true");
    centerButton.emit("click");
    assert.equal(menuOverlay.hidden, true);
    crestToggle.emit("click");
    assert.ok(subSection.hidden && thirdSection.hidden);
    rootButtons[0].emit("click");
    let mobileNavigationPrevented = false;
    menuOverlay.emit("click", { target:subGrid.children[0],
      preventDefault:() => { mobileNavigationPrevented = true; } });
    assert.equal(mobileNavigationPrevented, true);
    assert.equal(location.hash, menuPageHref("school-introduction"));
    assert.equal(menuOverlay.hidden, true, "A mobilos végpont oldalra navigál és bezárja a menüt.");
    location.hash = config.routes.home;
    crestToggle.emit("click");
  } else {
    assert.equal(nodes.filter((n) => n.className === "desktop-primary-nav").length, 0,
      "Nem jelenhet meg a két tesztnavigációs gomb az asztali fejlécben.");
    assert.equal(nodes.filter((n) => n.className === "desktop-primary-link").length, 0);
    assert.equal(nodes.filter((n) => n.tag === "a" && n.attributes.href === config.routes.gate).length, 0,
      "Asztalon sehol nem szerepelhet Vissza a kapuhoz hivatkozás.");
    assert.equal(nodes.filter((n) => n.className === "mobile-menu-overlay").length, 0);
    const wheelNodes = scan(menuDialog).filter((n) => n.className === "desktop-wheel-node");
    assert.equal(wheelNodes.length, 6);
    assert.equal(wheelNodes[0].style.left, "50.000%");
    assert.equal(wheelNodes[0].style.top, "32.000%");
    wheelNodes.forEach((button, i) => {
      const a = (-90 + i * 360 / wheelNodes.length) * Math.PI / 180;
      assert.equal(button.style.left, `${(50 + 18 * Math.cos(a)).toFixed(3)}%`,
        "A belső gyűrű pontjai nem szabályos, szimmetrikus körön vannak.");
      assert.equal(button.style.top, `${(50 + 18 * Math.sin(a)).toFixed(3)}%`);
    });
    const centerButton = scan(menuDialog).find((n) => n.className === "desktop-wheel-center");
    const homeLink = scan(menuDialog).find((n) => n.className === "desktop-wheel-home");
    assert.equal(centerButton.tagName, "BUTTON", "A középső címernek bezárógombnak kell lennie.");
    assert.equal(centerButton.attributes["aria-label"], config.menu.closeLabel);
    assert.equal(homeLink.attributes.href, config.routes.home);
    assert.equal(homeLink.attributes["aria-label"], config.menu.homeLabel);
    assert.equal(scan(menuDialog).filter((n) => n.className === "desktop-wheel-close").length, 0,
      "Az asztali menünek nem lehet külön bezáró X gombja.");
    assert.equal(scan(menuDialog).filter((n) => n.className.includes("desktop-wheel-guide ")).length, 0,
      "A főmenü és az almenük mögött egyetlen körkeret sem maradhat.");
    const outer = scan(menuDialog).find((n) => n.className === "desktop-wheel-ring-sub");
    assert.ok(outer.hidden, "Az előző menüszint kijelölése előtt a külső gyűrű üres.");
    wheelNodes[1].emit("click");
    assert.equal(wheelNodes[1].attributes["aria-pressed"], "true");
    assert.equal(outer.hidden, false);
    assert.equal(outer.children.length, config.menu.items[1].children.length);
    assert.equal(outer.children[0].style.top, "10.000%",
      "A második menüszint ténylegesen a külső körön legyen.");
    const n = outer.children.length;
    outer.children.forEach((node, i) => {
      const a = (-90 + i * 360 / n) * Math.PI / 180;
      assert.equal(node.style.left, `${(50 + 40 * Math.cos(a)).toFixed(3)}%`,
        "A külső gyűrű elemei nem egyenlő szögközzel helyezkednek el.");
      assert.equal(node.style.top, `${(50 + 40 * Math.sin(a)).toFixed(3)}%`);
    });
    wheelNodes[1].emit("click");
    assert.equal(outer.hidden, true, "Az aktív főmenü újabb kattintásra csukja össze a saját almenüjét.");
    assert.equal(outer.children.length, 0);
    assert.equal(wheelNodes[1].attributes["aria-expanded"], "false");
    assert.equal(wheelNodes[1].attributes["aria-pressed"], "false");
    wheelNodes[2].emit("click");
    assert.equal(outer.hidden, false);
    assert.equal(outer.children.length, config.menu.items[2].children.length);
    assert.equal(wheelNodes[2].attributes["aria-pressed"], "true");
    wheelNodes[1].emit("click");
    assert.equal(outer.children.length, config.menu.items[1].children.length,
      "Másik főmenüre kattintva az előző almenü teljesen lecserélődik.");
    assert.equal(wheelNodes[1].attributes["aria-expanded"], "true");
    assert.equal(wheelNodes[2].attributes["aria-expanded"], "false");
    outer.children[0].emit("click");
    const third = scan(menuDialog).find((n) => n.className === "desktop-wheel-level-three");
    assert.equal(third.children.length, 3);
    assert.equal(scan(menuDialog).find((n) => n.className === "desktop-wheel-third-panel").hidden, false);
    assert.equal(outer.children[0].attributes["aria-expanded"], "true");
    outer.children[0].emit("click");
    assert.equal(third.children.length, 0,
      "Az asztali harmadik menüszint az aktív almenügomb újbóli megnyomására csukódjon be.");
    assert.equal(scan(menuDialog).find((n) => n.className === "desktop-wheel-third-panel").hidden,true);
    assert.equal(outer.children[0].attributes["aria-expanded"], "false");
    outer.children[0].emit("click");
    assert.equal(third.children.length, 3,
      "Az összecsukott asztali harmadik menüszint újra nyitható legyen.");
    wheelNodes[3].emit("click");
    assert.equal(outer.children.length, config.menu.items[3].children.length);
    assert.equal(scan(menuDialog).find((n) => n.className === "desktop-wheel-third-panel").hidden, true,
      "Másik főág kiválasztásakor a korábbi harmadik menüszint is záródjon be.");
    const backdrop = scan(menuOverlay).find((n) => n.className === "desktop-wheel-backdrop");
    backdrop.emit("click");
    assert.equal(menuOverlay.hidden, false, "A menüt kizárólag a címerrel vagy ESC-pel zárjuk.");
    centerButton.emit("click");
    assert.equal(menuOverlay.hidden, true, "A középső címerre kattintásnak zárnia kell.");
    assert.equal(outer.hidden, true, "A bezárt menü ne tartsa meg a korábbi főág állapotát.");
    crestToggle.emit("click");
    assert.equal(menuOverlay.hidden, false, "A címer bezárása után a menü újranyitható.");
    assert.equal(outer.hidden, true, "Újranyitáskor tiszta, nem kijelölt menüállapot szükséges.");
    homeLink.emit("click");
    assert.equal(menuOverlay.hidden, true, "A házikóval a főoldalra lépve a menü bezárul.");
    crestToggle.emit("click");
    assert.equal(menuOverlay.hidden, false);
    wheelNodes[0].emit("click");
    let desktopNavigationPrevented = false;
    menuOverlay.emit("click", { target:outer.children[0],
      preventDefault:() => { desktopNavigationPrevented = true; } });
    assert.equal(desktopNavigationPrevented, true);
    assert.equal(location.hash, menuPageHref("school-introduction"));
    assert.equal(menuOverlay.hidden, true, "Az asztali végpont oldalra navigál és bezárja a menüt.");
    location.hash = config.routes.home;
    crestToggle.emit("click");
  }
  menuDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
  assert.equal(menuOverlay.hidden, true);
  assert.equal(document.body.style.overflow, "", "Bezárás után vissza kell állítani a görgetést.");
  assert.equal(crestToggle.attributes["aria-label"], config.home.header.menuOpenLabel);
  assert.ok(crestToggle.focused);

  editToggle.emit("click");
  assert.equal(homeNode.dataset.editMode, "on");
  assert.equal(editBar.hidden, false);
  assert.equal(editToggle.textContent, "✓", "A harmadik gombnak pipára kell váltania.");
  assert.equal(editToggle.attributes["aria-pressed"], "true");
  assert.equal(editToggle.attributes["aria-label"], config.home.header.finishEditingLabel);
  assert.equal(document.body.style.overflow, "", "Szerkesztés közben az oldal görgethető marad.");
  editToggle.emit("click");
  assert.equal(homeNode.dataset.editMode, "off");
  assert.equal(editBar.hidden, true);
  assert.equal(editToggle.textContent, "⚙");
  assert.equal(editToggle.attributes["aria-pressed"], "false");

  const searchOverlay = nodes.find((n) => n.className === `${platform}-search-overlay`);
  const searchDialog = nodes.find((n) => n.className === `${platform}-search-dialog`);
  assert.ok(searchOverlay && searchDialog);
  assert.equal(searchOverlay.hidden, true);
  assert.equal(searchDialog.attributes["aria-modal"], "true");
  searchToggle.emit("click");
  assert.equal(searchOverlay.hidden, false);
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(scan(searchDialog).find((n) => n.className === `${platform}-search-eyebrow`).textContent,
    config.home.header.searchEyebrow);
  const searchInput = searchDialog.querySelector("input");
  assert.ok(searchInput.focused);
  const searchCount = scan(searchDialog).find((n) => n.className === `${platform}-search-count`);
  const clearButton = scan(searchDialog).find((n) => n.className === `${platform}-search-clear`);
  const quickList = scan(searchDialog).find((n) => n.className === `${platform}-search-quick-list`);
  const resultsHeading = scan(searchDialog).find((n) => n.className === `${platform}-search-results-title`);
  assert.equal(quickList.children.length, 4, "Csak négy valódi elérhetőség szerepelhet a gyorsválasztóban.");
  assert.equal(resultsHeading.textContent, config.home.header.searchFeaturedTitle);
  assert.equal(clearButton.hidden, true);
  assert.equal(searchCount.textContent, `4 ${config.home.header.searchResultCountLabel}`);
  searchInput.value = "kapu";
  searchInput.emit("input");
  assert.equal(clearButton.hidden, false);
  assert.equal(searchCount.textContent, `0 ${config.home.header.searchResultCountLabel}`);
  const resultList = nodes.find((n) => n.className === `${platform}-search-results`);
  assert.equal(resultList.children.length, 1);
  assert.equal(resultList.children[0].textContent, config.home.header.searchNoResults,
    "Egyik keresőben sem maradhatnak ideiglenes kapu-hivatkozások.");
  assert.equal(resultsHeading.textContent, config.home.header.searchResultsTitle);
  clearButton.emit("click");
  assert.equal(searchInput.value, "");
  assert.equal(clearButton.hidden, true);
  assert.equal(resultList.children.length, 4, "Csak a négy valódi hivatkozás szerepelhet a keresőben.");
  assert.equal(resultsHeading.textContent, config.home.header.searchFeaturedTitle);
  assert.ok(searchInput.focused);
  quickList.children[2].emit("click");
  assert.equal(searchInput.value, "KRÉTA");
  assert.equal(resultList.children.length, 1);
  assert.equal(resultList.children[0].children[1].children[2].textContent,
    config.home.header.social[2].searchSummary);
  let arrowDownPrevented = false;
  searchInput.emit("keydown", { key:"ArrowDown", preventDefault:() => { arrowDownPrevented = true; } });
  assert.equal(arrowDownPrevented, true);
  assert.ok(resultList.children[0].focused, "A lefelé nyíl fókuszt adjon az első találatnak.");
  searchInput.value = "Facebook";
  searchInput.emit("input");
  assert.equal(resultList.children[0].attributes.target, "_blank");
  assert.equal(resultList.children[0].children[2].textContent, config.home.header.searchResultGlyph);
  searchDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
  assert.equal(searchOverlay.hidden, true);
  assert.equal(document.body.style.overflow, "");
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
  const leafDispose = app.mount(parent, config, "page:sports-results");
  const leafNodes = scan(parent);
  assert.equal(leafNodes.find((n) => n.className === `${platform}-page-title`).textContent,
    "Sporteredmények", "A menüvégpont valódi, külön renderelt oldalt kapjon.");
  const previewList = leafNodes.find((n) => n.className === `${platform}-page-list`);
  assert.equal(previewList.tagName, "UL");
  assert.equal(previewList.children.length, 3, "Az új oldalon csak a JSON-vázlat felsorolása szerepeljen.");
  assert.deepEqual(previewList.children.map((n) => n.textContent), config.pagePreview.sections.sports);
  assert.equal(leafNodes.filter((n) => n.tag === "h1").length, 1);
  leafDispose();
  console.log(`✓ ${platform}: saját fejléc, külön kereső, automatikus/világos/sötét téma és lábléc`);
}

// A lábléc 60 másodperces JSON-figyelése önállóan is tesztelhető:
// láthatatlan lapon nem kérdez le, érvényes adatot átvesz, hibásat visszautasít.
const { makeFooter } = await import(new URL("../shared/js/footer.js", import.meta.url));
const liveFooter = makeFooter(config, "desktop");
const liveVersion = scan(liveFooter.footer).find((node) => node.className === "footer-version");
const liveNotices = scan(liveFooter.footer).find((node) => node.className === "footer-notices");
const liveUpdated = scan(liveFooter.footer).find((node) => node.className === "footer-updated");
const liveChecked = scan(liveFooter.footer).find((node) => node.className === "footer-checked");
const liveModal = scan(liveFooter.footer).find((node) => node.className === "footer-notice-modal");
const liveModalText = scan(liveFooter.footer).find((node) => node.className === "footer-modal-content");
liveNotices.children[0].emit("click");
assert.equal(liveModal.hidden, false);
const refreshed = structuredClone(config);
refreshed.release = "2.23";
refreshed.home.footer.updatedAt = "2026-11-23";
refreshed.home.footer.notices[0].body = "Ellenőrzött, módosított impresszum-adatok.";
const originalFetch = globalThis.fetch;
let requests = 0;
let replacementUrl = null;
window.location = { href:"https://example.test/index.html?v=2.22#/kezdolap",
  replace:(next) => { replacementUrl = next; } };
globalThis.fetch = async (url, options) => {
  requests++;
  assert.match(String(url), /site\.json\?footer=\d+/);
  assert.equal(options.cache, "no-store");
  return { ok:true, json:async () => refreshed };
};
document.visibilityState = "hidden";
assert.equal(await liveFooter.checkForUpdates(), false);
assert.equal(requests, 0, "Rejtett lapon a frissítés nem terhelheti a hálózatot.");
document.visibilityState = "visible";
assert.equal(await liveFooter.checkForUpdates(), true);
assert.equal(requests, 1);
assert.equal(liveVersion.textContent, "Verzió: 2.23");
assert.equal(liveUpdated.textContent, "Utolsó frissítés: 2026. 11. 23.");
assert.equal(liveModalText.textContent, "Ellenőrzött, módosított impresszum-adatok.");
assert.equal(liveModal.hidden, false, "A megnyitott tájékoztató maradjon meg adatfrissítéskor.");
assert.equal(replacementUrl, "https://example.test/index.html?v=2.23#/kezdolap",
  "Új kiadáskor az egész alkalmazás új verziókulccsal töltődjön újra.");
scan(liveFooter.footer).find((node) => node.className === "footer-modal-close").emit("click");
assert.equal(liveModal.hidden, true);
assert.ok(liveNotices.children[0].focused, "Frissítés után is a létező ikonnak jár vissza a fókusz.");
assert.ok(liveChecked.textContent.startsWith(refreshed.home.footer.checkedLabel));
const invalid = structuredClone(refreshed);
invalid.release = "2.22";
invalid.home.footer.notices[0].body = "";
globalThis.fetch = async () => ({ ok: true, json: async () => invalid });
assert.equal(await liveFooter.checkForUpdates(), false);
assert.equal(liveVersion.textContent, "Verzió: 2.23", "Hibás JSON nem írhatja felül az érvényes adatot.");
const duplicateGlyph = structuredClone(refreshed);
duplicateGlyph.home.footer.notices[1].glyph = duplicateGlyph.home.footer.notices[0].glyph;
globalThis.fetch = async () => ({ ok: true, json: async () => duplicateGlyph });
assert.equal(await liveFooter.checkForUpdates(), false,
  "Az ismétlődő betűjelet a frissítési ellenőrzés is utasítsa el.");
assert.deepEqual(liveNotices.children.map((n) => n.textContent), ["I", "D", "A", "M"]);
assert.equal(liveChecked.textContent, config.home.footer.errorLabel);
liveFooter.destroy();
globalThis.fetch = originalFetch;
delete window.location;
console.log("✓ Tájékoztatási oszlop: 4 betűikon és lebegő ablak, élő JSON-frissítés, legalsó verzió");

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
failMobilePair = true;
const pairRoot = new FakeNode("root");
const pairDispose = mobile.mount(pairRoot, config, "gate");
scan(pairRoot).find((node) => node.className === "gate-door-button").emit("click");
await new Promise((done) => setImmediate(done));
for (const instant of [0, config.gate.mobileDurationMs / 2]) {
  const next = queue.shift();
  assert.ok(next); next(instant);
}
const pairFrames = scan(pairRoot).filter((node) => node.tag === "img" && node.className.includes("gate-frame"));
assert.ok(pairFrames[13].style.opacity === "1" || pairFrames[16].style.opacity === "1",
  "Két hibás szomszédos fázist közvetlenül szomszédos érvényes kép helyettesítsen.");
assert.equal(pairFrames[0].style.opacity, "0",
  "Az animáció sérült szakasznál sem kezdődhet újra az első képpel.");
pairDispose();
queue.length = 0;
failMobilePair = false;
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
assert.match(mobileCss, /\.mobile-links-right\s*\{\s*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(block(desktopCss, ".desktop-toolbar"), /grid-template-columns:\s*minmax\(0,1fr\) 84px minmax\(0,1fr\);/);
assert.match(block(desktopCss, ".desktop-headline"), /display:flex;\s*justify-content:center;/);
assert.match(block(desktopCss, ".desktop-brand"), /align-items:center;\s*text-align:center;/);
assert.doesNotMatch(desktopCss, /\.desktop-primary-nav|\.desktop-primary-link/,
  "Az eltávolított navigációhoz tartozó CSS-t is ki kell venni.");
assert.match(block(mobileCss, ".mobile-overlay-backdrop, .mobile-menu-backdrop"),
  /backdrop-filter:blur\(12px\)/);
assert.match(block(desktopCss, ".desktop-search-backdrop"), /backdrop-filter:blur\(13px\)/);
assert.match(block(desktopCss, ".desktop-successes-grid"), /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,
  "Asztalon pontosan három sportsiker-oszlop kell.");
assert.match(block(mobileCss, ".mobile-successes-grid"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,
  "Telefonon két sportsiker-oszlop kell.");
assert.match(block(desktopCss, ".desktop-successes-overlay"), /position:fixed; inset:0; z-index:1800/);
assert.match(block(mobileCss, ".mobile-successes-overlay"), /position:fixed; inset:0; z-index:1800/);
assert.match(desktopCss, /\.desktop-successes-card-fallback[\s\S]*?linear-gradient/);
assert.match(mobileCss, /\.mobile-successes-card-fallback[\s\S]*?linear-gradient/);
assert.match(block(desktopCss, ".desktop-wheel-overlay"),
  /position:fixed; inset:0; z-index:1600;/);
assert.match(block(desktopCss, ".desktop-wheel-backdrop"),
  /backdrop-filter:blur\(20px\) saturate\(\.78\) brightness\(\.88\)/);
assert.match(desktopCss, /\.desktop-home\[data-hero-home="true"\]\[data-theme="light"\] :is\(\.desktop-wheel-overlay,\.desktop-search-overlay\)/,
  "A különálló menü és kereső világos módban is a fejléc palettáját használja.");
assert.match(block(mobileCss, ".mobile-search-overlay .mobile-overlay-backdrop"), /backdrop-filter:blur\(13px\)/);
assert.match(block(desktopCss, ".desktop-search-dialog"), /width:min\(1160px,100%\); height:min\(84dvh,790px\);/);
assert.match(block(desktopCss, ".desktop-search-dialog"), /var\(--surface\) 75%,transparent/);
assert.match(mobileCss, /\.mobile-search-dialog\s*\{\s*isolation:isolate; background:color-mix\(in srgb,var\(--surface\) 67%,transparent\)/);
assert.match(block(desktopCss, ".desktop-search-quick-list"), /display:flex; flex-wrap:wrap;/);
assert.match(block(mobileCss, ".mobile-search-quick-list"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(block(mobileCss, ".mobile-menu-overlay, .mobile-search-overlay"),
  /position:fixed;\s*inset:0;/);
assert.match(mobileCss, /\.mobile-menu-dialog, \.mobile-search-dialog\s*\{[\s\S]*?width:100%;\s*height:100%;/);
assert.match(block(mobileCss, ".mobile-compass-stage"), /height:420px;/);
assert.match(block(mobileCss, ".mobile-compass-arc-upper"), /top:31%/);
assert.match(block(mobileCss, ".mobile-compass-arc-lower"), /top:57%/);
assert.match(block(mobileCss, ".mobile-compass-sub-grid,.mobile-compass-third-grid"),
  /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(desktopCss, ".desktop-page-preview"), /text-align:center;/);
assert.match(block(desktopCss, ".desktop-page-list li"), /text-align:center;/);
assert.match(block(mobileCss, ".mobile-page-preview"), /text-align:center;/);
assert.match(block(mobileCss, ".mobile-page-list li"), /text-align:center;/);
assert.doesNotMatch(mobileCss, /mobile-compass-branch-view|mobile-compass-branch-list|mobile-menu-close/,
  "A régi, külön képernyős mobilalmenü CSS-e nem maradhat aktív.");
assert.doesNotMatch(mobileCss, /\.mobile-menu-level|\.mobile-menu-expand/,
  "Nem maradhat bent a korábbi mobilharmonika stílusa.");
assert.match(block(desktopCss, ".desktop-search-field"), /min-height:83px;/);
assert.match(block(mobileCss, ".mobile-search-field"), /min-height:72px;/);
assert.match(block(desktopCss, ".desktop-wheel-stage"), /min-width:640px;/);
assert.match(block(desktopCss, ".desktop-wheel-stage"), /aspect-ratio:1;/);
assert.match(block(desktopCss, ".desktop-wheel-dialog"), /border:0;\s*border-radius:0;\s*padding:0;/);
assert.match(block(desktopCss, ".desktop-wheel-dialog"), /background:transparent;/);
assert.match(block(desktopCss, ".desktop-wheel-backdrop"), /background:rgba\(3,15,29,\.36\)/);
assert.match(block(desktopCss, ".desktop-wheel-backdrop"), /backdrop-filter:blur\(20px\) saturate\(\.78\) brightness\(\.88\)/);
assert.match(block(baseCss, ".offline-screen"), /min-height:100dvh/);
assert.match(block(baseCss, ".offline-retry"), /min-height:52px/);
assert.match(block(desktopCss, ".desktop-wheel-stage"), /background:transparent;/);
assert.match(block(desktopCss, ".desktop-wheel-stage::before"),
  /width:58%;[^}]*border:2px solid color-mix\(in srgb,var\(--accent\) 80%,transparent\);/s,
  "A fő- és almenü gyűrűje közötti arany elválasztóvonal maradjon meg.");
assert.doesNotMatch(desktopCss, /\.desktop-wheel-guide-main|\.desktop-wheel-guide-sub/,
  "Nem maradhatnak a menü mögött díszítő körkeretek.");
assert.match(block(desktopCss, ".desktop-wheel-ring-main,.desktop-wheel-ring-sub"),
  /pointer-events:none;/,
  "A külső gyűrű teljes felülete nem takarhatja el a főmenüpontokat!");
assert.match(block(desktopCss, ".desktop-wheel-node"), /pointer-events:auto;/);
assert.match(block(desktopCss, ".desktop-wheel-sub-node:is(button,a)"), /pointer-events:auto;/);
assert.doesNotMatch(desktopCss + mobileCss, /settings-overlay|settings-dialog|settings-option/,
  "A régi beállítási felugró ablak stílusai nem maradhatnak meg.");
assert.match(block(mobileCss, ".mobile-edit-bar"), /position:fixed;/);
assert.match(block(desktopCss, ".desktop-edit-bar"), /position:fixed;/);
for (const [viewport, diameter] of [[768,640], [900,640], [1100,900], [1440,960]]) {
  const innerWidth = Math.max(96, Math.min(132, viewport * .11));
  const outerWidth = Math.max(110, Math.min(144, viewport * .12));
  const gap = diameter * (.40 - .18) - (innerWidth + outerWidth) / 2;
  assert.ok(gap >= 8, `${viewport}px: a külső és belső gyűrű elemei összeérnének.`);
  assert.ok(diameter * .40 + outerWidth / 2 < diameter * .5,
    `${viewport}px: a külső gyűrű kilógna a körfelületből.`);
  assert.ok(2 * diameter * .40 * Math.sin(Math.PI / 9) > outerWidth + 8,
    `${viewport}px: kilenc külső menüpont összeérne.`);
}
// A tényleges, kódban kiszámolt körpozíciókat egymással is összevetjük.
// A szöveg tördelése miatt a minimum CSS-magasságnál nagyobb, óvatos
// 78 és 88 pixeles téglalapokkal ellenőrzünk minden kiválasztható főágat.
for (const viewport of [768, 900, 1100, 1440]) {
  const diameter = Math.min(960, viewport - 100);
  const center = diameter / 2;
  const mainWidth = Math.max(96, Math.min(132, viewport * .11));
  const subWidth = Math.max(110, Math.min(144, viewport * .12));
  const roots = config.menu.items.map((item, i) => {
    const a = (-90 + i * 60) * Math.PI / 180;
    return { id: item.id, x: center + .18 * diameter * Math.cos(a),
      y: center + .18 * diameter * Math.sin(a), width: mainWidth, height: 78 };
  });
  for (const [index, item] of config.menu.items.entries()) {
    const count = item.children.length;
    const subs = item.children.map((child, i) => {
      const degrees = -90 + i * 360 / count;
      const a = degrees * Math.PI / 180;
      return { id: child.id, x: center + .40 * diameter * Math.cos(a),
        y: center + .40 * diameter * Math.sin(a), width: subWidth, height: 88 };
    });
    const nodes = [...roots, ...subs];
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const horizontal = Math.abs(a.x - b.x) < (a.width + b.width) / 2 + 4;
      const vertical = Math.abs(a.y - b.y) < (a.height + b.height) / 2 + 4;
      assert.ok(!(horizontal && vertical),
        `${viewport}px / ${item.label}: a(z) ${a.id} és ${b.id} gomb összeérne.`);
    }
  }
}
console.log("✓ Két asztali menügyűrű: minden ág és négy szélesség ütközésmentes, konzervatív szövegmagassággal");
// A telefonos íves főmenü gombjai 360 pixeltől 3×2, alatta 2×3
// elrendezésben állnak. A hosszabb címkék miatt 92 px-es magassággal
// és extra 5 px térközzel kell minden méreten elférniük.
for (const viewport of [280, 320, 359, 360, 375, 390, 430, 650, 767]) {
  const compact = viewport <= 359;
  const width = Math.min(480, viewport - 40);
  const height = compact ? 510 : 420;
  const buttonWidth = compact ? width * .44 : Math.max(90, Math.min(138, width * .26));
  const positions = compact
    ? [[.265,.42],[.735,.42],[.265,.62],[.735,.62],[.265,.82],[.735,.82]]
    : [[.165,.53],[.5,.60],[.835,.53],[.165,.79],[.5,.86],[.835,.79]];
  const rects = positions.map(([x,y], i) => ({ id:i+1, x:x*width, y:y*height }));
  for (const node of rects) {
    assert.ok(node.x - buttonWidth/2 >= 5 && node.x + buttonWidth/2 <= width - 5,
      `${viewport}px: a mobilos körmenü gombja kilógna oldalra.`);
    assert.ok(node.y - 46 >= 5 && node.y + 46 <= height - 5,
      `${viewport}px: a mobilos körmenü gombja kilógna függőlegesen.`);
  }
  for (let i = 0; i < rects.length; i++) for (let j = i+1; j < rects.length; j++) {
    const a=rects[i],b=rects[j];
    const horizontal = Math.abs(a.x-b.x) < buttonWidth + 5;
    const vertical = Math.abs(a.y-b.y) < 92 + 5;
    assert.ok(!(horizontal && vertical),
      `${viewport}px: a mobilos iránytű ${a.id}. és ${b.id}. pontja összeérne.`);
  }
}
console.log("✓ Mobilos iránytű: hat főpont kilenc szélességen ütközésmentes, közös felületen nyíló 2–3. szinttel");
assert.match(block(desktopCss, ".desktop-footer .footer-inner"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(desktopCss, ".desktop-footer .footer-inner"), /align-items:stretch;/);
assert.match(block(desktopCss, ".desktop-footer .footer-contact,.desktop-footer .footer-links"), /height:100%;/);
assert.match(block(mobileCss, ".mobile-footer .footer-inner"), /display:block;/);
assert.match(block(mobileCss, ".mobile-footer .footer-mobile-tabs"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(baseCss, ".footer-notices"), /display:grid; grid-auto-rows:minmax\(0,1fr\);/);
assert.match(block(desktopCss, ".desktop-footer .footer-notices"), /flex:0 0 32px; min-height:32px;/);
assert.match(block(desktopCss, ".desktop-footer .footer-notice-icon"), /min-height:32px;/);
assert.match(block(desktopCss, ".desktop-footer .footer-notices"), /grid-template-columns:repeat\(4,minmax\(0,1fr\)\);/);
assert.match(block(mobileCss, ".mobile-footer .footer-notices"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(mobileCss, ".mobile-footer .footer-notices"), /flex:0 0 56px; min-height:56px;/);
assert.match(block(mobileCss, ".mobile-footer .footer-notice-icon"), /min-height:26px;/);
assert.match(block(mobileCss, ".mobile-footer .footer-mobile-tab"), /min-height:25px;/);
assert.match(block(baseCss, ".footer-notice-icon"), /width:100%; height:100%;/);
for (const width of [280, 320, 375, 390, 430, 650, 767]) {
  const available = Math.min(650, width - 20) - 16;
  const buttonWidth = (available - 4) / 2;
  const buttonHeight = (66 - 4) / 2;
  assert.ok(buttonWidth >= 44 && buttonHeight >= 30,
    `${width}px mobilnézet: a 2×2 láblécgomb-rács érintési területe túl kicsi.`);
}
for (const width of [768, 1024, 1440, 1920]) {
  const footerPadding = Math.max(14, Math.min(42, width * .03));
  const panelGap = Math.max(6, Math.min(12, width * .01));
  const panelWidth = (Math.min(1120, width - 2 * footerPadding) - panelGap) / 2;
  const cardPadding = 10;
  const buttonGap = Math.max(4, Math.min(9, width * .007));
  const buttonWidth = (panelWidth - 2 * cardPadding - 3 * buttonGap) / 4;
  assert.ok(buttonWidth >= 44,
    `${width}px asztali nézet: a négy egyforma láblécgomb túl keskeny lenne.`);
}
assert.match(block(baseCss, ".footer-notice-modal"), /position:fixed; inset:0; z-index:3000;/);
assert.match(block(desktopCss, ".desktop-footer"), /padding:5px/);
assert.match(block(mobileCss, ".mobile-footer"), /padding:3px/);
assert.match(block(desktopCss, ".desktop-hero-track"), /height:160dvh; min-height:960px;/,
  "Az asztali kép továbbra is végiggörgethető és eltűnik a tényleges tartalom előtt.");
assert.doesNotMatch(desktopCss, /\.desktop-hero-continuation\s*\{/,
  "A korábbi üres kezdőlapi folytatás ne maradjon meg.");
assert.match(block(desktopCss, ".desktop-hero-crest"), /border:0;[^}]*background:transparent;/s,
  "A nyitókép közepén ne jelenjen meg a korábbi nagy kör alakú címérkeret.");
assert.match(block(desktopCss, ".desktop-hero-crest"), /width:clamp\(340px,34vw,444px\);/,
  "A középső címer legyen kétszer akkora, miközben görgetésre a felső címerhez zsugorodik.");
assert.match(block(desktopCss, ".desktop-hero-controls"), /bottom:0; left:0; right:0;/,
  "A hírsáv a nagy nyitókép alján legyen.");
assert.match(block(desktopCss, ".desktop-hero-story"), /display:grid;[^}]*width:100%;[^}]*border-top:2px/s,
  "Az alsó TV-szerű hírsáv teljes szélességű, kattintható felület legyen.");
assert.match(block(desktopCss, ".desktop-hero-story-title"), /white-space:nowrap;/);
assert.match(block(desktopCss, ".desktop-hero-story-eyebrow"), /white-space:nowrap;/);
assert.doesNotMatch(desktopCss, /\.desktop-hero-scroll\s*\{/,
  "Az asztali lefelé mutató nyílgombot valóban ki kell venni.");
assert.match(desktopCss, /\[data-theme="light"\] \.desktop-hero-shade/,
  "A világos témának az asztali nyitófotó megjelenését is módosítania kell.");
assert.match(mobileCss, /\.mobile-story-track\s*\{[^}]*position:sticky; top:0;[^}]*height:clamp\(132px,18dvh,152px\)/s,
  "A mobilos képes sáv legyen rövid és tapadjon felül a valódi tartalom görgetésekor.");
assert.doesNotMatch(mobileCss,/mobile-story-(bottom|state-count|steps|step|scroll-hint)/,
  "Az állapotszámláló és jelző ne maradjon a megjelenésben.");
assert.doesNotMatch(mobileCss,/height:calc\(158px \+ clamp\(/,
  "Nem maradhat fél képernyős láthatatlan görgetési pálya.");
assert.doesNotMatch(mobileCss,/\.mobile-home-preview\s*\{/,
  "A mobilos kezdőlapon se maradjon meg a korábbi tartalomfelsorolás.");
assert.match(mobileCss, /\.mobile-story-visual\[data-active="true"\]/,
  "A mobilos állapotok külön, áttűnő képréteget használjanak.");
assert.match(block(mobileCss, ".mobile-home"), /display:\s*flex;\s*flex-direction:\s*column;/);
assert.match(block(mobileCss, ".mobile-main"), /flex:\s*1 1 auto;/);
assert.match(block(desktopCss, ".desktop-main"), /flex:\s*1 1 auto;/);
assert.match(block(mobileCss, ".mobile-brand"), /margin:\s*0 auto 14px;/);
for (const width of [280, 320, 359, 375, 390, 430, 650, 767]) {
  const compact = width <= 369;
  const innerWidth = Math.min(650, width - (compact ? 14 : 20));
  const center = compact ? 54 : 58;
  const gap = compact ? 3 : 4;
  const side = (innerWidth - center - 2 * gap) / 2;
  const cell = compact ? side : (side - 2 * 3) / 3;
  assert.ok(cell >= 44, `${width}px: a hat ikon érintési célja túl keskeny lenne.`);
  assert.ok(Math.abs((side + gap + center / 2) - innerWidth / 2) < .01,
    `${width}px: a címer nem lenne középen.`);
}
console.log("✓ Fejlécgeometria: 8 mobil szélességen középre tett címer, szimmetrikus 3+3 gomb és lábléc-aljhoz igazítás");
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
let historyUrl = null;
globalThis.window = {
  location: { href:"https://example.test/index.html#/" },
  history: { state:null, replaceState:(_state,_title,url) => { historyUrl = String(url); } },
  scrollY:0, scrollTo:(options) => { window.scrollY = options.top; },
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
assert.equal(historyUrl, "https://example.test/index.html?v=2.22#/",
  "A kezdő URL kapjon kiadási verziót a későbbi cache-biztos újratöltéshez.");
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
location.hash = menuPageHref("school-introduction");
window.scrollY = 340;
windowEvents.get("hashchange")();
await nextTick();
assert.equal(documentRoot.dataset.route, "page");
assert.equal(window.scrollY, 0,
  "Menünavigáció után az új aloldal mindig a tetejéről induljon.");
assert.equal(applicationRoot.querySelector(".mobile-page-title").textContent, "Bemutatkozás");
assert.ok(applicationRoot.querySelector(".mobile-page-title").focused);
assert.ok(document.title.startsWith("Bemutatkozás"));
location.hash = config.routes.home;
windowEvents.get("hashchange")();
await nextTick();
assert.equal(documentRoot.dataset.route, "home");
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
console.log("✓ Teljes belépési pont: kapu → kezdőlap → aloldal, fókusz és mobil/asztali CSS-csere");

// A hibás vagy éppen elérhetetlen kezdő JSON nem hagyhat üres lapot.
// A tartalékoldal kézi és automatikusan kezdeményezett újrapróbálás után
// megőrzi az eredeti hash-útvonalat, amikor a valódi JSON ismét elérhető.
const offlineRoot = new FakeNode("root");
const offlineHead = new FakeNode("head");
const offlineAppend = offlineHead.append.bind(offlineHead);
offlineHead.append = (...children) => {
  offlineAppend(...children);
  for (const child of children) Promise.resolve().then(() => child.emit("load"));
};
const offlineDocumentRoot = { dataset:{}, style:{ setProperty:()=>{} } };
globalThis.document = {
  createElement:(tag) => new FakeNode(tag),
  createElementNS:(_ns,tag) => new FakeNode(tag),
  getElementById:(id) => id === "app" ? offlineRoot : null,
  querySelectorAll:(selector) => selector === "link[data-platform-style]"
    ? offlineHead.children.filter((node) => node.dataset.platformStyle) : [],
  head:offlineHead, documentElement:offlineDocumentRoot,
  body:new FakeNode("body"), title:""
};
const offlineEvents = new Map();
globalThis.window = {
  location:{href:"https://example.test/index.html#/oldal/school-introduction"},
  history:{state:null,replaceState:()=>{}},
  matchMedia:(query) => query.includes("prefers-reduced-motion")
    ? {matches:true}
    : query.includes("prefers-color-scheme")
      ? {matches:false,addEventListener:()=>{},removeEventListener:()=>{}}
      : {matches:true,addEventListener:()=>{}},
  addEventListener:(name,callback) => offlineEvents.set(name,callback)
};
location.hash = "#/oldal/school-introduction";
let offlineMode = "invalid";
globalThis.fetch = async () => ({ok:true,json:async()=>offlineMode === "invalid"
  ? {...config,schemaVersion:"not-valid"} : config});
const originalWarn = console.warn;
let offlineWarnings = 0;
console.warn = () => { offlineWarnings++; };
try {
  await import(new URL("../shared/js/entry.js?offline-test", import.meta.url));
  await nextTick();
  assert.equal(offlineDocumentRoot.dataset.route, "offline");
  assert.ok(scan(offlineRoot).some((node) => node.className === "offline-screen"));
  assert.ok(offlineWarnings >= 1);
  const manualRetry = scan(offlineRoot).find((node) => node.className === "offline-retry");
  assert.ok(manualRetry && !manualRetry.disabled);
  manualRetry.emit("click");
  await nextTick();
  assert.equal(offlineDocumentRoot.dataset.route, "offline",
    "A második hibás JSON se távolítsa el a tartalékoldalt.");
  offlineMode = "valid";
  offlineEvents.get("online")();
  await nextTick();
  await nextTick();
  assert.equal(offlineDocumentRoot.dataset.route, "page");
  assert.equal(location.hash, "#/oldal/school-introduction");
  assert.ok(scan(offlineRoot).some((node) => node.className === "mobile-page-title"));
  assert.equal(scan(offlineRoot).filter((node) => node.className === "offline-screen").length, 0);
  location.hash = config.routes.gate;
  offlineEvents.get("hashchange")();
  await nextTick(); // A korábbi oldal láblécének időzítőjét a kapu-mount leállítja.
} finally {
  console.warn = originalWarn;
}
console.log("✓ Hibás JSON → tartalék offline oldal → újrapróbálás → eredeti útvonal helyreáll");

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
        assert.equal(await page.locator("main").locator(":scope > *").count(), 2);
        const platform = width < 768 ? "mobile" : "desktop";
        if (platform === "desktop") {
          assert.equal(await page.locator(".desktop-hero-photo").count(), 1);
          assert.equal(await page.locator(".desktop-hero-count,.desktop-hero-pause").count(),0);
          assert.equal(await page.locator(".desktop-hero-story").evaluate((node) =>
            getComputedStyle(node).whiteSpace),"nowrap");
          await page.locator(".desktop-hero-arrow--next").click();
          await page.evaluate(() => window.scrollTo({
            top:document.querySelector(".desktop-hero-track").offsetHeight - innerHeight,
            behavior:"instant"
          }));
          await page.waitForFunction(() => document.querySelector(".desktop-home")?.dataset.heroCompact === "true");
          assert.equal(await page.locator(".desktop-crest-toggle").getAttribute("aria-hidden"), "false");
          assert.equal(await page.locator(".desktop-hero-scroll").count(), 0);
          await page.evaluate(() => window.scrollTo({
            top:document.querySelector(".desktop-hero-track").offsetHeight, behavior:"instant"
          }));
          await page.waitForFunction(() =>
            document.querySelector(".desktop-hero-track")?.getBoundingClientRect().bottom <= 1);
        } else {
          assert.equal(await page.locator(".mobile-story-photo").count(),6);
          assert.equal(await page.locator(".mobile-story-stage").getAttribute("data-story-mode"),"trio");
          assert.equal(await page.locator(".mobile-story-bottom,.mobile-story-state-count,.mobile-story-step").count(),0);
          assert.equal(await page.locator(".mobile-story-track").evaluate((node) =>
            getComputedStyle(node).position),"sticky");
        }
        await page.locator(`.${platform}-crest-toggle`).click();
        if (platform === "mobile") {
          assert.equal(await page.locator(".mobile-compass-node").count(), 6);
          await page.locator('.mobile-compass-node[data-sector="2"]').click();
          assert.equal(await page.locator('.mobile-compass-sub-section:not([hidden])').count(), 1);
          await page.locator('.mobile-compass-node[data-sector="2"]').click();
          assert.equal(await page.locator('.mobile-compass-sub-section:not([hidden])').count(), 0);
          await page.locator('.mobile-compass-node[data-sector="1"]').click();
          await page.locator('.mobile-compass-grid-target').first().click();
        } else {
          assert.equal(await page.locator(".desktop-wheel-node").count(), 6);
          await page.locator('.desktop-wheel-node').first().click();
          assert.equal(await page.locator('.desktop-wheel-sub-node').count(), 9);
          await page.locator('.desktop-wheel-node').first().click();
          assert.equal(await page.locator('.desktop-wheel-sub-node').count(), 0);
          await page.locator('.desktop-wheel-node').nth(1).click();
          assert.equal(await page.locator('.desktop-wheel-sub-node').count(), 7);
          await page.locator('.desktop-wheel-node').first().click();
          assert.equal(await page.locator('.desktop-wheel-sub-node').count(), 9);
          await page.locator('.desktop-wheel-sub-node').first().click();
        }
        await page.waitForURL(/#\/oldal\/school-introduction$/, { timeout:4000 });
        assert.equal(await page.locator(`.${platform}-page-title`).textContent(), "Bemutatkozás");
        assert.equal(await page.locator(`.${platform}-page-list > li`).count(), 3);
        if (platform === "mobile") await page.locator('.footer-mobile-tab[aria-controls="footer-mobile-info"]').click();
        await page.locator('.footer-notice-icon').first().click();
        assert.equal(await page.locator('.footer-notice-modal:not([hidden])').count(), 1);
        await page.locator('.footer-modal-close').click();
        await page.locator(`.${platform}-search-toggle`).click();
        const searchInput = page.locator(`.${platform}-search-input`);
        await searchInput.fill("Facebook");
        assert.equal(await page.locator(`.${platform}-search-result`).count(), 1);
        await page.locator(`.${platform}-search-clear`).click();
        assert.equal(await searchInput.inputValue(), "");
        await page.keyboard.press("Escape");
        await page.locator(`.${platform}-edit-toggle`).click();
        assert.equal(await page.locator(`.${platform}-edit-toggle`).textContent(), "✓");
        await page.locator(`.${platform}-edit-toggle`).click();
        await page.goto(`${url}#/`, { waitUntil: "networkidle" });
        await page.waitForSelector(".gate-door-button");
        await page.close();
        console.log(`✓ ${width}px: élő kapu, menü, Spotlight, szerkesztőkapcsoló`);
      }
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((done) => server.close(done));
  }
}
console.log("\nA kód- és viselkedéstesztek sikeresek; a böngészőteszt állapota fent látható.");
