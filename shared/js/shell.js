import { crest, element } from "./dom.js";

/** Kizárólag a két jóváhagyott oldalsáv közös adatai és kezelése.
 * A mobilos és asztali elrendezést a saját app.js és styles.css határozza meg. */
let appearanceMode = null;
const SVG_NS = "http://www.w3.org/2000/svg";

function brandIcon(name) {
  if (name !== "facebook" && name !== "instagram") return null;
  const svg = document.createElementNS(SVG_NS, "svg");
  for (const [key, value] of Object.entries({viewBox:"0 0 24 24",width:24,height:24,
    "aria-hidden":"true", focusable:"false"})) svg.setAttribute(key, String(value));
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

function navLink(item, className = "") {
  const external = /^https:\/\//.test(item.href);
  return element("a", { className, text: item.label, attributes: {
    href: item.href, target: external ? "_blank" : undefined,
    rel: external ? "noopener noreferrer" : undefined
  } });
}

export function makeFooter(config, platform) {
  const { footer, navigation } = config.home;
  const emailLink = element("a", { text: footer.email, attributes: { href: `mailto:${footer.email}` } });
  return element("footer", { className: `${platform}-footer site-footer` },
    element("div", { className: "footer-inner" },
      element("div", { className: "footer-contact" },
        element("p", { className: "footer-brand", text: `${footer.brand} · ${footer.year}` }),
        element("h2", { text: footer.contactTitle }),
        element("p", { text: footer.address }),
        emailLink),
      element("nav", { className: "footer-links", attributes: { "aria-label": footer.linksTitle } },
        element("h2", { text: footer.linksTitle }),
        ...navigation.map((item) => navLink(item)))));
}

export function makeHeaderTools(config, platform, home) {
  const { header, navigation, footer } = config.home;
  const socials = header.social.map((item) => {
    const anchor = element("a", {
      className: `${platform}-social shell-tool`,
      attributes: { href: item.url, target: "_blank", rel: "noopener noreferrer",
        "aria-label": item.label, title: item.label }
    });
    const icon = brandIcon(item.icon);
    if (icon) anchor.append(icon);
    else anchor.textContent = item.glyph || "";
    return anchor;
  });
  const crestToggle = element("button", { className: `${platform}-crest-toggle shell-crest-toggle`,
    attributes: { type: "button", "aria-label": header.menuOpenLabel, "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: `${platform}-search-toggle shell-tool`,
    text: header.searchGlyph,
    attributes: { type: "button", "aria-label": header.searchOpenLabel, "aria-expanded": "false" } });
  const themeToggle = element("button", { className: `${platform}-theme-toggle shell-tool`,
    text: header.themeGlyph,
    attributes: { type: "button", "aria-label": header.themeLabel } });

  const menuPanel = element("nav", { className: `${platform}-menu-panel shell-panel`,
    attributes: { "aria-label": header.menuOpenLabel } },
    ...navigation.map((item) => navLink(item, "shell-nav-link")));
  menuPanel.hidden = true;
  const searchInput = element("input", { className: "shell-search-input", attributes: {
    type: "search", "aria-label": header.searchPlaceholder, placeholder: header.searchPlaceholder
  } });
  const searchResults = element("div", { className: "shell-search-results", attributes: { "aria-live": "polite" } });
  const searchPanel = element("div", { className: `${platform}-search-panel shell-panel` },
    searchInput, searchResults);
  searchPanel.hidden = true;

  function closeMenu() {
    menuPanel.hidden = true;
    crestToggle.setAttribute("aria-expanded", "false");
    crestToggle.setAttribute("aria-label", header.menuOpenLabel);
  }
  function closeSearch() {
    searchPanel.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", header.searchOpenLabel);
  }
  crestToggle.addEventListener("click", () => {
    const open = menuPanel.hidden;
    closeSearch();
    menuPanel.hidden = !open;
    crestToggle.setAttribute("aria-expanded", String(open));
    crestToggle.setAttribute("aria-label", open ? header.menuCloseLabel : header.menuOpenLabel);
    if (open) menuPanel.querySelector("a")?.focus({ preventScroll: true });
  });
  for (const link of menuPanel.children) link.addEventListener("click", closeMenu);
  menuPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault(); closeMenu(); crestToggle.focus({ preventScroll: true });
  });

  const searchables = [...navigation, ...header.social.map((item) => ({label:item.label,href:item.url})),
    {label:footer.contactTitle,href:`mailto:${footer.email}`}];
  function updateSearch() {
    const query = String(searchInput.value || "").toLocaleLowerCase("hu").trim();
    const matches = searchables.filter((item) => item.label.toLocaleLowerCase("hu").includes(query));
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item) => navLink(item, "shell-search-result"))
      : [element("p", { text: header.searchNoResults })]));
  }
  searchInput.addEventListener("input", updateSearch);
  searchToggle.addEventListener("click", () => {
    const open = searchPanel.hidden;
    closeMenu();
    searchPanel.hidden = !open;
    searchToggle.setAttribute("aria-expanded", String(open));
    searchToggle.setAttribute("aria-label", open ? header.searchCloseLabel : header.searchOpenLabel);
    if (open) { updateSearch(); searchInput.focus({ preventScroll: true }); }
  });
  searchPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault(); closeSearch(); searchToggle.focus({ preventScroll: true });
  });

  function applyTheme() {
    const mode = appearanceMode || config.appearance.defaultMode;
    home.dataset.theme = mode;
    const palette = mode === "light" ? config.appearance.light : config.theme;
    for (const [name, value] of Object.entries(palette)) home.style.setProperty(`--${name}`, value);
    themeToggle.textContent = mode === "light" ? header.lightThemeGlyph : header.themeGlyph;
    themeToggle.setAttribute("aria-label", `${header.themeLabel}: ${mode === "light" ? header.lightThemeLabel : header.darkThemeLabel}`);
  }
  themeToggle.addEventListener("click", () => {
    appearanceMode = (appearanceMode || config.appearance.defaultMode) === "dark" ? "light" : "dark";
    applyTheme();
  });
  applyTheme();
  return { socials, crestToggle, searchToggle, themeToggle, menuPanel, searchPanel };
}
