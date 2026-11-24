/** A kezdőlapi fülrendszer egyetlen JSON-konfigurációból épül fel.
 * A már közzétett sportsiker-/esemény-útvonalak miatt ez a két típus kötelező. */
const supportedTypes = new Set(["successes", "calendar", "news", "widgets", "center"]);

export function checkedHomeCarousel(config) {
  const data = config?.home?.carousel;
  if (!data || typeof data.ariaLabel !== "string" || !data.ariaLabel.trim() ||
      !Number.isInteger(data.autoplayMs) || data.autoplayMs < 10000 || data.autoplayMs > 300000 ||
      !Number.isInteger(data.interactionHoldMs) || data.interactionHoldMs < 0 ||
      data.interactionHoldMs > data.autoplayMs || !Array.isArray(data.panels) ||
      data.panels.length < 2 || data.panels.length > 24) {
    throw new Error("Érvénytelen kezdőlapi Carousel-konfiguráció.");
  }
  const routes = new Set([...config.menu.items.flatMap(g=>g.children.map(p=>p.id)),...(config.pagePreview.localPages||[]).map(p=>p.id)]);
  const ids = new Set();
  const singletonTypes = new Set();
  for (const panel of data.panels) {
    if (!panel || !/^[a-z][a-z0-9-]{1,31}$/.test(panel.id ?? "") ||
        ids.has(panel.id) || !supportedTypes.has(panel.type) ||
        (!["news","center"].includes(panel.type) && singletonTypes.has(panel.type)) ||
        typeof panel.enabled !== "boolean" || typeof panel.label !== "string" ||
        !panel.label.trim() || panel.label.length > 50) {
      throw new Error("Hibás, ismétlődő vagy nem támogatott Carousel-panel.");
    }
    if (panel.type === "news" && panel.tags !== undefined &&
        (!Array.isArray(panel.tags) || panel.tags.length < 1 || panel.tags.length > 10 ||
         new Set(panel.tags).size !== panel.tags.length ||
         panel.tags.some((tag) => !/^[a-z][a-z0-9-]{1,31}$/.test(tag)))) {
      throw new Error("Hibás hírcsoport-szűrő.");
    }
    if (typeof panel.icon !== "string" || !panel.icon.trim() || panel.icon.length>12 ||
      (panel.type !== "widgets" && (!Array.isArray(panel.pages)||!panel.pages.length||new Set(panel.pages).size!==panel.pages.length||panel.pages.some(id=>!routes.has(id))))) throw new Error("Hibás főfül-oldalkapcsolat.");
    if (panel.type === "center") {
      if (!["learning","documents","services","heritage"].includes(panel.mode)||typeof panel.intro!=="string"||!panel.intro.trim()) throw new Error("Hibás központ konfiguráció.");
      if (panel.mode!=="documents" && (!Array.isArray(panel.collections)||!panel.collections.length||new Set(panel.collections).size!==panel.collections.length||panel.collections.some(k=>!config.contentExpansion.collections[k]||config.contentExpansion.collections[k].items.some(i=>!panel.pages.includes(i.relatedPage))))) throw new Error("Hibás központi gyűjteménykapcsolat.");
      if (panel.mode==="heritage" && (!panel.pages.includes(panel.timelinePage)||config.contentExpansion.activities[panel.timelinePage]?.kind!=="timeline")) throw new Error("Hibás idővonal.");
    }
    ids.add(panel.id);
    if (panel.type !== "news") singletonTypes.add(panel.type);
  }
  const active = data.panels.filter((panel) => panel.enabled);
  if (active.length < 2 || !["successes", "calendar"].every((type) =>
    active.some((panel) => panel.type === type))) {
    throw new Error("A Sportsikerek és a Tanévi naptár paneleknek elérhetőnek kell maradniuk.");
  }
  if (active.some((panel) => panel.type === "news")) {
    const news = config.home.newsSpotlight;
    if (!news || !Number.isInteger(news.maxItems) || news.maxItems < 1 || news.maxItems > 12 ||
        !Number.isInteger(news.maxAgeDays) || news.maxAgeDays < 1 || news.maxAgeDays > 3650 ||
        !Number.isInteger(news.maxFutureDays) || news.maxFutureDays < 1 || news.maxFutureDays > 1095 ||
        ["eyebrow","heading","intro","detailsLabel","emptyLabel","featuredLabel",
         "linksLabel","allNewsLabel","announcementsLabel"].some((key) =>
          typeof news[key] !== "string" || !news[key].trim()) ||
        !news.stateLabels || ["ongoing","upcoming","past"].some((key) =>
          typeof news.stateLabels[key] !== "string" || !news.stateLabels[key].trim()) ||
        !news.tagLabels || ["announcement","admission","event","studies","sports","community"].some((key) =>
          typeof news.tagLabels[key] !== "string" || !news.tagLabels[key].trim())) {
      throw new Error("Érvénytelen kiemelt hírek konfiguráció.");
    }
  }
  return { ...data, activePanels:[...active.filter(p=>p.type!=="widgets"),...active.filter(p=>p.type==="widgets")] };
}

/** A kizárás minden aktív fül deklarált oldalára automatikus, a fül típusától függetlenül. */
export function reservedWidgetPages(config){return new Set(checkedHomeCarousel(config).activePanels.filter(p=>p.type!=="widgets").flatMap(p=>p.pages));}
