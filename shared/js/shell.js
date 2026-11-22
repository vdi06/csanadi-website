import { element } from "./dom.js?v=2.17";

/** Kizárólag közös adatelérés, ikonok és lábléc.
 * Fejlécet itt szándékosan NEM építünk: azt a két platform a saját fájljában teszi. */
const SVG_NS = "http://www.w3.org/2000/svg";

function brandIcon(name) {
  if (name !== "facebook" && name !== "instagram") return null;
  const svg = document.createElementNS(SVG_NS, "svg");
  for (const [key, value] of Object.entries({viewBox:"0 0 24 24",width:24,height:24,
    "aria-hidden":"true",focusable:"false"})) svg.setAttribute(key, String(value));
  if (name === "facebook") {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M14.25 8.25V6.8c0-.75.41-1.12 1.2-1.12h1.6V2.45h-2.82c-3.05 0-4.76 1.83-4.76 4.83v.97H7v3.43h2.47V22h3.63V11.68h3.11l.47-3.43h-3.58Z");
    path.setAttribute("fill", "currentColor");
    svg.append(path);
  } else {
    for (const [tag, attrs] of [
      ["rect", {x:3,y:3,width:18,height:18,rx:5}],
      ["circle", {cx:12,cy:12,r:4}],
      ["circle", {cx:17.5,cy:6.5,r:1,fill:"currentColor",stroke:"none"}]
    ]) {
      const shape = document.createElementNS(SVG_NS, tag);
      for (const [key, value] of Object.entries(attrs)) shape.setAttribute(key, String(value));
      svg.append(shape);
    }
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
  }
  return svg;
}

export function makeSocialLink(item, className) {
  const link = element("a", { className, attributes: {
    href: item.url, target: "_blank", rel: "noopener noreferrer",
    "aria-label": item.label, title: item.label
  } });
  const icon = brandIcon(item.icon);
  if (icon) link.append(icon);
  else link.textContent = item.glyph || "";
  return link;
}

export function navLink(item, className = "") {
  const external = /^https:\/\//.test(item.href);
  return element("a", { className, text: item.label, attributes: {
    href: item.href, target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined
  } });
}

export function searchItems(config) {
  const { header, footer } = config.home;
  return [...header.social.map((item) => ({
    label:item.label, href:item.url, short:item.searchShort,
    summary:item.searchSummary,
    category:item.icon === "kreta" ? header.searchDiaryCategory : header.searchSocialCategory
  })),
    {label:footer.contactTitle,href:`mailto:${footer.email}`,
      short:footer.contactTitle, summary:header.searchEmailSummary,
      category:header.searchContactCategory}];
}

export function filterSearchItems(config, query) {
  const needle = String(query || "").toLocaleLowerCase("hu").trim();
  return searchItems(config).filter((item) =>
    [item.label,item.short,item.summary,item.category].some((value) =>
      String(value || "").toLocaleLowerCase("hu").includes(needle)));
}

