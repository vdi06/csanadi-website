import { crest, element } from "../shared/js/dom.js";
import { bindAppearance } from "../shared/js/appearance.js";
import { createEditMode } from "../shared/js/edit-mode.js";
import { trapTab } from "../shared/js/focus.js";
import { filterSearchItems, makeSocialLink, navLink } from "../shared/js/shell.js";
import { createMobileMenu } from "./menu.js";

/** Csak mobilos fejléc: középső címerből nyíló harmonikamenü, külön kereső. */
export function makeMobileHeader(config, home) {
  const data = config.home.header;
  const brand = element("a", { className: "home-brand mobile-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: data.schoolLine1 }),
    element("small", { text: data.schoolLine2 }));
  const crestToggle = element("button", { className: "mobile-crest-toggle shell-crest-toggle",
    attributes: { type: "button", "aria-label": data.menuOpenLabel,
      "aria-controls": "mobile-main-menu", "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "mobile-search-toggle shell-tool",
    text: data.searchGlyph, attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "mobile-search-view", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "mobile-theme-toggle shell-tool shell-theme-toggle",
    attributes: { type: "button", "aria-label": data.themeLabel } });
  const editToggle = element("button", { className: "mobile-edit-toggle shell-tool",
    text: data.settingsGlyph, attributes: { type: "button", "aria-label": data.settingsLabel,
      "aria-pressed": "false" } });

  const searchClose = element("button", { className: "mobile-overlay-close", text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchCloseLabel } });
  const searchInput = element("input", { className: "mobile-search-input", attributes: {
    type: "search", placeholder: data.searchPlaceholder, "aria-label": data.searchPlaceholder
  } });
  const searchResults = element("div", { className: "mobile-search-results", attributes: { "aria-live": "polite" } });
  const searchDialog = element("section", { className: "mobile-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } }, element("div", { className: "mobile-overlay-heading" },
      element("h2", { text: data.searchTitle }), searchClose),
    searchInput, searchResults);
  const searchBackdrop = element("div", { className: "mobile-overlay-backdrop", attributes: {
    "aria-hidden": "true"
  } });
  const searchOverlay = element("div", { className: "mobile-search-overlay", attributes: {
    id: "mobile-search-view"
  } }, searchBackdrop, searchDialog);
  searchOverlay.hidden = true;
  let searchOverflow;

  const menu = createMobileMenu(config, crestToggle, () => {
    closeSearch(false);
  });
  const editor = createEditMode(config, home, editToggle, "mobile");

  const header = element("header", { className: "mobile-header" },
    brand,
    element("div", { className: "mobile-toolbar" },
      element("nav", { className: "mobile-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "mobile-social shell-tool"))),
      crestToggle,
      element("div", { className: "mobile-links-right" }, searchToggle, themeToggle, editToggle)),
    element("p", { className: "mobile-motto", text: data.motto }),
    menu.overlay, searchOverlay, editor.bar);

  function closeSearch(restoreFocus = true) {
    if (searchOverlay.hidden) return;
    searchOverlay.hidden = true;
    if (document.body) document.body.style.overflow = searchOverflow || "";
    searchToggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) searchToggle.focus({ preventScroll: true });
  }
  function renderSearch() {
    const matches = filterSearchItems(config, searchInput.value);
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item) => navLink(item, "mobile-search-result"))
      : [element("p", { text: data.searchNoResults })]));
  }
  searchInput.addEventListener("input", renderSearch);
  searchToggle.addEventListener("click", () => {
    if (!searchOverlay.hidden) { closeSearch(); return; }
    menu.close(false);
    searchOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    searchOverlay.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    renderSearch();
    searchInput.focus({ preventScroll: true });
  });
  searchClose.addEventListener("click", () => closeSearch());
  searchBackdrop.addEventListener("click", () => closeSearch());
  searchDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeSearch(); }
    else trapTab(event, [searchClose, searchInput,
      ...Array.from(searchResults.children).filter((node) => node.tagName === "A")]);
  });

  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: () => {
    closeSearch(false); menu.destroy(); editor.destroy(); unbindAppearance();
  } };
}
