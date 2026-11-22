import { element } from "../shared/js/dom.js?v=2.21";
import { trapTab } from "../shared/js/focus.js?v=2.21";
import { checkedSportSuccesses, successImageRoot, successDateText } from "../shared/js/successes-data.js?v=2.21";

/** Önálló mobilos sportsiker-rács: 2×3 kártya és függőlegesen olvasható lebegő ablak. */
export function createMobileSuccesses(config) {
  const data = checkedSportSuccesses(config);
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
        detailSummary, detailBody, detailLink)));
  const backdrop = element("button", { className: "mobile-successes-backdrop", attributes: {
    type: "button", "aria-label": data.closeLabel, tabindex: "-1", "aria-hidden": "true"
  } });
  const overlay = element("div", { className: "mobile-successes-overlay" }, backdrop, dialog);
  overlay.hidden = true;
  let activeIndex = -1;
  let previousOverflow = "";
  let origin = null;
  const cards = data.items.map((item, index) => {
    const image = item.image ? element("img", { className: "mobile-successes-card-image", attributes: {
      src: `${successImageRoot}${item.image}`, alt: `${item.sport} – sportpillanat`,
      loading: "lazy", decoding: "async", width: 480, height: 360
    } }) : null;
    const fallback = element("div", { className: "mobile-successes-card-fallback" },
      element("span", { className: "mobile-successes-fallback-mark", text: "✦", attributes: { "aria-hidden": "true" } }),
      element("strong", { className: "mobile-successes-fallback-sport", text: item.sport }));
    fallback.hidden = Boolean(image);
    image?.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; });
    const card = element("button", { className: "mobile-successes-card", attributes: {
      type: "button", "aria-label": `${data.openLabel}: ${item.name}, ${item.result}, ${item.sport}`,
      "aria-haspopup": "dialog", "aria-controls": "mobile-successes-dialog", "aria-expanded": "false"
    } },
      element("div", { className: "mobile-successes-card-image-wrap" },
        ...(image ? [image] : []), fallback,
        element("span", { className: "mobile-successes-card-sport", text: item.sport })),
      element("div", { className: "mobile-successes-card-copy" },
        element("strong", { className: "mobile-successes-card-name", text: item.name }),
        element("span", { className: "mobile-successes-card-result", text: item.result })));
    card.addEventListener("click", () => activeIndex === index ? close() : open(index));
    return card;
  });
  const section = element("section", { className: "mobile-successes-section", attributes: {
    "aria-label": data.ariaLabel
  } }, element("div", { className: "mobile-successes-inner" },
    element("div", { className: "mobile-successes-heading" },
      element("span", { className: "mobile-successes-eyebrow", text: data.eyebrow }),
      element("h2", { text: data.title }),
      element("p", { text: data.intro })),
    element("div", { className: "mobile-successes-grid" }, ...cards)));

  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    if (activeIndex >= 0) cards[activeIndex].setAttribute("aria-expanded", "false");
    activeIndex = -1;
    document.body.style.overflow = previousOverflow;
    if (restoreFocus && origin?.isConnected !== false) origin?.focus({ preventScroll: true });
    origin = null;
  }
  function open(index) {
    const item = data.items[index];
    if (!item) return;
    if (!overlay.hidden) close(false);
    origin = cards[index];
    previousOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
    detailName.textContent = item.name;
    detailSport.textContent = item.sport;
    detailResult.textContent = item.result;
    detailCompetition.textContent = item.competition;
    detailDate.dateTime = item.date;
    detailDate.textContent = successDateText(item.date);
    detailSummary.textContent = item.summary;
    detailBody.replaceChildren(...item.details.map((text) => element("p", { text })));
    detailImage.hidden = !item.image;
    detailFallback.hidden = Boolean(item.image);
    detailFallbackSport.textContent = item.sport;
    if (item.image) detailImage.setAttribute("src", `${successImageRoot}${item.image}`);
    detailImage.setAttribute("alt", `${item.sport} – sportpillanat`);
    detailLink.setAttribute("href", item.href);
    activeIndex = index;
    cards[index].setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    closeButton.focus({ preventScroll: true });
  }
  backdrop.addEventListener("click", () => close());
  closeButton.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else trapTab(event, [closeButton, detailLink]);
  });
  detailLink.addEventListener("click", (event) => {
    const href = detailLink.getAttribute("href");
    if (href?.startsWith("#/")) { event.preventDefault(); location.hash = href; }
    close(false);
  });
  return { section, overlay, destroy: () => close(false) };
}
