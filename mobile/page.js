import { element } from "../shared/js/dom.js?v=2.14";
import { getMenuPage } from "../shared/js/menu-data.js?v=2.14";

/** Önálló mobilos oldal: csak egy középre rendezett, olvasható felsorolás. */
export function createMobilePage(config, id) {
  const page = getMenuPage(config, id);
  if (!page) throw new Error("Ismeretlen mobilos oldalazonosító.");
  const list = element("ul", { className:"mobile-page-list" },
    ...page.items.map((line) => element("li", { text:line })));
  return element("article", { className:"mobile-page-preview" },
    element("h1", { className:"mobile-page-title", text:page.title,
      attributes: { tabindex:"-1" } }),
    element("p", { className:"mobile-page-intro", text:page.intro }),
    list);
}
