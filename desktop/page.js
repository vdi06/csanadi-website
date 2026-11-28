import {makePagePoints} from "../shared/js/components/page-points.js?v=2.78";
import { collectionView, relatedView, openContentDialog } from "../shared/js/content-expansion.js?v=2.78";
import { element } from "../shared/js/dom.js?v=2.78";
import { getMenuPage } from "../shared/js/menu-data.js?v=2.78";

const cls = (part) => `desktop-page-${part}`;
const {details:detailsList,point:classicPoint}=makePagePoints(cls);

function richGroup(group, kind) {
  const heading = element("h3", { className:cls("card-group-title"), text:group.title });
  if (kind === "accordion") {
    return element("section", { className:`${cls("card-group")} accordion` }, heading,
      ...group.points.map((point) => element("details", {
        className:`${cls("accordion-item")} accordion-item`
      }, element("summary", {
        className:`${cls("accordion-button")} accordion-button`, text:point.title
      }), element("div", { className:"accordion-body" }, detailsList(point)))));
  }
  if (kind === "table") {
    return element("section", { className:cls("card-group") }, heading,
      element("div", { className:cls("table-wrap") },
        element("table", { className:`${cls("table")} table table-striped`,
          attributes:{ "aria-label":group.title } },
          element("tbody", {}, ...group.points.map((point) => element("tr", {},
            element("th", { text:point.title, attributes:{scope:"row"} }),
            element("td", { text:point.details.join(" · ") })))))));
  }
  if (kind === "badges") {
    return element("section", { className:cls("card-group") }, heading,
      element("div", { className:cls("badge-list") },
        ...group.points.map((point) => element("div", { className:cls("badge-entry") },
          element("span", { className:"badge rounded-pill", text:point.title }),
          element("p", { text:point.details.join(" ") })))));
  }
  const isNumbered = kind === "steps" || kind === "timeline";
  const listTag = isNumbered ? "ol" : "ul";
  const listClasses = [cls("card-points")];
  if (kind === "steps") listClasses.push("list-group","list-group-numbered",cls("steps"));
  else if (kind === "timeline") listClasses.push("list-group",cls("timeline"));
  else if (kind === "list") listClasses.push("list-group",cls("list"));
  return element("section", { className:cls("card-group") }, heading,
    element(listTag, { className:listClasses.join(" ") }, ...group.points.map(classicPoint)));
}

function gallery(config, category) {
  const slides = config.home.desktopHero.slides.filter((slide) => slide.pageId === category);
  if (!slides.length) return null;
  return element("div", { className:cls("gallery-grid") }, ...slides.map((slide) =>
    element("figure", { className:cls("gallery-item") },
      element("img", { attributes:{
        src:`./shared/assets/media/web/desktop-hero/${slide.file}`,
        alt:slide.title, loading:"lazy", decoding:"async", width:1672, height:941
      } }), element("figcaption", { text:slide.title }))));
}

function cardElement(card, config, page) {
  const kind = card.kind || "card";
  const wide = ["gallery","table","timeline"].includes(kind);
  const extra = kind === "alert" ? " alert alert-warning" : "";
  return element("section", {
    className:`${cls("card")} card ${cls("kind-" + kind)}${wide ? " is-wide" : ""}${extra}`
  }, element("div", { className:`${cls("card-body")} card-body` },
    element("h2", { className:`${cls("card-title")} card-title`, text:card.title }),
    element("p", { className:`${cls("card-summary")} card-text`, text:card.summary }),
    ...card.groups.map((group) => richGroup(group,kind)),
    ...(kind === "gallery" && page.galleryCategory ? [gallery(config,page.galleryCategory)] : [])));
}

/** Asztali, tartalomtípushoz alkalmazkodó, JSON-vezérelt Bootstrap-komponensek. */
export function createDesktopPage(config, id, { hideHeading = false, hideIntro = false, hideCards = false, extraContent = null } = {}) {
  const page = getMenuPage(config,id);
  if (!page) throw new Error("Ismeretlen asztali oldalazonosító.");
  return element("article", { className:cls("preview") },
    ...(hideHeading ? [] : [element("h1", { className:cls("title"), text:page.title,
      attributes:{tabindex:"-1"} })]),
    ...(hideIntro ? [] : [element("p", { className:cls("intro"), text:page.intro })]),
    ...(extraContent ? [extraContent] : []),
    ...(page.collectionId ? [collectionView(config,page.collectionId,"desktop")] : []),
    ...(hideCards ? [] : [element("div", { className:`${cls("cards")} row` },
      ...page.items.map((card) => cardElement(card,config,page)))]) );
}
