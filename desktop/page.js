import { element } from "../shared/js/dom.js?v=2.22";
import { getMenuPage } from "../shared/js/menu-data.js?v=2.22";

/** Az asztali aloldalak tudatosan csak JSON-ból épített tartalomvázlatok. */
export function createDesktopPage(config, id) {
  const page = getMenuPage(config, id);
  if (!page) throw new Error("Ismeretlen asztali oldalazonosító.");
  const list = element("ul", { className:"desktop-page-list" },
    ...page.items.map((line) => element("li", { text:line })));
  return element("article", { className:"desktop-page-preview" },
    element("h1", { className:"desktop-page-title", text:page.title,
      attributes: { tabindex:"-1" } }),
    element("p", { className:"desktop-page-intro", text:page.intro }),
    list);
}
