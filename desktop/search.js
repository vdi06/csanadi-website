import { element } from "../shared/js/dom.js?v=2.53";
import { trapTab } from "../shared/js/focus.js?v=2.53";
import { isolateModal } from "../shared/js/modal.js?v=2.53";
import { searchSiteResults } from "../shared/js/search-index.js?v=2.53";
import { filterSearchItems, navLink, searchItems } from "../shared/js/shell.js?v=2.53";

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
    "aria-label": data.searchPlaceholder, "aria-controls":"desktop-search-results-list",
    autocomplete: "off", maxlength: "120" } });
  const searchCount = element("p", { className: "desktop-search-count",
    attributes: { "aria-live": "polite" } });
  const resultsTitle = element("h3", { className: "desktop-search-results-title",
    attributes: { id: "desktop-search-results-heading" } });
  const searchResults = element("div", { className: "desktop-search-results",
    attributes: { role: "region", "aria-labelledby": "desktop-search-results-heading" } });
  const categoryFilters = element("div", { className: "desktop-search-categories",
    attributes: { role:"group", "aria-label":"Találatok kategória szerinti szűrése" } });
  categoryFilters.hidden = true;
  const loadMore = element("button", { className:"desktop-search-more", text:"További találatok megjelenítése",
    attributes:{type:"button", "aria-label":"További keresési találatok megjelenítése"} });
  loadMore.hidden = true;
  let activeCategory = "all";
  let visibleLimit = 12;
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
  const quickArea = element("div", {className:"desktop-search-quick"},
    element("span",{className:"desktop-search-quick-title",text:data.searchQuickTitle}),
    element("div",{className:"desktop-search-quick-list"},...quickButtons));
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
  quickArea,
  element("div", { className: "desktop-search-result-bar" },
    resultsTitle, searchCount),
  categoryFilters, searchResults, loadMore,
  element("div", { className: "desktop-search-bottom" },
    element("p", { text: data.searchScopeHint }),
    element("span", { text: data.searchKeyboardHint })));
  const backdrop = element("div", { className: "desktop-search-backdrop",
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-search-overlay",
    attributes: { id: "desktop-floating-search" } }, backdrop, searchDialog);
  overlay.hidden = true;
  let previousOverflow;
  let releaseIsolation = () => {};

  function render() {
    const query = String(searchInput.value || "").trim();
    const searching = Boolean(query);
    quickArea.hidden = searching;
    clearButton.hidden = !searchInput.value.length;
    resultsTitle.textContent = searching ? data.searchResultsTitle : data.searchFeaturedTitle;
    // Kategóriaváltáskor a szűrők minden találatot, nem csak az első 12-t számolják.
    const overall = searching ? searchSiteResults(config,query) : null;
    if (!overall?.facets.some(item => item.id === activeCategory)) activeCategory = "all";
    const result = searching ? searchSiteResults(config,query,{category:activeCategory}) : null;
    const matches = searching ? result.items : filterSearchItems(config, "");
    const total = searching ? result.total : matches.length;
    searchCount.textContent = searching && activeCategory !== "all"
      ? `${total} ${data.searchResultCountLabel} · összesen ${result.allTotal}`
      : `${total} ${data.searchResultCountLabel}`;
    categoryFilters.hidden = !searching || overall.facets.length < 3;
    categoryFilters.replaceChildren(...(searching ? overall.facets.map(facet => {
      const button = element("button", { className:"desktop-search-category", text:`${facet.label} (${facet.count})`,
        attributes:{type:"button","aria-pressed":facet.id===activeCategory ? "true":"false"} });
      button.addEventListener("click",()=>{
        activeCategory=facet.id;
        visibleLimit=12;
        render();
        categoryFilters.querySelectorAll("button")[overall.facets.findIndex(item=>item.id===activeCategory)]?.focus();
      });
      return button;
    }) : []));
    const visible = matches.slice(0, visibleLimit);
    searchResults.replaceChildren(...(visible.length ? visible.map((item,index) => {
      const link = navLink(item,"desktop-search-result");
      link.replaceChildren(
        element("span", { className:"desktop-search-result-index", text:String(index+1).padStart(2,"0"), attributes:{"aria-hidden":"true"} }),
        element("span", { className:"desktop-search-result-copy" },
          element("span", { className:"desktop-search-result-category", text:item.category }),
          element("strong", { className:"desktop-search-result-title", text:item.label }),
          element("span", { className:"desktop-search-result-summary", text:item.summary })),
        element("span", { className:"desktop-search-result-glyph",text:data.searchResultGlyph,attributes:{"aria-hidden":"true"} }));
      return link;
    }) : [element("div", {className:"desktop-search-empty",attributes:{role:"status"}},
      element("strong",{text:searching ? "Nincs találat ebben a kategóriában" : "Nincs gyorselérhetőség"}),
      element("p",{text:data.searchNoResults}),
      element("button",{className:"desktop-search-reset",text:"Összes kategória megjelenítése", attributes:{type:"button"}}))]));
    const reset = searchResults.querySelector(".desktop-search-reset");
    if (reset) {
      reset.hidden = activeCategory === "all";
      reset.addEventListener("click",()=>{activeCategory="all";render();searchInput.focus();});
    }
    loadMore.hidden = visible.length >= total || !searching;
    loadMore.textContent = `További találatok (${visible.length} / ${total})`;
  }
  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    releaseIsolation();
    releaseIsolation = () => {};
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
    releaseIsolation = isolateModal(overlay);
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", data.searchCloseLabel);
    render();
    searchInput.focus({ preventScroll: true });
  }
  searchInput.addEventListener("input", () => { activeCategory="all"; visibleLimit=12; render(); });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown") return;
    const first = Array.from(searchResults.children).find((node) => node.tagName === "A");
    if (first) { event.preventDefault(); first.focus({ preventScroll:true }); }
  });
  clearButton.addEventListener("click", () => {
    searchInput.value = ""; activeCategory="all"; visibleLimit=12; render(); searchInput.focus({ preventScroll: true });
  });
  loadMore.addEventListener("click", () => {visibleLimit+=12;render();loadMore.focus({preventScroll:true});});
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  closeButton.addEventListener("click", () => close());
  backdrop.addEventListener("click", () => close());
  searchDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    trapTab(event, [closeButton, searchInput,
      ...(!clearButton.hidden ? [clearButton] : []),
      ...quickButtons,
      ...Array.from(categoryFilters.querySelectorAll("button")),
      ...Array.from(searchResults.querySelectorAll("a[href],button")),loadMore]);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
