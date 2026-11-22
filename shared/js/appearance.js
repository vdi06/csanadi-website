/** Közös állapot, nem közös fejléc: mindkét külön fejléc saját témagombot kap. */
let preference;
const subscribers = new Set();

function initialPreference(config) {
  if (preference !== undefined) return preference;
  let saved;
  try { saved = localStorage.getItem(config.appearance.storageKey); } catch { /* Nem kötelező tárhely. */ }
  preference = config.appearance.cycle.includes(saved) ? saved : config.appearance.defaultMode;
  return preference;
}

function savePreference(config, value) {
  preference = value;
  try { localStorage.setItem(config.appearance.storageKey, value); } catch { /* A váltás így is működik. */ }
  for (const update of subscribers) update();
}

export function bindAppearance(config, home, themeButton) {
  const appearance = config.appearance;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    const selected = initialPreference(config);
    const effective = selected === "auto" ? (media.matches ? "dark" : "light") : selected;
    home.dataset.themePreference = selected;
    home.dataset.theme = effective;
    home.style.setProperty("color-scheme", effective);
    const colors = effective === "light" ? appearance.light : config.theme;
    for (const [name, value] of Object.entries(colors)) home.style.setProperty(`--${name}`, value);
    themeButton.textContent = appearance.glyphs[selected];
    const label = `${config.home.header.themeLabel}: ${appearance.labels[selected]}`;
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  };
  const switchMode = () => {
    const current = initialPreference(config);
    const modes = appearance.cycle;
    savePreference(config, modes[(modes.indexOf(current) + 1) % modes.length]);
  };
  themeButton.addEventListener("click", switchMode);
  if (typeof media.addEventListener === "function") media.addEventListener("change", apply);
  else if (typeof media.addListener === "function") media.addListener(apply);
  subscribers.add(apply);
  apply();
  return () => {
    subscribers.delete(apply);
    themeButton.removeEventListener("click", switchMode);
    if (typeof media.removeEventListener === "function") media.removeEventListener("change", apply);
    else if (typeof media.removeListener === "function") media.removeListener(apply);
  };
}
