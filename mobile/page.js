import { collectionView, relatedView, openContentDialog } from "../shared/js/content-expansion.js?v=2.63";
import { element } from "../shared/js/dom.js?v=2.63";
import { getMenuPage } from "../shared/js/menu-data.js?v=2.63";

const css = (name) => `mobile-page-${name}`;
function pointDetails(point) {
  return element("ul", { className:css("card-details") },
    ...point.details.map((detail) => element("li", { text:detail })));
}
function item(point) {
  return element("li", { className:css("card-point") },
    point.href ? element("a",{className:css("card-point-title"),text:point.title,
      attributes:{href:point.href}}) :
      element("strong", { className:css("card-point-title"), text:point.title }),
    pointDetails(point));
}
function mobileGroup(group, kind) {
  const title = element("h3", { className:css("card-group-title"), text:group.title });
  const section = element("section", { className:css("card-group") }, title);
  if (kind === "accordion") {
    section.className += " accordion";
    for (const point of group.points) section.append(element("details", {
      className:`${css("accordion-item")} accordion-item`
    }, element("summary", { className:"accordion-button", text:point.title }),
      element("div", { className:"accordion-body" },pointDetails(point))));
  } else if (kind === "table") {
    // Telefonon az időadatok kártyás sorok, így nincs vízszintes görgetés.
    section.append(element("dl", { className:css("time-list") },
      ...group.points.flatMap((point) => [
        element("dt", { text:point.title }),
        element("dd", { text:point.details.join(" · ") })
      ])));
  } else if (kind === "badges") {
    section.append(element("div", { className:css("badge-list") },
      ...group.points.map((point) => element("div", { className:css("badge-entry") },
        element("span", { className:"badge rounded-pill", text:point.title }),
        element("p", { text:point.details.join(" ") })))));
  } else {
    const numbered = kind === "steps" || kind === "timeline";
    const className = `${css("card-points")}${numbered ? " list-group list-group-numbered" : ""}` +
      (kind === "timeline" ? ` ${css("timeline")}` : "");
    section.append(element(numbered ? "ol" : "ul", { className },...group.points.map(item)));
  }
  return section;
}
function galleryImages(config, category) {
  const slides = config.home.desktopHero.slides.filter((slide) => slide.pageId === category);
  if (!slides.length) return null;
  return element("div", { className:css("gallery-grid") }, ...slides.map((slide) =>
    element("figure", { className:css("gallery-item") },
      element("img", { attributes:{
        src:`./shared/assets/media/web/desktop-hero/${slide.file}`,
        alt:slide.title, loading:"lazy", decoding:"async", width:1672, height:941
      } }),
      element("figcaption", { text:slide.title }))));
}
function mobileCard(card, config, page) {
  const kind=card.kind||"card";
  const views=[];
  for(const group of card.groups){
    for(let n=0;n<group.points.length;n+=2){
      const chunk={...group,points:group.points.slice(n,n+2)};
      views.push(()=>element("div",{className:"content-card-view"},n===0?element("p",{text:card.summary}):null,mobileGroup(chunk,kind==="accordion"?"list":kind)));
    }
  }
  if(kind==="gallery"&&page.galleryCategory)views.push(()=>galleryImages(config,page.galleryCategory)||element("p",{text:"Jelenleg nincs kép."}));
  const button=element("button",{className:"content-tile mobile-compact-panel",attributes:{type:"button","aria-haspopup":"dialog"}},element("span",{className:"content-kicker",text:kind==="timeline"?"Idővonal":kind==="steps"?"Útmutató":kind==="table"?"Adatok":"Tudnivalók"}),element("strong",{text:card.title}),element("span",{className:"content-tile-summary",text:card.summary}),element("span",{className:"content-tile-arrow",text:"Részletek ›"}));
  button.addEventListener("click",()=>openContentDialog({title:card.title,views,trigger:button}));
  // Az azonnal fontos hivatalos közlések maradjanak láthatók, ne csak a részletekben.
  return element("section",{className:`${css("card")} mobile-compact-card ${kind==="alert"?"is-important":""}`},element("h2",{className:"visually-hidden",text:card.title}),button,kind==="alert"?element("p",{className:"content-important",text:card.groups.flatMap(g=>g.points.flatMap(p=>p.details)).join(" ")}):null);
}

/** Mobilos, külön szerkesztett és reszponzív komponensváltozat. */
export function createMobilePage(config, id, { hideHeading = false, hideIntro = false, hideCards = false, extraContent = null } = {}) {
  const page = getMenuPage(config,id);
  if (!page) throw new Error("Ismeretlen mobilos oldalazonosító.");
  return element("article", { className:css("preview") },
    ...(hideHeading ? [] : [element("h1", { className:css("title"), text:page.title,
      attributes:{tabindex:"-1"} })]),
    ...(hideIntro ? [] : [element("p", { className:css("intro"), text:page.intro })]),
    ...(extraContent ? [extraContent] : []),
    ...(page.collectionId ? [collectionView(config,page.collectionId,"mobile")] : []),
    ...(hideCards ? [] : [element("div", { className:`${css("cards")} row` },
      ...page.items.map((card) => mobileCard(card,config,page)))]) );
}
