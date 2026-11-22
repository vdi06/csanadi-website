import { crest, element } from "../shared/js/dom.js";
import { bindAppearance } from "../shared/js/appearance.js";
import { filterSearchItems, makeSocialLink, navLink } from "../shared/js/shell.js";

/** Asztali fejléc: saját vízszintes navigáció, külön nagy lebegő keresőablak.
 * Mobilmenü, mobil-gombállapot és mobil DOM itt nem létezik. */
export function makeDesktopHeader(config, home) {
  const data = config.home.header;
  const brand = element("a", { className: "home-brand desktop-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: data.schoolLine1 }),
    element("small", { text: data.schoolLine2 }));
  const topNavigation = element("nav", { className: "desktop-primary-nav", attributes: {
    "aria-label": data.navigationLabel
  } }, ...config.home.navigation.map((item) => navLink(item, "desktop-primary-link")));
  const crestHome = element("a", { className: "desktop-crest-home shell-crest-toggle",
    attributes: { href: config.routes.home, "aria-label": config.site.fullName } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "desktop-search-toggle shell-tool",
    text: data.searchGlyph,
    attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "desktop-floating-search", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "desktop-theme-toggle shell-tool",
    attributes: { type: "button", "aria-label": data.themeLabel } });

  const closeButton = element("button", { className: "desktop-search-close", text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchCloseLabel } });
  const searchInput = element("input", { className: "desktop-search-input", attributes: {
    type: "search", placeholder: data.searchPlaceholder, "aria-label": data.searchPlaceholder
  } });
  const searchResults = element("div", { className: "desktop-search-results", attributes: { "aria-live": "polite" } });
  const searchDialog = element("section", { className: "desktop-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } },
    element("div", { className: "desktop-search-heading" },
      element("h2", { text: data.searchTitle }), closeButton),
    searchInput, searchResults);
  const backdrop = element("div", { className: "desktop-search-backdrop", attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-search-overlay", attributes: {
    id: "desktop-floating-search"
  } }, backdrop, searchDialog);
  overlay.hidden = true;

  const header = element("header", { className: "desktop-header" },
    element("div", { className: "desktop-headline" }, brand, topNavigation),
    element("div", { className: "desktop-toolbar" },
      element("nav", { className: "desktop-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "desktop-social shell-tool"))),
      crestHome,
      element("div", { className: "desktop-links-right" }, searchToggle, themeToggle)),
    element("p", { className: "desktop-motto", text: data.motto }),
    overlay);

  function closeSearch() {
    overlay.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", data.searchOpenLabel);
    searchToggle.focus({ preventScroll: true });
  }
  function renderSearch() {
    const matches = filterSearchItems(config, searchInput.value);
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item) => navLink(item, "desktop-search-result"))
      : [element("p", { text: data.searchNoResults })]));
  }
  searchInput.addEventListener("input", renderSearch);
  searchToggle.addEventListener("click", () => {
    if (!overlay.hidden) { closeSearch(); return; }
    overlay.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    searchToggle.setAttribute("aria-label", data.searchCloseLabel);
    renderSearch();
    searchInput.focus({ preventScroll: true });
  });
  closeButton.addEventListener("click", closeSearch);
  backdrop.addEventListener("click", closeSearch);
  searchDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeSearch(); return; }
    if (event.key !== "Tab") return;
    event.preventDefault();
    const nodes = [closeButton, searchInput,
      ...Array.from(searchResults.children).filter((node) => node.tagName === "A")];
    const index = nodes.indexOf(document.activeElement);
    nodes[(index + (event.shiftKey ? nodes.length - 1 : 1) + nodes.length) % nodes.length]
      .focus({ preventScroll: true });
  });

  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: unbindAppearance };
}
