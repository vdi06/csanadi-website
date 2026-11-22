/** Egyetlen belépési pont: kapu (#/) és egyetlen kezdőlap (#/kezdolap). */
const root = document.getElementById("app");
const breakpoint = window.matchMedia("(max-width: 767px)");
const settingsUrl = new URL("../shared/data/site.json", import.meta.url);
let config;
let destroyCurrent = () => {};
let serial = 0;
let activePlatform = null;
let activeModule = null;
let hasRendered = false;

function route() {
  return location.hash === config.routes.home ? "home" : "gate";
}

function mountView(platform, module, selectedRoute) {
  destroyCurrent();
  document.documentElement.dataset.platform = platform;
  document.documentElement.dataset.route = selectedRoute;
  destroyCurrent = module.mount(root, config, selectedRoute) || (() => {});
  if (hasRendered) {
    const focusTarget = selectedRoute === "home"
      ? root.querySelector(".home-brand") : root.querySelector(".gate-door-button");
    if (focusTarget) {
      focusTarget.focus({ preventScroll: true });
    }
  }
  hasRendered = true;
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
  stylesheet.href = `./${platform}/styles.css`;
  stylesheet.dataset.platformStyle = platform;
  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("A platformstílus nem tölthető be.")), { once: true });
  });
  document.head.append(stylesheet);
  const module = await import(`../${platform}/app.js`);
  await loaded;
  if (version !== serial) { stylesheet.remove(); return; }
  document.querySelectorAll("link[data-platform-style]").forEach((node) => {
    if (node !== stylesheet) node.remove();
  });
  activePlatform = platform;
  activeModule = module;
  mountView(platform, module, selectedRoute);
}

async function start() {
  try {
    const response = await fetch(settingsUrl);
    if (!response.ok) throw new Error(`Hiányzó JSON: ${response.status}`);
    config = await response.json();
    if (config.schemaVersion !== "2.05" || config.gate.frames !== 30) {
      throw new Error("A kapu JSON-beállításai hibásak.");
    }
    document.title = config.site.fullName;
    for (const [name, value] of Object.entries(config.theme)) {
      document.documentElement.style.setProperty(`--${name}`, value);
    }
    document.documentElement.style.setProperty("--home-reveal-duration", `${config.gate.homeRevealMs}ms`);
    await render();
    window.addEventListener("hashchange", () => render().catch(console.error));
    breakpoint.addEventListener("change", () => render().catch(console.error));
  } catch (error) {
    console.error(error);
  }
}

start();
