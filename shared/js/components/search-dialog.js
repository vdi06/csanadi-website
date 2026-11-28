import {highlightText} from "./search-text.js?v=2.82";
import { element } from "../dom.js?v=2.82";
import { trapTab } from "../focus.js?v=2.82";
import { isolateModal } from "../modal.js?v=2.82";
import { searchSiteResults, prepareSearchIndex, searchIndexReady } from "../search-index.js?v=2.82";
import { filterSearchItems, navLink, searchItems } from "../shell.js?v=2.82";

/** One shared Spotlight implementation; platform-specific CSS and IDs are selected at mount. */
export function createSearchDialog(platform, config, trigger, beforeOpen = () => {}) {
  const mobile=platform==="mobile";
  const data = config.home.header;
  const closeButton = element("button", { className: (mobile ? "mobile-overlay-close" : "desktop-search-close"),
    text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchCloseLabel } });
  const clearButton = element("button", { className: `${platform}-search-clear`,
    text: data.closeSymbol,
    attributes: { type: "button", "aria-label": data.searchClearLabel } });
  clearButton.hidden = true;
  const searchInput = element("input", { className: `${platform}-search-input`, attributes: {
    id: `${platform}-search-query`, type: "search", placeholder: data.searchPlaceholder,
    "aria-label": data.searchPlaceholder, "aria-controls":`${platform}-search-results-list`,
    autocomplete: "off", maxlength: "120" } });
  const searchCount = element("p", { className: `${platform}-search-count`,
    attributes: { "aria-live": "polite" } });
  const resultsTitle = element("h3", { className: `${platform}-search-results-title`,
    attributes: { id: `${platform}-search-results-heading` } });
  const searchResults = element("div", { className: `${platform}-search-results`,
    attributes: { id: `${platform}-search-results-list`, role: "region", "aria-labelledby": `${platform}-search-results-heading` } });
  const suggestions=element('div',{className:'search-suggestions-279',attributes:{'aria-label':'Keresési javaslatok'}});suggestions.hidden=true;
  const categoryFilters = element("div", { className: `${platform}-search-categories`,
    attributes: { role:"group", "aria-label":"Találatok kategória szerinti szűrése" } });
  categoryFilters.hidden = true;
  const loadMore = element("button", { className:`${platform}-search-more`, text:"További találatok megjelenítése",
    attributes:{type:"button", "aria-label":"További keresési találatok megjelenítése"} });
  loadMore.hidden = true;
  let activeCategory = "all";
  let visibleLimit = 12;
  const quickButtons = searchItems(config).map((item) => {
    const button = element("button", { className: `${platform}-search-chip`, text: item.short,
      attributes: { type: "button", "aria-label": item.short } });
    button.addEventListener("click", () => {
      searchInput.value = item.short;
      render();
      searchInput.focus({ preventScroll:true });
    });
    return button;
  });
  const quickArea = element("div", {className:`${platform}-search-quick`},
    element("span",{className:`${platform}-search-quick-title`,text:data.searchQuickTitle}),
    element("div",{className:`${platform}-search-quick-list`},...quickButtons));
  const searchDialog = element("section", { className: `${platform}-search-dialog`, attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.searchTitle
  } }, element("div", { className: `${platform}-search-ambient`, attributes: { "aria-hidden": "true" } }),
  element("div", { className: (mobile ? "mobile-overlay-heading" : "desktop-search-heading") },
    element("div", { className: `${platform}-search-title-block` },
      element("div", { className: `${platform}-search-kicker` },
        element("span", { className: `${platform}-search-emblem`, text: data.searchEmblem,
          attributes: { "aria-hidden": "true" } }),
        element("span", { className: `${platform}-search-eyebrow`, text: data.searchEyebrow })),
      element("h2", { text: data.searchTitle }),
      element("p", { className: `${platform}-search-lead`, text: data.searchLead })), closeButton),
  element("div", { className: `${platform}-search-input-group` },
    element("label", { className: `${platform}-search-field-label`, text: data.searchFieldLabel,
      attributes: { for: `${platform}-search-query` } }),
    element("div", { className: `${platform}-search-field` },
      element("span", { className: `${platform}-search-field-symbol`, text: data.searchGlyph,
        attributes: { "aria-hidden": "true" } }), searchInput, clearButton)),
  quickArea,
  element("div", { className: `${platform}-search-result-bar` },
    resultsTitle, searchCount),
  suggestions, categoryFilters, searchResults, loadMore,
  element("div", { className: `${platform}-search-bottom` },
    element("p", { text: data.searchScopeHint }),
    element("span", { text: data.searchKeyboardHint })));
  const backdrop = element("div", { className: (mobile ? "mobile-overlay-backdrop" : "desktop-search-backdrop"),
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: `${platform}-search-overlay`,
    attributes: { id: (mobile ? "mobile-search-view" : "desktop-floating-search") } }, backdrop, searchDialog);
  overlay.hidden = true;
  let previousOverflow;
  let releaseIsolation = () => {};

  let indexPending=false;
  function render() {
    const query = String(searchInput.value || "").trim();
    const searching = Boolean(query);
    quickArea.hidden = searching;suggestions.hidden=true;suggestions.replaceChildren();
    clearButton.hidden = !searchInput.value.length;
    resultsTitle.textContent = searching ? data.searchResultsTitle : data.searchFeaturedTitle;
    if(searching&&!searchIndexReady(config)){
      searchCount.textContent="Keresőindex betöltése…";categoryFilters.hidden=true;loadMore.hidden=true;
      searchResults.replaceChildren(element("p",{text:"A teljes keresőindex betöltése…",attributes:{role:"status"}}));
      if(!indexPending){indexPending=true;prepareSearchIndex(config).then(()=>{indexPending=false;if(!overlay.hidden)render();}).catch(()=>{indexPending=false;searchCount.textContent="A keresőindex nem tölthető be.";const retry=element("button",{text:"Újrapróbálás",attributes:{type:"button"}});retry.addEventListener("click",render);searchResults.replaceChildren(retry);});}return;
    }
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
      const button = element("button", { className:`${platform}-search-category`, text:`${facet.label} (${facet.count})`,
        attributes:{type:"button","aria-pressed":facet.id===activeCategory ? "true":"false"} });
      button.addEventListener("click",()=>{
        activeCategory=facet.id;
        visibleLimit=12;
        render();
        categoryFilters.querySelectorAll("button")[overall.facets.findIndex(item=>item.id===activeCategory)]?.focus();
      });
      return button;
    }) : []));
    if(searching&&overall.items.length){const labels=[...new Set(overall.items.map(x=>x.label))].filter(x=>x.length<=120&&x.toLocaleLowerCase('hu')!==query.toLocaleLowerCase('hu')).slice(0,3);if(labels.length){suggestions.hidden=false;suggestions.append(element('strong',{text:'Keresési javaslatok: '}));for(const label of labels){const b=element('button',{text:label,className:'numbers-detail-button',attributes:{type:'button'}});b.addEventListener('click',()=>{searchInput.value=label;activeCategory='all';visibleLimit=12;render();searchInput.focus();});suggestions.append(b);}}}
    const visible = matches.slice(0, visibleLimit);
    searchResults.replaceChildren(...(visible.length ? visible.map((item,index) => {
      const link = navLink(item,`${platform}-search-result`);
      link.replaceChildren(
        element("span", { className:`${platform}-search-result-index`, text:String(index+1).padStart(2,"0"), attributes:{"aria-hidden":"true"} }),
        element("span", { className:`${platform}-search-result-copy` },
          element("span", { className:`${platform}-search-result-category`, text:item.category }),
          element("strong", { className:`${platform}-search-result-title`, text:item.label }),
          element("span", { className:`${platform}-search-result-summary`, text:item.summary })),
        element("span", { className:`${platform}-search-result-glyph`,text:data.searchResultGlyph,attributes:{"aria-hidden":"true"} }));
      highlightText(link.querySelector(`.${platform}-search-result-title`),item.label,query);highlightText(link.querySelector(`.${platform}-search-result-summary`),item.summary,query);
      if(searching&&item.preview&&item.preview!==item.summary){const excerpt=element('span',{className:'search-result-excerpt'});highlightText(excerpt,item.preview,query);link.querySelector(`.${platform}-search-result-copy`).append(excerpt);}
      return link;
    }) : [element("div", {className:`${platform}-search-empty`,attributes:{role:"status"}},
      element("strong",{text:searching ? "Nincs találat ebben a kategóriában" : "Nincs gyorselérhetőség"}),
      element("p",{text:data.searchNoResults}),
      element("button",{className:`${platform}-search-reset`,text:"Összes kategória megjelenítése", attributes:{type:"button"}}))]));
    const reset = searchResults.querySelector(`.${platform}-search-reset`);
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
  const shortcut=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"&&![...document.querySelectorAll("dialog[open],[role=dialog][aria-modal=true]")].some(node=>node.getClientRects().length&&!node.closest("[hidden]"))){event.preventDefault();open();}};document.addEventListener("keydown",shortcut);
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
  overlay.dataset.adaptiveState='search';overlay.adaptiveSnapshot=()=>({query:searchInput.value,category:activeCategory,limit:visibleLimit,open:!overlay.hidden,start:searchInput.selectionStart,end:searchInput.selectionEnd});overlay.adaptiveRestore=(state)=>{searchInput.value=state.query;activeCategory=state.category;visibleLimit=state.limit;if(state.open){open();try{searchInput.setSelectionRange(state.start,state.end);}catch{}}};return { overlay, close, destroy: () => {document.removeEventListener("keydown",shortcut);close(false);} };
}
