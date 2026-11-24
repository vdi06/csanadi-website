import { element, crest, schoolDisplayNames } from "./dom.js?v=2.63";

const NS = "http://www.w3.org/2000/svg";
const DOOR_SHAPE = "M 6 78 C 37 48 76 17 140 12 C 204 17 243 48 274 78 L 274 510 Q 274 514 269 514 L 11 514 Q 6 514 6 510 Z";

/** Több sérült egymás melletti képnél is a folyamatban levő fázishoz
 * legközelebbi használható képet választjuk, soha nem ugrunk az elejére. */
export function nearestAvailableFrame(available, desired) {
  if (!Array.isArray(available) || !available.length || !Number.isFinite(desired)) return -1;
  const center = Math.max(0, Math.min(available.length - 1, Math.round(desired)));
  for (let distance = 0; distance < available.length; distance++) {
    const before = center - distance;
    const after = center + distance;
    if (before >= 0 && available[before]) return before;
    if (distance && after < available.length && available[after]) return after;
  }
  return -1;
}

function svgNode(tag, attributes = {}, ...children) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  for (const child of children) node.append(child);
  return node;
}

/** Az 1.53-as kapusziluett, a 2.02-ben jóváhagyott aranyperemmel és fényhatással. */
function makeOutline() {
  const svg = svgNode("svg", { class: "gate-outline", viewBox: "0 0 1600 900",
    preserveAspectRatio: "none", "aria-hidden": "true" });
  const gradient = svgNode("linearGradient", { id: "csanadi-gold", x1: "0%", y1: "0%", x2: "100%", y2: "40%" },
    svgNode("stop", { offset: "0%", "stop-color": "#8e5d24" }),
    svgNode("stop", { offset: "28%", "stop-color": "#fbe7aa" }),
    svgNode("stop", { offset: "58%", "stop-color": "#c29346" }),
    svgNode("stop", { offset: "100%", "stop-color": "#f7d890" }));
  svg.append(svgNode("defs", {}, gradient));
  svg.append(svgNode("g", { transform: "translate(666 284) scale(.96 .95)" },
    svgNode("path", { d: DOOR_SHAPE, fill: "none", stroke: "#38230f", "stroke-width": 13 }),
    svgNode("path", { d: DOOR_SHAPE, fill: "none", stroke: "url(#csanadi-gold)", "stroke-width": 8 }),
    svgNode("path", { d: DOOR_SHAPE, fill: "none", stroke: "#fff0bc", "stroke-width": 2.2,
      "stroke-opacity": .78 }),
    svgNode("path", { d: "M 140 12 L 140 513", fill: "none", stroke: "#d9ac61",
      "stroke-width": 2.5, "stroke-opacity": .8 })));
  return svg;
}

export function mountGate(root, config, platform, enter) {
  const settings = config.gate;
  const frames = [];
  let destroyed = false;
  let opening = false;
  let entered = false;
  let animationFrame = 0;
  let finishTimer = 0;
  let lowerFrame = -1;
  let upperFrame = -1;
  const available = Array(settings.frames).fill(false);
  const imagePath = (index, mobile) => {
    const name = `${settings.framePrefix}${String(index).padStart(2, "0")}${mobile ? settings.mobileSuffix : ""}${settings.extension}`;
    return `${settings.assetDirectory}${name}`;
  };
  const frameHost = element("div", { className: "gate-frames", attributes: { "aria-hidden": "true" } });
  for (let index = 0; index < settings.frames; index++) {
    const picture = element("img", { className: `gate-frame${index === 0 ? " is-visible" : ""}`,
      attributes: { src: imagePath(index, platform === "mobile"), alt: "", draggable: "false",
        decoding: "async", loading: "eager" } });
    picture.fetchPriority = index === 0 ? "high" : "low";
    frameHost.append(picture);
    frames.push(picture);
  }

  // Az 1.53-as kódból átvett elv: egyetlen képet sem jelenítünk meg dekódolás előtt.
  // Asztalon hibás képnél a hozzá tartozó kisebb változattal próbálkozunk.
  async function decodeImage(picture) {
    if (typeof picture.decode === "function") await picture.decode();
    else if (!picture.complete) await new Promise((resolve, reject) => {
      picture.addEventListener("load", resolve, { once: true });
      picture.addEventListener("error", reject, { once: true });
    });
    if (picture.naturalWidth <= 0) throw new Error("Nem dekódolható képkocka.");
  }
  const decoded = frames.map(async (picture, index) => {
    try {
      await decodeImage(picture);
      available[index] = true;
    } catch {
      if (platform === "desktop") {
        picture.src = imagePath(index, true);
        try {
          await decodeImage(picture);
          available[index] = true;
          return;
        } catch { /* Az előző használható képkocka marad. */ }
      }
      console.warn(`[Csanádi kapu] Nem tölthető be a(z) ${index}. képkocka.`);
    }
  });

  const button = element("button", { className: "gate-door-button", attributes: {
    type: "button", "aria-label": settings.actionLabel
  } });
  const stage = element("div", { className: "gate-stage" },
    frameHost,
    makeOutline(),
    element("div", { className: "gate-glass-crest" }, crest(config)),
    button);
  const screen = element("main", { className: "gate-screen", attributes: {
    "aria-label": settings.title
  } },
    stage,
    element("div", { className: "gate-bottom-bar" },
      element("div", { className: "gate-bottom-copy" },
        element("h1", { className: "gate-school-name", text: schoolDisplayNames(config.site.fullName).caption }))));
  const duration = platform === "mobile" ? settings.mobileDurationMs : settings.desktopDurationMs;
  screen.style.setProperty("--opening-duration", `${duration}ms`);
  screen.style.setProperty("--finish-duration", `${settings.finishFadeMs}ms`);
  screen.style.setProperty("--finish-blur", `${settings.finishBlurPx}px`);
  root.replaceChildren(screen);

  // 30 képfázis között is folyamatosan, a kijelző képfrissítéséhez igazodva
  // keverjük a két szomszédos fotót. Nincs opacity CSS-transition és képcsere.
  function showProgress(position) {
    const lower = Math.min(frames.length - 1, Math.floor(position));
    const upper = Math.min(frames.length - 1, lower + 1);
    if (!available[lower] || !available[upper]) {
      const fallback = available[lower] ? lower : available[upper] ? upper
        : nearestAvailableFrame(available, position);
      if (fallback < 0) return;
      if (lowerFrame !== fallback || upperFrame !== -1) {
        frames.forEach((frame, index) => { frame.style.opacity = index === fallback ? "1" : "0"; });
        lowerFrame = fallback;
        upperFrame = -1;
      }
      return;
    }
    if (lowerFrame !== lower || upperFrame !== upper) {
      frames.forEach((frame, index) => {
        if (index !== lower && index !== upper) frame.style.opacity = "0";
      });
      lowerFrame = lower;
      upperFrame = upper;
    }
    frames[lower].style.opacity = "1";
    if (upper !== lower) frames[upper].style.opacity = String(position - lower);
  }
  function navigate() {
    if (destroyed || entered) return;
    entered = true;
    enter();
  }
  function startOpening() {
    if (opening || destroyed) return;
    opening = true;
    button.disabled = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { navigate(); return; }
    Promise.all(decoded).then(() => {
      if (destroyed || entered) return;
      if (!available.some(Boolean)) { navigate(); return; }
      showProgress(0);
      screen.classList.add("is-opening");
      let startedAt;
      const step = (time) => {
        if (destroyed || entered) return;
        if (startedAt === undefined) startedAt = time;
        const progress = Math.min(1, (time - startedAt) / duration);
        const eased = (1 - Math.cos(progress * Math.PI)) / 2;
        showProgress(eased * (settings.frames - 1));
        if (progress >= 1) {
          // Az utolsó, teljesen nyitott képet sötét háttérbe úsztatjuk,
          // majd ugyanebből a háttérből jelenik meg a külön kezdőlap.
          screen.classList.add("is-finishing");
          finishTimer = setTimeout(navigate, settings.finishFadeMs);
        } else animationFrame = requestAnimationFrame(step);
      };
      animationFrame = requestAnimationFrame(step);
    });
  }
  button.addEventListener("click", startOpening);
  return () => {
    destroyed = true;
    cancelAnimationFrame(animationFrame);
    clearTimeout(finishTimer);
  };
}
