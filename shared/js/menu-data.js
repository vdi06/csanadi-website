import { validatePersonalData } from "./personal-data.js?v=2.63";
import { validateExpansion } from "./content-expansion.js?v=2.63";
import { checkedFeatureCenters } from "./feature-centers-data.js?v=2.63";
import { checkedDocumentCenter } from "./document-data.js?v=2.63";
import { checkedAdmissions } from "./admission-data.js?v=2.63";
import { checkedInformationCenter } from "./information-data.js?v=2.63";
import { checkedMediaCenter } from "./media-data.js?v=2.63";
/** Kétszintű menü, 63 önálló oldal és közösen kezelt, JSON-alapú tartalom. */
import { checkedCalendar } from "./calendar-data.js?v=2.63";

const validLabel = (value, max = 800) => typeof value === "string" &&
  !!value.trim() && value.length <= max;
const validId = (id) => typeof id === "string" && /^[a-z0-9-]+$/.test(id);
const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\d$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
};
function localToday() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone:"Europe/Budapest", year:"numeric", month:"2-digit", day:"2-digit"
  }).formatToParts(new Date());
  const fields = Object.fromEntries(parts.map(({type,value}) => [type,value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}
const cardKinds = new Set(["card","timeline","steps","accordion","list","table","alert","gallery","badges"]);
const permittedRefs = new Set(["site.fullName","site.principal",
  "home.footer.address","home.footer.email","home.footer.phone"]);

function valueAt(config, path) {
  if (!permittedRefs.has(path)) throw new Error("Ismeretlen megosztott adatmező.");
  const result = path.split(".").reduce((value, segment) => value?.[segment], config);
  if (!validLabel(result)) throw new Error("Hiányzó központi adat.");
  return result;
}

function validDetail(detail) {
  return validLabel(detail, 1000) ||
    (detail && typeof detail === "object" &&
      Object.keys(detail).length === 1 && permittedRefs.has(detail.ref));
}

function checkedCards(config, id) {
  const page = config.pagePreview?.pages?.[id];
  if (!page || !validLabel(page.intro, 900) ||
    !Array.isArray(page.items) || page.items.length < 1 || page.items.length > 15) {
    throw new Error(`Hiányzó vagy hibás egyedi oldal: ${id}`);
  }
  if (page.items.some((card) => !card || !validLabel(card.title, 130) ||
    !validLabel(card.summary, 450) || !cardKinds.has(card.kind) ||
    !Array.isArray(card.groups) || card.groups.length < 1 || card.groups.length > 8 ||
    card.groups.some((group) => !group || !validLabel(group.title, 130) ||
      !Array.isArray(group.points) || group.points.length < 1 || group.points.length > 10 ||
      group.points.some((point) => !point || !validLabel(point.title, 130) ||
        !Array.isArray(point.details) || point.details.length < 1 || point.details.length > 8 ||
        point.details.some((detail) => !validDetail(detail)))))) {
    throw new Error(`Hibás tartalomkártya: ${id}`);
  }
  if (page.galleryCategory && (!validId(page.galleryCategory) ||
    !config.home.desktopHero.slides.some((slide) => slide.pageId === page.galleryCategory))) {
    throw new Error(`Hibás képgaléria-hivatkozás: ${id}`);
  }
  if (page.feed && (!Array.isArray(page.feed.tags) || !page.feed.tags.length ||
    page.feed.tags.some((tag) => !validId(tag)) ||
    !validLabel(page.feed.heading, 130) ||
    !validLabel(page.feed.summary, 250) || !validLabel(page.feed.groupTitle, 130) ||
    (page.feed.pastOnly !== undefined && typeof page.feed.pastOnly !== "boolean") ||
    (page.feed.futureOnly !== undefined && typeof page.feed.futureOnly !== "boolean") ||
    (page.feed.futureOnly && page.feed.pastOnly))) {
    throw new Error(`Érvénytelen hírgyűjtemény: ${id}`);
  }
  for (const card of page.items) for (const group of card.groups)
    for (const point of group.points) for (const detail of point.details)
      if (typeof detail !== "string") valueAt(config, detail.ref);
  return page;
}

function checkedNews(config) {
  if (!Array.isArray(config.publicNews)) throw new Error("Hiányzó közös híradatok.");
  const ids = new Set();
  for (const news of config.publicNews) {
    if (!news || !validId(news.id) || ids.has(news.id) ||
      !validLabel(news.title, 150) || !validLabel(news.summary, 800) ||
      (news.featured !== undefined && typeof news.featured !== "boolean") ||
      !validDate(news.date) ||
      (news.endDate && (!validDate(news.endDate) || news.endDate < news.date)) ||
      !Array.isArray(news.tags) || !news.tags.length || news.tags.some((tag) => !validId(tag)) ||
      !Array.isArray(news.details) || !news.details.length ||
      news.details.some((detail) => !validLabel(detail, 800))) {
      throw new Error("Érvénytelen nyilvános hírbejegyzés.");
    }
    ids.add(news.id);
  }
}

/** Minden egyes almenü saját tartalmat kap, a kártyaszám nincs rögzítve. */
export function validateMenu(config) {
  const items = config.menu?.items;
  if (!Array.isArray(items) || items.length !== 6) throw new Error("A hat főmenü hiányzik.");
  const ids = new Set();
  const leafIds = [];
  const visit = (node, depth) => {
    if (!node || depth > 2 || !validId(node.id) || ids.has(node.id) ||
      !validLabel(node.label, 120)) throw new Error("Hibás vagy ismétlődő menüazonosító.");
    ids.add(node.id);
    if (node.href !== undefined && !/^#\/[a-z0-9/-]*$/.test(node.href)) {
      throw new Error("Nem megengedett belső menühivatkozás.");
    }
    if (node.children !== undefined) {
      if (depth === 2 || !Array.isArray(node.children) || node.children.length < 8 ||
        node.children.length > 30) throw new Error("Hibás almenüszint vagy darabszám.");
      for (const child of node.children) visit(child, depth + 1);
    } else if (depth === 2) leafIds.push(node.id);
  };
  items.forEach((root) => visit(root,1));
  if (leafIds.length !== 63) throw new Error("A 63 almenüoldal nem teljes.");
  const pages = config.pagePreview?.pages;
  if (!pages || typeof pages !== "object" ||
    Object.keys(pages).length !== leafIds.length ||
    Object.keys(pages).some((id) => !leafIds.includes(id))) {
    throw new Error("Az egyedi tartalomoldalak és a menü eltérnek.");
  }
  const signatures = new Set();
  for (const id of leafIds) {
    const page = checkedCards(config,id);
    const signature = JSON.stringify(page.items.map((card) => [card.title,card.groups]));
    if (signatures.has(signature)) throw new Error("Két almenü ugyanazt a tartalmat kapta.");
    signatures.add(signature);
  }
  const locals = config.pagePreview?.localPages;
  if (!Array.isArray(locals) || locals.length !== 3) throw new Error("Hiányzó képzési aloldalak.");
  for (const local of locals) {
    if (!validId(local.id) || ids.has(local.id) || !validLabel(local.title, 100) ||
      !leafIds.includes(local.parentId) || local.parentId !== "education-programs" ||
      !Number.isInteger(local.cardIndex) || local.cardIndex < 0 ||
      local.cardIndex >= config.pagePreview.pages[local.parentId].items.length) {
      throw new Error("Érvénytelen képzési aloldal.");
    }
    ids.add(local.id);
  }
  // A kezdőlap új, szerkeszthető három témakártyája csak valós, létező
  // almenüoldalra vezethet; hiányos JSON-nál ne jelenjen meg hibás link.
  const highlights = config.home?.homeHighlights;
  if (!highlights || !validLabel(highlights.kicker,70) ||
    !validLabel(highlights.title,130) || !validLabel(highlights.intro,250) ||
    !Array.isArray(highlights.items) || highlights.items.length !== 3 ||
    new Set(highlights.items.map((item) => item.pageId)).size !== 3 ||
    highlights.items.some((item) => !item || !validLabel(item.title,80) ||
      !validLabel(item.subtitle,170) || !validLabel(item.icon,12) ||
      !leafIds.includes(item.pageId))) {
    throw new Error("Érvénytelen kezdőlapi prémium témakártya-adatok.");
  }
  validateExpansion(config);
  validatePersonalData(config);
  checkedNews(config);
  checkedCalendar(config);
  checkedInformationCenter(config);
  checkedMediaCenter(config);
  checkedDocumentCenter(config);
  checkedAdmissions(config);
  checkedFeatureCenters(config);
  return items;
}

export function menuPageHref(id) {
  if (!validId(id)) throw new Error("Érvénytelen oldalazonosító.");
  return `#/oldal/${id}`;
}

/** A teljes, beágyazott oldalszöveget visszaadja a kereső számára. */
export function pagePreviewSearchText(cards) {
  return cards.flatMap((card) => [card.title, card.summary,
    ...card.groups.flatMap((group) => [group.title,
      ...group.points.flatMap((point) => [point.title, ...point.details])])]).join(" ");
}

function feedCard(config, feed) {
  const now = localToday();
  const matches = config.publicNews.filter((news) =>
    (feed.tags.includes("all") || feed.tags.some((tag) => news.tags.includes(tag))) &&
    (!feed.pastOnly || (news.endDate || news.date) < now) &&
    (!feed.futureOnly || (news.endDate || news.date) >= now))
    .sort((a,b) => b.date.localeCompare(a.date));
  if (!matches.length) return null;
  return {
    kind: "timeline", title: feed.heading,
    summary: feed.summary,
    groups: [{ title: feed.groupTitle,
      points: matches.map((news) => ({
        title: news.title,
        href:`${menuPageHref(news.tags.includes("announcement") ? "news-announcements" : "news-latest")}/hir/${news.id}`,
        details: [news.date + (news.endDate ? ` – ${news.endDate}` : ""),
          news.summary, ...news.details]
      }))
    }]
  };
}

function resolvedItems(config, page) {
  const items = page.items.map((card) => ({
    ...card,
    groups: card.groups.map((group) => ({
      ...group,
      points: group.points.map((point) => ({
        ...point,
        details: point.details.map((detail) => typeof detail === "string" ?
          detail : valueAt(config, detail.ref))
      }))
    }))
  }));
  if (page.feed) {
    const newsCard = feedCard(config,page.feed);
    if (newsCard) items.unshift(newsCard);
  }
  return items;
}

export function getMenuPage(config, id) {
  const local = config.pagePreview?.localPages?.find((item) => item.id === id);
  if (local) {
    const parent = config.pagePreview.pages[local.parentId];
    const card = parent.items[local.cardIndex];
    if (!card) return null;
    return { id, title:local.title, intro:parent.intro,
      items:resolvedItems(config,{items:[card]}) };
  }
  for (const root of config.menu.items) {
    const node = root.children?.find((item) => item.id === id);
    if (!node) continue;
    const page = config.pagePreview.pages[id];
    if (!page) return null;
    return { id, title:node.label, intro:page.intro, items:resolvedItems(config,page),
      galleryCategory:page.galleryCategory, collectionId:page.collectionId };
  }
  return null;
}
