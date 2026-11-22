import { crest, element } from "../shared/js/dom.js";
import { bindAppearance } from "../shared/js/appearance.js";
import { createEditMode } from "../shared/js/edit-mode.js";
import { trapTab } from "../shared/js/focus.js";
import { filterSearchItems, makeSocialLink, navLink } from "../shared/js/shell.js";
import { createDesktopMenu } from "./menu.js";

/** Asztali fejléc: címerből nyíló körmenü és külön nagy lebegő keresőablak.
 * A mobilmenü és annak DOM-ja itt nem létezik. */
export function makeDesktopHeader(config, home) {
  const data = config.home.header;
  const brand = element("a", { className: "home-brand desktop-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: data.schoolLine1 }),
    element("small", { text: data.schoolLine2 }));
  const crestToggle = element("button", { className: "desktop-crest-toggle shell-crest-toggle",
    attributes: { type: "button", "aria-label": data.menuOpenLabel,
      "aria-controls": "desktop-main-menu", "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "desktop-search-toggle shell-tool",
    text: data.searchGlyph,
    attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "desktop-floating-search", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "desktop-theme-toggle shell-tool shell-theme-toggle",
    attributes: { type: "button", "aria-label": data.themeLabel } });
  const editToggle = element("button", { className: "desktop-edit-toggle shell-tool",
    text: data.settingsGlyph, attributes: { type: "button", "aria-label": data.settingsLabel,
      "aria-pressed": "false" } });

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
  let searchOverflow;

  const menu = createDesktopMenu(config, crestToggle, () => {
    closeSearch(false);
  });
  const editor = createEditMode(config, home, editToggle, "desktop");

  const header = element("header", { className: "desktop-header" },
    element("div", { className: "desktop-headline" }, brand),
    element("div", { className: "desktop-toolbar" },
      element("nav", { className: "desktop-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "desktop-social shell-tool"))),
      crestToggle,
      element("div", { className: "desktop-links-right" }, searchToggle, themeToggle,
        editToggle)),
    element("p", { className: "desktop-motto", text: data.motto }),
    overlay, menu.overlay, editor.bar);

  function closeSearch(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    if (document.body) document.body.style.overflow = searchOverflow || "";
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", data.searchOpenLabel);
    if (restoreFocus) searchToggle.focus({ preventScroll: true });
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
    menu.close(false);
    searchOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    overlay.hidden = false;
    searchToggle.setAttribute("aria-expanded", "true");
    searchToggle.setAttribute("aria-label", data.searchCloseLabel);
    renderSearch();
    searchInput.focus({ preventScroll: true });
  });
  closeButton.addEventListener("click", () => closeSearch());
  backdrop.addEventListener("click", () => closeSearch());
  searchDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeSearch(); return; }
    const nodes = [closeButton, searchInput,
      ...Array.from(searchResults.children).filter((node) => node.tagName === "A")];
    trapTab(event, nodes);
  });

  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: () => {
    closeSearch(false); menu.destroy(); editor.destroy(); unbindAppearance();
  } };
}
