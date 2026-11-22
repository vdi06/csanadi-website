import { element } from "../shared/js/dom.js?v=2.14";
import { trapTab } from "../shared/js/focus.js?v=2.14";
import { filterSearchItems, navLink } from "../shared/js/shell.js?v=2.14";

/** Mobilos Spotlight: valódi teljes képernyős, háttérhomályosító kereső. */
export function createMobileSearch(config, trigger, beforeOpen = () => {}) {
  const data = config.home.header;
  const closeButton = element("button", { className: "mobile-overlay-close",
    text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchCloseLabel } });
  const clearButton = element("button", { className: "mobile-search-clear",
    text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchClearLabel } });
  clearButton.hidden = true;
  const searchInput = element("input", { className: "mobile-search-input", attributes: {
    type: "search", placeholder: data.searchPlaceholder, "aria-label": data.searchPlaceholder,
    autocomplete: "off" } });
  const searchCount = element("p", { className: "mobile-search-count",
    attributes: { "aria-live": "polite" } });
  const searchResults = element("div", { className: "mobile-search-results",
    attributes: { "aria-live": "polite" } });
  const dialog = element("section", { className: "mobile-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } }, element("div", { className: "mobile-overlay-heading" },
    element("div", { className: "mobile-search-title-block" },
      element("span", { className: "mobile-search-eyebrow", text: data.searchEyebrow }),
      element("h2", { text: data.searchTitle })), closeButton),
  element("div", { className: "mobile-search-field" },
    element("span", { className: "mobile-search-field-symbol", text: data.searchGlyph,
      attributes: { "aria-hidden": "true" } }), searchInput, clearButton),
  searchCount, searchResults);
  const backdrop = element("div", { className: "mobile-overlay-backdrop",
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "mobile-search-overlay",
    attributes: { id: "mobile-search-view" } }, backdrop, dialog);
  overlay.hidden = true;
  let previousOverflow;

  function render() {
    const matches = filterSearchItems(config, searchInput.value);
    clearButton.hidden = !String(searchInput.value || "").length;
    searchCount.textContent = `${matches.length} ${data.searchResultCountLabel}`;
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item) => {
        const link = navLink(item, "mobile-search-result");
        link.append(element("span", { className: "mobile-search-result-glyph",
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
  dialog.addEventListener("keydown", (event) => {
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
