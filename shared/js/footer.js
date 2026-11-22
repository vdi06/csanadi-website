import { element } from "./dom.js";

/** Közös JSON-adatfolyam: a platformok csak a lábléc elrendezését stílusozzák.
 * Az adatok csak ellenőrzött, teljes válasz esetén cserélődnek le. */
function validFooter(data, release) {
  if (!data || typeof release !== "string" || !/^\d+\.\d+$/.test(release)) return false;
  for (const name of ["brand", "year", "address", "email", "contactTitle", "linksTitle",
    "versionLabel", "updatedLabel", "checkedLabel", "pendingLabel", "errorLabel"]) {
    if (typeof data[name] !== "string" || !data[name].trim() || data[name].length > 500) return false;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt || "") ||
    !Number.isFinite(Date.parse(`${data.updatedAt}T12:00:00Z`))) return false;
  if (!Array.isArray(data.notices) || data.notices.length > 8) return false;
  const ids = new Set();
  for (const notice of data.notices) {
    if (!notice || !/^[a-z0-9-]{1,40}$/.test(notice.id || "") || ids.has(notice.id) ||
      typeof notice.title !== "string" || !notice.title.trim() || notice.title.length > 90 ||
      typeof notice.body !== "string" || !notice.body.trim() || notice.body.length > 1000) return false;
    ids.add(notice.id);
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
  const checked = element("p", { className: "footer-checked",
    attributes: { "aria-live": "polite" } });
  const version = element("p", { className: "footer-version" });
  const contactPanel = element("section", { className: "footer-contact",
    attributes: { "aria-label": first.contactTitle } },
    element("div", { className: "footer-contact-main" }, brand, contactTitle, address, email),
    element("p", { className: "footer-signature", text: config.home.header.motto }));
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
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const next = button === contactTab ? infoTab : contactTab;
        selectTab(next === contactTab ? "contact" : "info");
        next.focus({ preventScroll: true });
      });
    }
    selectTab("info");
  }
  const footer = element("footer", { className: `${platform}-footer site-footer` },
    ...(tabs ? [tabs] : []),
    element("div", { className: "footer-inner" }, contactPanel, infoPanel));
  const expandedIds = new Set();
  let active = true;
  let pending = false;
  let requestController = null;

  function apply(data, release) {
    if (!validFooter(data, release)) return false;
    const items = data.notices.map((item) => {
      const disclosure = element("details", { className: "footer-notice" },
        element("summary", { className: "footer-notice-title", text: item.title }),
        element("p", { className: "footer-notice-content", text: item.body }));
      disclosure.open = expandedIds.has(item.id);
      disclosure.addEventListener("toggle", () => {
        if (disclosure.open) expandedIds.add(item.id);
        else expandedIds.delete(item.id);
      });
      return disclosure;
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
    updated.textContent = `${data.updatedLabel}: ${formatDate(data.updatedAt)}`;
    version.textContent = `${data.versionLabel}: ${release}`;
    return true;
  }
  apply(first, config.release);
  checked.textContent = first.pendingLabel;

  async function checkForUpdates() {
    if (!active || pending || document.visibilityState === "hidden") return false;
    pending = true;
    requestController = new AbortController();
    try {
      const response = await fetch(`./shared/data/site.json?footer=${Date.now()}`,
        { cache: "no-store", signal: requestController.signal });
      if (!response.ok) throw new Error("A JSON nem érhető el.");
      const next = await response.json();
      if (!active || !apply(next?.home?.footer, next?.release)) throw new Error("Érvénytelen frissítés.");
      const time = new Intl.DateTimeFormat("hu-HU", {
        timeZone: "Europe/Budapest", hour: "2-digit", minute: "2-digit"
      }).format(new Date());
      checked.textContent = `${next.home.footer.checkedLabel}: ${time}`;
      return true;
    } catch {
      if (active) checked.textContent = first.errorLabel;
      return false;
    } finally {
      pending = false;
      requestController = null;
    }
  }
  const seconds = Math.max(30, Math.min(600, Number(first.refreshSeconds) || 60));
  const timer = setInterval(() => { void checkForUpdates(); }, seconds * 1000);
  const onVisibility = () => {
    if (document.visibilityState === "visible") void checkForUpdates();
  };
  document.addEventListener?.("visibilitychange", onVisibility);

  function destroy() {
    active = false;
    clearInterval(timer);
    requestController?.abort();
    document.removeEventListener?.("visibilitychange", onVisibility);
  }
  return { footer, destroy, checkForUpdates };
}
