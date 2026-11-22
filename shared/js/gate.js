import { element, crest } from "./dom.js";

const NS = "http://www.w3.org/2000/svg";
const DOOR_SHAPE = "M 6 78 C 37 48 76 17 140 12 C 204 17 243 48 274 78 L 274 510 Q 274 514 269 514 L 11 514 Q 6 514 6 510 Z";

function svgNode(tag, attributes = {}, ...children) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  for (const child of children) node.append(child);
  return node;
}

/** Három egymáshoz illeszkedő arany fémél. Nincs kitöltött ovális vagy téglalap. */
function makeOutline() {
  const svg = svgNode("svg", { class: "gate-outline", viewBox: "0 0 1600 900",
    preserveAspectRatio: "none", "aria-hidden": "true" });
  const gradient = svgNode("linearGradient", { id: "csanadi-gold", x1: "0%", y1: "0%", x2: "100%", y2: "40%" },
    svgNode("stop", { offset: "0%", "stop-color": "#8e5d24" }),
    svgNode("stop", { offset: "28%", "stop-color": "#fbe7aa" }),
    svgNode("stop", { offset: "58%", "stop-color": "#c29346" }),
    svgNode("stop", { offset: "100%", "stop-color": "#f7d890" }));
  svg.append(svgNode("defs", {}, gradient));
  const group = svgNode("g", { transform: "translate(666 284) scale(.96 .95)" },
    svgNode("path", { d: DOOR_SHAPE, fill: "none", stroke: "#38230f", "stroke-width": 13 }),
    svgNode("path", { d: DOOR_SHAPE, fill: "none", stroke: "url(#csanadi-gold)", "stroke-width": 8 }),
    svgNode("path", { d: DOOR_SHAPE, fill: "none", stroke: "#fff0bc", "stroke-width": 2.2,
      "stroke-opacity": .78 }),
    svgNode("path", { d: "M 140 12 L 140 513", fill: "none", stroke: "#d9ac61",
      "stroke-width": 2.5, "stroke-opacity": .8 }));
  svg.append(group);
  return svg;
}

export function mountGate(root, config, platform, enter) {
  const settings = config.gate;
  const frames = [];
  let destroyed = false;
  let opening = false;
  let animationFrame = 0;
  let lastVisible = 0;
  const frameHost = element("div", { className: "gate-frames", attributes: { "aria-hidden": "true" } });
  for (let index = 0; index < settings.frames; index++) {
    const name = `${settings.framePrefix}${String(index).padStart(2, "0")}${platform === "mobile" ? settings.mobileSuffix : ""}${settings.extension}`;
    const picture = element("img", { className: `gate-frame${index === 0 ? " is-visible" : ""}`,
      attributes: { src: `${settings.assetDirectory}${name}`, alt: "", draggable: "false",
        decoding: "async", loading: "eager" } });
    frameHost.append(picture);
    frames.push(picture);
    // A dekódolás párhuzamosan indul; a képek végig a DOM-ban maradnak.
    if (typeof picture.decode === "function") picture.decode().catch(() => {});
  }

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
    element("div", { className: "gate-caption" },
      element("h1", { text: config.site.name }),
      element("p", { className: "gate-subtitle", text: config.site.subtitle }),
      element("p", { className: "gate-hint", text: platform === "mobile" ? settings.mobileHint : settings.desktopHint })));
  root.replaceChildren(screen);

  function visible(index) {
    if (destroyed || index === lastVisible) return;
    // Hibás kép esetén az előző, működő képkocka megmarad a képernyőn.
    const target = frames[index];
    if (!target.complete || target.naturalWidth === 0) return;
    frames[lastVisible].classList.remove("is-visible");
    target.classList.add("is-visible");
    lastVisible = index;
  }
  function startOpening() {
    if (opening || destroyed) return;
    opening = true;
    button.disabled = true;
    screen.classList.add("is-opening");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { enter(); return; }
    const duration = platform === "mobile" ? settings.mobileDurationMs : settings.desktopDurationMs;
    let startedAt;
    const step = (time) => {
      if (destroyed) return;
      if (startedAt === undefined) startedAt = time;
      const progress = Math.min(1, (time - startedAt) / duration);
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      visible(Math.min(settings.frames - 1, Math.round(eased * (settings.frames - 1))));
      if (progress >= 1) enter();
      else animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
  }
  button.addEventListener("click", startOpening);
  return () => {
    destroyed = true;
    cancelAnimationFrame(animationFrame);
  };
}
