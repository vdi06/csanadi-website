/** Egyetlen HTML, közvetlen kezdőlap és valódi menüvégpont-útvonalak. */
import { validateMenu, getMenuPage } from "./menu-data.js?v=2.53";
import { featuredSportSuccesses, archivedSportSuccesses } from "./successes-data.js?v=2.53";
import { eventById } from "./calendar-data.js?v=2.53";
import { mountOffline } from "./offline.js?v=2.53";
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
let platformRetryTimer = 0;
let platformRetryFailures = 0;

// A reszponzív stílus átmeneti fájl-/hálózati hibáját is újrapróbáljuk.
// Enélkül a 767/768 px-es váltás után a régi mobil/asztali nézet maradhat a képernyőn.
function retryPlatformLater() {
  if (platformRetryTimer || !initialized) return;
  const delay = Math.min(30000, 1500 * 2 ** Math.min(platformRetryFailures - 1, 4));
  platformRetryTimer = setTimeout(() => {
    platformRetryTimer = 0;
    if (!initialized || !config || !activeModule) return;
    const wanted = breakpoint.matches ? "mobile" : "desktop";
    if (wanted === activePlatform) { platformRetryFailures = 0; return; }
    void render().catch((error) => {
      console.warn("[Csanádi] A reszponzív nézet átmenetileg nem tölthető be.", error);
    });
  }, delay);
}


function route() {
  if (!location.hash || location.hash === config.routes.gate || location.hash === "#/kapu") return "gate";
  if (location.hash === config.routes.home) return "home";
  const sportMatch = /^#\/kezdolap\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash);
  if (sportMatch && featuredSportSuccesses(config).some((item) => item.id === sportMatch[1])) return "home";
  const noticeMatch = /^#\/kezdolap\/tajekoztatas\/([a-z0-9-]+)$/.exec(location.hash);
  if (noticeMatch && config.home.footer.notices.some((item) => item.id === noticeMatch[1])) return "home";
  const eventMatch = /^#\/kezdolap\/esemeny\/([a-z0-9-]+)$/.exec(location.hash);
  if (eventMatch && eventById(config,eventMatch[1])) return "home";
  const calendarPageMatch = /^#\/oldal\/news-calendar\/esemeny\/([a-z0-9-]+)$/.exec(location.hash);
  if (calendarPageMatch && eventById(config,calendarPageMatch[1])) return "page:news-calendar";
  const newsMatch = /^#\/oldal\/(news-latest|news-announcements|news-archive)\/hir\/([a-z0-9-]+)$/.exec(location.hash);
  if (newsMatch && config.publicNews.some((item)=>item.id===newsMatch[2] &&
      (newsMatch[1]!=="news-announcements" || item.tags.includes("announcement")) &&
      (newsMatch[1]==="news-announcements" || !item.tags.includes("announcement")))) {
    return `page:${newsMatch[1]}`;
  }
  const archiveMatch = /^#\/oldal\/sports-results\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash);
  if (archiveMatch && archivedSportSuccesses(config).some((item) => item.id === archiveMatch[1])) {
    return "page:sports-results";
  }
  const match = /^#\/oldal\/([a-z0-9-]+)$/.exec(location.hash);
  return match && getMenuPage(config, match[1]) ? `page:${match[1]}` : "home";
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
    const searchDetailOpen = (selectedRoute.startsWith("page:news-") &&
      /^#\/oldal\/(news-latest|news-announcements|news-archive)\/hir\/[a-z0-9-]+$/.test(location.hash)) || (selectedRoute === "page:news-calendar" &&
      /^#\/oldal\/news-calendar\/esemeny\/[a-z0-9-]+$/.test(location.hash)) || (selectedRoute === "home" &&
      /^#\/kezdolap\/(sportsiker|tajekoztatas|esemeny)\/[a-z0-9-]+$/.test(location.hash)) ||
      (selectedRoute === "page:sports-results" &&
        /^#\/oldal\/sports-results\/sportsiker\/[a-z0-9-]+$/.test(location.hash));
    const focusTarget = searchDetailOpen ? null : menuPage
      ? root.querySelector(`.${platform}-page-title`)
      : selectedRoute === "home" ? root.querySelector(".home-brand")
      : root.querySelector(".gate-door-button");
    if (focusTarget) {
      focusTarget.focus({ preventScroll:true });
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
    // A CSS-betöltés hibáját azonnal figyeljük: egy gyors hálózati elutasítás
    // ne okozzon külön kezeletlen Promise-rejectiont a JS-import ideje alatt.
    const [module] = await Promise.all([
      import(`../../${platform}/app.js?v=${encodeURIComponent(config.release)}`),
      loaded
    ]);
    if (version !== serial) { stylesheet.remove(); return; }
    document.querySelectorAll("link[data-platform-style]").forEach((node) => {
      if (node !== stylesheet) node.remove();
    });
    activePlatform = platform;
    activeModule = module;
    platformRetryFailures = 0;
    if (platformRetryTimer) { clearTimeout(platformRetryTimer); platformRetryTimer = 0; }
    mountView(platform, module, selectedRoute);
  } catch (error) {
    stylesheet.remove();
    if (initialized && version === serial && activeModule) {
      platformRetryFailures++;
      retryPlatformLater();
    }
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
    if (nextConfig?.schemaVersion !== "2.30" || !nextConfig.routes?.home ||
      nextConfig.routes.gate !== "#/" || nextConfig.gate?.frames !== 30) {
      throw new Error("A honlap JSON-beállításai hibásak.");
    }
    validateMenu(nextConfig);
    // A betöltött kiadás nem írható vissza szerverre; a kereső gyorsítótárát
    // csak teljes, validált új JSON-betöltéskor szabad cserélni.
    Object.defineProperty(nextConfig, "__staticContent", { value:true });
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
    // A kapu külön kezdőútvonalon jelenik meg; a közvetlen oldalhivatkozások nem sérülnek.
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
