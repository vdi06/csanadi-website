import { element } from "../shared/js/dom.js";
import { trapTab } from "../shared/js/focus.js";
import { filterSearchItems, navLink } from "../shared/js/shell.js";

/** Asztali Spotlight: majdnem teljes képernyős, de lebegő üvegpanel. */
export function createDesktopSearch(config, trigger, beforeOpen = () => {}) {
  const data = config.home.header;
  const closeButton = element("button", { className: "desktop-search-close",
    text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchCloseLabel } });
  const clearButton = element("button", { className: "desktop-search-clear",
    text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchClearLabel } });
  clearButton.hidden = true;
  const searchInput = element("input", { className: "desktop-search-input", attributes: {
    type: "search", placeholder: data.searchPlaceholder, "aria-label": data.searchPlaceholder,
    autocomplete: "off" } });
  const searchCount = element("p", { className: "desktop-search-count",
    attributes: { "aria-live": "polite" } });
  const searchResults = element("div", { className: "desktop-search-results",
    attributes: { "aria-live": "polite" } });
  const searchDialog = element("section", { className: "desktop-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } }, element("div", { className: "desktop-search-heading" },
    element("div", { className: "desktop-search-title-block" },
      element("span", { className: "desktop-search-eyebrow", text: data.searchEyebrow }),
      element("h2", { text: data.searchTitle })), closeButton),
  element("div", { className: "desktop-search-field" },
    element("span", { className: "desktop-search-field-symbol", text: data.searchGlyph,
      attributes: { "aria-hidden": "true" } }), searchInput, clearButton),
  searchCount, searchResults);
  const backdrop = element("div", { className: "desktop-search-backdrop",
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-search-overlay",
    attributes: { id: "desktop-floating-search" } }, backdrop, searchDialog);
  overlay.hidden = true;
  let previousOverflow;

  function render() {
    const matches = filterSearchItems(config, searchInput.value);
    clearButton.hidden = !String(searchInput.value || "").length;
    searchCount.textContent = `${matches.length} ${data.searchResultCountLabel}`;
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item) => {
        const link = navLink(item, "desktop-search-result");
        link.append(element("span", { className: "desktop-search-result-glyph",
          text: data.searchResultGlyph, attributes: { "aria-hidden": "true" } }));
        return link;
      })
      : [element("p", { text: data.searchNoResults })]));
  }
  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    if (document.body) document.body.style.overflow = previousOverflow || "";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", data.searchOpenLabel);
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  function open() {
    beforeOpen();
    if (!overlay.hidden) return;
    previousOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    overlay.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", data.searchCloseLabel);
    render();
    searchInput.focus({ preventScroll: true });
  }
  searchInput.addEventListener("input", render);
  clearButton.addEventListener("click", () => {
    searchInput.value = ""; render(); searchInput.focus({ preventScroll: true });
  });
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  closeButton.addEventListener("click", () => close());
  backdrop.addEventListener("click", () => close());
  searchDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    trapTab(event, [closeButton, searchInput,
      ...(!clearButton.hidden ? [clearButton] : []),
      ...Array.from(searchResults.children).filter((node) => node.tagName === "A")]);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
