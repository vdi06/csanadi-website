import { element } from "./dom.js?v=2.34";

/** Kétpaneles, valódi Bootstrap 5 Carousel, saját akadálymentes vezérléssel.
 * Ha a CDN nem érhető el, az osztályváltásos tartalék működés megmarad. */
export function createHomeCarousel(config, successesSection, makeCalendar, platform) {
  const data = config.home.calendar;
  const id = `${platform}-feature-carousel`;
  let current = 0;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  let manualHoldUntil = 0;
  let visible = true;
  let destroyed = false;
  let pendingIndex = null;
  let pendingEventId = null;
  let transitioning = false;
  // A naptári interakció csak átmenetileg halasztja az automatikus váltást.
  const holdForReading = () => {
    manualHoldUntil = Math.max(manualHoldUntil, Date.now() + data.manualHoldMs);
  };
  const calendar = makeCalendar(holdForReading);
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
  // A fülek önálló ARIA-tablistet alkotnak, NEM Bootstrap .carousel-indicators-t.
  // Az a CSS-osztály a Bootstrap belső aktívindikátor-kezelését aktiválná,
  // amely itt data-bs-target hiányában hibát dobna és megakasztaná a váltást.
  const tabBar = element("div", {className:"home-carousel-tabs",attributes:{
    role:"tablist","aria-label":data.panelLabel
  }}, ...tabs);
  const controls = element("div", {className:"home-carousel-controls"},tabBar);
  const section = element("section", {className:"carousel slide home-feature-carousel",
    attributes:{id,"aria-label":data.panelLabel,"data-bs-interval":"false"}
  },controls,element("div", {className:"carousel-inner home-carousel-inner"},...slides));

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
  // a fókuszt, a kézi váltás utáni olvasási időt és a csökkentett mozgást.
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
    if (byUser) holdForReading();
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
  // Nem állítjuk meg tartósan a váltást egy telefonos koppintás vagy
  // a két fülön maradó egérmutató miatt. A billentyűzetes tényleges fókusz,
  // illetve a megnyitott naptári részletek idején viszont szünetel.
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
    if (destroyed || reducedMotion || transitioning ||
        Date.now() < manualHoldUntil || !visible ||
        document.visibilityState === "hidden") return;
    const active = document.activeElement;
    if (active && section.contains?.(active) && active.matches?.(":focus-visible")) return;
    if (current === 1 && section.querySelector?.(".school-day-detail:not([hidden])")) return;
    show((current + 1) % 2);
  },data.autoplayMs);
  return {
    section,show,
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
