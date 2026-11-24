import { element } from "./dom.js?v=2.56";
import { checkedHomeCarousel } from "./carousel-data.js?v=2.56";
import { createNewsPanel } from "./news-panel.js?v=2.56";
import { menuPageHref } from "./menu-data.js?v=2.56";

/** JSON-ból felépített, bővíthető Bootstrap 5 Carousel: nem igényel
 * nyilakat vagy külön szüneteltető gombot. CDN-kiesésnél osztályváltásos tartalék.
 * A fülek ARIA-tablistként működnek, nem Bootstrap-indikátorokként. */
export function createHomeCarousel(config, successesSection, makeCalendar, platform) {
  const data = checkedHomeCarousel(config);
  const id = `${platform}-feature-carousel`;
  const activePanels = data.activePanels;
  const calendarIndex = activePanels.findIndex((panel) => panel.type === "calendar");
  let current = 0;
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia?.("(hover:hover) and (pointer:fine)");
  let manualHoldUntil = 0;
  let visible = true;
  let destroyed = false;
  let pendingIndex = null;
  let pendingEventId = null;
  let transitioning = false;
  let pointerInside = false;

  const holdForReading = () => {
    manualHoldUntil = Math.max(manualHoldUntil, Date.now() + data.interactionHoldMs);
  };
  // Minden panelnek saját tartalma és életciklusa van; a sorrend kizárólag JSON.
  const instances = activePanels.map((panel) => {
    const {type} = panel;
    if (type === "successes") return { section:successesSection, destroy(){} };
    if (type === "calendar") return makeCalendar(holdForReading);
    if (type === "news") return createNewsPanel(config,holdForReading,panel);
    throw new Error(`Ismeretlen kezdőlapi Carousel-panel: ${type}`);
  });
  const calendar = instances[calendarIndex];
  if (calendar?.section) calendar.section.append(element("nav",{
    className:"calendar-full-page-link",attributes:{"aria-label":"Naptár további lehetőségei"}},
    element("a",{text:"Teljes tanévi eseménynaptár",attributes:{href:menuPageHref("news-calendar")}})));
  const slides = instances.map((instance,index) => element("div", {
    className:`carousel-item home-carousel-item${index === 0 ? " active" : ""}`,
    attributes:{id:`${id}-panel-${index}`,role:"tabpanel",
      "aria-labelledby":`${id}-tab-${index}`,"aria-hidden":index === 0 ? "false" : "true"}
  },instance.section));
  slides.forEach((slide,index) => { slide.inert = index !== 0; });
  const tabs = activePanels.map((panel,index) => element("button", {
    className:`home-carousel-tab${index === 0 ? " is-active" : ""}`,text:panel.label,
    attributes:{type:"button",id:`${id}-tab-${index}`,role:"tab",
      "aria-controls":slides[index].getAttribute("id"),"data-panel-type":panel.type,
      "aria-selected":index === 0 ? "true" : "false",tabindex:index === 0 ? "0" : "-1"}
  }));
  const descriptionId = `${id}-usage-hint`;
  const tabBar = element("div", {className:"home-carousel-tabs",attributes:{
    role:"tablist","aria-label":data.ariaLabel
  }},...tabs);
  const usageHint = element("p",{className:"visually-hidden home-carousel-accessibility-hint",
    text:"A fülek között a bal és jobb nyílbillentyűvel válthat. Az automatikus váltás billentyűzetes fókusz, illetve egérmutató alatt megáll; az egyes fülek külön is kiválaszthatók.",
    attributes:{id:descriptionId}});
  const section = element("section", {className:"carousel slide home-feature-carousel",
    attributes:{id,"aria-label":data.ariaLabel,"aria-roledescription":"váltakozó tartalmak",
      "aria-describedby":descriptionId,"data-bs-interval":"false"}
  },element("div",{className:"home-carousel-controls"},tabBar,usageHint),
    element("div",{className:"carousel-inner home-carousel-inner",attributes:{"aria-live":"off"}},...slides));

  function reflect(index,updateClasses=false) {
    current = index;
    instances.forEach((instance,i) => {
      if (i !== index) { instance.closePopover?.(); instance.closeDetails?.(); }
    });
    slides.forEach((slide,i) => {
      if (updateClasses) slide.classList[i === index ? "add" : "remove"]("active");
      slide.inert = i !== index;
      slide.setAttribute("aria-hidden",i === index ? "false" : "true");
      tabs[i].setAttribute("aria-selected",i === index ? "true" : "false");
      tabs[i].setAttribute("tabindex",i === index ? "0" : "-1");
      tabs[i].classList[i === index ? "add" : "remove"]("is-active");
    });
  }

  // Csak a Bootstrap átmenete fut: a 30 másodperces időzítő egy helyről,
  // a fókusz- és naptárinterakciók figyelembevételével vezérli a váltást.
  const BootstrapCarousel = window.bootstrap?.Carousel;
  const bootstrapCarousel = typeof BootstrapCarousel === "function"
    ? BootstrapCarousel.getOrCreateInstance(section, {
      interval:false,ride:false,pause:false,touch:false,keyboard:false,wrap:true
    }) : null;
  if (bootstrapCarousel) section.classList.add("bs-ready");

  const slid = (event) => {
    if (destroyed) return;
    transitioning = false;
    const index = Number.isInteger(event.to) && event.to >= 0 && event.to < slides.length
      ? event.to : Math.max(0,slides.findIndex((slide) => slide.classList.contains("active")));
    reflect(index);
    if (current === calendarIndex && pendingEventId) {
      const eventId = pendingEventId;
      pendingEventId = null;
      calendar.showEvent?.(eventId);
    }
    if (pendingIndex !== null) {
      const target = pendingIndex;
      pendingIndex = null;
      if (target !== current) show(target);
    }
  };
  if (bootstrapCarousel) section.addEventListener("slid.bs.carousel",slid);

  function show(index,byUser=false) {
    if (destroyed || !Number.isInteger(index) || index < 0 || index >= slides.length) return;
    if (byUser) holdForReading();
    if (index !== current) instances[current].closePopover?.();
    if (index !== current) instances[current].closeDetails?.();
    if (!bootstrapCarousel) { reflect(index,true); return; }
    if (transitioning) { pendingIndex = index; return; }
    if (index === current) return;
    transitioning = true;
    bootstrapCarousel.to(index);
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener("click",() => show(index,true));
    tab.addEventListener("keydown",(event) => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 :
        event.key === "End" ? tabs.length - 1 :
        (index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      show(nextIndex,true);
      tabs[nextIndex].focus();
    });
  });

  // A :hover lekérdezés néhány böngészőben/érintéses emulációban ragadhat vagy
  // nem követi a valós mutatóhelyzetet; a pointerenter/leave állapot az elsődleges.
  const pointerEntered = (event) => { if (event.pointerType !== "touch") pointerInside = true; };
  const pointerLeft = () => { pointerInside = false; };
  section.addEventListener("pointerenter",pointerEntered);
  section.addEventListener("pointerleave",pointerLeft);
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
    if (destroyed || motionPreference?.matches || transitioning || Date.now() < manualHoldUntil || !visible ||
        document.visibilityState === "hidden") return;
    // WCAG 2.2.2: az olvasni kívánt tartalom ne váltson el egér alatt, illetve
    // a billentyűzetes felhasználó aktív fókusza alatt. Telefonon a tap utáni
    // ragadós :hover állapot viszont nem fagyaszthatja le a Carouselt.
    if (canHover?.matches && (pointerInside || section.matches?.(":hover"))) return;
    const active = document.activeElement;
    if (active && section.contains?.(active) && active.matches?.(":focus-visible")) return;
    if (instances[current].isOpen?.()) return;
    show((current + 1) % slides.length);
  },data.autoplayMs);

  return {
    section,show,
    showEvent(eventId) {
      if (current === calendarIndex && !transitioning) {
        holdForReading();
        return calendar.showEvent?.(eventId) ?? false;
      }
      pendingEventId = eventId;
      show(calendarIndex,true);
      if (!bootstrapCarousel) {
        pendingEventId = null;
        return calendar.showEvent?.(eventId) ?? false;
      }
      return true;
    },
    destroy() {
      destroyed = true;
      globalThis.clearInterval(timer);
      observer?.disconnect();
      section.removeEventListener("pointerenter",pointerEntered);
      section.removeEventListener("pointerleave",pointerLeft);
      document.removeEventListener?.("visibilitychange",visibilityChanged);
      if (bootstrapCarousel) {
        section.removeEventListener("slid.bs.carousel",slid);
        bootstrapCarousel.dispose();
      }
      instances.forEach((instance) => instance.destroy?.());
    }
  };
}
