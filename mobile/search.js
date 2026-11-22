import { element } from "../shared/js/dom.js?v=2.26";
import { trapTab } from "../shared/js/focus.js?v=2.26";
import { filterSearchItems, navLink, searchItems } from "../shared/js/shell.js?v=2.26";

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
    id: "mobile-search-query", type: "search", placeholder: data.searchPlaceholder,
    "aria-label": data.searchPlaceholder,
    autocomplete: "off" } });
  const searchCount = element("p", { className: "mobile-search-count",
    attributes: { "aria-live": "polite" } });
  const resultsTitle = element("h3", { className: "mobile-search-results-title" });
  const searchResults = element("div", { className: "mobile-search-results",
    attributes: { "aria-live": "polite" } });
  const quickButtons = searchItems(config).map((item) => {
    const button = element("button", { className: "mobile-search-chip", text: item.short,
      attributes: { type: "button", "aria-label": item.short } });
    button.addEventListener("click", () => {
      searchInput.value = item.short;
      render();
      searchInput.focus({ preventScroll:true });
    });
    return button;
  });
  const dialog = element("section", { className: "mobile-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } }, element("div", { className: "mobile-search-ambient", attributes: { "aria-hidden": "true" } }),
  element("div", { className: "mobile-overlay-heading" },
    element("div", { className: "mobile-search-title-block" },
      element("div", { className: "mobile-search-kicker" },
        element("span", { className: "mobile-search-emblem", text: data.searchEmblem,
          attributes: { "aria-hidden": "true" } }),
        element("span", { className: "mobile-search-eyebrow", text: data.searchEyebrow })),
      element("h2", { text: data.searchTitle }),
      element("p", { className: "mobile-search-lead", text: data.searchLead })), closeButton),
  element("div", { className: "mobile-search-input-group" },
    element("label", { className: "mobile-search-field-label", text: data.searchFieldLabel,
      attributes: { for: "mobile-search-query" } }),
    element("div", { className: "mobile-search-field" },
      element("span", { className: "mobile-search-field-symbol", text: data.searchGlyph,
        attributes: { "aria-hidden": "true" } }), searchInput, clearButton)),
  element("div", { className: "mobile-search-quick" },
    element("span", { className: "mobile-search-quick-title", text: data.searchQuickTitle }),
    element("div", { className: "mobile-search-quick-list" }, ...quickButtons)),
  element("div", { className: "mobile-search-result-bar" },
    resultsTitle, searchCount),
  searchResults,
  element("div", { className: "mobile-search-bottom" },
    element("p", { text: data.searchScopeHint }),
    element("span", { text: data.searchKeyboardHint })));
  const backdrop = element("div", { className: "mobile-overlay-backdrop",
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "mobile-search-overlay",
    attributes: { id: "mobile-search-view" } }, backdrop, dialog);
  overlay.hidden = true;
  let previousOverflow;

  function render() {
    const matches = filterSearchItems(config, searchInput.value);
    clearButton.hidden = !String(searchInput.value || "").length;
    resultsTitle.textContent = String(searchInput.value || "").trim()
      ? data.searchResultsTitle : data.searchFeaturedTitle;
    searchCount.textContent = `${matches.length} ${data.searchResultCountLabel}`;
    searchResults.replaceChildren(...(matches.length
      ? matches.map((item, index) => {
        const link = navLink(item, "mobile-search-result");
        link.replaceChildren(
          element("span", { className: "mobile-search-result-index",
            text: String(index + 1).padStart(2, "0"), attributes: { "aria-hidden": "true" } }),
          element("span", { className: "mobile-search-result-copy" },
            element("span", { className: "mobile-search-result-category", text: item.category }),
            element("strong", { className: "mobile-search-result-title", text: item.label }),
            element("span", { className: "mobile-search-result-summary", text: item.summary })),
          element("span", { className: "mobile-search-result-glyph",
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
  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown") return;
    const first = Array.from(searchResults.children).find((node) => node.tagName === "A");
    if (first) { event.preventDefault(); first.focus({ preventScroll:true }); }
  });
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
      ...quickButtons,
      ...Array.from(searchResults.children).filter((node) => node.tagName === "A")]);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
