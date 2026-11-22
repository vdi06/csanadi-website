import { getMenuPage, menuPageHref } from "./menu-data.js?v=2.24";
import { orderedSportSuccesses } from "./successes-data.js?v=2.24";

/** A kereső az aktuálisan betöltött, ellenőrzött site.json-ból épít indexet.
 * A két külön kereső ugyanazt a találati sorrendet használja. */

export function normalizeSearchText(value) {
  return String(value ?? "").toLocaleLowerCase("hu-HU").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const tokenize = (value) => normalizeSearchText(value).split(" ").filter(Boolean);

function editDistanceAtMost(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return false;
  if (a === b) return true;
  const rows = Array.from({ length:a.length + 1 },
    () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) rows[i][0] = i;
  for (let j = 0; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1, rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      // Az elcserélt betűk is egyetlen elgépelésnek számítanak.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
      }
    }
  }
  return rows[a.length][b.length] <= limit;
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
      details:`${page.intro} ${page.items.join(" ")}` });
  }
  for (const root of config.menu.items) visit(root);
  // A menüből kivett, de saját oldalcímmel megtartott képzési témák is
  // kereshetők; a menüben ettől nem jelenik meg harmadik szint.
  for (const local of config.pagePreview.localPages || []) {
    const page = getMenuPage(config, local.id);
    if (!page) continue;
    add({ label:page.title, category:categories.page,
      href:menuPageHref(local.id), summary:local.parentId,
      details:`${page.intro} ${page.items.join(" ")}` });
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
  return entries;
}

export function searchSite(config, query) {
  const words = [...new Set(tokenize(query))].slice(0, 8);
  if (!words.length) return [];
  // Nincs állandó találati lista vagy beragadható gyorsítótár: az index
  // minden kereséskor az éppen rendelkezésre álló JSON-adatokból készül.
  const index = createIndex(config);
  const phrase = normalizeSearchText(query);
  const matches = [];
  for (const entry of index) {
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
  return matches.slice(0, 50).map(({ entry }) => ({
    label:entry.label, short:entry.short, summary:entry.summary,
    category:entry.category, href:entry.href
  }));
}
