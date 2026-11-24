import { element } from "../shared/js/dom.js?v=2.62";
import { getMenuPage, menuPageHref } from "../shared/js/menu-data.js?v=2.62";

/** JSON-vezérelt asztali kezdőlapi gyűjtőpont; nem második menü. */
export function createDesktopHomeHighlights(config) {
  const data=config.home.homeHighlights;
  if (!data || data.items.length!==3 || data.items.some(item=>!getMenuPage(config,item.pageId)))
    throw new Error("Érvénytelen kezdőlapi gyorselérés.");
  return element("section",{className:"desktop-home-highlights",attributes:{"aria-labelledby":"desktop-home-highlights-title"}},
    element("div",{className:"desktop-home-highlights-inner"},
      element("p",{className:"desktop-home-highlights-kicker",text:data.kicker}),
      element("h2",{className:"desktop-home-highlights-title",text:data.title,attributes:{id:"desktop-home-highlights-title"}}),
      element("p",{className:"desktop-home-highlights-intro",text:data.intro}),
      element("nav",{className:"desktop-home-highlights-grid",attributes:{"aria-label":"Fő témák gyors elérése"}},
        ...data.items.map((item,index)=>element("a",{className:"desktop-home-highlight",attributes:{href:menuPageHref(item.pageId)}},
          element("span",{className:"desktop-home-highlight-icon",text:item.icon,attributes:{"aria-hidden":"true"}}),
          element("span",{className:"desktop-home-highlight-content"},
            element("strong",{text:item.title}),element("small",{text:item.subtitle})),
          element("span",{className:"desktop-home-highlight-arrow",text:"→",attributes:{"aria-hidden":"true"}}))))));
}
