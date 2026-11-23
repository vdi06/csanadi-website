import { element } from "./dom.js?v=2.41";
import { trapTab } from "./focus.js?v=2.41";
import { isolateModal } from "./modal.js?v=2.41";

/** Közös JSON-adatfolyam: a platformok csak a lábléc elrendezését stílusozzák.
 * Az adatok csak ellenőrzött, teljes válasz esetén cserélődnek le. */
function validFooter(data, release) {
  if (!data || typeof release !== "string" || !/^\d+\.\d+$/.test(release)) return false;
  for (const name of ["brand", "year", "address", "email", "contactTitle", "linksTitle",
    "versionLabel", "modalCloseLabel", "updatedLabel", "checkedLabel", "pendingLabel", "errorLabel"]) {
    if (typeof data[name] !== "string" || !data[name].trim() || data[name].length > 500) return false;
  }
  if ((data.pendingLabel.match(/\{seconds\}/g) || []).length !== 1) return false;
  if (!Number.isInteger(data.refreshSeconds) || data.refreshSeconds < 10 ||
    data.refreshSeconds > 600) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt || "") ||
    !Number.isFinite(Date.parse(`${data.updatedAt}T12:00:00Z`))) return false;
  if (!Array.isArray(data.notices) || data.notices.length > 8) return false;
  const ids = new Set();
  const glyphs = new Set();
  for (const notice of data.notices) {
    if (!notice || !/^[a-z0-9-]{1,40}$/.test(notice.id || "") || ids.has(notice.id) ||
      typeof notice.glyph !== "string" || !/^\p{Lu}$/u.test(notice.glyph) || glyphs.has(notice.glyph) ||
      typeof notice.title !== "string" || !notice.title.trim() || notice.title.length > 90 ||
      typeof notice.body !== "string" || !notice.body.trim() || notice.body.length > 1000) return false;
    ids.add(notice.id);
    glyphs.add(notice.glyph);
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
}

function formatDate(iso) {
  const [year, month, day] = iso.split("-");
  return `${year}. ${month}. ${day}.`;
}

export function makeFooter(config, platform) {
  const first = config.home.footer;
  if (!validFooter(first, config.release)) throw new Error("Érvénytelen tájékoztatási JSON-adatok.");

  const brand = element("p", { className: "footer-brand" });
  const contactTitle = element("h2");
  const address = element("p");
  const email = element("a");
  const linksTitle = element("h2");
  const notices = element("div", { className: "footer-notices" });
  const updated = element("p", { className: "footer-updated" });
  // Tíz másodpercenkénti háttérellenőrzést a képernyőolvasó ne mondja be újra.
  const checked = element("p", { className: "footer-checked" });
  const version = element("p", { className: "footer-version" });
  const modalTitle = element("h2", { className: "footer-modal-title",
    attributes: { id: `${platform}-footer-modal-title` } });
  const modalContent = element("p", { className: "footer-modal-content" });
  const modalClose = element("button", { className: "footer-modal-close",
    text: config.home.header.closeSymbol,
    attributes: { type: "button", "aria-label": first.modalCloseLabel } });
  const modalDialog = element("section", { className: "footer-modal-dialog",
    attributes: { role: "dialog", "aria-modal": "true",
      "aria-labelledby": `${platform}-footer-modal-title` } },
    modalClose, modalTitle, modalContent);
  const modalBackdrop = element("div", { className: "footer-modal-backdrop",
    attributes: { "aria-hidden": "true" } });
  const modal = element("div", { className: "footer-notice-modal" },
    modalBackdrop, modalDialog);
  modal.hidden = true;
  const contactPanel = element("section", { className: "footer-contact",
    attributes: { "aria-label": first.contactTitle } },
    element("div", { className: "footer-contact-main" }, brand, contactTitle, address, email));
  const infoPanel = element("section", { className: "footer-links",
    attributes: { "aria-label": first.linksTitle } },
    linksTitle, notices, updated, checked, version);
  let tabs;
  let contactTab;
  let infoTab;
  if (platform === "mobile") {
    contactTab = element("button", { className: "footer-mobile-tab",
      attributes: { type: "button", role: "tab", id: "footer-mobile-contact-tab",
        "aria-controls": "footer-mobile-contact", "aria-selected": "false", tabindex: "-1" } });
    infoTab = element("button", { className: "footer-mobile-tab",
      attributes: { type: "button", role: "tab", id: "footer-mobile-info-tab",
        "aria-controls": "footer-mobile-info", "aria-selected": "true", tabindex: "0" } });
    tabs = element("div", { className: "footer-mobile-tabs",
      attributes: { role: "tablist", "aria-label": first.linksTitle } }, contactTab, infoTab);
    contactPanel.setAttribute("id", "footer-mobile-contact");
    contactPanel.setAttribute("role", "tabpanel");
    contactPanel.setAttribute("aria-labelledby", "footer-mobile-contact-tab");
    infoPanel.setAttribute("id", "footer-mobile-info");
    infoPanel.setAttribute("role", "tabpanel");
    infoPanel.setAttribute("aria-labelledby", "footer-mobile-info-tab");
    function selectTab(name) {
      const showContact = name === "contact";
      contactPanel.hidden = !showContact;
      infoPanel.hidden = showContact;
      contactTab.setAttribute("aria-selected", String(showContact));
      infoTab.setAttribute("aria-selected", String(!showContact));
      contactTab.setAttribute("tabindex", showContact ? "0" : "-1");
      infoTab.setAttribute("tabindex", showContact ? "-1" : "0");
    }
    contactTab.addEventListener("click", () => selectTab("contact"));
    infoTab.addEventListener("click", () => selectTab("info"));
    for (const button of [contactTab, infoTab]) {
      button.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? contactTab : event.key === "End" ? infoTab
          : button === contactTab ? infoTab : contactTab;
        selectTab(next === contactTab ? "contact" : "info");
        next.focus({ preventScroll: true });
      });
    }
    selectTab("info");
  }
  const footer = element("footer", { className: `${platform}-footer site-footer` },
    ...(tabs ? [tabs] : []),
    element("div", { className: "footer-inner" }, contactPanel, infoPanel), modal);
  let active = true;
  let pending = false;
  let requestController = null;
  let currentNoticeId = null;
  let currentTrigger = null;
  let noticeById = new Map();
  let triggerById = new Map();
  let previousOverflow;
  let releaseIsolation = () => {};

  function closeModal(restoreFocus = true, restoreRoute = true) {
    if (modal.hidden) return;
    const closingId = currentNoticeId;
    modal.hidden = true;
    releaseIsolation();
    releaseIsolation = () => {};
    currentNoticeId = null;
    if (document.body) document.body.style.overflow = previousOverflow || "";
    if (restoreFocus) currentTrigger?.focus({ preventScroll:true });
    currentTrigger = null;
    if (restoreRoute && closingId &&
      location.hash === `${config.routes.home}/tajekoztatas/${closingId}`) {
      location.hash = config.routes.home;
    }
  }
  function openModal(item, trigger) {
    currentNoticeId = item.id;
    currentTrigger = trigger;
    modalTitle.textContent = item.title;
    modalContent.textContent = item.body;
    previousOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    modal.hidden = false;
    releaseIsolation = isolateModal(modal);
    modalClose.focus({ preventScroll:true });
  }
  modalClose.addEventListener("click", () => closeModal());
  modalBackdrop.addEventListener("click", () => closeModal());
  modalDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeModal(); }
    else trapTab(event, [modalClose]);
  });

  function apply(data, release) {
    if (!validFooter(data, release)) return false;
    const nextNotices = new Map();
    const nextTriggers = new Map();
    const items = data.notices.map((item) => {
      const button = element("button", { className: "footer-notice-icon",
        text: item.glyph,
        attributes: { type: "button", "aria-label": item.title, title:item.title } });
      button.addEventListener("click", () => openModal(item, button));
      nextNotices.set(item.id, item);
      nextTriggers.set(item.id, button);
      return button;
    });
    brand.textContent = `${data.brand} · ${data.year}`;
    contactTitle.textContent = data.contactTitle;
    if (contactTab) contactTab.textContent = data.contactTitle;
    address.textContent = data.address;
    email.textContent = data.email;
    email.setAttribute("href", `mailto:${data.email}`);
    linksTitle.textContent = data.linksTitle;
    if (infoTab) infoTab.textContent = data.linksTitle;
    notices.replaceChildren(...items);
    noticeById = nextNotices;
    triggerById = nextTriggers;
    if (currentNoticeId) {
      const updatedNotice = noticeById.get(currentNoticeId);
      if (updatedNotice) {
        currentTrigger = triggerById.get(currentNoticeId);
        modalTitle.textContent = updatedNotice.title;
        modalContent.textContent = updatedNotice.body;
      } else closeModal(false);
    }
    modalClose.setAttribute("aria-label", data.modalCloseLabel);
    updated.textContent = `${data.updatedLabel}: ${formatDate(data.updatedAt)}`;
    version.textContent = `${data.versionLabel}: ${release}`;
    return true;
  }
  apply(first, config.release);
  let appliedRelease = config.release;
  let appliedFooter = JSON.stringify(first);
  const refreshSeconds = first.refreshSeconds;
  checked.textContent = first.pendingLabel.replace("{seconds}", String(refreshSeconds));

  async function checkForUpdates() {
    if (!active || pending || document.visibilityState === "hidden") return false;
    pending = true;
    requestController = new AbortController();
    try {
      const response = await fetch(`./shared/data/site.json?footer=${Date.now()}`,
        { cache: "no-store", signal: requestController.signal });
      if (!response.ok) throw new Error("A JSON nem érhető el.");
      const next = await response.json();
      const nextFooter = next?.home?.footer;
      if (!active || !validFooter(nextFooter, next?.release)) throw new Error("Érvénytelen frissítés.");
      const nextSignature = JSON.stringify(nextFooter);
      if (next.release !== appliedRelease || nextSignature !== appliedFooter) {
        if (!apply(nextFooter, next.release)) throw new Error("Érvénytelen frissítés.");
        appliedRelease = next.release;
        appliedFooter = nextSignature;
      }
      const time = new Intl.DateTimeFormat("hu-HU", {
        timeZone: "Europe/Budapest", hour: "2-digit", minute: "2-digit"
      }).format(new Date());
      checked.textContent = `${next.home.footer.checkedLabel}: ${time}`;
      // Új programkiadásnál friss URL: a böngésző nem használhatja a régi HTML/JS-t.
      if (next.release !== config.release && window.location?.href &&
        typeof window.location.replace === "function") {
        const destination = new URL(window.location.href);
        if (destination.searchParams.get("v") !== next.release) {
          destination.searchParams.set("v", next.release);
          window.location.replace(destination.href);
        }
      }
      return true;
    } catch {
      if (active) checked.textContent = first.errorLabel;
      return false;
    } finally {
      pending = false;
      requestController = null;
    }
  }
  const timer = setInterval(() => { void checkForUpdates(); }, refreshSeconds * 1000);
  const onVisibility = () => {
    if (document.visibilityState === "visible") void checkForUpdates();
  };
  document.addEventListener?.("visibilitychange", onVisibility);

  function destroy() {
    active = false;
    closeModal(false, false);
    clearInterval(timer);
    requestController?.abort();
    document.removeEventListener?.("visibilitychange", onVisibility);
  }
  return { footer, destroy, checkForUpdates,
    openById: (id) => {
      const notice = noticeById.get(id);
      const trigger = triggerById.get(id);
      if (!notice || !trigger) return false;
      if (contactTab && infoTab) infoTab.click?.();
      openModal(notice, trigger);
      return true;
    } };
}
