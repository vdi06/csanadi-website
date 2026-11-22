import { crest, element } from "../shared/js/dom.js";
import { bindAppearance } from "../shared/js/appearance.js";
import { filterSearchItems, makeSocialLink, navLink } from "../shared/js/shell.js";

/** Csak mobilra tervezett fejléc: címeres főmenü + külön teljes képernyős kereső. */
export function makeMobileHeader(config, home) {
  const data = config.home.header;
  const brand = element("a", { className: "home-brand mobile-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: data.schoolLine1 }),
    element("small", { text: data.schoolLine2 }));
  const menuToggle = element("button", { className: "mobile-crest-toggle shell-crest-toggle",
    attributes: { type: "button", "aria-label": data.menuOpenLabel,
      "aria-controls": "mobile-main-menu", "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "mobile-search-toggle shell-tool",
    text: data.searchGlyph, attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "mobile-search-view", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "mobile-theme-toggle shell-tool shell-theme-toggle",
    attributes: { type: "button", "aria-label": data.themeLabel } });

  const navLinks = config.home.navigation.map((item) => navLink(item, "mobile-menu-link"));
  const menuClose = element("button", { className: "mobile-overlay-close", text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.menuCloseLabel } });
  const menuDialog = element("section", { className: "mobile-menu-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.menuTitle
  } },
    element("div", { className: "mobile-overlay-heading" },
      element("h2", { text: data.menuTitle }), menuClose),
    element("nav", { className: "mobile-menu-links", attributes: { "aria-label": data.navigationLabel } },
      ...navLinks));
  const menuBackdrop = element("div", { className: "mobile-overlay-backdrop", attributes: { "aria-hidden": "true" } });
  const menuOverlay = element("div", { className: "mobile-menu-overlay", attributes: { id: "mobile-main-menu" } },
    menuBackdrop, menuDialog);
  menuOverlay.hidden = true;

  const searchClose = element("button", { className: "mobile-overlay-close", text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchCloseLabel } });
  const searchInput = element("input", { className: "mobile-search-input", attributes: {
    type: "search", placeholder: data.searchPlaceholder, "aria-label": data.searchPlaceholder
  } });
  const searchResults = element("div", { className: "mobile-search-results", attributes: { "aria-live": "polite" } });
  const searchDialog = element("section", { className: "mobile-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } },
    element("div", { className: "mobile-overlay-heading" },
      element("h2", { text: data.searchTitle }), searchClose),
    searchInput, searchResults);
  const searchBackdrop = element("div", { className: "mobile-overlay-backdrop", attributes: { "aria-hidden": "true" } });
  const searchOverlay = element("div", { className: "mobile-search-overlay", attributes: { id: "mobile-search-view" } },
    searchBackdrop, searchDialog);
  searchOverlay.hidden = true;

  const header = element("header", { className: "mobile-header" },
    brand,
    element("div", { className: "mobile-toolbar" },
      element("nav", { className: "mobile-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "mobile-social shell-tool"))),
      menuToggle,
      element("div", { className: "mobile-links-right" }, searchToggle, themeToggle)),
    element("p", { className: "mobile-motto", text: data.motto }),
    menuOverlay, searchOverlay);

  function closeMenu(restoreFocus = true) {
    menuOverlay.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", data.menuOpenLabel);
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }
  function closeSearch(restoreFocus = true) {
    searchOverlay.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", data.searchOpenLabel);
    if (restoreFocus) searchToggle.focus({ preventScroll: true });
  }
  function trapTab(event, elements) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const index = elements.indexOf(document.activeElement);
    const target = (index + (event.shiftKey ? elements.length - 1 : 1) + elements.length) % elements.length;
    elements[target].focus({ preventScroll: true });
  }
  menuToggle.addEventListener("click", () => {
    if (!menuOverlay.hidden) { closeMenu(); return; }
    closeSearch(false);
    menuOverlay.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", data.menuCloseLabel);
    navLinks[0]?.focus({ preventScroll: true });
  });
  menuClose.addEventListener("click", () => closeMenu());
  menuBackdrop.addEventListener("click", () => closeMenu());
  for (const link of navLinks) link.addEventListener("click", () => closeMenu(false));
  menuDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeMenu(); }
    else trapTab(event, [menuClose, ...navLinks]);
  });

  function renderSearch() {
    const matches = filterSearchItems(config, searchInput.value);
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item) => navLink(item, "mobile-search-result"))
      : [element("p", { text: data.searchNoResults })]));
  }
  searchInput.addEventListener("input", renderSearch);
  searchToggle.addEventListener("click", () => {
    if (!searchOverlay.hidden) { closeSearch(); return; }
    closeMenu(false);
    searchOverlay.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    searchToggle.setAttribute("aria-label", data.searchCloseLabel);
    renderSearch();
    searchInput.focus({ preventScroll: true });
  });
  searchClose.addEventListener("click", () => closeSearch());
  searchBackdrop.addEventListener("click", () => closeSearch());
  searchDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeSearch(); }
    else trapTab(event, [searchClose, searchInput, ...Array.from(searchResults.children).filter((node) => node.tagName === "A")]);
  });

  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: unbindAppearance };
}
