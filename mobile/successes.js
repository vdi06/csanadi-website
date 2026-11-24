import { element } from "../shared/js/dom.js?v=2.62";
import { trapTab } from "../shared/js/focus.js?v=2.62";
import { isolateModal } from "../shared/js/modal.js?v=2.62";
import { checkedSportSuccesses, featuredSportSuccesses, orderedSportSuccesses,
  successImageRoot, successDateText } from "../shared/js/successes-data.js?v=2.62";
import { archiveView, readArchiveState, saveArchiveState } from "../shared/js/archive-data.js?v=2.62";

/** Önálló mobilos sportsiker-rács: 2×3 kártya és függőlegesen olvasható lebegő ablak. */
export function createMobileSuccesses(config, { archive = false } = {}) {
  const data = checkedSportSuccesses(config);
  const items = archive ? orderedSportSuccesses(config) : featuredSportSuccesses(config);
  const ui = data.archiveUi;
  let archiveState = archive ? readArchiveState() : null;
  let visibleIds = [];
  const baseRoute = archive ? "#/oldal/sports-results" : config.routes.home;
  const detailName = element("h3", { className: "mobile-successes-detail-name", attributes: {
    id: "mobile-successes-detail-title"
  } });
  const detailSport = element("span", { className: "mobile-successes-detail-sport" });
  const detailResult = element("strong", { className: "mobile-successes-detail-result" });
  const detailCompetition = element("p", { className: "mobile-successes-detail-event" });
  const detailDate = element("time", { className: "mobile-successes-detail-date" });
  const detailSummary = element("p", { className: "mobile-successes-detail-summary" });
  const detailBody = element("div", { className: "mobile-successes-detail-body" });
  const detailImage = element("img", { className: "mobile-successes-detail-image", attributes: {
    width: 960, height: 640, decoding: "async"
  } });
  const detailFallbackSport = element("strong", { className: "mobile-successes-fallback-sport" });
  const detailFallback = element("div", { className: "mobile-successes-detail-fallback" },
    element("span", { className: "mobile-successes-fallback-mark", text: "✦", attributes: { "aria-hidden": "true" } }),
    detailFallbackSport);
  detailFallback.hidden = true;
  detailImage.addEventListener("error", () => { detailImage.hidden = true; detailFallback.hidden = false; });
  const detailLink = element("a", { className: "mobile-successes-detail-link", text: data.linkLabel });
  const previousDetail = element("button", { className:"mobile-archive-detail-button", text:ui.previousDetail,
    attributes:{ type:"button", "aria-label":ui.previousDetail } });
  const nextDetail = element("button", { className:"mobile-archive-detail-button", text:ui.nextDetail,
    attributes:{ type:"button", "aria-label":ui.nextDetail } });
  const detailNavigation = element("div", { className:"mobile-archive-detail-nav" }, previousDetail, nextDetail);
  const closeButton = element("button", { className: "mobile-successes-close", text: "×",
    attributes: { type: "button", "aria-label": data.closeLabel } });
  const dialog = element("section", { className: "mobile-successes-dialog", attributes: {
    id: "mobile-successes-dialog", role: "dialog", "aria-modal": "true",
    "aria-labelledby": "mobile-successes-detail-title"
  } },
    element("div", { className: "mobile-successes-dialog-head" },
      element("span", { className: "mobile-successes-detail-eyebrow", text: data.eyebrow }), closeButton),
    element("div", { className: "mobile-successes-detail-scroll" },
      element("div", { className: "mobile-successes-detail-visual" }, detailImage, detailFallback),
      element("div", { className: "mobile-successes-detail-copy" },
        detailSport, detailName, detailResult, detailCompetition, detailDate,
        detailSummary, detailBody,...(archive ? [detailNavigation] : [detailLink]))));
  const backdrop = element("button", { className: "mobile-successes-backdrop", attributes: {
    type: "button", "aria-label": data.closeLabel, tabindex: "-1", "aria-hidden": "true"
  } });
  const overlay = element("div", { className: archive ? "mobile-successes-overlay is-archive" : "mobile-successes-overlay" }, backdrop, dialog);
  overlay.hidden = true;
  let activeIndex = -1;
  let previousOverflow = "";
  let origin = null;
  let releaseIsolation = () => {};
  const cards = items.map((item, index) => {
    const image = item.image ? element("img", { className: "mobile-successes-card-image", attributes: {
      src: `${successImageRoot}${item.image}`, alt: `${item.sport} – sportpillanat`,
      loading: "lazy", decoding: "async", width: 480, height: 360
    } }) : null;
    const fallback = element("div", { className: "mobile-successes-card-fallback" },
      element("span", { className: "mobile-successes-fallback-mark", text: "✦", attributes: { "aria-hidden": "true" } }),
      element("strong", { className: "mobile-successes-fallback-sport", text: item.sport }));
    fallback.hidden = Boolean(image);
    image?.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; });
    const featuredBadge = element("span", { className:"mobile-archive-featured", text:ui.featuredLabel });
    featuredBadge.hidden = true;
    const card = element("button", { className: "mobile-successes-card", attributes: {
      type: "button", "aria-label": `${item.verified ? "" : data.verificationLabel + ": "}${data.openLabel}: ${item.name}, ${item.result}, ${item.sport}`,
      "aria-haspopup": "dialog", "aria-controls": "mobile-successes-dialog", "aria-expanded": "false"
    } },
      element("div", { className: "mobile-successes-card-image-wrap" },
        ...(image ? [image] : []), fallback,
        ...(!item.verified ? [element("span", { className:"mobile-successes-card-sample", text:data.verificationLabel })] : []),
        element("span", { className: "mobile-successes-card-sport", text: item.sport }),
        ...(archive ? [featuredBadge] : [])),
      element("div", { className: "mobile-successes-card-copy" },
        element("strong", { className: "mobile-successes-card-name", text: item.name }),
        element("span", { className: "mobile-successes-card-result", text: item.result }),
        ...(archive ? [element("time", { className:"mobile-archive-card-date", text:successDateText(item.date),
          attributes:{ datetime:item.date } })] : [])));
    card.addEventListener("click", () => activeIndex === index ? close() : open(index));
    return card;
  });
  const cardsById = new Map(items.map((item,index) => [item.id,cards[index]]));
  const grid = element("div", { className:"mobile-successes-grid",
    attributes:archive ? { tabindex:"-1" } : {} },...(archive ? [] : cards));
  let toolbar = null;
  let paginator = null;
  let searchInput, sportSelect, yearSelect, yearField, orderSelect, countLabel, fields, toggle;
  if (archive) {
    const options = archiveView(config,archiveState).options;
    searchInput = element("input", { className:"mobile-archive-search", attributes:{
      type:"search", "aria-label":ui.searchLabel, placeholder:ui.searchPlaceholder, maxlength:120
    } });
    searchInput.value = archiveState.query;
    function selector(label,values) {
      return element("label", { className:"mobile-archive-field" }, element("span", { text:label }),
        element("select", {}, ...values.map(([value,title]) =>
          element("option", { text:title, attributes:{ value } }))));
    }
    const sportField = selector(ui.sportLabel,
      [["",ui.allSports],...options.sports.map((sport) => [sport,sport])]);
    sportSelect = sportField.children[1];
    yearField = selector(ui.yearLabel,
      [["",ui.allYears],...options.years.map((year) => [year,year])]);
    yearSelect = yearField.children[1];
    yearField.hidden = options.years.length < 2;
    const orderField = selector(ui.sortLabel,[["newest",ui.newest],["oldest",ui.oldest]]);
    orderSelect = orderField.children[1];
    fields = element("div", { className:"mobile-archive-fields", attributes:{ id:"mobile-archive-fields" } },
      sportField,yearField,orderField);
    fields.hidden = true;
    toggle = element("button", { className:"mobile-archive-toggle", text:ui.filtersToggle,
      attributes:{ type:"button", "aria-expanded":"false", "aria-controls":"mobile-archive-fields" } });
    const clear = element("button", { className:"mobile-archive-clear", text:ui.clearLabel,
      attributes:{ type:"button" } });
    countLabel = element("p", { className:"mobile-archive-count", attributes:{ "aria-live":"polite" } });
    toolbar = element("div", { className:"mobile-archive-toolbar" },
      element("label", { className:"mobile-archive-search-label" },
        element("span", { text:ui.searchLabel }),searchInput),
      toggle,fields,element("div", { className:"mobile-archive-status" },countLabel,clear));
    paginator = element("nav", { className:"mobile-archive-pagination", attributes:{ "aria-label":ui.pageLabel } });
    const update = (patch) => {
      archiveState = saveArchiveState({ ...archiveState,...patch,page:1 });
      renderArchive();
    };
    searchInput.addEventListener("input", () => update({ query:searchInput.value }));
    sportSelect.addEventListener("change", () => update({ sport:sportSelect.value }));
    yearSelect.addEventListener("change", () => update({ year:yearSelect.value }));
    orderSelect.addEventListener("change", () => update({ order:orderSelect.value }));
    clear.addEventListener("click", () => update({ query:"",sport:"",year:"",order:"newest" }));
    toggle.addEventListener("click", () => {
      fields.hidden = !fields.hidden;
      toggle.setAttribute("aria-expanded",String(!fields.hidden));
    });
  }
  const section = element("section", { className: archive ? "mobile-successes-section is-archive" : "mobile-successes-section", attributes: {
    "aria-label": archive ? data.archiveTitle : data.ariaLabel
  } }, element("div", { className: "mobile-successes-inner" },
    element("div", { className: "mobile-successes-heading" },
      element("span", { className: "mobile-successes-eyebrow", text: archive ? ui.eyebrow : data.eyebrow }),
      element(archive ? "h1" : "h2", { className: archive ? "mobile-page-title" : "",
        text: archive ? data.archiveTitle : data.title,
        attributes: archive ? { tabindex:"-1" } : {} }),
      element("p", { text: archive ? data.archiveIntro : data.intro })),
    ...(archive ? [toolbar] : []),grid,...(archive ? [paginator] : [])));

  function renderArchive() {
    if (!archive) return;
    const view = archiveView(config,archiveState);
    archiveState = saveArchiveState(view.state);
    visibleIds = view.visible.map((item) => item.id);
    searchInput.value = archiveState.query;
    sportSelect.value = archiveState.sport;
    yearSelect.value = archiveState.year;
    orderSelect.value = archiveState.order;
    countLabel.textContent = `${view.total} ${ui.resultsLabel}`;
    for (const item of view.visible) {
      const card = cardsById.get(item.id);
      const badge = card.querySelector?.(".mobile-archive-featured") || card.children[0].children.at(-1);
      if (badge?.className === "mobile-archive-featured") badge.hidden = !view.featured.has(item.id);
    }
    grid.replaceChildren(...(view.visible.length ? view.visible.map((item) => cardsById.get(item.id)) : [
      element("div", { className:"mobile-archive-empty" },
        element("p", { text:ui.noResults }),
        element("button", { text:ui.clearLabel,
          attributes:{ type:"button", "aria-label":ui.emptyClearLabel } }))
    ]));
    if (!view.visible.length) grid.children[0].children[1].addEventListener("click", () => {
      archiveState = saveArchiveState({ query:"",sport:"",year:"",order:"newest",page:1 });
      renderArchive();
    });
    const prev = element("button", { className:"mobile-archive-page", text:"‹",
      attributes:{ type:"button", "aria-label":ui.previousPage } });
    const next = element("button", { className:"mobile-archive-page", text:"›",
      attributes:{ type:"button", "aria-label":ui.nextPage } });
    prev.disabled = view.state.page <= 1;
    next.disabled = view.state.page >= view.pageCount;
    prev.addEventListener("click", () => changePage(archiveState.page-1));
    next.addEventListener("click", () => changePage(archiveState.page+1));
    paginator.replaceChildren(prev,
      element("span", { className:"mobile-archive-current", text:`${view.state.page} / ${view.pageCount}` }),next,
      element("span", { className:"mobile-archive-range", text:view.total
        ? `${view.start+1}–${view.start+view.visible.length} / ${view.total}` : "0 / 0" }));
    paginator.hidden = view.total <= 6;
  }
  function changePage(page) {
    archiveState = saveArchiveState({ ...archiveState,page });
    renderArchive();
    section.scrollIntoView?.({ block:"start", behavior:"instant" });
    grid.focus({ preventScroll:true });
  }
  if (archive) renderArchive();

  function close(restoreFocus = true, restoreRoute = true) {
    if (overlay.hidden) return;
    const activeItem = items[activeIndex];
    overlay.hidden = true;
    releaseIsolation();
    releaseIsolation = () => {};
    if (activeIndex >= 0) cards[activeIndex].setAttribute("aria-expanded", "false");
    activeIndex = -1;
    document.body.style.overflow = previousOverflow;
    if (restoreFocus) {
      if (origin?.isConnected === false && archive) grid.focus({ preventScroll:true });
      else if (origin?.isConnected !== false) origin?.focus({ preventScroll:true });
    }
    origin = null;
    if (restoreRoute && activeItem &&
      location.hash === `${baseRoute}/sportsiker/${activeItem.id}`) {
      location.hash = baseRoute;
    }
  }
  function open(index, fromNavigation = false) {
    const item = items[index];
    if (!item) return;
    const wasHidden = overlay.hidden;
    if (wasHidden) {
      origin = cards[index];
      previousOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    } else if (!fromNavigation) origin = cards[index];
    if (activeIndex >= 0) cards[activeIndex].setAttribute("aria-expanded","false");
    detailName.textContent = item.name;
    detailSport.textContent = item.sport;
    detailResult.textContent = item.result;
    detailCompetition.textContent = item.competition;
    detailDate.dateTime = item.date;
    detailDate.textContent = successDateText(item.date);
    detailSummary.textContent = item.summary;
    detailBody.replaceChildren(...(!item.verified ? [element("p", { className:"successes-verification-warning", text:data.verificationNotice })] : []), ...item.details.map((text) => element("p", { text })));
    detailImage.hidden = !item.image;
    detailFallback.hidden = Boolean(item.image);
    detailFallbackSport.textContent = item.sport;
    if (item.image) detailImage.setAttribute("src", `${successImageRoot}${item.image}`);
    detailImage.setAttribute("alt", `${item.sport} – sportpillanat`);
    if (!archive) detailLink.setAttribute("href", item.href);
    activeIndex = index;
    cards[index].setAttribute("aria-expanded", "true");
    if (archive) {
      const position = visibleIds.indexOf(item.id);
      previousDetail.disabled = position <= 0;
      nextDetail.disabled = position < 0 || position >= visibleIds.length-1;
    }
    overlay.hidden = false;
    if (wasHidden) releaseIsolation = isolateModal(overlay);
    closeButton.focus({ preventScroll: true });
  }
  function moveDetail(step) {
    const position = visibleIds.indexOf(items[activeIndex]?.id);
    const nextId = visibleIds[position+step];
    const nextIndex = items.findIndex((item) => item.id === nextId);
    if (position >= 0 && nextIndex >= 0) open(nextIndex,true);
  }
  previousDetail.addEventListener("click", () => moveDetail(-1));
  nextDetail.addEventListener("click", () => moveDetail(1));
  backdrop.addEventListener("click", () => close());
  closeButton.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else trapTab(event, archive ? [closeButton,previousDetail,nextDetail] : [closeButton,detailLink]);
  });
  detailLink.addEventListener("click", (event) => {
    const href = detailLink.getAttribute("href");
    if (href?.startsWith("#/")) { event.preventDefault(); location.hash = href; }
    close(false);
  });
  return { section, overlay,
    openById: (id) => {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return false;
      open(index); return true;
    },
    destroy: () => close(false, false) };
}
