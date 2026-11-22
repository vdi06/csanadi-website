import { crest, element } from "../shared/js/dom.js?v=2.16";
import { getMenuPage, menuPageHref } from "../shared/js/menu-data.js?v=2.16";

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

/** A régi teljes képes asztali nyitás: forgó, középső címer és görgetésre
 * a fejléc címeréhez összezáródó teljes fotó. Mobilon nem importáljuk. */
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
  const story = element("a", { className: "desktop-hero-story" }, eyebrow, storyTitle,
    element("span", { className: "desktop-hero-story-arrow", text: "↗", attributes: { "aria-hidden": "true" } }));
  const counter = element("span", { className: "desktop-hero-count", attributes: {
    role: "status", "aria-live": "polite", "aria-atomic": "true"
  } });
  const pause = element("button", { className: "desktop-hero-pause", text: "Ⅱ",
    attributes: { type: "button", "aria-label": data.pauseLabel, "aria-pressed": "false" } });
  const previous = element("button", { className: "desktop-hero-arrow desktop-hero-arrow--prev", text: "‹",
    attributes: { type: "button", "aria-label": data.previousLabel } });
  const next = element("button", { className: "desktop-hero-arrow desktop-hero-arrow--next", text: "›",
    attributes: { type: "button", "aria-label": data.nextLabel } });
  const heroCrest = element("button", { className: "desktop-hero-crest", attributes: {
    type: "button", "aria-label": data.menuTitle,
    "aria-controls": "desktop-main-menu", "aria-expanded": "false"
  } }, crest(config, "desktop-hero-crest-image"));
  const cue = element("button", { className: "desktop-hero-scroll", text: data.scrollGlyph,
    attributes: { type: "button", "aria-label": data.scrollLabel, title: data.scrollLabel } });
  const brand = element("div", { className: "desktop-hero-identity", attributes: { "aria-hidden": "true" } },
    element("span", { className: "desktop-hero-wordmark", text: data.brand }),
    element("span", { className: "desktop-hero-wordmark-sub", text: data.brandSub }));
  const message = element("div", { className: "desktop-hero-message" },
    element("h1", { text: data.schoolTitle }),
    element("p", { text: data.motto }));
  const stage = element("div", { className: "desktop-hero-stage" },
    element("div", { className: "desktop-hero-image", attributes: { "aria-hidden": "true" } }, photo,
      element("div", { className: "desktop-hero-shade" })),
    brand, heroCrest, message, previous, next,
    element("div", { className: "desktop-hero-controls" }, story, counter, pause), cue);
  const track = element("section", { className: "desktop-hero-track", attributes: {
    "aria-label": data.ariaLabel
  } },
    element("div", { className: "desktop-hero-after", attributes: { "aria-hidden": "true" } },
      element("span", { text: data.brand }), element("span", { text: data.motto })),
    stage);

  let sequence = shuffledHeroOrder(data.slides.length);
  let position = 0;
  let activeIndex = sequence[position];
  let paused = false;
  let lastFolded = false;
  let scrollRatio = 0;
  let scheduled = false;
  let disposed = false;
  const failed = new Set();
  const allControls = [heroCrest, cue, previous, next, pause, story];

  function showSlide(announce = false) {
    activeIndex = sequence[position];
    const slide = data.slides[activeIndex];
    photo.setAttribute("src", `${mediaRoot}${slide.file}`);
    eyebrow.textContent = `${data.brand} · ${slide.eyebrow}`;
    storyTitle.textContent = slide.title;
    story.setAttribute("href", menuPageHref(slide.pageId));
    story.setAttribute("aria-label", `${slide.title}. ${slide.summary}`);
    counter.textContent = `${position + 1} / ${data.slides.length}`;
    counter.setAttribute("aria-live", announce ? "polite" : "off");
  }
  function changeSlide(direction, announce = false) {
    if (direction > 0) {
      position++;
      if (position === sequence.length) {
        sequence = shuffledHeroOrder(data.slides.length, activeIndex);
        position = 0;
      }
    } else position = (position - 1 + sequence.length) % sequence.length;
    showSlide(announce);
  }
  photo.addEventListener("load", () => failed.delete(activeIndex));
  photo.addEventListener("error", () => {
    failed.add(activeIndex);
    const remaining = data.slides.some((_, index) => !failed.has(index));
    if (remaining) changeSlide(1);
    else { photo.hidden = true; pause.disabled = true; }
  });
  previous.addEventListener("click", () => changeSlide(-1, true));
  next.addEventListener("click", () => changeSlide(1, true));
  pause.addEventListener("click", () => {
    paused = !paused;
    pause.textContent = paused ? "▶" : "Ⅱ";
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute("aria-label", paused ? data.resumeLabel : data.pauseLabel);
  });
  heroCrest.addEventListener("click", () => openMenu(heroCrest));
  stage.addEventListener("keydown", (event) => {
    if (event.target?.closest?.("button,a")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); changeSlide(event.key === "ArrowLeft" ? -1 : 1, true);
    }
  });

  const foldLength = () => Math.max(1, (track.offsetHeight || window.innerHeight * 1.58 || 1200) -
    (window.innerHeight || 800));
  cue.addEventListener("click", () => window.scrollTo?.({
    top: foldLength(), behavior: reduced.matches ? "instant" : "smooth"
  }));
  function updateScroll() {
    scheduled = false;
    if (disposed) return;
    scrollRatio = clamp((window.scrollY || 0) / foldLength());
    const stageBounds = stage.getBoundingClientRect?.();
    const targetBounds = headerCrest?.getBoundingClientRect?.();
    const targetY = stageBounds && targetBounds && stageBounds.height
      ? ((targetBounds.top + targetBounds.height / 2 - stageBounds.top) / stageBounds.height * 100)
      : 12;
    const y = 45 + (targetY - 45) * scrollRatio;
    stage.style.setProperty("--hero-fold-radius", `${(155 * (1 - scrollRatio)).toFixed(2)}%`);
    stage.style.setProperty("--hero-fold-y", `${y.toFixed(2)}%`);
    stage.style.setProperty("--hero-fold-scale", String(1 - scrollRatio * .70));
    stage.style.setProperty("--hero-fold-opacity", String(1 - scrollRatio * .98));
    const compact = scrollRatio >= .72;
    setCompact(compact);
    const folded = scrollRatio >= .985;
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
    if (!disposed && !paused && !reduced.matches) changeSlide(1);
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
