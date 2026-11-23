import { checkedFeatureCenters } from "./feature-centers-data.js?v=2.43";
import { getMenuPage, menuPageHref, pagePreviewSearchText } from "./menu-data.js?v=2.43";
import { orderedSportSuccesses } from "./successes-data.js?v=2.43";
import { calendarEntries } from "./calendar-data.js?v=2.43";
import { newsStoryHref } from "./news-panel.js?v=2.43";
import { checkedAdmissions } from "./admission-data.js?v=2.43";

/** A kereső az aktuálisan betöltött, ellenőrzött site.json-ból épít indexet.
 * A két külön kereső ugyanazt a találati sorrendet használja. */

export function normalizeSearchText(value) {
  return String(value ?? "").toLocaleLowerCase("hu-HU").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const tokenize = (value) => normalizeSearchText(value).split(" ").filter(Boolean);
const indexCache = new WeakMap();

/** Elütéstűrő, sávosan korlátozott Damerau–Levenshtein (OSA).
 * Az előző megoldás minden szópárhoz teljes négyzetes mátrixot foglalt le.
 * Itt csak a megengedett legfeljebb 1–2 eltéréshez szükséges sávot számoljuk. */
function editDistanceAtMost(a, b, limit) {
  const n = a.length, m = b.length;
  if (Math.abs(n - m) > limit) return false;
  if (a === b) return true;
  if (!n || !m) return Math.max(n, m) <= limit;
  const beyond = limit + 1;
  let previous2 = new Uint16Array(m + 1).fill(beyond);
  let previous = new Uint16Array(m + 1).fill(beyond);
  for (let j = 0; j <= Math.min(m, limit); j++) previous[j] = j;
  for (let i = 1; i <= n; i++) {
    const current = new Uint16Array(m + 1).fill(beyond);
    if (i <= limit) current[0] = i;
    const low = Math.max(1, i - limit);
    const high = Math.min(m, i + limit);
    let rowMinimum = beyond;
    for (let j = low; j <= high; j++) {
      const substitution = a[i-1] === b[j-1] ? 0 : 1;
      let cost = Math.min(previous[j] + 1, current[j-1] + 1,
        previous[j-1] + substitution);
      if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]) {
        cost = Math.min(cost, previous2[j-2] + 1);
      }
      current[j] = Math.min(cost, beyond);
      rowMinimum = Math.min(rowMinimum, current[j]);
    }
    if (rowMinimum > limit) return false;
    previous2 = previous;
    previous = current;
  }
  return previous[m] <= limit;
}

function tokenScore(queryToken, candidate) {
  if (queryToken === candidate) return 100;
  if (candidate.startsWith(queryToken) && queryToken.length >= 2) return 76;
  if (queryToken.length >= 3 && candidate.includes(queryToken)) return 58;
  const tolerance = queryToken.length >= 7 ? 2 : queryToken.length >= 4 ? 1 : 0;
  if (tolerance && editDistanceAtMost(queryToken, candidate, tolerance)) {
    return tolerance === 2 ? 24 : 34;
  }
  return 0;
}

function createIndex(config) {
  // A változásfigyelő lenyomat az azonos objektumon végzett JSON-adatfrissítést
  // is észreveszi. Ezzel az adatot szerkesztéskor sem kell kézzel újraindexelni.
  const cached = indexCache.get(config);
  // A HTTPS-ről betöltött, validált kiadás a következő oldalfrissítésig változatlan.
  // Ennél minden billentyűleütésnél elhagyható a nagy JSON újraszerializálása.
  // Szerkesztési/teszt-konfigurációnál a lenyomat továbbra is észleli az adatváltozást.
  if (cached && config.__staticContent === true) return cached.entries;
  const signature = JSON.stringify([config.site, config.home, config.menu,
    config.pagePreview, config.publicNews, config.admissionCenter, config.featureCenters]);
  if (cached?.signature === signature) return cached.entries;
  const entries = [];
  const categories = config.home.search.categories;
  const add = ({ label, short = label, summary = "", category, href, details = "" }) => {
    const headline = new Set(tokenize(`${label} ${short}`));
    const description = new Set(tokenize(`${summary} ${category}`));
    const extra = new Set(tokenize(details));
    const vocabulary = new Set([...headline, ...description, ...extra]);
    const synonyms = new Set();
    for (const group of config.home.search.synonyms) {
      const groupTerms = group.flatMap(tokenize);
      if (groupTerms.some((word) => vocabulary.has(word))) {
        for (const word of groupTerms) synonyms.add(word);
      }
    }
    entries.push({
      label, short, summary, category, href,
      headline:[...headline], description:[...description], extra:[...extra],
      synonyms:[...synonyms], exactLabel:normalizeSearchText(label)
    });
  };

  // 2.43: a négy külön központból az alaptartalmakat a globális kereső is indexeli.
  // A találatok mindig működő menüoldalra vezetnek, nem nem létező részoldalra.
  const centers = checkedFeatureCenters(config);
  for (const p of centers.education.programs) add({
    label:p.name, summary:p.summary, details:`${p.level} ${p.points.join(' ')}`,
    category:'Képzési út', href:menuPageHref('education-programs')
  });
  for (const p of centers.sports.topics) add({
    label:p.name, summary:p.summary, category:'Sportági bemutató',
    href:menuPageHref('sports-disciplines')
  });
  for (const p of centers.sports.facilities) add({
    label:p.title, summary:p.description, category:'Sporthelyszín információ',
    href:menuPageHref('sports-facilities')
  });
  // Országosan ellenőrzött felvételi határidők: a menübeli részletes oldalra vezetnek.
  const admissions = checkedAdmissions(config);
  for (const milestone of admissions.milestones) add({
    label:milestone.title, short:milestone.title,
    category:"Felvételi határidő",
    summary:`${milestone.start}${milestone.end !== milestone.start ? ` – ${milestone.end}` : ""}`,
    details:`${milestone.detail} ${admissions.programs.find(p=>p.id===milestone.program)?.label || ""}`,
    href:menuPageHref(milestone.link)
  });

  // A gyorsválasztó négy külső elérhetősége továbbra is kereshető.
  const { header, footer } = config.home;
  for (const item of header.social) add({
    label:item.label, short:item.searchShort, summary:item.searchSummary,
    category:item.icon === "kreta" ? header.searchDiaryCategory : header.searchSocialCategory,
    href:item.url
  });
  add({ label:footer.contactTitle, short:footer.contactTitle,
    summary:`${header.searchEmailSummary} · ${footer.email} · ${footer.address}`,
    category:header.searchContactCategory, href:`mailto:${footer.email}` });

  // Minden tényleges, saját útvonallal rendelkező menüvégpont.
  function visit(node, parents = []) {
    if (node.children?.length) {
      for (const child of node.children) visit(child, [...parents, node.label]);
      return;
    }
    const page = getMenuPage(config, node.id);
    if (!page) return;
    add({ label:page.title, category:categories.page, href:menuPageHref(node.id),
      summary:parents.join(" · "),
      details:`${page.intro} ${pagePreviewSearchText(page.items)}` });
  }
  for (const root of config.menu.items) visit(root);
  // A menüből kivett, de saját oldalcímmel megtartott képzési témák is
  // kereshetők; a menüben ettől nem jelenik meg harmadik szint.
  for (const local of config.pagePreview.localPages || []) {
    const page = getMenuPage(config, local.id);
    if (!page) continue;
    add({ label:page.title, category:categories.page,
      href:menuPageHref(local.id), summary:local.parentId,
      details:`${page.intro} ${pagePreviewSearchText(page.items)}` });
  }

  // Kattintásra valódi sportsiker-részletező nyílik, névre is kereshető.
  const orderedSuccesses = orderedSportSuccesses(config);
  const recentIds = new Set(orderedSuccesses.slice(0, 6).map((item) => item.id));
  for (const success of orderedSuccesses) add({
    label:success.name, short:success.name,
    category:recentIds.has(success.id) ? categories.success : categories.archive,
    href:recentIds.has(success.id)
      ? `${config.routes.home}/sportsiker/${success.id}`
      : `#/oldal/sports-results/sportsiker/${success.id}`,
    summary:`${success.sport} · ${success.result} · ${success.competition}`,
    details:`${success.summary} ${success.details.join(" ")} ${success.date} ${config.home.sportSuccesses.title}`
  });
  // Az egyedi JSON-hírek közvetlenül a megfelelő részletes oldalra vezetnek.
  for (const news of config.publicNews) add({
    label:news.title, short:news.title, summary:news.summary,
    category:news.tags.includes("announcement") ? "Közlemény" : "Iskolai hír",
    href:newsStoryHref(config,news),
    details:`${news.details.join(" ")} ${news.tags.join(" ")} ${news.date}`
  });
  // Az önálló, menüből elérhető híradatlapokra is van közvetlen találat.
  // A keresés mindig az aktuális JSON-ból épül fel, így nincs kézi hírindex.
  for (const news of config.publicNews) add({
    label:news.title, short:news.title,
    category:categories.page,
    href:newsStoryHref(config,news),
    summary:`${news.date} · ${news.summary}`,
    details:`${news.tags.join(" ")} ${news.details.join(" ")}`
  });
  // Az események keresőtalálatai a saját napjukhoz és részleteikhez vezetnek.
  for (const event of calendarEntries(config)) add({
    label:event.title,
    short:event.title,
    summary:`${event.date}${event.time ? ` · ${event.time}` : ""} · ${event.categoryLabel}`,
    details:`${event.summary} ${event.details.join(" ")} ${event.endDate || ""}`,
    category:categories.calendar,
    href:`#/kezdolap/esemeny/${event.id}`
  });
  for (const slide of config.home.desktopHero.slides) add({
    label:slide.title, category:categories.headline, href:menuPageHref(slide.pageId),
    summary:`${slide.eyebrow} · ${slide.summary}`
  });
  const story = config.home.mobileStory;
  for (const topic of story.topics) add({
    label:topic.title, category:categories.story, href:config.routes.home,
    summary:topic.subtitle, details:story.ariaLabel
  });
  for (const state of [
    [story.introTitle,story.introSubtitle],[story.outroTitle,story.outroSubtitle]
  ]) add({ label:state[0], summary:state[1], category:categories.story,
    href:config.routes.home });

  // A tájékoztatási betűgombok szövegei is valóban megnyitható találatok.
  for (const notice of footer.notices) add({
    label:notice.title, summary:notice.body.slice(0, 140), details:notice.body,
    category:categories.notice,
    href:`${config.routes.home}/tajekoztatas/${notice.id}`
  });
  indexCache.set(config, { signature, entries });
  return entries;
}

function searchEntries(config, query, sportsOnly = false) {
  const words = [...new Set(tokenize(query))].slice(0, 8);
  if (!words.length) return [];
  // Az index változatlan JSON-tartalomnál azonnal újrahasznosítható.
  const index = createIndex(config);
  const phrase = normalizeSearchText(query);
  const matches = [];
  for (const entry of index) {
    if (sportsOnly && !/\/sportsiker\/[a-z0-9-]+$/.test(entry.href)) continue;
    let score = 0;
    let allMatched = true;
    for (const word of words) {
      const best = Math.max(
        ...entry.headline.map((token) => tokenScore(word, token) * 4),
        ...entry.description.map((token) => tokenScore(word, token) * 2),
        ...entry.extra.map((token) => tokenScore(word, token)),
        ...entry.synonyms.map((token) => tokenScore(word, token) * 1.7),
        0
      );
      if (!best) { allMatched = false; break; }
      score += best;
    }
    if (allMatched) {
      if (entry.exactLabel === phrase) score += 500;
      else if (entry.exactLabel.includes(phrase)) score += 160;
      matches.push({ entry, score });
    }
  }
  matches.sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label, "hu"));
  return matches.slice(0, sportsOnly ? 250 : 50).map(({ entry }) => ({
    label:entry.label, short:entry.short, summary:entry.summary,
    category:entry.category, href:entry.href
  }));
}

export function searchSite(config, query) {
  return searchEntries(config, query);
}

/** Az archív kereső kizárólag a sportsikereket, de mind a harmincat vizsgálja. */
export function searchSportSuccessIds(config, query) {
  return searchEntries(config, query, true).map((entry) => entry.href.split("/").at(-1));
}
