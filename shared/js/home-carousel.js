import { element } from "./dom.js?v=2.33";

/** Kétpaneles, valódi Bootstrap 5 Carousel, saját akadálymentes vezérléssel.
 * Ha a CDN nem érhető el, az osztályváltásos tartalék működés megmarad. */
export function createHomeCarousel(config, successesSection, makeCalendar, platform) {
  const data = config.home.calendar;
  const id = `${platform}-feature-carousel`;
  let current = 0;
  let manuallyPaused = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  let manualHoldUntil = 0;
  let hovered = false;
  let focused = false;
  let visible = true;
  let destroyed = false;
  let pendingIndex = null;
  let pendingEventId = null;
  let transitioning = false;
  const pause = () => { manuallyPaused = true; updatePlay(); };
  const calendar = makeCalendar(pause);
  const slides = [successesSection, calendar.section].map((content, index) => element("div", {
    className:`carousel-item home-carousel-item${index === 0 ? " active" : ""}`,
    attributes:{ id:`${id}-panel-${index}`,role:"tabpanel",
      "aria-labelledby":`${id}-tab-${index}`,"aria-hidden":index === 0 ? "false" : "true" }
  }, content));
  slides[1].inert = true;
  const tabs = data.tabs.map((label, index) => element("button", {
    className:`home-carousel-tab${index === 0 ? " is-active" : ""}`,text:label,
    attributes:{ type:"button",id:`${id}-tab-${index}`,role:"tab",
      "aria-controls":slides[index].getAttribute("id"),"aria-selected":index === 0 ? "true" : "false",
      tabindex:index === 0 ? "0" : "-1" }
  }));
  const previous = element("button", {className:"home-carousel-arrow carousel-control-prev",text:data.previousGlyph,
    attributes:{type:"button","aria-label":data.previousLabel}});
  const next = element("button", {className:"home-carousel-arrow carousel-control-next",text:data.nextGlyph,
    attributes:{type:"button","aria-label":data.nextLabel}});
  const play = element("button", {className:"home-carousel-play",attributes:{type:"button"}});
  const tabBar = element("div", {className:"carousel-indicators home-carousel-tabs",attributes:{
    role:"tablist","aria-label":data.panelLabel
  }}, ...tabs);
  const controls = element("div", {className:"home-carousel-controls"},previous,tabBar,next,play);
  const section = element("section", {className:"carousel slide home-feature-carousel",
    attributes:{id,"aria-label":data.panelLabel,"data-bs-interval":"false"}
  },controls,element("div", {className:"carousel-inner home-carousel-inner"},...slides));

  function updatePlay() {
    play.textContent = manuallyPaused ? data.playGlyph : data.pauseGlyph;
    play.setAttribute("aria-label", manuallyPaused ? data.playLabel : data.pauseLabel);
    play.setAttribute("aria-pressed", manuallyPaused ? "false" : "true");
  }
  function reflect(index, updateClasses = false) {
    current = index;
    slides.forEach((slide, i) => {
      if (updateClasses) slide.classList[i === index ? "add" : "remove"]("active");
      slide.inert = i !== index;
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
      tabs[i].setAttribute("aria-selected", i === index ? "true" : "false");
      tabs[i].setAttribute("tabindex", i === index ? "0" : "-1");
      tabs[i].classList[i === index ? "add" : "remove"]("is-active");
    });
  }

  // Nincs automatikus Bootstrap-időzítő: a közös, hozzáférhető időzítés kezeli
  // a fókuszt, az érintést, a kézi szüneteltetést és a csökkentett mozgást.
  const BootstrapCarousel = window.bootstrap?.Carousel;
  const bootstrapCarousel = typeof BootstrapCarousel === "function"
    ? BootstrapCarousel.getOrCreateInstance(section, {
      interval:false,ride:false,pause:false,touch:false,keyboard:false,wrap:true
    }) : null;
  if (bootstrapCarousel) section.classList.add("bs-ready");

  const slid = (event) => {
    if (destroyed) return;
    transitioning = false;
    reflect(Number.isInteger(event.to) ? event.to :
      (slides[1].classList.contains("active") ? 1 : 0));
    if (current === 1 && pendingEventId) {
      calendar.showEvent(pendingEventId);
      pendingEventId = null;
    }
    if (pendingIndex !== null) {
      const target = pendingIndex;
      pendingIndex = null;
      if (target !== current) show(target);
    }
  };
  if (bootstrapCarousel) section.addEventListener("slid.bs.carousel",slid);

  function show(index, byUser = false) {
    if (destroyed || index < 0 || index >= slides.length) return;
    if (byUser) manualHoldUntil = Date.now() + data.manualHoldMs;
    if (!bootstrapCarousel) { reflect(index,true); return; }
    if (transitioning) { pendingIndex = index; return; }
    if (index === current) return;
    transitioning = true;
    bootstrapCarousel.to(index);
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => show(i,true));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? 1
        : (current + (event.key === "ArrowLeft" ? 1 : 3)) % 2;
      show(nextIndex,true);
      tabs[nextIndex].focus();
    });
  });
  previous.addEventListener("click",() => show((current + 1) % 2,true));
  next.addEventListener("click",() => show((current + 1) % 2,true));
  play.addEventListener("click",() => {
    manuallyPaused = !manuallyPaused;
    updatePlay();
  });
  section.addEventListener("mouseenter",() => { hovered = true; });
  section.addEventListener("mouseleave",() => { hovered = false; });
  section.addEventListener("focusin",() => { focused = true; });
  section.addEventListener("touchstart",pause,{passive:true});
  section.addEventListener("focusout",(event) => {
    if (!section.contains(event.relatedTarget)) focused = false;
  });
  const visibilityChanged = () => { visible = document.visibilityState !== "hidden"; };
  document.addEventListener?.("visibilitychange",visibilityChanged);
  let observer = null;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    },{threshold:0.1});
    observer.observe(section);
  }
  const timer = globalThis.setInterval(() => {
    if (!manuallyPaused && !transitioning && Date.now() >= manualHoldUntil &&
        !hovered && !focused && visible && document.visibilityState !== "hidden") {
      show((current + 1) % 2);
    }
  },data.autoplayMs);
  updatePlay();
  return {
    section,pause,show,
    showEvent(eventId) {
      if (bootstrapCarousel && (current !== 1 || transitioning)) {
        pendingEventId = eventId;
        show(1,true);
        return true;
      }
      show(1,true);
      return calendar.showEvent(eventId);
    },
    destroy() {
      destroyed = true;
      globalThis.clearInterval(timer);
      observer?.disconnect();
      document.removeEventListener?.("visibilitychange",visibilityChanged);
      if (bootstrapCarousel) {
        section.removeEventListener("slid.bs.carousel",slid);
        bootstrapCarousel.dispose();
      }
      calendar.destroy();
    }
  };
}
