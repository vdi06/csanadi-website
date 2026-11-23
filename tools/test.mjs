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
  "shared/js/gate.js", "shared/js/offline.js", "shared/js/shell.js", "shared/js/search-index.js", "shared/js/archive-data.js", "shared/js/appearance.js", "shared/js/successes-data.js",
  "shared/js/calendar-data.js", "shared/js/calendar-view.js", "shared/js/home-carousel.js",
  "shared/js/focus.js", "shared/js/modal.js", "shared/js/menu-data.js", "shared/js/edit-mode.js", "shared/js/footer.js", "shared/css/base.css",
  "shared/assets/media/logo/csanadi-crest-512.webp",
  "mobile/app.js", "mobile/header.js", "mobile/menu.js", "mobile/search.js", "mobile/page.js", "mobile/story.js", "mobile/successes.js", "mobile/calendar.js", "mobile/styles.css",
  "desktop/app.js", "desktop/header.js", "desktop/hero.js", "desktop/menu.js", "desktop/search.js", "desktop/page.js", "desktop/successes.js", "desktop/calendar.js", "desktop/styles.css",
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
assert.equal(config.schemaVersion, "2.30");
assert.equal(config.release, "2.33");
assert.equal(config.appearance.defaultMode, "auto");
assert.deepEqual(config.appearance.cycle, ["auto", "light", "dark"]);
assert.deepEqual(Object.keys(config.appearance.shortLabels).sort(), ["auto", "dark", "light"]);
assert.equal(config.appearance.glyphs.auto, "◐");
assert.equal(config.home.header.settingsGlyph, "⚙");
assert.equal(config.home.header.finishEditingGlyph, "✓");
assert.equal(config.home.header.searchResultGlyph, "↗");
assert.equal(config.menu.backGlyph, "‹");
assert.equal(config.menu.homeGlyph, "⌂");
assert.equal(config.home.footer.refreshSeconds, 10);
assert.equal(config.home.footer.pendingLabel, "Frissítés: {seconds} mp-enként");
const { schoolDisplayNames } = await import(new URL("../shared/js/dom.js",import.meta.url));
const schoolText = schoolDisplayNames(config.site.fullName);
assert.deepEqual(schoolText,{
  line1:"CSANÁDI ÁRPÁD SPORTISKOLA",
  line2:"ÁLTALÁNOS ISKOLA ÉS GIMNÁZIUM",
  caption:"CSANÁDI ÁRPÁD SPORTISKOLA, ÁLTALÁNOS ISKOLA ÉS GIMNÁZIUM"
});
assert.equal(schoolDisplayNames("Egy Másik Iskola, Új Tagozat").line2,"ÚJ TAGOZAT",
  "Az intézménynevet elegendő egyetlen JSON-mezőben módosítani.");
assert.ok(!Object.hasOwn(config.site,"gateCaption"));
assert.ok(!Object.hasOwn(config.home.header,"schoolLine1"));
assert.ok(!Object.hasOwn(config.home.header,"schoolLine2"));
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
assert.equal(config.home.sportSuccesses.items.length, 30,
  "A teljes JSON-ban harminc, dátum szerint válogatható sportsiker legyen.");
assert.equal(config.home.sportSuccesses.items.filter((item) => item.image).length, 6,
  "Hat képes, a többi fénykép nélküli sportsiker ellenőrzendő.");
const {checkedCalendar,calendarEntries,schoolMonths,eventsOnDay,eventById} =
  await import(new URL("../shared/js/calendar-data.js",import.meta.url));
const calendar = checkedCalendar(config);
const calendarEvents = calendarEntries(config);
const months = schoolMonths(calendar);
assert.equal(months.length,12);
assert.deepEqual([months[0],months[11]],["2026-09","2027-08"]);
assert.equal(calendarEvents.length,88);
assert.equal(calendar.undated.length,7);
assert.equal(new Set(calendarEvents.map((event) => event.id)).size,calendarEvents.length);
assert.equal(eventsOnDay(calendarEvents,"2026-11-17").length,3,
  "Egy napon a nyílt nap, érettségi és szülői tájékoztató egyszerre jelenjen meg.");
assert.ok(eventsOnDay(calendarEvents,"2026-12-25").some((event) => event.id === "teli-szunet"));
assert.ok(eventsOnDay(calendarEvents,"2027-05-27").some((event) => event.id === "sportnap"));
assert.ok(!eventsOnDay(calendarEvents,"2027-05-27").some((event) => event.id === "kompetenciameres"),
  "A hónapokon át tartó mérési időszak ne foglaljon le minden egyes naptári napot.");
assert.equal(eventById(config,"kazinczy-verseny").month,"2026-11");
assert.equal(calendarEvents.find((event) => event.id === "nyilt-nap-17").summary,
  config.publicNews.find((news) => news.id === "nyilt-napok-2026").summary,
  "A hírek és a naptár azonos tényei egyetlen közös JSON-adatból jöjjenek.");
const brokenCalendar = structuredClone(config);
brokenCalendar.home.calendar.events[0].date = "2027-02-30";
assert.throws(() => checkedCalendar(brokenCalendar),/Hibás naptári esemény/);
const duplicateCalendar = structuredClone(config);
duplicateCalendar.home.calendar.undated[0].id = "sportnap";
assert.throws(() => checkedCalendar(duplicateCalendar),/Hibás, pontosítandó/);
assert.deepEqual(config.home.sportSuccesses.items.filter((item) => item.image).map((item) => item.image).sort(),
  ["atletika.webp", "labdarugas.webp", "uszas.webp", "kosarlabda.webp",
    "roplabda.webp", "asztalitenisz.webp"].sort());
assert.equal(config.home.header.social.length, 3);
assert.ok(!Object.hasOwn(config.home, "navigation"), "A korábbi próbalinkeket végleg ki kell venni.");
assert.equal(config.menu.items.length, 6, "A hat főcsoportot a közös JSON tartalmazza.");
assert.deepEqual(config.menu.items.map(({ id, children }) => [id, children.length]), [
  ["school",9], ["education",8], ["admission",8], ["sports",8], ["news",8], ["information",8]
], "Mindegyik főmenünek legalább nyolc, önállóan megnyitható almenüt kell tartalmaznia.");
const { validateMenu, getMenuPage, menuPageHref } = await import(new URL("../shared/js/menu-data.js", import.meta.url));
const { checkedSportSuccesses, featuredSportSuccesses, archivedSportSuccesses } =
  await import(new URL("../shared/js/successes-data.js", import.meta.url));
const { archiveView, archiveOptions, readArchiveState, resetArchiveState, saveArchiveState } =
  await import(new URL("../shared/js/archive-data.js", import.meta.url));
const { searchSite, normalizeSearchText } = await import(new URL("../shared/js/search-index.js", import.meta.url));
assert.ok(searchSite(config,"Szalagavató").some((hit) =>
  hit.href === "#/kezdolap/esemeny/szalagavato"),"Az események külön keresőtalálatként nyíljanak meg.");
assert.ok(searchSite(config,"Kazinczy-verseny").some((hit) =>
  hit.href === "#/kezdolap/esemeny/kazinczy-verseny"),"A nap nélküli havi programhoz is vezethet keresés.");
assert.ok(searchSite(config,"Csanádi-nap").some((hit) =>
  hit.href === "#/kezdolap/esemeny/csanadi-nap"),"Ékezetes eseménykeresés");
const changedCalendarData = structuredClone(config);
changedCalendarData.home.calendar.events.find((event) => event.id === "sportnap").title = "Új sportversenynaptár";
assert.ok(searchSite(changedCalendarData,"Új sportversenynaptár").some((hit) =>
  hit.href === "#/kezdolap/esemeny/sportnap"),"A JSON eseménymódosítása automatikusan újraindexeljen.");
assert.ok(validateMenu(config));
assert.throws(() => validateMenu(brokenCalendar),/Hibás naptári esemény/,
  "A hibás naptári JSON-t már a teljes oldal betöltésekor utasítsuk el.");
assert.equal(normalizeSearchText("Árvíztűrő TÜKÖRFÚRÓGÉP"), "arvizturo tukorfurogep");
assert.equal(searchSite(config, "Nagy Lilla")[0].href,
  "#/kezdolap/sportsiker/atletika-nagy-lilla", "A diák nevére közvetlen részletes találat kell.");
assert.equal(searchSite(config, "Nagy Lillla")[0].label, "Nagy Lilla",
  "Egy-két betűs elírás esetén is találja meg a diákot.");
assert.ok(searchSite(config, "foci").some((item) => item.label === "Kiss Márton"),
  "A szinonimaszótárból a labdarúgás/foci egyezés is működjön.");
assert.ok(searchSite(config, "uszas").some((item) => item.label === "Szabó Nóra"),
  "Az ékezetek ne befolyásolják a név és sportág találatait.");
assert.ok(searchSite(config, "úszaz").some((item) => item.label === "Szabó Nóra"),
  "Sportágakban is működjön az elgépelés-tűrés.");
assert.ok(searchSite(config, "adatkezeles").some((item) =>
  item.href === "#/kezdolap/tajekoztatas/adatkezeles"),
  "A tájékoztatók teljes szövege is legyen kereshető és megnyitható.");
assert.ok(searchSite(config, "kíváncsiságból").some((item) => item.category ===
  config.home.search.categories.headline), "A húsz kiemelt képes hír tartalma is bekerüljön az indexbe.");
assert.ok(searchSite(config, "tantestület").some((item) => item.href === "#/oldal/school-staff"));
assert.ok(searchSite(config, "osztályozó vizsga").some((item) => item.href === "#/oldal/education-exams"),
  "A kártyák legmélyebb JSON-alpontjai is részt vegyenek a dinamikus keresésben.");
const changedSearchData = structuredClone(config);
changedSearchData.home.sportSuccesses.items[0].name = "Kovács Zelma";
assert.equal(searchSite(changedSearchData, "Zelma")[0].label, "Kovács Zelma",
  "Új JSON-név automatikusan jelenjen meg a keresőben, kézi találati lista nélkül.");
changedSearchData.menu.items[0].children.push({
  id:"school-new-lab", label:"Új csillagászati műhely"
});
changedSearchData.pagePreview.pages["school-new-lab"] = structuredClone(
  changedSearchData.pagePreview.pages["school-introduction"]);
changedSearchData.pagePreview.pages["school-new-lab"].intro = "Új csillagászati műhely.";
assert.ok(searchSite(changedSearchData, "csillagászati").some((item) =>
  item.href === "#/oldal/school-new-lab"),
  "A JSON-menübe később bekerülő új aloldal kézi keresőlista nélkül legyen elérhető.");
assert.ok(!searchSite(changedSearchData, "Nagy Lilla").some((item) => item.label === "Nagy Lilla"),
  "A régi név ne maradjon bent az új JSON-ból épített indexben.");
assert.equal(checkedSportSuccesses(config), config.home.sportSuccesses);
assert.equal(featuredSportSuccesses(config).length, 6);
assert.equal(archivedSportSuccesses(config).length, 24);
assert.equal(archiveView(config,{}).total, 24);
assert.equal(archiveView(config,{}).pageCount, 4);
assert.equal(archiveView(config,{}).visible.length, 6);
assert.equal(archiveOptions(config).years.length, 1);
assert.ok(archiveOptions(config).sports.includes("Röplabda"));
assert.equal(archiveView(config,{ query:"Nagy Lillla" }).visible[0].name,"Nagy Lilla",
  "A teljes archívkereső a hat kiemeltben is keressen elgépelés mellett.");
assert.equal(archiveView(config,{ sport:"Atlétika" }).visible[0].name,"Nagy Lilla");
assert.equal(archiveView(config,{ order:"oldest" }).visible[0].name,"Kiss Dániel");
assert.equal(archiveView(config,{ page:4 }).visible.length,6);
assert.equal(archiveView(config,{ query:"nemlétezősportolónév" }).total,0);
const multiYear = structuredClone(config);
multiYear.home.sportSuccesses.items.at(-1).date = "2025-04-17";
assert.equal(archiveOptions(multiYear).years.length,2);
assert.equal(archiveView(multiYear,{ year:"2025" }).total,1);
assert.equal(archiveView(config,{ year:"2025" }).state.year,"",
  "Az egyetlen rendelkezésre álló évben az érvénytelen évszűrő törlődjön.");
const invalidArchive = structuredClone(config);
delete invalidArchive.home.sportSuccesses.archiveUi;
assert.throws(() => checkedSportSuccesses(invalidArchive), /Érvénytelen archívumfeliratok/);
assert.deepEqual(featuredSportSuccesses(config).map((item) => item.date),
  [...featuredSportSuccesses(config).map((item) => item.date)].sort().reverse(),
  "A dátum szerinti legfrissebb hat jelenjen meg a kezdőlapon.");
assert.ok(featuredSportSuccesses(config).every((item) =>
  item.date >= archivedSportSuccesses(config)[0].date));
assert.ok(searchSite(config, "Balogh Dávid").some((item) =>
  item.href === "#/oldal/sports-results/sportsiker/kerekpar-balogh-david"),
  "Az archív sporteredmény is kereshető, de már az archív oldalra vezet.");
assert.ok(searchSite(config, "Sipos Anna").some((item) =>
  item.href === "#/oldal/sports-results/sportsiker/tajfutas-sipos-anna"),
  "A kiterjesztett archívum összes bejegyzése legyen kereshető.");
assert.ok(searchSite(config, "Sportiskolai nevelés").some((item) =>
  item.href === "#/oldal/education-sports"),
  "A menüből kivett, oldalon belülre szánt altémák is kereshetők maradjanak.");
const invalidSuccess = structuredClone(config);
invalidSuccess.home.sportSuccesses.items[0].image = "../path.webp";
assert.throws(() => checkedSportSuccesses(invalidSuccess), /Érvénytelen sportsiker/);
invalidSuccess.home.sportSuccesses.items[0].image = "atletika.webp";
invalidSuccess.home.sportSuccesses.items[1].id = invalidSuccess.home.sportSuccesses.items[0].id;
assert.throws(() => checkedSportSuccesses(invalidSuccess), /Érvénytelen sportsiker/);
assert.ok(config.home.desktopHero.slides.every((slide) => getMenuPage(config, slide.pageId)),
  "A képekhez kizárólag működő JSON-aloldalak kapcsolódhatnak.");
assert.equal(validateMenu(config), config.menu.items);
const badCard = structuredClone(config);
badCard.pagePreview.pages["school-introduction"].items[0].groups[0].points[0].details = [];
assert.throws(() => validateMenu(badCard), /tartalomkártya/,
  "A megjelenő kártyákból ne hiányozhassanak a legbelső részletek.");
const invalidNewsDate = structuredClone(config);
invalidNewsDate.publicNews[0].date = "2026-02-30";
assert.throws(() => validateMenu(invalidNewsDate), /nyilvános hírbejegyzés/,
  "Érvénytelen naptári dátum ne kerülhessen át több oldalra.");
const invalidNewsInterval = structuredClone(config);
invalidNewsInterval.publicNews[0].endDate = "2026-01-01";
assert.throws(() => validateMenu(invalidNewsInterval), /nyilvános hírbejegyzés/,
  "A hír lejárati dátuma nem előzheti meg a kezdődátumot.");
assert.equal(Object.keys(config.pagePreview.pages).length,49);
assert.equal(getMenuPage(config, "sports-results").title, "Diákjaink sporteredményei");
assert.equal(getMenuPage(config, "education-primary").items.length, 1);
assert.notDeepEqual(getMenuPage(config,"school-introduction").items,
  getMenuPage(config,"school-values").items, "A külön oldalak tartalma nem ismétlődhet.");
assert.equal(config.menu.items[1].children.at(-1).label,"Tehetséggondozás");
assert.ok(!JSON.stringify(config.pagePreview).toLocaleLowerCase("hu-HU").includes("szakkör"),
  "Nem kerülhet szakköri tartalom az iskolai oldalakra.");
assert.ok(config.pagePreview.pages["admission-process"].items.length !==
  config.pagePreview.pages["information-absence"].items.length,
  "A kártyák száma oldalspecifikus legyen.");
assert.equal(getMenuPage(config, "education-programs").title, "Iskolai képzések",
  "A képzések önálló aloldalt nyissanak, ne harmadik menüszintet.");
for (const root of config.menu.items) {
  for (const child of root.children) {
    assert.equal(getMenuPage(config, child.id)?.title, child.label,
      `A(z) ${child.id} almenü valós, JSON-címkéjű oldalra vezessen.`);
  }
}
assert.ok(config.menu.items.every((root) => root.children?.every((child) => !child.children)),
  "A menüben tilos a harmadik szint.");
assert.equal(menuPageHref("school-introduction"), "#/oldal/school-introduction");
assert.throws(() => menuPageHref("../"), /Érvénytelen/);
assert.equal(new Set(config.menu.items.map((item) => item.id)).size, 6);
const duplicateMenu = structuredClone(config);
duplicateMenu.menu.items[1].id = duplicateMenu.menu.items[0].id;
assert.throws(() => validateMenu(duplicateMenu), /ismétlődő menüazonosító/);
const deepMenu = structuredClone(config);
deepMenu.menu.items[1].children[0].children = [{ id: "too-deep", label: "Túl mély" }];
assert.throws(() => validateMenu(deepMenu), /almenüszint/);
const shortMenu = structuredClone(config);
shortMenu.menu.items[2].children.length = 7;
assert.throws(() => validateMenu(shortMenu), /almenüszint/,
  "A rövid, értelmetlenül üres almenüágak ne kerülhessenek éles JSON-ba.");
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
assert.match(html, /src="\.\/shared\/js\/entry\.js\?v=2\.33"/);
assert.match(html, /href="\.\/shared\/css\/base\.css\?v=2\.33"/);
assert.match(html, /name="color-scheme" content="light dark"/);
assert.match(html, /bootstrap@5\.3\.8\/dist\/css\/bootstrap\.min\.css" integrity="sha384-/);
assert.match(html, /bootstrap@5\.3\.8\/dist\/js\/bootstrap\.bundle\.min\.js" integrity="sha384-/);
assert.doesNotMatch(html, /<h[1-6]|<p[ >]|<nav|<article|<img/i);
const src = ["shared/js/entry.js", "shared/js/dom.js", "shared/js/gate.js", "shared/js/offline.js", "shared/js/shell.js",
  "shared/js/appearance.js", "mobile/app.js", "mobile/header.js", "desktop/app.js", "desktop/header.js",
  "desktop/menu.js", "mobile/menu.js", "desktop/search.js", "mobile/search.js",
  "shared/js/edit-mode.js", "shared/js/footer.js", "mobile/page.js", "desktop/page.js", "desktop/hero.js", "mobile/story.js"]
  .map((path) => readFileSync(join(root, path), "utf8"));
for (const source of src) assert.doesNotMatch(source, /innerHTML|eval\s*\(|fetch\([^)]*pages/i);
for (const source of [src[18],src[19]]) assert.doesNotMatch(source, /carousel|slideshow/i,
  "A kezdőlapi képsáv belső animációját a sportsikerek/naptár lapozójától külön kell tartani.");
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
      remove: (name) => { this.className = this.className.split(/\s+/).filter((value) => value !== name).join(" "); },
      contains: (name) => this.className.split(/\s+/).includes(name)
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
  emit(name, event = {}) { this.events.get(name)?.(event); }
  matches(selector) { return selector === ":hover" ? !!this.isHovered : false; }
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
const { isolateModal } = await import(new URL("../shared/js/modal.js", import.meta.url));
const modalTestHost = new FakeNode("div");
const modalTestBackground = new FakeNode("main");
const modalTestWrapper = new FakeNode("header");
const modalTestSibling = new FakeNode("nav");
const modalTestOverlay = new FakeNode("div");
modalTestSibling.inert = true;
modalTestWrapper.append(modalTestSibling, modalTestOverlay);
modalTestHost.append(modalTestBackground, modalTestWrapper);
const restoreModalTest = isolateModal(modalTestOverlay);
assert.equal(modalTestBackground.inert, true);
assert.equal(modalTestSibling.inert, true);
restoreModalTest(); restoreModalTest();
assert.equal(modalTestBackground.inert, false);
assert.equal(modalTestSibling.inert, true, "A korábban inaktív háttérelem állapota megmaradjon.");
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
  assert.equal(nodes.find((n) => n.tag === "h1").textContent, schoolText.caption);
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

  const originalCarouselInterval = globalThis.setInterval;
  let autoplayCallback = null;
  globalThis.setInterval = (callback,ms) => {
    if (ms === calendar.autoplayMs) autoplayCallback = callback;
    return originalCarouselInterval(callback,ms);
  };
  const homeDispose = app.mount(parent, config, "home");
  globalThis.setInterval = originalCarouselInterval;
  nodes = scan(parent);
  assert.equal(nodes.filter((n) => n.tag === "header").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "main").length, 1);
  assert.equal(nodes.filter((n) => n.tag === "footer").length, 1);
  const mainContent = nodes.find((n) => n.tag === "main");
  const skipLink = nodes.find((n) => n.className === "skip-to-content");
  assert.equal(skipLink.tag, "a");
  assert.equal(skipLink.textContent, config.home.header.skipLinkLabel);
  assert.equal(skipLink.attributes.href, "#content");
  let preventedSkipRoute = false;
  const routeBeforeSkip = location.hash;
  skipLink.emit("click", { preventDefault:() => { preventedSkipRoute = true; } });
  assert.ok(preventedSkipRoute && mainContent.focused && location.hash === routeBeforeSkip,
    "A billentyűzetes főtartalom-ugrás nem módosíthatja a hash útvonalat.");
  assert.equal(nodes.find((n) => n.tag === "main").children.length, 2,
    "A képes nyitó alatt egy közös, kétpaneles Carousel legyen.");
  const feature = nodes.find((n) => n.className === "carousel slide home-feature-carousel");
  assert.ok(feature,`${platform}: hiányzó Bootstrap Carousel`);
  const featureSlides = scan(feature).filter((node) => node.className.startsWith("carousel-item home-carousel-item"));
  const featureTabs = scan(feature).filter((node) => node.attributes.role === "tab");
  assert.equal(featureSlides.length,2);
  assert.equal(featureTabs.length,2);
  assert.ok(featureSlides[0].classList.contains("active"));
  assert.ok(!featureSlides[1].classList.contains("active"));
  assert.equal(featureSlides[1].attributes["aria-hidden"],"true");
  assert.equal(featureSlides[1].inert,true);
  assert.ok(autoplayCallback,`${platform}: hiányzó automatikus váltó időzítő`);
  autoplayCallback();
  assert.ok(featureSlides[1].classList.contains("active"),`${platform}: az automatikus Carousel nem vált`);
  autoplayCallback();
  assert.ok(featureSlides[0].classList.contains("active"));
  featureTabs[1].emit("click");
  assert.ok(featureSlides[1].classList.contains("active"),`${platform}: kézzel nem váltható a naptár`);
  assert.ok(!featureSlides[0].classList.contains("active"));
  assert.equal(featureTabs[1].attributes["aria-selected"],"true");
  featureTabs[0].emit("click");
  assert.ok(featureSlides[0].classList.contains("active"));
  const monthCards = scan(featureSlides[1]).filter((node) =>
    node.className === `school-month school-month--${platform}`);
  assert.equal(monthCards.length,platform === "desktop" ? 12 : 1);
  const firstMarkedDay = scan(monthCards[0]).find((node) => node.className === "school-day has-events");
  assert.ok(firstMarkedDay,`${platform}: az eseményes napok nem különülnek el`);
  const detail = scan(monthCards[0]).find((node) => node.className === "school-day-detail");
  firstMarkedDay.emit("click");
  assert.equal(detail.hidden,false,`${platform}: esemény részlete kattintásra`);
  assert.equal(firstMarkedDay.attributes["aria-expanded"],"true");
  firstMarkedDay.emit("click");
  assert.equal(detail.hidden,true,`${platform}: ismételt koppintás bezár`);
  if (platform === "desktop") {
    firstMarkedDay.isHovered = true;
    firstMarkedDay.emit("mouseenter");
    assert.equal(detail.hidden,false,"Asztali egér-rámutatásra nyíljon ki a nap.");
    firstMarkedDay.emit("click");
    assert.equal(detail.hidden,true,"Asztalon rámutatás közben is zárjon az ismételt kattintás.");
    firstMarkedDay.emit("mouseenter");
    firstMarkedDay.isHovered = false;
    firstMarkedDay.emit("mouseleave");
    assert.equal(detail.hidden,true,"Az egér levétele zárja be a részleteket.");
  } else {
    const monthSelect = scan(featureSlides[1]).find((node) => node.className === "mobile-month-select");
    assert.equal(monthSelect.children.length,12,"A teljes tanév minden hónapja elérhető legyen.");
    monthSelect.value = "11";
    monthSelect.emit("change");
    assert.ok(scan(featureSlides[1]).some((node) => node.textContent === "2027. augusztus"));
  }
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
    assert.equal(storyStage.querySelector(".mobile-story-title").textContent,
      config.home.mobileStory.introTitle);
    assert.notEqual(config.home.mobileStory.introTitle, config.home.mobileStory.outroTitle,
      "A mobilos nyitó és záró felirat ne legyen azonos.");
    assert.notEqual(config.home.mobileStory.introTitle, config.home.header.motto,
      "A mobilos képsáv ne ismételje meg a fejléc mottóját.");
    assert.notEqual(config.home.mobileStory.outroTitle, config.home.header.motto);
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
      "carousel slide home-feature-carousel", "A mobilos képsávot közvetlenül a Carousel kövesse.");
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
  const recentSuccesses = featuredSportSuccesses(config);
  const photoIndex = recentSuccesses.findIndex((item) => item.image);
  const fallbackIndex = recentSuccesses.findIndex((item) => !item.image);
  assert.ok(photoIndex >= 0 && fallbackIndex >= 0);
  for (const [index, card] of successCards.entries()) {
    assert.equal(card.attributes["aria-expanded"], "false");
    assert.ok(scan(card).some((n) => n.textContent === recentSuccesses[index].name));
    assert.ok(scan(card).some((n) => n.textContent === recentSuccesses[index].result));
  }
  successCards[photoIndex].emit("click");
  assert.equal(successOverlay.hidden, false);
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(successCards[photoIndex].attributes["aria-expanded"], "true");
  assert.equal(successDetailName.textContent, recentSuccesses[photoIndex].name);
  assert.equal(successDetailImage.hidden, false);
  assert.equal(successDetailFallback.hidden, true);
  assert.ok(successClose.focused);
  successClose.emit("click");
  assert.equal(successOverlay.hidden, true);
  assert.equal(document.body.style.overflow, "");
  assert.ok(successCards[photoIndex].focused, "Bezárás után a kiválasztott kártyára kerüljön vissza a fókusz.");
  successCards[fallbackIndex].emit("click");
  assert.equal(successOverlay.hidden, false);
  assert.equal(successDetailImage.hidden, true);
  assert.equal(successDetailFallback.hidden, false);
  assert.equal(successDetailName.textContent, recentSuccesses[fallbackIndex].name);
  successDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
  assert.equal(successOverlay.hidden, true);
  successCards[5].emit("click");
  successBackdrop.emit("click");
  assert.equal(successOverlay.hidden, true);
  // A képbetöltés hibája sem hagyhat törött kártyát a rácsban.
  const firstPhoto = scan(successCards[photoIndex]).find((n) => n.className === `${platform}-successes-card-image`);
  const firstFallback = scan(successCards[photoIndex]).find((n) => n.className === `${platform}-successes-card-fallback`);
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
  assert.equal(scan(footer).some((n) => n.className === "footer-signature"), false,
    "A már fejlécben olvasható mottót ne ismételje meg a lábléc.");
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
    infoTab.emit("keydown", { key:"Home", preventDefault:()=>{} });
    assert.equal(contactTab.attributes["aria-selected"], "true");
    contactTab.emit("keydown", { key:"End", preventDefault:()=>{} });
    assert.equal(infoTab.attributes["aria-selected"], "true");
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
  assert.equal(footer.querySelector(".footer-inner").inert, true);
  assert.equal(scan(modalDialog).find((n) => n.className === "footer-modal-title").textContent, "Impresszum");
  assert.equal(document.body.style.overflow, "hidden");
  modalDialog.emit("keydown", { key:"Escape", preventDefault:()=>{} });
  assert.equal(noticeModal.hidden, true);
  assert.equal(footer.querySelector(".footer-inner").inert, false);
  assert.equal(document.body.style.overflow, "");
  assert.ok(noticeRows[0].focused, "Bezárás után a betűikon kapja vissza a fókuszt.");
  noticeRows[3].emit("click");
  assert.equal(scan(modalDialog).find((n) => n.className === "footer-modal-title").textContent,
    "Működés");
  scan(footer).find((n) => n.className === "footer-modal-backdrop").emit("click");
  assert.ok(noticeModal.hidden);
  assert.ok(scan(informationColumn).some((n) => n.textContent ===
    `${config.home.footer.updatedLabel}: 2026. 11. 23.`));
  assert.ok(scan(informationColumn).some((n) => n.textContent ===
    config.home.footer.pendingLabel.replace("{seconds}",String(config.home.footer.refreshSeconds))));
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
    assert.equal(scan(hero).filter((n) => n.className === "desktop-hero-accessible-title").length, 1,
      "A kezdőlap szemantikusan megőrzi a címet, de nem sokszorozza a képen.");
    assert.equal(scan(hero).some((n) => ["desktop-hero-identity", "desktop-hero-message",
      "desktop-hero-wordmark", "desktop-hero-wordmark-sub"].includes(n.className)), false,
      "Az iskola neve és mottója ne ismétlődjön több rétegben a fotón.");
    assert.equal(hero.querySelector(".desktop-hero-after").children.length, 0,
      "A görgetés után előtűnő rétegben se szerepeljen még egyszer az iskolanév.");
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
    window.scrollY = 270;
    for (const callback of heroWindowEvents.get("scroll")) callback();
    queue.shift()?.(0);
    assert.equal(crestToggle.attributes.tabindex, "-1",
      "Félúton a címer még ne ugorjon a fejlécbe.");
    const stage = hero.querySelector(".desktop-hero-stage");
    const midpointMove = Number.parseFloat(stage.style["--hero-crest-y"]);
    assert.ok(midpointMove < 0 && Math.abs(midpointMove) < 120,
      "A címer az első félúton csak lassan induljon fölfelé.");
    assert.equal(hero.children[0].className,"desktop-hero-image",
      "A fotó az egész nyitószakasznak legyen háttere, ne a ragadós címerrel tűnjön el.");
    assert.equal(stage.style["--hero-image-opacity"], undefined,
      "A fotó a menübe érkezéskor sem halványodhat el.");
    window.scrollY = 550;
    for (const callback of heroWindowEvents.get("scroll")) callback();
    queue.shift()?.(0);
    assert.equal(crestToggle.attributes.tabindex, "0",
      "A felső címer csak a ragadós görgetés végén jelenhet meg.");
    assert.equal(crestToggle.attributes["aria-hidden"], "false");
    assert.equal(stage.style["--hero-clip-radius"], undefined,
      "A képnek végig láthatónak kell maradnia, nem zsugorodhat a címer méretére.");
    assert.ok(Number.parseFloat(stage.style["--hero-crest-opacity"]) < .01,
      "A középső címer akkor tűnjön el, amikor a fejlécben már megjelenik.");
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
    assert.ok(!scan(menuDialog).some((n) => n.className.startsWith("mobile-compass-third")),
      "Mobilon sem lehet harmadik menüszint.");
    const centerButton = scan(menuDialog).find((n) => n.className === "mobile-compass-center");
    const homeLink = scan(menuDialog).find((n) => n.className === "mobile-compass-home");
    assert.equal(rootButtons.length, config.menu.items.length);
    assert.deepEqual(rootButtons.map((n) => n.dataset.sector), ["1","2","3","4","5","6"]);
    assert.ok(subSection.hidden);
    assert.equal(centerButton.tagName, "BUTTON", "Mobilon is a középső címer zárja a menüt.");
    assert.equal(homeLink.attributes.href, config.routes.home);
    assert.equal(scan(menuDialog).filter((n) => n.className === "mobile-menu-close").length, 0);
    rootButtons[0].emit("click");
    assert.equal(rootButtons[0].attributes["aria-expanded"], "true");
    assert.equal(subSection.hidden, false);
    assert.equal(subGrid.children.length, config.menu.items[0].children.length);
    assert.equal(subGrid.children[0].attributes.href, menuPageHref("school-introduction"));
    rootButtons[0].emit("click");
    assert.ok(subSection.hidden,
      "Az aktív mobil főmenü második kattintásra becsukódjon.");
    rootButtons[1].emit("click");
    assert.equal(subGrid.children.length, config.menu.items[1].children.length);
    assert.equal(subGrid.children[0].tagName, "A");
    assert.equal(subGrid.children[0].attributes.href, menuPageHref("education-programs"),
      "A Képzéseink közvetlen aloldalra vezessen, ne újabb almenüt nyisson.");
    rootButtons[2].emit("click");
    assert.equal(subGrid.children.length, config.menu.items[2].children.length);
    assert.equal(rootButtons[1].attributes["aria-expanded"], "false");
    assert.equal(rootButtons[2].attributes["aria-expanded"], "true");
    centerButton.emit("click");
    assert.equal(menuOverlay.hidden, true);
    crestToggle.emit("click");
    assert.ok(subSection.hidden);
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
    assert.equal(outer.children[0].tagName, "A");
    assert.equal(outer.children[0].attributes.href, menuPageHref("education-programs"));
    assert.equal(scan(menuDialog).some((node) =>
      node.className.includes("third") || node.className.includes("level-three")), false,
      "Asztalon a második menügyűrűből már ne nyíljon harmadik.");
    wheelNodes[3].emit("click");
    assert.equal(outer.children.length, config.menu.items[3].children.length);
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
  const backgroundNode = platform === "desktop" ? homeNode.querySelector(".desktop-header")
    : homeNode.querySelector(".mobile-brand");
  assert.equal(backgroundNode.inert, true,
    "Nyitott keresőnél a háttér ne legyen billentyűzettel elérhető.");
  assert.equal(scan(searchDialog).find((n) => n.className === `${platform}-search-eyebrow`).textContent,
    config.home.header.searchEyebrow);
  const searchInput = searchDialog.querySelector("input");
  assert.ok(searchInput.focused);
  assert.equal(searchInput.attributes.maxlength, "120");
  const searchCount = scan(searchDialog).find((n) => n.className === `${platform}-search-count`);
  const clearButton = scan(searchDialog).find((n) => n.className === `${platform}-search-clear`);
  const quickList = scan(searchDialog).find((n) => n.className === `${platform}-search-quick-list`);
  const resultsHeading = scan(searchDialog).find((n) => n.className === `${platform}-search-results-title`);
  assert.equal(quickList.children.length, 4, "Csak négy valódi elérhetőség szerepelhet a gyorsválasztóban.");
  assert.equal(resultsHeading.textContent, config.home.header.searchFeaturedTitle);
  assert.equal(clearButton.hidden, true);
  assert.equal(searchCount.textContent, `4 ${config.home.header.searchResultCountLabel}`);
  searchInput.value = "nemletezo-kereso-kifejezes-7391";
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
  assert.ok(resultList.children.length >= 1);
  const kretaResult = resultList.children.find((node) =>
    node.children[1]?.children[1]?.textContent === config.home.header.social[2].label);
  assert.ok(kretaResult, "A KRÉTA gyorselérhetőség keresse a valódi külső hivatkozást.");
  assert.equal(kretaResult.children[1].children[2].textContent,
    config.home.header.social[2].searchSummary);
  let arrowDownPrevented = false;
  searchInput.emit("keydown", { key:"ArrowDown", preventDefault:() => { arrowDownPrevented = true; } });
  assert.equal(arrowDownPrevented, true);
  assert.ok(resultList.children[0].focused, "A lefelé nyíl fókuszt adjon az első találatnak.");
  searchInput.value = "Facebook";
  searchInput.emit("input");
  assert.equal(resultList.children[0].attributes.target, "_blank");
  assert.equal(resultList.children[0].children[2].textContent, config.home.header.searchResultGlyph);
  searchInput.value = "Nagy Lillla";
  searchInput.emit("input");
  assert.equal(resultList.children[0].children[1].children[1].textContent, "Nagy Lilla",
    `${platform}: a kereső a valódi sportsiker-nevet elírással is megtalálja.`);
  assert.equal(resultList.children[0].attributes.href, "#/kezdolap/sportsiker/atletika-nagy-lilla");
  searchInput.value = "foci";
  searchInput.emit("input");
  assert.ok(resultList.children.some((node) =>
    node.children[1]?.children[1]?.textContent === "Kiss Márton"),
    `${platform}: a szinonimával keresett sporteredmény hiányzik.`);
  searchInput.value = "tájékoztatás";
  searchInput.emit("input");
  assert.ok(resultList.children.some((node) =>
    node.attributes.href === "#/kezdolap/tajekoztatas/hasznalat"),
    `${platform}: a tájékoztató tartalmak nem találhatók.`);
  searchDialog.emit("keydown", { key: "Escape", preventDefault: () => {} });
  assert.equal(searchOverlay.hidden, true);
  assert.equal(document.body.style.overflow, "");
  assert.equal(backgroundNode.inert, false,
    "A párbeszédablak bezárása után a háttér ismét használható.");
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
  const leafDispose = app.mount(parent, config, "page:school-introduction");
  const leafNodes = scan(parent);
  assert.equal(leafNodes.find((n) => n.className === `${platform}-page-title`).textContent,
    "Bemutatkozás", "A menüvégpont valódi, külön renderelt oldalt kapjon.");
  const previewCards = leafNodes.find((n) => n.className === `${platform}-page-cards row`);
  const initialCards = getMenuPage(config,"school-introduction").items;
  assert.equal(previewCards.children.length, initialCards.length,
    "Minden oldal a saját, változó számú JSON-tartalomkártyáját kapja.");
  assert.ok(previewCards.children.every((node) => node.className.includes(" card")));
  assert.deepEqual(leafNodes.filter((n) => n.className === `${platform}-page-card-title card-title`)
    .map((n) => n.textContent), initialCards.map((card) => card.title));
  const expectedGroups = initialCards.reduce((n,card) => n + card.groups.length,0);
  const expectedPoints = initialCards.reduce((n,card) =>
    n + card.groups.reduce((sum,group) => sum+group.points.length,0),0);
  assert.equal(leafNodes.filter((n) => n.className === `${platform}-page-card-group`).length,
    expectedGroups);
  assert.equal(leafNodes.filter((n) => n.className === `${platform}-page-card-point`).length,
    expectedPoints);
  assert.equal(leafNodes.filter((n) => n.className === `${platform}-page-card-details`).length,
    expectedPoints,
    "Mindegyik alpont alatt egy újabb, valódi részletező lista szerepeljen.");
  assert.equal(leafNodes.filter((n) => n.tag === "h1").length, 1);
  leafDispose();
  resetArchiveState();
  const archiveDispose = app.mount(parent, config, "page:sports-results");
  const archiveNodes = scan(parent);
  assert.equal(archiveNodes.find((n) => n.className === `${platform}-page-title`).textContent,
    config.home.sportSuccesses.archiveTitle);
  const archiveGrid = archiveNodes.find((n) => n.className === `${platform}-successes-grid`);
  assert.equal(archiveGrid.children.length, 6, "Az archívumon egyszerre csak hat eredmény látszódjon.");
  assert.equal(archiveNodes.filter((n) => n.className?.includes(`${platform}-page-card card`)).length,
    getMenuPage(config,"sports-results").items.length,
    "A sportsiker-archívum mellől sem hiányozhat a 49. oldalak egyikének egyedi tartalma.");
  assert.equal(scan(archiveGrid).filter((node) => node.className === `${platform}-archive-card-date`).length,6);
  const pager = archiveNodes.find((n) => n.className === `${platform}-archive-pagination`);
  assert.ok(pager && !pager.hidden);
  if (platform === "mobile") {
    const filters = archiveNodes.find((n) => n.className === "mobile-archive-fields");
    const toggle = archiveNodes.find((n) => n.className === "mobile-archive-toggle");
    assert.equal(filters.hidden,true);
    toggle.emit("click");
    assert.equal(filters.hidden,false);
    assert.equal(toggle.attributes["aria-expanded"],"true");
  }
  const archiveSearchInput = archiveNodes.find((n) => n.className === `${platform}-archive-search`);
  archiveSearchInput.value = "Nagy Lillla";
  archiveSearchInput.emit("input");
  assert.equal(archiveGrid.children.length,1);
  assert.ok(scan(archiveGrid).some((node) => node.className === `${platform}-successes-card-name` &&
    node.textContent === "Nagy Lilla"));
  assert.ok(scan(archiveGrid).some((node) => node.className === `${platform}-archive-featured` && !node.hidden),
    "A kiemelt találat az archívum saját rácsában külön jelzést kapjon.");
  const searchCard = archiveGrid.children[0];
  searchCard.emit("click");
  assert.equal(archiveNodes.find((n) => n.className.startsWith(`${platform}-successes-overlay`)).hidden,false);
  archiveNodes.find((n) => n.className === `${platform}-successes-close`).emit("click");
  archiveSearchInput.value = ""; archiveSearchInput.emit("input");
  assert.equal(archiveGrid.children.length,6);
  const firstArchiveCard = archiveGrid.children[0];
  firstArchiveCard.emit("click");
  const archivePrevious = archiveNodes.find((n) => n.className === `${platform}-archive-detail-button`);
  const archiveDetailButtons = archiveNodes.filter((n) => n.className === `${platform}-archive-detail-button`);
  assert.ok(archivePrevious.disabled);
  assert.equal(archiveDetailButtons[1].disabled,false);
  archiveDetailButtons[1].emit("click");
  assert.equal(archiveNodes.find((n) => n.className === `${platform}-successes-detail-name`).textContent,
    "Molnár Emma", "A modalon belüli léptetés csak az aktuális hatos oldalon működjön.");
  archiveNodes.find((n) => n.className === `${platform}-successes-close`).emit("click");
  assert.ok(firstArchiveCard.focused,"A navigáció után is az eredetileg megnyitott kártyára térjen vissza a fókusz.");
  archiveSearchInput.value = "nemlétezősportolónév"; archiveSearchInput.emit("input");
  assert.ok(scan(archiveGrid).some((n) => n.className === `${platform}-archive-empty`));
  scan(archiveGrid).find((n) => n.tag === "button").emit("click");
  assert.equal(archiveGrid.children.length,6);
  const archiveOrderSelect = archiveNodes.find((n) => n.tag === "select" && n.children.some((option) =>
    option.textContent === config.home.sportSuccesses.archiveUi.oldest));
  archiveOrderSelect.value = "oldest"; archiveOrderSelect.emit("change");
  assert.ok(scan(archiveGrid).some((n) => n.textContent === "Kiss Dániel"),
    "A legrégebbi eredmény kerüljön előre a rendezés megfordításakor.");
  archiveOrderSelect.value = "newest"; archiveOrderSelect.emit("change");
  const pagerNext = scan(pager).find((node) => node.className === `${platform}-archive-page` &&
    node.attributes["aria-label"] === config.home.sportSuccesses.archiveUi.nextPage);
  pagerNext.emit("click");
  assert.ok(scan(archiveGrid).some((node) => node.textContent === "Sipos Anna"),
    "A második oldal a következő hat eredményt mutassa.");
  const savedPage = archiveView(config,saveArchiveState({ query:"",sport:"",year:"",order:"newest",page:2 }));
  assert.equal(savedPage.state.page,2);
  assert.ok(!archiveGrid.children.some((card) => scan(card).some((node) =>
    node.className === `${platform}-successes-card-name` && node.textContent === "Nagy Lilla")),
  "Az archívum ne ismételje meg a kezdőlapon kiemelt hat nevet.");
  archiveDispose();
  const returnedDispose = app.mount(parent,config,"page:sports-results");
  const returnedGrid = scan(parent).find((n) => n.className === `${platform}-successes-grid`);
  assert.ok(scan(returnedGrid).some((n) => n.textContent === "Sipos Anna"),
    "Az archívumba visszatérve maradjon meg a második oldal.");
  returnedDispose();
  saveArchiveState({ query:"Nagy Lillla",sport:"",year:"",order:"oldest",page:1 });
  location.hash = "#/oldal/sports-results/sportsiker/kerekpar-balogh-david";
  const archiveDetailDispose = app.mount(parent, config, "page:sports-results");
  const archiveDetail = scan(parent).find((n) => n.className.startsWith(`${platform}-successes-overlay`));
  assert.equal(archiveDetail.hidden, false);
  assert.equal(scan(archiveDetail).find((n) => n.className === `${platform}-successes-detail-name`).textContent,
    "Balogh Dávid");
  assert.deepEqual(readArchiveState(),
    { query:"Nagy Lillla",sport:"",year:"",order:"oldest",page:1 },
    "A közvetlen archív találat nem írhatja felül a megőrzött szűrőket.");
  scan(archiveDetail).find((n) => n.className === `${platform}-successes-close`).emit("click");
  assert.equal(location.hash, "#/oldal/sports-results");
  archiveDetailDispose();
  resetArchiveState();
  location.hash = "#/kezdolap/sportsiker/atletika-nagy-lilla";
  const detailDispose = app.mount(parent, config, "home");
  const detailOverlay = scan(parent).find((n) => n.className === `${platform}-successes-overlay`);
  assert.equal(detailOverlay.hidden, false,
    `${platform}: a kereső linkjének közvetlenül a megfelelő sportsiker-ablakot kell megnyitnia.`);
  assert.equal(scan(detailOverlay).find((n) => n.className === `${platform}-successes-detail-name`).textContent,
    "Nagy Lilla");
  scan(detailOverlay).find((n) => n.className === `${platform}-successes-close`).emit("click");
  assert.equal(location.hash, config.routes.home,
    `${platform}: a részletező bezárása állítsa vissza a kezdőlap URL-jét.`);
  detailDispose();

  location.hash = "#/kezdolap/tajekoztatas/adatkezeles";
  const noticeDispose = app.mount(parent, config, "home");
  const deepNoticeModal = scan(parent).find((n) => n.className === "footer-notice-modal");
  assert.equal(deepNoticeModal.hidden, false,
    `${platform}: a keresőből nyitható legyen a tájékoztatási szöveg.`);
  assert.equal(scan(deepNoticeModal).find((n) => n.className === "footer-modal-title").textContent,
    "Adatkezelési tájékoztató");
  scan(deepNoticeModal).find((n) => n.className === "footer-modal-close").emit("click");
  assert.equal(location.hash, config.routes.home);
  noticeDispose();
  console.log(`✓ ${platform}: saját fejléc, külön kereső, automatikus/világos/sötét téma és lábléc`);
}

// A lábléc 10 másodperces JSON-figyelése önállóan is tesztelhető:
// láthatatlan lapon nem kérdez le, érvényes adatot átvesz, hibásat visszautasít.
const { makeFooter } = await import(new URL("../shared/js/footer.js", import.meta.url));
const originalSetInterval = globalThis.setInterval;
let footerIntervalMs = null;
globalThis.setInterval = (callback, ms) => {
  footerIntervalMs = ms;
  return originalSetInterval(callback, ms);
};
const liveFooter = makeFooter(config, "desktop");
globalThis.setInterval = originalSetInterval;
assert.equal(footerIntervalMs, 10000, "A tényleges frissítésellenőrzés is 10 másodpercenként történjen.");
const liveVersion = scan(liveFooter.footer).find((node) => node.className === "footer-version");
const liveNotices = scan(liveFooter.footer).find((node) => node.className === "footer-notices");
const liveUpdated = scan(liveFooter.footer).find((node) => node.className === "footer-updated");
const liveChecked = scan(liveFooter.footer).find((node) => node.className === "footer-checked");
assert.equal(liveChecked.textContent, "Frissítés: 10 mp-enként");
const liveModal = scan(liveFooter.footer).find((node) => node.className === "footer-notice-modal");
const liveModalText = scan(liveFooter.footer).find((node) => node.className === "footer-modal-content");
liveNotices.children[0].emit("click");
assert.equal(liveModal.hidden, false);
const refreshed = structuredClone(config);
refreshed.release = "2.34";
refreshed.home.footer.updatedAt = "2026-11-23";
refreshed.home.footer.notices[0].body = "Ellenőrzött, módosított impresszum-adatok.";
const originalFetch = globalThis.fetch;
let requests = 0;
let replacementUrl = null;
window.location = { href:"https://example.test/index.html?v=2.30#/kezdolap",
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
assert.equal(liveVersion.textContent, "Verzió: 2.34");
assert.equal(liveUpdated.textContent, "Utolsó frissítés: 2026. 11. 23.");
assert.equal(liveModalText.textContent, "Ellenőrzött, módosított impresszum-adatok.");
assert.equal(liveModal.hidden, false, "A megnyitott tájékoztató maradjon meg adatfrissítéskor.");
assert.equal(replacementUrl, "https://example.test/index.html?v=2.34#/kezdolap",
  "Új kiadáskor az egész alkalmazás új verziókulccsal töltődjön újra.");
scan(liveFooter.footer).find((node) => node.className === "footer-modal-close").emit("click");
assert.equal(liveModal.hidden, true);
assert.ok(liveNotices.children[0].focused, "Frissítés után is a létező ikonnak jár vissza a fókusz.");
assert.ok(liveChecked.textContent.startsWith(refreshed.home.footer.checkedLabel));
const noticeAfterUpdate = liveNotices.children[0];
assert.equal(await liveFooter.checkForUpdates(), true);
assert.equal(liveNotices.children[0], noticeAfterUpdate,
  "Változatlan JSON esetén a 10 másodperces ellenőrzés ne építse újra a gombokat.");
const invalid = structuredClone(refreshed);
invalid.release = "2.33";
invalid.home.footer.notices[0].body = "";
globalThis.fetch = async () => ({ ok: true, json: async () => invalid });
assert.equal(await liveFooter.checkForUpdates(), false);
assert.equal(liveVersion.textContent, "Verzió: 2.34", "Hibás JSON nem írhatja felül az érvényes adatot.");
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
const changedIntervalConfig = structuredClone(config);
changedIntervalConfig.home.footer.refreshSeconds = 20;
let changedIntervalMs = null;
globalThis.setInterval = (callback, ms) => {
  changedIntervalMs = ms;
  return originalSetInterval(callback, ms);
};
const changedIntervalFooter = makeFooter(changedIntervalConfig, "desktop");
globalThis.setInterval = originalSetInterval;
assert.equal(changedIntervalMs, 20000);
assert.equal(scan(changedIntervalFooter.footer).find((node) => node.className === "footer-checked").textContent,
  "Frissítés: 20 mp-enként",
  "Az ellenőrzési felirat és az időzítő ugyanazt az egyetlen JSON-értéket használja.");
changedIntervalFooter.destroy();
const stalePendingLabel = structuredClone(config);
stalePendingLabel.home.footer.pendingLabel = "Frissítés: 10 mp-enként";
assert.throws(() => makeFooter(stalePendingLabel, "desktop"), /Érvénytelen tájékoztatási/,
  "A külön beírt, elavulható számot ne engedjük vissza a feliratba.");
const invalidInterval = structuredClone(config);
invalidInterval.home.footer.refreshSeconds = 5;
assert.throws(() => makeFooter(invalidInterval, "desktop"), /Érvénytelen tájékoztatási/,
  "A túl gyakori frissítés a megengedett 10–600 másodperces tartományon kívül esik.");
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
for (const [platform, css, basis] of [
  ["desktop",desktopCss,/flex:0 0 calc\(33\.333333% - 15\.34px\);/],
  ["mobile",mobileCss,/flex:0 0 calc\(50% - 5px\);/]
]) {
  const gridRule = block(css, `.${platform}-successes-section.is-archive .${platform}-successes-grid`);
  const cardRule = block(css, `.${platform}-successes-section.is-archive .${platform}-successes-card`);
  assert.match(gridRule,/display:flex; flex-wrap:wrap; justify-content:center;/,
    `${platform}: a keresési találatok nem maradhatnak balra igazítva.`);
  assert.match(cardRule,basis,
    `${platform}: egyetlen találat se nyúljon teljes szélességre.`);
}
assert.match(desktopCss,/flex-basis:calc\(33\.333333% - 8\.67px\);/,
  "Keskeny asztali nézetben is pontosan három kártya férjen egy sorba.");
assert.match(mobileCss,/flex-basis:calc\(50% - 4px\);/,
  "Keskeny telefonon is két kártya férjen egy sorba.");
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
assert.match(block(mobileCss, ".mobile-compass-sub-grid"),
  /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.doesNotMatch(mobileCss, /\.mobile-compass-third-|\.desktop-wheel-third-/,
  "Harmadik menüszinthez tartozó stílus se maradjon.");
assert.doesNotMatch(desktopCss, /\.desktop-wheel-third-|\.desktop-wheel-level-three/,
  "A harmadik asztali panel stílusa is eltűnjön.");
assert.match(block(desktopCss, ".desktop-page-preview"), /text-align:center;/);
assert.match(block(desktopCss, ".desktop-page-cards"), /display:flex; flex-wrap:wrap; justify-content:center;/,
  "Az asztali tartalomkártyák az utolsó, nem teljes sorban is középre kerüljenek.");
assert.match(block(desktopCss, ".desktop-page-card"), /border-radius:23px;/);
assert.match(block(desktopCss, ".desktop-page-card"), /max-width:570px;/,
  "Egyetlen asztali kártya ne nőjön a teljes oldal szélességére.");
assert.match(block(mobileCss, ".mobile-page-preview"), /text-align:center;/);
assert.match(block(mobileCss, ".mobile-page-cards"), /grid-template-columns:minmax\(0,1fr\)/);
assert.match(block(mobileCss, ".mobile-page-cards"), /justify-items:center;/);
assert.match(block(mobileCss, ".mobile-page-card"), /border-radius:19px;/);
for (const [platform, css] of [["desktop",desktopCss],["mobile",mobileCss]]) {
  assert.match(block(css, `.${platform}-page-card-body`), /text-align:center;/,
    `${platform}: a hierarchikus kártyaszövegek legyenek középen.`);
  assert.match(block(css, `.${platform}-page-card-point`), /text-align:center;/,
    `${platform}: minden alpont a kártya középvonalához igazodjon.`);
  assert.match(block(css, `.${platform}-page-card-details li`), /text-align:center;/,
    `${platform}: a részletező sorok is középre kerüljenek.`);
  assert.match(block(css, `.${platform}-page-kind-steps .${platform}-page-card-point::before`),
    /left:50%/,`${platform}: a számozott lépések jelzése középen maradjon.`);
  assert.match(block(css, `.${platform}-successes-heading`), /text-align:center;/,
    `${platform}: a főoldal és az archívum címsora legyen középen.`);
  assert.match(block(css, `.${platform}-successes-card`), /text-align:center;/,
    `${platform}: a sportsikerkártyák tartalma legyen középen.`);
}
assert.match(block(desktopCss, ".desktop-page-table th,.desktop-page-table td"), /text-align:center;/);
assert.match(block(mobileCss, ".mobile-page-time-list dt,.mobile-page-time-list dd"), /text-align:center;/);
assert.match(block(desktopCss, ".desktop-page-gallery-grid"), /justify-content:center;/);
assert.match(block(mobileCss, ".mobile-page-gallery-grid"), /justify-items:center;/);
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
console.log("✓ Mobilos iránytű: hat főpont kilenc szélességen ütközésmentes, legfeljebb két menüszinttel");
assert.match(block(desktopCss, ".desktop-footer .footer-inner"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(desktopCss, ".desktop-footer .footer-inner"), /align-items:stretch;/);
assert.match(block(desktopCss, ".desktop-footer .footer-contact,.desktop-footer .footer-links"), /height:100%;/);
assert.match(block(mobileCss, ".mobile-footer .footer-inner"), /display:block;/);
assert.match(block(mobileCss, ".mobile-footer .footer-mobile-tabs"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(baseCss, ".footer-notices"), /display:grid; grid-auto-rows:minmax\(0,1fr\);/);
assert.match(block(desktopCss, ".desktop-footer .footer-notices"), /flex:0 0 44px; min-height:44px;/);
assert.match(block(desktopCss, ".desktop-footer .footer-notice-icon"), /min-height:44px;/);
assert.match(block(desktopCss, ".desktop-footer .footer-notices"), /grid-template-columns:repeat\(4,minmax\(0,1fr\)\);/);
assert.match(block(mobileCss, ".mobile-footer .footer-notices"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/);
assert.match(block(mobileCss, ".mobile-footer .footer-notices"), /flex:0 0 92px; min-height:92px;/);
assert.match(block(mobileCss, ".mobile-footer .footer-notice-icon"), /min-height:44px;/);
assert.match(block(mobileCss, ".mobile-footer .footer-mobile-tab"), /min-height:44px;/);
assert.match(block(baseCss, ".footer-notice-icon"), /width:100%; height:100%;/);
for (const width of [280, 320, 375, 390, 430, 650, 767]) {
  const available = Math.min(650, width - 20) - 16;
  const buttonWidth = (available - 4) / 2;
  const buttonHeight = (92 - 3) / 2;
  assert.ok(buttonWidth >= 44 && buttonHeight >= 44,
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
assert.match(block(desktopCss,
  ".desktop-footer .footer-links :is(.footer-updated,.footer-checked,.footer-version)"),
  /text-align:center;/,
  "Asztalon a dátum, az ellenőrzés és a verzió legyen középen.");
assert.match(block(mobileCss,
  ".mobile-footer .footer-links :is(.footer-updated,.footer-checked,.footer-version)"),
  /text-align:center;/,
  "Mobilon a dátum, az ellenőrzés és a verzió legyen középen.");
assert.match(block(mobileCss, ".mobile-footer .footer-links"), /text-align:center;/,
  "A mobilos Tájékoztatás fül frissítési és verziószövege középre legyen igazítva.");
assert.match(block(desktopCss, ".desktop-hero-track"), /height:160dvh; min-height:960px;/,
  "Az asztali kép továbbra is végiggörgethető és eltűnik a tényleges tartalom előtt.");
assert.doesNotMatch(desktopCss, /\.desktop-hero-continuation\s*\{/,
  "A korábbi üres kezdőlapi folytatás ne maradjon meg.");
assert.match(block(desktopCss, ".desktop-hero-crest"), /border:0;[^}]*background:transparent;/s,
  "A nyitókép közepén ne jelenjen meg a korábbi nagy kör alakú címérkeret.");
assert.match(block(desktopCss,
  '.desktop-home[data-hero-home="true"][data-hero-compact="true"] .desktop-crest-toggle'),
  /background:radial-gradient\(circle,#1c4a69,#071729 73%\);/,
  "Sötét témában a felköltözött címergomb mély kék hátteret kapjon.");
assert.match(block(desktopCss,
  '.desktop-home[data-hero-home="true"][data-theme="light"][data-hero-compact="true"] .desktop-crest-toggle'),
  /background:radial-gradient\(circle at 38% 28%,#fffdf6,#f0dfba 64%,#c9a363\);/,
  "Világos témában a felköltözött címergomb háttérszíne valóban változzon.");
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
const lightHeroOverlay = block(desktopCss,
  '.desktop-home[data-hero-home="true"][data-theme="light"] .desktop-hero-after');
assert.match(lightHeroOverlay, /rgba\(244,220,175,\.18\),transparent 70%/,
  "Világos módban is áttetsző legyen a fotó előtt fekvő dekorációs réteg.");
assert.doesNotMatch(lightHeroOverlay, /#[0-9a-f]{3,8}/i,
  "A dekorációs réteg ne kapjon átlátszatlan világos hátteret a kép fölé.");
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

// Valódi Bootstrap API integrációs próba kontrollált Carousel-implementációval.
// Ez a fallback-től függetlenül bizonyítja, hogy a panelváltást a Bootstrap .to()
// metódusára bízzuk, majd a slid.bs.carousel eseménnyel szinkronizálunk.
const { createHomeCarousel } = await import(new URL("../shared/js/home-carousel.js", import.meta.url));
let bootstrapInstance;
class BootstrapCarouselDouble {
  static getOrCreateInstance(node, options) {
    bootstrapInstance = new BootstrapCarouselDouble(node,options);
    return bootstrapInstance;
  }
  constructor(node,options) { this.node=node;this.options=options;this.calls=[];this.disposed=false; }
  to(index) {
    this.calls.push(index);
    const panels=scan(this.node).filter((item) => item.className.includes("home-carousel-item"));
    panels.forEach((panel,i) => panel.classList[i===index ? "add" : "remove"]("active"));
    this.node.emit("slid.bs.carousel", {to:index});
  }
  dispose() { this.disposed=true; }
}
window.bootstrap={Carousel:BootstrapCarouselDouble};
let revealedEvent=null;
const bootstrapTestCarousel=createHomeCarousel(config,new FakeNode("section"),() => ({
  section:new FakeNode("section"),
  showEvent:(id) => {revealedEvent=id;return true;},
  destroy:() => {}
}),"test");
assert.equal(bootstrapInstance.options.interval,false,"Ne induljon saját Bootstrap-időzítő a mi időzítőnk mellett.");
assert.equal(bootstrapInstance.options.touch,false,"Ne legyen kétszeres, ütköző érintéses swipe.");
assert.ok(bootstrapTestCarousel.section.classList.contains("bs-ready"));
bootstrapTestCarousel.show(1,true);
assert.deepEqual(bootstrapInstance.calls,[1],"A panelváltást a Bootstrap Carousel .to() végezze.");
const fakeBootstrapPanels=scan(bootstrapTestCarousel.section).filter((node)=>node.className.includes("home-carousel-item"));
assert.equal(fakeBootstrapPanels[1].attributes["aria-hidden"],"false");
assert.equal(fakeBootstrapPanels[0].inert,true);
bootstrapTestCarousel.showEvent("sportnap");
assert.equal(revealedEvent,"sportnap");
bootstrapTestCarousel.show(0,true);
assert.deepEqual(bootstrapInstance.calls,[1,0]);
bootstrapTestCarousel.destroy();
assert.equal(bootstrapInstance.disposed,true,"Nézetváltáskor a Bootstrap példány is szűnjön meg.");
delete window.bootstrap;
console.log("✓ Bootstrap 5 Carousel API: .to(), slid.bs.carousel, akadálymentes állapot, dispose és CDN-fallback");

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
// A platformmodul dinamikus importja gépterheléstől függően több eseménykört kérhet.
// Nem egyetlen vak setImmediate futást, hanem ellenőrizhető célállapotot várunk.
async function waitFor(predicate, label, maxMs = 6000) {
  const deadline = Date.now() + maxMs;
  while (!predicate()) {
    assert.ok(Date.now() <= deadline, `Időtúllépés a valódi állapotig: ${label}`);
    await new Promise((done) => setTimeout(done, 10));
  }
}
await waitFor(() => documentRoot.dataset.platform === "mobile" &&
  documentRoot.dataset.route === "gate" && applicationRoot.querySelector(".gate-door-button"), "mobil kapu inicializálás");
assert.equal(historyUrl, "https://example.test/index.html?v=2.33#/",
  "A kezdő URL kapjon kiadási verziót a későbbi cache-biztos újratöltéshez.");
assert.equal(documentRoot.dataset.platform, "mobile");
assert.equal(documentRoot.dataset.route, "gate");
assert.ok(applicationRoot.querySelector(".gate-door-button"));
assert.equal(head.children.length, 1);
applicationRoot.querySelector(".gate-door-button").emit("click");
assert.equal(location.hash, config.routes.home);
windowEvents.get("hashchange")();
await waitFor(() => documentRoot.dataset.route === "home" &&
  applicationRoot.querySelector(".home-brand"), "kezdőlap betöltés");
assert.ok(applicationRoot.querySelector(".home-brand").focused, "A kezdőlap fejlécére fókuszt kell átadni.");
location.hash = menuPageHref("school-introduction");
window.scrollY = 340;
windowEvents.get("hashchange")();
await waitFor(() => documentRoot.dataset.route === "page" &&
  applicationRoot.querySelector(".mobile-page-title"), "aloldal betöltés");
assert.equal(window.scrollY, 0,
  "Menünavigáció után az új aloldal mindig a tetejéről induljon.");
assert.equal(applicationRoot.querySelector(".mobile-page-title").textContent, "Bemutatkozás");
assert.ok(applicationRoot.querySelector(".mobile-page-title").focused);
assert.ok(document.title.startsWith("Bemutatkozás"));
location.hash = config.routes.home;
windowEvents.get("hashchange")();
await waitFor(() => documentRoot.dataset.route === "home", "vissza a kezdőlapra");
location.hash = config.routes.gate;
windowEvents.get("hashchange")();
await waitFor(() => documentRoot.dataset.route === "gate" &&
  applicationRoot.querySelector(".gate-door-button"), "vissza a kapuhoz");
assert.ok(applicationRoot.querySelector(".gate-door-button").focused, "Visszalépés után a kapu fókuszt kap.");
viewportIsMobile = false;
breakpointChange();
await waitFor(() => documentRoot.dataset.platform === "desktop", "asztali platformváltás");
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

// 2.30 teljes tartalomregresszió: mind a 49 menüvégpont mindkét különálló
// megjelenítőben ellenőrzendő, a kártyaszám és a megjelenítési típus szabadon változhat.
const { createDesktopPage } = await import(new URL("../desktop/page.js",import.meta.url));
const { createMobilePage } = await import(new URL("../mobile/page.js",import.meta.url));
const allLeaves = config.menu.items.flatMap((root) => root.children);
for (const [platform, createPage] of [["desktop",createDesktopPage],["mobile",createMobilePage]]) {
  for (const leaf of allLeaves) {
    const data = getMenuPage(config,leaf.id);
    const rendered = createPage(config,leaf.id);
    const nodes = scan(rendered);
    const cardNodes = nodes.filter((node) =>
      node.className?.startsWith(`${platform}-page-card card `));
    assert.equal(nodes.filter((node) => node.tag === "h1").length,1,`${platform}: ${leaf.id}`);
    assert.equal(cardNodes.length,data.items.length,`${platform}: ${leaf.id} kártyaszám`);
    assert.equal(nodes.filter((node) => node.className === `${platform}-page-card-group` ||
      node.className?.startsWith(`${platform}-page-card-group `)).length,
      data.items.reduce((count,card) => count + card.groups.length,0),
      `${platform}: ${leaf.id} témacsoportok`);
    for (const kind of new Set(data.items.map((card) => card.kind))) {
      assert.ok(cardNodes.some((node) => node.className.includes(`${platform}-page-kind-${kind}`)),
        `${platform}: ${leaf.id} hiányzó ${kind} komponens`);
    }
    if (data.items.some((card) => card.kind === "accordion")) {
      assert.ok(nodes.some((node) => node.tag === "details"),`${platform}: ${leaf.id} kinyitható részletek`);
      assert.ok(nodes.some((node) => node.tag === "summary"),`${platform}: ${leaf.id} kinyitható címke`);
    }
    if (data.items.some((card) => card.kind === "table")) {
      assert.ok(nodes.some((node) => node.tag === (platform === "desktop" ? "table" : "dl")),
        `${platform}: ${leaf.id} platformhoz illő adatmegjelenítés`);
    }
    if (data.items.some((card) => card.kind === "gallery")) {
      const images = nodes.filter((node) => node.tag === "img");
      assert.equal(images.length,
        config.home.desktopHero.slides.filter((slide) => slide.pageId === data.galleryCategory).length,
        `${platform}: ${leaf.id} egyetlen, teljes képgaléria`);
      for (const img of images) assert.ok(existsSync(join(root, img.attributes.src.replace(/^\.\//,""))),
        `${platform}: ${leaf.id} nem létező képfájl: ${img.attributes.src}`);
    }
  }
}
const changedNews = structuredClone(config);
changedNews.publicNews[0].title = "Új intézményi értesítés a közös JSON-ból";
assert.ok(searchSite(changedNews,"intézményi értesítés").some((hit) =>
  hit.href === "#/oldal/news-latest"),"Az új hírek kézi keresőbejegyzés nélkül jelenjenek meg.");
assert.ok(getMenuPage(changedNews,"news-latest").items[0].groups[0].points
  .some((point) => point.title === changedNews.publicNews[0].title),
"A közösen tárolt hír címének változása az oldalon is azonnal megjelenjen.");
const principalChange = structuredClone(config);
principalChange.site.principal = "A JSON-ban frissített intézményvezető";
assert.ok(getMenuPage(principalChange,"school-staff").items[0].groups[0].points[0].details
  .includes(principalChange.site.principal),"Az intézményvezető neve egyszer szerkesztendő.");
assert.ok(!JSON.stringify(config.publicNews).includes("Nagy Lilla"),
  "Az új intézményi híradatok közé nem kerülhetnek át diákszemélyek nevei.");
console.log("✓ 49 × 2 oldalrender: változó Bootstrap-komponensek, egyedi csoportok, galéria és közös JSON-adatok");

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
          assert.equal(await page.locator('.desktop-wheel-sub-node').count(), 8);
          await page.locator('.desktop-wheel-node').first().click();
          assert.equal(await page.locator('.desktop-wheel-sub-node').count(), 9);
          await page.locator('.desktop-wheel-sub-node').first().click();
        }
        await page.waitForURL(/#\/oldal\/school-introduction$/, { timeout:4000 });
        assert.equal(await page.locator(`.${platform}-page-title`).textContent(), "Bemutatkozás");
        assert.equal(await page.locator(`.${platform}-page-card.card`).count(),
          getMenuPage(config,"school-introduction").items.length);
        assert.equal(await page.locator(`.${platform}-page-card-group`).count(),
          getMenuPage(config,"school-introduction").items.reduce((sum,card) =>
            sum+card.groups.length,0));
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
