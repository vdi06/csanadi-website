import { element } from "../shared/js/dom.js?v=2.21";
import { trapTab } from "../shared/js/focus.js?v=2.21";
import { checkedSportSuccesses, successImageRoot, successDateText } from "../shared/js/successes-data.js?v=2.21";

/** Asztali sportsikerek: tágas 3×2-es rács, teljes nézet fölötti saját lebegő ablak. */
export function createDesktopSuccesses(config) {
  const data = checkedSportSuccesses(config);
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
        sport, name, result, competition, date, summary, description, link)));
  const backdrop = element("button", { className: "desktop-successes-backdrop", attributes: {
    type: "button", "aria-label": data.closeLabel, tabindex: "-1", "aria-hidden": "true"
  } });
  const overlay = element("div", { className: "desktop-successes-overlay" }, backdrop, dialog);
  overlay.hidden = true;

  let activeIndex = -1;
  let previousOverflow = "";
  let origin = null;
  const cards = data.items.map((item, index) => {
    const image = item.image ? element("img", { className: "desktop-successes-card-image", attributes: {
      src: `${successImageRoot}${item.image}`, alt: `${item.sport} – sportpillanat`,
      loading: "lazy", decoding: "async", width: 960, height: 640
    } }) : null;
    const fallback = element("div", { className: "desktop-successes-card-fallback" },
      element("span", { className: "desktop-successes-fallback-mark", text: "✦", attributes: { "aria-hidden": "true" } }),
      element("strong", { className: "desktop-successes-fallback-sport", text: item.sport }));
    fallback.hidden = Boolean(image);
    image?.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; });
    const card = element("button", { className: "desktop-successes-card", attributes: {
      type: "button", "aria-label": `${data.openLabel}: ${item.name}, ${item.result}, ${item.sport}`,
      "aria-haspopup": "dialog", "aria-controls": "desktop-successes-dialog", "aria-expanded": "false"
    } },
      element("div", { className: "desktop-successes-card-image-wrap" },
        ...(image ? [image] : []), fallback,
        element("span", { className: "desktop-successes-card-sport", text: item.sport })),
      element("div", { className: "desktop-successes-card-copy" },
        element("strong", { className: "desktop-successes-card-name", text: item.name }),
        element("span", { className: "desktop-successes-card-result", text: item.result })));
    card.addEventListener("click", () => activeIndex === index ? close() : open(index));
    return card;
  });
  const section = element("section", { className: "desktop-successes-section", attributes: {
    "aria-label": data.ariaLabel
  } }, element("div", { className: "desktop-successes-inner" },
    element("div", { className: "desktop-successes-heading" },
      element("span", { className: "desktop-successes-eyebrow", text: data.eyebrow }),
      element("h2", { text: data.title }),
      element("p", { text: data.intro })),
    element("div", { className: "desktop-successes-grid" }, ...cards)));

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
    description.replaceChildren(...item.details.map((text) => element("p", { text })));
    link.setAttribute("href", item.href);
    activeIndex = index;
    cards[index].setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    closeButton.focus({ preventScroll: true });
  }
  backdrop.addEventListener("click", () => close());
  closeButton.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else trapTab(event, [closeButton, link]);
  });
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (href?.startsWith("#/")) { event.preventDefault(); location.hash = href; }
    close(false);
  });
  return { section, overlay, destroy: () => close(false) };
}
