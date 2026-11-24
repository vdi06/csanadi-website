import { element } from "../shared/js/dom.js?v=2.56";
import { trapTab } from "../shared/js/focus.js?v=2.56";
import { isolateModal } from "../shared/js/modal.js?v=2.56";
import { checkedSportSuccesses, featuredSportSuccesses, orderedSportSuccesses,
  successImageRoot, successDateText } from "../shared/js/successes-data.js?v=2.56";
import { archiveView, readArchiveState, saveArchiveState } from "../shared/js/archive-data.js?v=2.56";

/** Asztali sportsikerek: tágas 3×2-es rács, teljes nézet fölötti saját lebegő ablak. */
export function createDesktopSuccesses(config, { archive = false } = {}) {
  const data = checkedSportSuccesses(config);
  const items = archive ? orderedSportSuccesses(config) : featuredSportSuccesses(config);
  const ui = data.archiveUi;
  let archiveState = archive ? readArchiveState() : null;
  let visibleIds = [];
  const baseRoute = archive ? "#/oldal/sports-results" : config.routes.home;
  const name = element("h3", { className: "desktop-successes-detail-name",
    attributes: { id: "desktop-successes-detail-title" } });
  const sport = element("span", { className: "desktop-successes-detail-sport" });
  const result = element("strong", { className: "desktop-successes-detail-result" });
  const competition = element("p", { className: "desktop-successes-detail-event" });
  const date = element("time", { className: "desktop-successes-detail-date" });
  const summary = element("p", { className: "desktop-successes-detail-summary" });
  const description = element("div", { className: "desktop-successes-detail-body" });
  const photo = element("img", { className: "desktop-successes-detail-image", attributes: {
    width: 960, height: 640, decoding: "async"
  } });
  const photoFallbackSport = element("strong", { className: "desktop-successes-fallback-sport" });
  const photoFallback = element("div", { className: "desktop-successes-detail-fallback" },
    element("span", { className: "desktop-successes-fallback-mark", text: "✦", attributes: { "aria-hidden": "true" } }),
    photoFallbackSport);
  photoFallback.hidden = true;
  photo.addEventListener("error", () => { photo.hidden = true; photoFallback.hidden = false; });
  const link = element("a", { className: "desktop-successes-detail-link", text: data.linkLabel });
  const previousDetail = element("button", { className:"desktop-archive-detail-button", text:ui.previousDetail,
    attributes:{ type:"button", "aria-label":ui.previousDetail } });
  const nextDetail = element("button", { className:"desktop-archive-detail-button", text:ui.nextDetail,
    attributes:{ type:"button", "aria-label":ui.nextDetail } });
  const detailNavigation = element("div", { className:"desktop-archive-detail-nav" }, previousDetail, nextDetail);
  const closeButton = element("button", { className: "desktop-successes-close", text: "×",
    attributes: { type: "button", "aria-label": data.closeLabel } });
  const dialog = element("section", { className: "desktop-successes-dialog", attributes: {
    id: "desktop-successes-dialog", role: "dialog", "aria-modal": "true",
    "aria-labelledby": "desktop-successes-detail-title"
  } },
    element("div", { className: "desktop-successes-dialog-head" },
      element("span", { className: "desktop-successes-detail-eyebrow", text: data.eyebrow }), closeButton),
    element("div", { className: "desktop-successes-dialog-layout" },
      element("div", { className: "desktop-successes-detail-visual" }, photo, photoFallback),
      element("div", { className: "desktop-successes-detail-copy" },
        sport, name, result, competition, date, summary, description,
        ...(archive ? [detailNavigation] : [link]))));
  const backdrop = element("button", { className: "desktop-successes-backdrop", attributes: {
    type: "button", "aria-label": data.closeLabel, tabindex: "-1", "aria-hidden": "true"
  } });
  const overlay = element("div", { className: archive ? "desktop-successes-overlay is-archive" : "desktop-successes-overlay" }, backdrop, dialog);
  overlay.hidden = true;

  let activeIndex = -1;
  let previousOverflow = "";
  let origin = null;
  let releaseIsolation = () => {};
  const cards = items.map((item, index) => {
    const image = item.image ? element("img", { className: "desktop-successes-card-image", attributes: {
      src: `${successImageRoot}${item.image}`, alt: `${item.sport} – sportpillanat`,
      loading: "lazy", decoding: "async", width: 960, height: 640
    } }) : null;
    const fallback = element("div", { className: "desktop-successes-card-fallback" },
      element("span", { className: "desktop-successes-fallback-mark", text: "✦", attributes: { "aria-hidden": "true" } }),
      element("strong", { className: "desktop-successes-fallback-sport", text: item.sport }));
    fallback.hidden = Boolean(image);
    image?.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; });
    const featuredBadge = element("span", { className:"desktop-archive-featured", text:ui.featuredLabel });
    featuredBadge.hidden = true;
    const card = element("button", { className: "desktop-successes-card", attributes: {
      type: "button", "aria-label": `${item.verified ? "" : data.verificationLabel + ": "}${data.openLabel}: ${item.name}, ${item.result}, ${item.sport}`,
      "aria-haspopup": "dialog", "aria-controls": "desktop-successes-dialog", "aria-expanded": "false"
    } },
      element("div", { className: "desktop-successes-card-image-wrap" },
        ...(image ? [image] : []), fallback,
        ...(!item.verified ? [element("span", { className:"desktop-successes-card-sample", text:data.verificationLabel })] : []),
        element("span", { className: "desktop-successes-card-sport", text: item.sport }),
        ...(archive ? [featuredBadge] : [])),
      element("div", { className: "desktop-successes-card-copy" },
        element("strong", { className: "desktop-successes-card-name", text: item.name }),
        element("span", { className: "desktop-successes-card-result", text: item.result }),
        ...(archive ? [element("time", { className:"desktop-archive-card-date", text:successDateText(item.date),
          attributes:{ datetime:item.date } })] : [])));
    card.addEventListener("click", () => activeIndex === index ? close() : open(index));
    return card;
  });
  const cardsById = new Map(items.map((item,index) => [item.id,cards[index]]));
  const grid = element("div", { className: "desktop-successes-grid",
    attributes:archive ? { tabindex:"-1" } : {} }, ...(archive ? [] : cards));
  let toolbar = null;
  let paginator = null;
  let searchInput, sportSelect, yearSelect, yearField, orderSelect, countLabel;
  if (archive) {
    const options = archiveView(config,archiveState).options;
    searchInput = element("input", { className:"desktop-archive-search", attributes:{
      type:"search", "aria-label":ui.searchLabel, placeholder:ui.searchPlaceholder, maxlength:120
    } });
    searchInput.value = archiveState.query;
    function selector(className,label,values) {
      return element("label", { className }, element("span", { text:label }),
        element("select", {}, ...values.map(([value,title]) =>
          element("option", { text:title, attributes:{ value } }))));
    }
    const sportField = selector("desktop-archive-field",ui.sportLabel,
      [["",ui.allSports],...options.sports.map((sport) => [sport,sport])]);
    sportSelect = sportField.children[1];
    yearField = selector("desktop-archive-field",ui.yearLabel,
      [["",ui.allYears],...options.years.map((year) => [year,year])]);
    yearSelect = yearField.children[1];
    yearField.hidden = options.years.length < 2;
    const orderField = selector("desktop-archive-field",ui.sortLabel,
      [["newest",ui.newest],["oldest",ui.oldest]]);
    orderSelect = orderField.children[1];
    const clear = element("button", { className:"desktop-archive-clear", text:ui.clearLabel,
      attributes:{ type:"button" } });
    countLabel = element("p", { className:"desktop-archive-count", attributes:{ "aria-live":"polite" } });
    toolbar = element("div", { className:"desktop-archive-toolbar" },
      element("label", { className:"desktop-archive-search-label" },
        element("span", { text:ui.searchLabel }),searchInput),
      element("div", { className:"desktop-archive-fields" },sportField,yearField,orderField),
      element("div", { className:"desktop-archive-status" },countLabel,clear));
    paginator = element("nav", { className:"desktop-archive-pagination", attributes:{ "aria-label":ui.pageLabel } });
    const update = (patch) => {
      archiveState = saveArchiveState({ ...archiveState,...patch,page:1 });
      renderArchive();
    };
    searchInput.addEventListener("input", () => update({ query:searchInput.value }));
    sportSelect.addEventListener("change", () => update({ sport:sportSelect.value }));
    yearSelect.addEventListener("change", () => update({ year:yearSelect.value }));
    orderSelect.addEventListener("change", () => update({ order:orderSelect.value }));
    clear.addEventListener("click", () => update({ query:"",sport:"",year:"",order:"newest" }));
  }
  const section = element("section", { className: archive ? "desktop-successes-section is-archive" : "desktop-successes-section", attributes: {
    "aria-label": archive ? data.archiveTitle : data.ariaLabel
  } }, element("div", { className: "desktop-successes-inner" },
    element("div", { className: "desktop-successes-heading" },
      element("span", { className: "desktop-successes-eyebrow", text: archive ? ui.eyebrow : data.eyebrow }),
      element(archive ? "h1" : "h2", { className: archive ? "desktop-page-title" : "",
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
      const badge = cardsById.get(item.id).querySelector?.(".desktop-archive-featured") ||
        cardsById.get(item.id).children[0].children.at(-1);
      if (badge?.className === "desktop-archive-featured") badge.hidden = !view.featured.has(item.id);
    }
    grid.replaceChildren(...(view.visible.length ? view.visible.map((item) => cardsById.get(item.id)) : [
      element("div", { className:"desktop-archive-empty" },
        element("p", { text:ui.noResults }),
        element("button", { text:ui.clearLabel,
          attributes:{ type:"button", "aria-label":ui.emptyClearLabel } }))
    ]));
    if (!view.visible.length) grid.children[0].children[1].addEventListener("click", () => {
      archiveState = saveArchiveState({ query:"",sport:"",year:"",order:"newest",page:1 });
      renderArchive();
    });
    const pages = [];
    const include = (page) => page === 1 || page === view.pageCount || Math.abs(page - view.state.page) <= 1;
    let last = 0;
    for (let page = 1; page <= view.pageCount; page++) {
      if (!include(page)) continue;
      if (page > last + 1) pages.push(element("span", { className:"desktop-archive-ellipsis", text:"…" }));
      const button = element("button", { className:"desktop-archive-page", text:String(page),
        attributes:{ type:"button", "aria-label":`${page}. ${ui.pageLabel}`,
          "aria-current":page === view.state.page ? "page" : undefined } });
      button.addEventListener("click", () => changePage(page));
      pages.push(button); last = page;
    }
    const prev = element("button", { className:"desktop-archive-page", text:"‹",
      attributes:{ type:"button", "aria-label":ui.previousPage } });
    const next = element("button", { className:"desktop-archive-page", text:"›",
      attributes:{ type:"button", "aria-label":ui.nextPage } });
    prev.disabled = view.state.page <= 1;
    next.disabled = view.state.page >= view.pageCount;
    prev.addEventListener("click", () => changePage(archiveState.page-1));
    next.addEventListener("click", () => changePage(archiveState.page+1));
    paginator.replaceChildren(prev,...pages,next,
      element("span", { className:"desktop-archive-range", text:view.total
        ? `${view.start+1}–${view.start+view.visible.length} / ${view.total}` : `0 / 0` }));
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
    name.textContent = item.name;
    sport.textContent = item.sport;
    result.textContent = item.result;
    competition.textContent = item.competition;
    date.dateTime = item.date;
    date.textContent = successDateText(item.date);
    summary.textContent = item.summary;
    photo.hidden = !item.image;
    photoFallback.hidden = Boolean(item.image);
    photoFallbackSport.textContent = item.sport;
    if (item.image) photo.setAttribute("src", `${successImageRoot}${item.image}`);
    photo.setAttribute("alt", `${item.sport} – sportpillanat`);
    description.replaceChildren(...(!item.verified ? [element("p", { className:"successes-verification-warning", text:data.verificationNotice })] : []), ...item.details.map((text) => element("p", { text })));
    if (!archive) link.setAttribute("href", item.href);
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
    else trapTab(event, archive ? [closeButton,previousDetail,nextDetail] : [closeButton,link]);
  });
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
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
