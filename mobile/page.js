import { element } from "../shared/js/dom.js?v=2.28";
import { getMenuPage } from "../shared/js/menu-data.js?v=2.28";

/** Önálló mobilos, egymás alá rendezett Bootstrap-kártyaszerkezet. */
export function createMobilePage(config, id) {
  const page = getMenuPage(config, id);
  if (!page) throw new Error("Ismeretlen mobilos oldalazonosító.");
  const cards = element("div", { className:"mobile-page-cards row" },
    ...page.items.map((card) => element("section", { className:"mobile-page-card card" },
      element("div", { className:"mobile-page-card-body card-body" },
        element("h2", { className:"mobile-page-card-title card-title", text:card.title }),
        element("p", { className:"mobile-page-card-summary card-text", text:card.summary }),
        ...card.groups.map((group) => element("section", { className:"mobile-page-card-group" },
          element("h3", { className:"mobile-page-card-group-title", text:group.title }),
          element("ul", { className:"mobile-page-card-points" },
            ...group.points.map((point) => element("li", { className:"mobile-page-card-point" },
              element("strong", { className:"mobile-page-card-point-title", text:point.title }),
              element("ul", { className:"mobile-page-card-details" },
                ...point.details.map((detail) => element("li", { text:detail }))))))))))));
  return element("article", { className:"mobile-page-preview" },
    element("h1", { className:"mobile-page-title", text:page.title,
      attributes: { tabindex:"-1" } }),
    element("p", { className:"mobile-page-intro", text:page.intro }),
    cards);
}
