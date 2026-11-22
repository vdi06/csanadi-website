/** A közös belépési pont csak a kijelzőhöz tartozó alkalmazást indítja el. */
const root = document.getElementById("app");
const breakpoint = window.matchMedia("(max-width: 767px)");
const configUrl = new URL("../shared/data/site.json", import.meta.url);
let version = 0;

async function loadConfig() {
  const response = await fetch(configUrl);
  if (!response.ok) throw new Error(`A JSON nem érhető el: HTTP ${response.status}`);
  const config = await response.json();
  if (config.schemaVersion !== "2.00" || !config.site?.crest) {
    throw new Error("A kezdőlap JSON-adatainak formátuma hibás.");
  }
  return config;
}

function applyTheme({ theme }) {
  for (const [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }
}

async function activate(platform, config) {
  const request = ++version;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = `./${platform}/styles.css`;
  stylesheet.dataset.platformStyle = platform;

  const loaded = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => reject(new Error("A megjelenés nem tölthető be.")), { once: true });
  });
  document.head.append(stylesheet);
  const appModule = await import(`../${platform}/app.js`);
  await loaded;
  if (request !== version) {
    stylesheet.remove();
    return;
  }
  document.querySelectorAll("link[data-platform-style]").forEach((link) => {
    if (link !== stylesheet) link.remove();
  });
  document.documentElement.dataset.platform = platform;
  root.replaceChildren();
  appModule.mount(root, config);
}

async function start() {
  try {
    const config = await loadConfig();
    document.title = config.site.fullName;
    applyTheme(config);
    const select = () => activate(breakpoint.matches ? "mobile" : "desktop", config).catch(console.error);
    await select();
    breakpoint.addEventListener("change", select);
  } catch (error) {
    // A hálózati hiba nem fedhető el: a konzolban vizsgálható marad.
    console.error(error);
  }
}

start();
