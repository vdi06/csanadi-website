import { crest, element } from "../shared/js/dom.js?v=2.29";
import { getMenuPage, menuPageHref } from "../shared/js/menu-data.js?v=2.29";

const clamp = (value) => Math.max(0, Math.min(1, value));
const mediaRoot = "./shared/assets/media/web/desktop-hero/";

/** Új sorrend minden órában: minden kép pontosan egyszer, a körök határán
 * sincs egymás utáni ismétlés. A tesztelhetőség miatt a sorsoló injektálható. */
export function shuffledHeroOrder(count, previous = -1, random = Math.random) {
  if (!Number.isInteger(count) || count < 2) throw new Error("Legalább két nyitókép szükséges.");
  const sequence = Array.from({ length: count }, (_, index) => index);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  if (sequence[0] === previous) [sequence[0], sequence[1]] = [sequence[1], sequence[0]];
  return sequence;
}

/** Asztali nyitás: a fotó a következő szakaszig kitart, a címer csak a
 * ragadós nyitószakasz végére ér a fejlécbe. Mobilon ez a modul nincs betöltve. */
export function createDesktopHero(config, { openMenu, headerCrest, setCompact }) {
  const data = config.home.desktopHero;
  if (!Array.isArray(data?.slides) || data.slides.length < 2 ||
    !data.slides.every((slide) => /^[a-z0-9-]+\.webp$/.test(slide.file) &&
      getMenuPage(config, slide.pageId))) throw new Error("Érvénytelen asztali nyitókép-JSON.");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const photo = element("img", { className: "desktop-hero-photo", attributes: {
    alt: "", decoding: "async", fetchpriority: "high", width: "1672", height: "941"
  } });
  const eyebrow = element("span", { className: "desktop-hero-story-eyebrow" });
  const storyTitle = element("strong", { className: "desktop-hero-story-title" });
  const story = element("a", { className: "desktop-hero-story" },
    element("span", { className: "desktop-hero-story-channel", text: "CSANÁDI HÍREK" }),
    eyebrow, storyTitle,
    element("span", { className: "desktop-hero-story-action", text: "MEGNYITÁS" }));
  const previous = element("button", { className: "desktop-hero-arrow desktop-hero-arrow--prev", text: "‹",
    attributes: { type: "button", "aria-label": data.previousLabel } });
  const next = element("button", { className: "desktop-hero-arrow desktop-hero-arrow--next", text: "›",
    attributes: { type: "button", "aria-label": data.nextLabel } });
  const heroCrest = element("button", { className: "desktop-hero-crest", attributes: {
    type: "button", "aria-label": data.menuTitle,
    "aria-controls": "desktop-main-menu", "aria-expanded": "false"
  } }, crest(config, "desktop-hero-crest-image"));
  // A teljes intézménynév és a mottó már a fejlécben olvasható.
  // A nyitóképen nem ismételjük meg őket, de a főcím a felolvasóknak megmarad.
  const accessibleTitle = element("h1", {
    className: "desktop-hero-accessible-title", text: data.schoolTitle
  });
  const imageLayer = element("div", { className: "desktop-hero-image",
    attributes: { "aria-hidden": "true" } }, photo,
    element("div", { className: "desktop-hero-shade" }));
  const stage = element("div", { className: "desktop-hero-stage" },
    accessibleTitle, heroCrest, previous, next,
    element("div", { className: "desktop-hero-controls" }, story));
  const track = element("section", { className: "desktop-hero-track", attributes: {
    "aria-label": data.ariaLabel
  } },
    imageLayer,
    element("div", { className: "desktop-hero-after", attributes: { "aria-hidden": "true" } }),
    stage);
  let sequence = shuffledHeroOrder(data.slides.length);
  let position = 0;
  let activeIndex = sequence[position];
  let lastFolded = false;
  let scrollRatio = 0;
  let scheduled = false;
  let disposed = false;
  const failed = new Set();
  const allControls = [heroCrest, previous, next, story];

  function showSlide() {
    activeIndex = sequence[position];
    const slide = data.slides[activeIndex];
    photo.setAttribute("src", `${mediaRoot}${slide.file}`);
    eyebrow.textContent = slide.eyebrow;
    storyTitle.textContent = slide.title;
    story.setAttribute("href", menuPageHref(slide.pageId));
    story.setAttribute("aria-label", `${slide.title}. ${slide.summary}`);
  }
  function changeSlide(direction) {
    if (direction > 0) {
      position++;
      if (position === sequence.length) {
        sequence = shuffledHeroOrder(data.slides.length, activeIndex);
        position = 0;
      }
    } else position = (position - 1 + sequence.length) % sequence.length;
    showSlide();
  }
  photo.addEventListener("load", () => failed.delete(activeIndex));
  photo.addEventListener("error", () => {
    failed.add(activeIndex);
    const remaining = data.slides.some((_, index) => !failed.has(index));
    if (remaining) changeSlide(1);
    else photo.hidden = true;
  });
  previous.addEventListener("click", () => changeSlide(-1));
  next.addEventListener("click", () => changeSlide(1));
  heroCrest.addEventListener("click", () => openMenu(heroCrest));
  stage.addEventListener("keydown", (event) => {
    if (event.target?.closest?.("button,a")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); changeSlide(event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  const foldLength = () => Math.max(1, (track.offsetHeight || window.innerHeight * 1.6 || 1200) -
    (window.innerHeight || 800));
  function updateScroll() {
    scheduled = false;
    if (disposed) return;
    scrollRatio = clamp((window.scrollY || 0) / foldLength());
    // A felfelé mozgás eleinte lassú, és pontosan a ragadós szakasz végén ér célba.
    const progress = reduced.matches ? (scrollRatio >= 1 ? 1 : 0)
      : scrollRatio * scrollRatio * scrollRatio;
    const bounds = stage.getBoundingClientRect?.() || { left:0, top:0,
      width:window.innerWidth || 1440, height:window.innerHeight || 900 };
    const target = headerCrest?.getBoundingClientRect?.() || { left:bounds.width/2 - 38,
      top:0, width:76, height:76 };
    const startX = bounds.width / 2;
    const startY = bounds.height / 2;
    const targetX = target.left + target.width / 2 - bounds.left;
    const targetY = target.top + target.height / 2 - bounds.top;
    const moveX = (targetX - startX) * progress;
    const moveY = (targetY - startY) * progress;
    const sourceCrestWidth = heroCrest.offsetWidth || Math.min(234,
      Math.max(158, (window.innerWidth || 1100) * .16));
    const endScale = Math.min(1, target.width / sourceCrestWidth);
    stage.style.setProperty("--hero-crest-x", `${moveX.toFixed(2)}px`);
    stage.style.setProperty("--hero-crest-y", `${moveY.toFixed(2)}px`);
    stage.style.setProperty("--hero-crest-scale", String(1 + (endScale - 1) * progress));
    stage.style.setProperty("--hero-crest-opacity", String(clamp((1 - progress) / .045)));
    stage.style.setProperty("--hero-fold-opacity", String(clamp((1 - scrollRatio) / .35)));
    const compact = scrollRatio >= .995;
    setCompact(compact);
    const folded = scrollRatio >= .995;
    if (folded !== lastFolded) {
      for (const control of allControls) control.setAttribute("tabindex", folded ? "-1" : "0");
      lastFolded = folded;
    }
  }
  const onScroll = () => {
    if (scheduled || disposed) return;
    scheduled = true;
    requestAnimationFrame(updateScroll);
  };
  window.addEventListener?.("scroll", onScroll, { passive: true });
  window.addEventListener?.("resize", onScroll, { passive: true });
  const intervalMs = Math.max(1000, Math.min(360000, Number(data.intervalMs) || 180000));
  const timer = setInterval(() => {
    if (!disposed && !reduced.matches) changeSlide(1);
  }, intervalMs);
  showSlide();
  updateScroll();
  return { track, updateScroll, destroy() {
    disposed = true;
    clearInterval(timer);
    window.removeEventListener?.("scroll", onScroll);
    window.removeEventListener?.("resize", onScroll);
    setCompact(false);
  } };
}
