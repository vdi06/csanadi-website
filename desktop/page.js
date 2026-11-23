import { element } from "../shared/js/dom.js?v=2.29";
import { getMenuPage } from "../shared/js/menu-data.js?v=2.29";

/** Az asztali aloldalak Bootstrap-kártyaszerkezetű, hierarchikus JSON-vázlatok. */
export function createDesktopPage(config, id) {
  const page = getMenuPage(config, id);
  if (!page) throw new Error("Ismeretlen asztali oldalazonosító.");
  const cards = element("div", { className:"desktop-page-cards row" },
    ...page.items.map((card) => element("section", { className:"desktop-page-card card" },
      element("div", { className:"desktop-page-card-body card-body" },
        element("h2", { className:"desktop-page-card-title card-title", text:card.title }),
        element("p", { className:"desktop-page-card-summary card-text", text:card.summary }),
        ...card.groups.map((group) => element("section", { className:"desktop-page-card-group" },
          element("h3", { className:"desktop-page-card-group-title", text:group.title }),
          element("ul", { className:"desktop-page-card-points" },
            ...group.points.map((point) => element("li", { className:"desktop-page-card-point" },
              element("strong", { className:"desktop-page-card-point-title", text:point.title }),
              element("ul", { className:"desktop-page-card-details" },
                ...point.details.map((detail) => element("li", { text:detail }))))))))))));
  return element("article", { className:"desktop-page-preview" },
    element("h1", { className:"desktop-page-title", text:page.title,
      attributes: { tabindex:"-1" } }),
    element("p", { className:"desktop-page-intro", text:page.intro }),
    cards);
}
