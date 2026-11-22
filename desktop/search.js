import { element } from "../shared/js/dom.js?v=2.19";
import { trapTab } from "../shared/js/focus.js?v=2.19";
import { filterSearchItems, navLink, searchItems } from "../shared/js/shell.js?v=2.19";

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
    id: "desktop-search-query", type: "search", placeholder: data.searchPlaceholder,
    "aria-label": data.searchPlaceholder,
    autocomplete: "off" } });
  const searchCount = element("p", { className: "desktop-search-count",
    attributes: { "aria-live": "polite" } });
  const resultsTitle = element("h3", { className: "desktop-search-results-title" });
  const searchResults = element("div", { className: "desktop-search-results",
    attributes: { "aria-live": "polite" } });
  const quickButtons = searchItems(config).map((item) => {
    const button = element("button", { className: "desktop-search-chip", text: item.short,
      attributes: { type: "button", "aria-label": item.short } });
    button.addEventListener("click", () => {
      searchInput.value = item.short;
      render();
      searchInput.focus({ preventScroll:true });
    });
    return button;
  });
  const searchDialog = element("section", { className: "desktop-search-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } }, element("div", { className: "desktop-search-ambient", attributes: { "aria-hidden": "true" } }),
  element("div", { className: "desktop-search-heading" },
    element("div", { className: "desktop-search-title-block" },
      element("div", { className: "desktop-search-kicker" },
        element("span", { className: "desktop-search-emblem", text: data.searchEmblem,
          attributes: { "aria-hidden": "true" } }),
        element("span", { className: "desktop-search-eyebrow", text: data.searchEyebrow })),
      element("h2", { text: data.searchTitle }),
      element("p", { className: "desktop-search-lead", text: data.searchLead })), closeButton),
  element("div", { className: "desktop-search-input-group" },
    element("label", { className: "desktop-search-field-label", text: data.searchFieldLabel,
      attributes: { for: "desktop-search-query" } }),
    element("div", { className: "desktop-search-field" },
      element("span", { className: "desktop-search-field-symbol", text: data.searchGlyph,
        attributes: { "aria-hidden": "true" } }), searchInput, clearButton)),
  element("div", { className: "desktop-search-quick" },
    element("span", { className: "desktop-search-quick-title", text: data.searchQuickTitle }),
    element("div", { className: "desktop-search-quick-list" }, ...quickButtons)),
  element("div", { className: "desktop-search-result-bar" },
    resultsTitle, searchCount),
  searchResults,
  element("div", { className: "desktop-search-bottom" },
    element("p", { text: data.searchScopeHint }),
    element("span", { text: data.searchKeyboardHint })));
  const backdrop = element("div", { className: "desktop-search-backdrop",
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-search-overlay",
    attributes: { id: "desktop-floating-search" } }, backdrop, searchDialog);
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
        const link = navLink(item, "desktop-search-result");
        link.replaceChildren(
          element("span", { className: "desktop-search-result-index",
            text: String(index + 1).padStart(2, "0"), attributes: { "aria-hidden": "true" } }),
          element("span", { className: "desktop-search-result-copy" },
            element("span", { className: "desktop-search-result-category", text: item.category }),
            element("strong", { className: "desktop-search-result-title", text: item.label }),
            element("span", { className: "desktop-search-result-summary", text: item.summary })),
          element("span", { className: "desktop-search-result-glyph",
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
  searchDialog.addEventListener("keydown", (event) => {
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
