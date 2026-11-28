import {mountViewportAdaptation} from "./components/viewport-adaptation.js?v=2.84";
import {mountPageLibrary} from "./components/page-library.js?v=2.84";
import {hydrateStartupDomains,ensureDocuments} from "./data/domain-loader.js?v=2.84";
import {ensurePage} from "./data/page-loader.js?v=2.84";
import {installHealth,recordConfig} from "./layout-health.js?v=2.84";
installHealth();
import { trackLiveState, resetSwitchState, switchBlocked, captureState, restoreState, noteDeferred } from "./layout-state.js?v=2.84";
import { configureLegacyMedia } from "./layout-controller.js?v=2.84";
import { configureResponsiveMedia } from "./responsive-media.js?v=2.84";
import { initLayout, layoutNow } from "./layout-controller.js?v=2.84";
import { mountLayoutPanel } from "./layout-panel.js?v=2.84";
import { loadActivity } from "./page-activities.js?v=2.84";
/** Egyetlen HTML, közvetlen kezdőlap és valódi menüvégpont-útvonalak. */
import { validateMenu, getMenuPage } from "./menu-data.js?v=2.84";
import { featuredSportSuccesses, archivedSportSuccesses } from "./successes-data.js?v=2.84";
import { eventById } from "./calendar-data.js?v=2.84";
import { mountOffline } from "./offline.js?v=2.84";
const root = document.getElementById("app");
const wantedRenderer = () => layoutNow().family;
const settingsUrl = new URL("../data/site.json", import.meta.url);
let config;
let fullConfigPromise=null;
const gateHash=()=>!location.hash||location.hash==="#/"||location.hash==="#/kapu";
let destroyCurrent = () => {};
let serial = 0;
let activePlatform = null;
let activeModule = null;
let hasRendered = false;
let lastRenderedRoute = null;
let lastMountedHash = null;
let initialized = false;
let checkingConfig = false;
let retryTimer = 0;
let failedAttempts = 0;
let offlineView = null;
let platformRetryTimer = 0;
let platformRetryFailures = 0;
let switchTimer=0;
trackLiveState(root);
function requestStructural(){clearTimeout(switchTimer);switchTimer=setTimeout(()=>{if(!initialized||lastMountedHash!==location.hash||wantedRenderer()===activePlatform)return;const why=switchBlocked(root,route());if(why){noteDeferred(why);return;}void render(true).catch(console.error);},180);}
root.addEventListener("close",requestStructural,true);
root.addEventListener("click",()=>{if(wantedRenderer()!==activePlatform)requestStructural();},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&wantedRenderer()!==activePlatform)requestStructural();});

// A reszponzív stílus átmeneti fájl-/hálózati hibáját is újrapróbáljuk.
// Enélkül a 767/768 px-es váltás után a régi mobil/asztali nézet maradhat a képernyőn.
function retryPlatformLater() {
  if (platformRetryTimer || !initialized) return;
  const delay = Math.min(30000, 1500 * 2 ** Math.min(platformRetryFailures - 1, 4));
  platformRetryTimer = setTimeout(() => {
    platformRetryTimer = 0;
    if (!initialized || !config || !activeModule) return;
    const wanted = wantedRenderer();
    if (wanted === activePlatform) { platformRetryFailures = 0; return; }
    const same=lastMountedHash===location.hash;
    if(same&&switchBlocked(root,route()))return;
    void render(same).catch((error) => {
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

function mountView(platform, module, selectedRoute, snapshot=null) {
  if(!snapshot)resetSwitchState();
  const routeChanged = hasRendered && selectedRoute !== lastRenderedRoute;
  destroyCurrent();
  document.documentElement.dataset.platform = platform === "tablet" ? "mobile" : platform;
  document.documentElement.dataset.renderer = platform;
  document.documentElement.dataset.route = selectedRoute.startsWith("page:") ? "page" : selectedRoute;
  const menuPage = selectedRoute.startsWith("page:") ? getMenuPage(config, selectedRoute.slice(5)) : null;
  document.title = menuPage ? `${menuPage.title} – ${config.site.fullName}` : config.site.fullName;
  const destroyView = module.mount(root, config, selectedRoute) || (() => {});
  const destroyPanel = mountLayoutPanel(root,config);
  const destroyViewport=mountViewportAdaptation(root,config),destroyLibrary=mountPageLibrary(root,config,selectedRoute);
  destroyCurrent = () => { destroyViewport(); destroyLibrary(); destroyPanel(); destroyView(); };
  if (routeChanged) window.scrollTo?.({ top:0, behavior:"instant" });
  if (hasRendered) {
    const searchDetailOpen = (selectedRoute.startsWith("page:news-") &&
      /^#\/oldal\/(news-latest|news-announcements|news-archive)\/hir\/[a-z0-9-]+$/.test(location.hash)) || (selectedRoute === "page:news-calendar" &&
      /^#\/oldal\/news-calendar\/esemeny\/[a-z0-9-]+$/.test(location.hash)) || (selectedRoute === "home" &&
      /^#\/kezdolap\/(sportsiker|tajekoztatas|esemeny)\/[a-z0-9-]+$/.test(location.hash)) ||
      (selectedRoute === "page:sports-results" &&
        /^#\/oldal\/sports-results\/sportsiker\/[a-z0-9-]+$/.test(location.hash));
    const focusTarget = searchDetailOpen ? null : menuPage
      ? root.querySelector(`.${platform === "tablet" ? "mobile" : platform}-page-title`)
      : selectedRoute === "home" ? root.querySelector(".home-brand")
      : root.querySelector(".gate-door-button");
    if (focusTarget) {
      focusTarget.focus({ preventScroll:true });
    }
  }
  hasRendered = true;
  lastRenderedRoute = selectedRoute;
  lastMountedHash = location.hash;
  if(snapshot)restoreState(root,snapshot);
}

let inFlightRender=null;
function render(structural=false){const key=JSON.stringify([location.hash,wantedRenderer(),structural]);if(inFlightRender?.key===key)return inFlightRender.promise;const promise=renderActual(structural).finally(()=>{if(inFlightRender?.promise===promise)inFlightRender=null;});inFlightRender={key,promise};return promise;}
async function renderActual(structural=false) {
  if (!config) return;
  if(config.gateOnly&&!gateHash()){
    try{await ensureFullConfig();}catch(error){if(!initialized)throw error;console.warn('[Csanádi] Tartalmi konfiguráció nem elérhető.',error);initialized=false;failedAttempts++;showOffline();scheduleRetry();return;}
  }
  const version = ++serial;
  const platform = wantedRenderer();
  const selectedRoute = route();
  const requestedHash = location.hash;
  const isStale = () => version !== serial || requestedHash !== location.hash || platform !== (wantedRenderer());
  // A teljes, validált kiadási állomány már tartalmazza az oldalt.
  // Csak a különálló interaktív modult kell lekérni.
  if(selectedRoute.startsWith("page:")){
    const id=selectedRoute.slice(5);
    try{await Promise.all([ensurePage(config,id),loadActivity(config,id,settingsUrl),...(id==="information-documents"?[ensureDocuments(config)]:[])]);}catch(error){if(isStale())return;if(!initialized)throw error;console.warn("[Csanádi] Oldaladat nem elérhető.",error);initialized=false;failedAttempts++;showOffline();scheduleRetry();return;}
  }
  if (isStale()) return;
  if(structural && switchBlocked(root,selectedRoute)){noteDeferred(switchBlocked(root,selectedRoute));return;}
  if (activePlatform === platform && activeModule) {
    if(structural)return;
    mountView(platform, activeModule, selectedRoute);
    return;
  }
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = `./${platform === "tablet" ? "mobile" : platform}/styles.css?v=${encodeURIComponent(config.release)}`;
  stylesheet.dataset.platformStyle = platform;
  stylesheet.media="not all";
  let cssTimeout;
  const loaded = new Promise((resolve, reject) => {
    cssTimeout = setTimeout(() => reject(new Error("A platformstílus betöltése túllépte az időkorlátot.")), 8000);
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("A platformstílus nem tölthető be.")), { once: true });
  });
  document.head.insertBefore(stylesheet, document.querySelector("link[data-tablet-css]"));
  try {
    // A CSS-betöltés hibáját azonnal figyeljük: egy gyors hálózati elutasítás
    // ne okozzon külön kezeletlen Promise-rejectiont a JS-import ideje alatt.
    const [module] = await Promise.all([
      import(`../../${platform}/app.js?v=${encodeURIComponent(config.release)}`),
      loaded
    ]);
    if (isStale()) { stylesheet.remove(); return; }
    if(structural && switchBlocked(root,selectedRoute)){stylesheet.remove();noteDeferred(switchBlocked(root,selectedRoute));return;}
    const snapshot=structural?captureState(root):null;
    configureLegacyMedia(stylesheet.sheet);stylesheet.media="all";
    document.querySelectorAll("link[data-platform-style]").forEach((node) => {
      if (node !== stylesheet) node.remove();
    });
    activePlatform = platform;
    activeModule = module;
    platformRetryFailures = 0;
    if (platformRetryTimer) { clearTimeout(platformRetryTimer); platformRetryTimer = 0; }
    mountView(platform, module, selectedRoute,snapshot);
  } catch (error) {
    stylesheet.remove();
    if (initialized && version === serial && activeModule) {
      platformRetryFailures++;
      retryPlatformLater();
    }
    throw error;
  } finally {
    clearTimeout(cssTimeout);
  }
}

async function ensureFullConfig(){
  if(!config?.gateOnly)return;
  if(!fullConfigPromise)fullConfigPromise=(async()=>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);
    try{const u=new URL(settingsUrl);u.searchParams.set('check',String(Date.now()));const started=performance.now();
      const response=await fetch(u,{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Tartalmi JSON: '+response.status);
      const raw=await response.text(),fetched=performance.now(),parsed=JSON.parse(raw);recordConfig(new TextEncoder().encode(raw).length,fetched-started,performance.now()-fetched);const next=await hydrateStartupDomains(parsed);
      if(next.release!==config.release||next.schemaVersion!==config.schemaVersion||next.gateOnly)throw Error('Eltérő tartalmi kiadás.');
      await ensurePage(next,"information-timetable");validateMenu(next,{deferDocuments:true});Object.defineProperty(next,'__staticContent',{value:true});config=next;configureResponsiveMedia(config.adaptiveLayout?.responsiveMedia);
    }finally{clearTimeout(timer);}
  })().finally(()=>{fullConfigPromise=null;});
  return fullConfigPromise;
}
function onHashChange(){void render().catch(console.error);}
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
    const freshSettings = new URL(gateHash()?"gate-config.json":settingsUrl,settingsUrl);
    freshSettings.searchParams.set("check", String(Date.now()));
    const started=performance.now();
    const response = await fetch(freshSettings, { cache:"no-store", signal:controller.signal });
    if (!response.ok) throw new Error(`Hiányzó JSON: ${response.status}`);
    const raw=await response.text();const fetched=performance.now();const parsed=JSON.parse(raw);recordConfig(new TextEncoder().encode(raw).length,fetched-started,performance.now()-fetched);const nextConfig=await hydrateStartupDomains(parsed);
    if (nextConfig?.schemaVersion !== "2.30" || !nextConfig.routes?.home ||
      nextConfig.routes.gate !== "#/" || nextConfig.gate?.frames !== 30) {
      throw new Error("A honlap JSON-beállításai hibásak.");
    }
    if(nextConfig.gateOnly===true){if(!nextConfig.site?.fullName||!nextConfig.site?.crest||!nextConfig.adaptiveLayout||!nextConfig.theme)throw Error("Hiányos kapukonfiguráció.");}else {await ensurePage(nextConfig,"information-timetable");validateMenu(nextConfig,{deferDocuments:true});}
    const moduleRelease=new URL(import.meta.url).searchParams.get("v");
    if(moduleRelease && nextConfig.release !== moduleRelease) throw new Error("A kiadás állományai eltérő verziójúak. Töltsd újra a kezdő HTML-t.");
    // A betöltött kiadás nem írható vissza szerverre; a kereső gyorsítótárát
    // csak teljes, validált új JSON-betöltéskor szabad cserélni.
    Object.defineProperty(nextConfig, "__staticContent", { value:true });
    config = nextConfig;
    configureResponsiveMedia(config.adaptiveLayout?.responsiveMedia);
    initLayout(config, () => {
      if(initialized && lastMountedHash !== location.hash) void render().catch(console.error);
      else if(initialized && wantedRenderer()!==activePlatform)requestStructural();
    });
    // A következő oldalfrissítés is saját, kiadáshoz kötött URL-en történjen.
    if (window.location?.href && window.history?.replaceState) {
      const current = new URL(window.location.href);
      if (current.searchParams.get("v") !== config.release) {
        current.searchParams.set("v", config.release);
        try { window.history.replaceState(window.history.state, "", current); } catch { /* A megjelenítés nem függhet a history írási jogától. */ }
      }
    }
    document.title = config.site.fullName;
    for (const [name, value] of Object.entries(config.theme)) {
      document.documentElement.style.setProperty(`--${name}`, value);
    }
    // A kapu külön kezdőútvonalon jelenik meg; a közvetlen oldalhivatkozások nem sérülnek.
    document.documentElement.style.setProperty("--home-reveal-duration", `${config.gate.homeRevealMs}ms`);
    // A betöltés közben változó hash és töréspont ne vesszen el.
    let requestedHash, requestedMobile;
    do {
      requestedHash = location.hash;
      requestedMobile = wantedRenderer();
      await render();
    } while (requestedHash !== location.hash || requestedMobile !== wantedRenderer() || !activeModule);
    initialized = true;
    offlineView = null;
    failedAttempts = 0;
    clearRetry();
    window.addEventListener("hashchange", onHashChange);

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
