import { element } from "../shared/js/dom.js?v=2.62";
import { getMenuPage, menuPageHref } from "../shared/js/menu-data.js?v=2.62";

/** Mobilon külön, függőleges érintésbarát témalista. */
export function createMobileHomeHighlights(config) {
  const data=config.home.homeHighlights;
  if (!data || data.items.length!==3 || data.items.some(item=>!getMenuPage(config,item.pageId)))
    throw new Error("Érvénytelen mobilos kezdőlapi gyorselérés.");
  return element("section",{className:"mobile-home-highlights",attributes:{"aria-labelledby":"mobile-home-highlights-title"}},
    element("p",{className:"mobile-home-highlights-kicker",text:data.kicker}),
    element("h2",{className:"mobile-home-highlights-title",text:data.title,attributes:{id:"mobile-home-highlights-title"}}),
    element("p",{className:"mobile-home-highlights-intro",text:data.intro}),
    element("nav",{className:"mobile-home-highlights-list",attributes:{"aria-label":"Fő témák gyors elérése"}},
      ...data.items.map(item=>element("a",{className:"mobile-home-highlight",attributes:{href:menuPageHref(item.pageId)}},
        element("span",{className:"mobile-home-highlight-icon",text:item.icon,attributes:{"aria-hidden":"true"}}),
        element("span",{className:"mobile-home-highlight-content"},
          element("strong",{text:item.title}),element("small",{text:item.subtitle})),
        element("span",{className:"mobile-home-highlight-arrow",text:"→",attributes:{"aria-hidden":"true"}})))));
}
