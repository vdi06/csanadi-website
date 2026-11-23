/** Egyetlen HTML, JSON-alapú kapu, kezdőlap és valódi menüvégpont-útvonalak. */
import { validateMenu, getMenuPage } from "./menu-data.js?v=2.30";
import { featuredSportSuccesses, archivedSportSuccesses } from "./successes-data.js?v=2.30";
import { mountOffline } from "./offline.js?v=2.30";
const root = document.getElementById("app");
const breakpoint = window.matchMedia("(max-width: 767px)");
const settingsUrl = new URL("../data/site.json", import.meta.url);
let config;
let destroyCurrent = () => {};
let serial = 0;
let activePlatform = null;
let activeModule = null;
let hasRendered = false;
let lastRenderedRoute = null;
let initialized = false;
let checkingConfig = false;
let retryTimer = 0;
let failedAttempts = 0;
let offlineView = null;

function route() {
  if (location.hash === config.routes.home) return "home";
  const sportMatch = /^#\/kezdolap\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash);
  if (sportMatch && featuredSportSuccesses(config).some((item) => item.id === sportMatch[1])) return "home";
  const noticeMatch = /^#\/kezdolap\/tajekoztatas\/([a-z0-9-]+)$/.exec(location.hash);
  if (noticeMatch && config.home.footer.notices.some((item) => item.id === noticeMatch[1])) return "home";
  const archiveMatch = /^#\/oldal\/sports-results\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash);
  if (archiveMatch && archivedSportSuccesses(config).some((item) => item.id === archiveMatch[1])) {
    return "page:sports-results";
  }
  const match = /^#\/oldal\/([a-z0-9-]+)$/.exec(location.hash);
  return match && getMenuPage(config, match[1]) ? `page:${match[1]}` : "gate";
}

function mountView(platform, module, selectedRoute) {
  const routeChanged = hasRendered && selectedRoute !== lastRenderedRoute;
  destroyCurrent();
  document.documentElement.dataset.platform = platform;
  document.documentElement.dataset.route = selectedRoute.startsWith("page:") ? "page" : selectedRoute;
  const menuPage = selectedRoute.startsWith("page:") ? getMenuPage(config, selectedRoute.slice(5)) : null;
  document.title = menuPage ? `${menuPage.title} – ${config.site.fullName}` : config.site.fullName;
  destroyCurrent = module.mount(root, config, selectedRoute) || (() => {});
  if (routeChanged) window.scrollTo?.({ top:0, behavior:"instant" });
  if (hasRendered) {
    const searchDetailOpen = (selectedRoute === "home" &&
      /^#\/kezdolap\/(sportsiker|tajekoztatas)\/[a-z0-9-]+$/.test(location.hash)) ||
      (selectedRoute === "page:sports-results" &&
        /^#\/oldal\/sports-results\/sportsiker\/[a-z0-9-]+$/.test(location.hash));
    const focusTarget = searchDetailOpen ? null : menuPage
      ? root.querySelector(`.${platform}-page-title`)
      : selectedRoute === "home" ? root.querySelector(".home-brand")
      : root.querySelector(".gate-door-button");
    if (focusTarget) {
      focusTarget.focus({ preventScroll: true });
    }
  }
  hasRendered = true;
  lastRenderedRoute = selectedRoute;
}

async function render() {
  if (!config) return;
  const version = ++serial;
  const platform = breakpoint.matches ? "mobile" : "desktop";
  const selectedRoute = route();
  if (activePlatform === platform && activeModule) {
    mountView(platform, activeModule, selectedRoute);
    return;
  }
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = `./${platform}/styles.css?v=${encodeURIComponent(config.release)}`;
  stylesheet.dataset.platformStyle = platform;
  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("A platformstílus nem tölthető be.")), { once: true });
  });
  document.head.append(stylesheet);
  try {
    const module = await import(`../../${platform}/app.js?v=${encodeURIComponent(config.release)}`);
    await loaded;
    if (version !== serial) { stylesheet.remove(); return; }
    document.querySelectorAll("link[data-platform-style]").forEach((node) => {
      if (node !== stylesheet) node.remove();
    });
    activePlatform = platform;
    activeModule = module;
    mountView(platform, module, selectedRoute);
  } catch (error) {
    stylesheet.remove();
    throw error;
  }
}

function clearRetry() {
  clearTimeout(retryTimer);
  retryTimer = 0;
}

function showOffline() {
  if (!offlineView) {
    destroyCurrent();
    destroyCurrent = () => {};
    activePlatform = null;
    activeModule = null;
    document.querySelectorAll("link[data-platform-style]").forEach((node) => node.remove());
    document.documentElement.dataset.platform = "offline";
    document.documentElement.dataset.route = "offline";
    document.title = "Csanádi – Átmeneti offline nézet";
    offlineView = mountOffline(root, () => { clearRetry(); void loadConfig(); });
  }
  offlineView.setChecking(false);
}

function scheduleRetry() {
  if (initialized || retryTimer) return;
  const delay = Math.min(30000, 5000 * 2 ** Math.min(failedAttempts - 1, 3));
  retryTimer = setTimeout(() => {
    retryTimer = 0;
    void loadConfig();
  }, delay);
}

async function loadConfig() {
  if (initialized || checkingConfig) return;
  checkingConfig = true;
  offlineView?.setChecking(true);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const freshSettings = new URL(settingsUrl);
    freshSettings.searchParams.set("check", String(Date.now()));
    const response = await fetch(freshSettings, { cache:"no-store", signal:controller.signal });
    if (!response.ok) throw new Error(`Hiányzó JSON: ${response.status}`);
    const nextConfig = await response.json();
    if (nextConfig?.schemaVersion !== "2.30" || nextConfig.gate?.frames !== 30) {
      throw new Error("A kapu JSON-beállításai hibásak.");
    }
    validateMenu(nextConfig);
    config = nextConfig;
    // A következő oldalfrissítés is saját, kiadáshoz kötött URL-en történjen.
    if (window.location?.href && window.history?.replaceState) {
      const current = new URL(window.location.href);
      if (current.searchParams.get("v") !== config.release) {
        current.searchParams.set("v", config.release);
        window.history.replaceState(window.history.state, "", current);
      }
    }
    document.title = config.site.fullName;
    for (const [name, value] of Object.entries(config.theme)) {
      document.documentElement.style.setProperty(`--${name}`, value);
    }
    document.documentElement.style.setProperty("--home-reveal-duration", `${config.gate.homeRevealMs}ms`);
    await render();
    initialized = true;
    offlineView = null;
    failedAttempts = 0;
    clearRetry();
    window.addEventListener("hashchange", () => render().catch(console.error));
    breakpoint.addEventListener("change", () => render().catch(console.error));
  } catch (error) {
    console.warn("[Csanádi] Átmeneti betöltési hiba, újrapróbálás következik.", error);
    failedAttempts++;
    showOffline();
    scheduleRetry();
  } finally {
    clearTimeout(timeout);
    checkingConfig = false;
  }
}

window.addEventListener("online", () => {
  if (!initialized) { clearRetry(); void loadConfig(); }
});
void loadConfig();
