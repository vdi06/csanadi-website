import { createDesktopFeatureCenter } from "./centers.js?v=2.43";
import { centerRouteKind } from "../shared/js/feature-centers-data.js?v=2.43";
import { element } from "../shared/js/dom.js?v=2.43";
import { mountGate } from "../shared/js/gate.js?v=2.43";
import { makeFooter } from "../shared/js/footer.js?v=2.43";
import { makeDesktopHeader } from "./header.js?v=2.43";
import { createDesktopPage } from "./page.js?v=2.43";
import { createDesktopHero } from "./hero.js?v=2.43";
import { createDesktopSuccesses } from "./successes.js?v=2.43";
import { createDesktopCalendar } from "./calendar.js?v=2.43";
import { createHomeCarousel } from "../shared/js/home-carousel.js?v=2.43";
import { createNewsArchivePage } from "../shared/js/news-page.js?v=2.43";
import { createDesktopInformation } from "./information.js?v=2.43";
import { createDesktopMedia } from "./gallery.js?v=2.43";
import { createDesktopTimetable } from "./timetable.js?v=2.43";
import { createDesktopDocuments } from "./documents.js?v=2.43";
import { createDesktopAdmissions, createDesktopAdmissionLinks } from "./admissions.js?v=2.43";

/** Önálló asztali nézet: a visszaállított teljes képes nyitó csak a kezdőlapon él. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "desktop-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "desktop", () => { location.hash = config.routes.home; });
  }

  const home = element("div", { className: "desktop-home" });
  const isHome = page === "home";
  const desktopHeader = makeDesktopHeader(config, home, { heroMode: isHome });
  const desktopFooter = makeFooter(config, "desktop");
  const main = element("main", { className: "desktop-main", attributes: { id: "content", tabindex: "-1" } });
  const skipLink = element("a", { className: "skip-to-content", text: config.home.header.skipLinkLabel,
    attributes: { href: "#content" } });
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    main.focus({ preventScroll:true });
    main.scrollIntoView?.({ block:"start", behavior:"instant" });
  });
  const hero = isHome ? createDesktopHero(config, {
    openMenu: desktopHeader.openMenu, headerCrest: desktopHeader.crestToggle,
    setCompact: desktopHeader.setCompact
  }) : null;
  const isNewsPage = ["page:news-latest","page:news-announcements","page:news-archive"].includes(page);
  const newsId = page.slice(5);
  const storyId = /^#\/oldal\/(?:news-latest|news-announcements|news-archive)\/hir\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const newsPage = isNewsPage ? createNewsArchivePage(config, newsId, "desktop", storyId) : null;
  const isCalendarPage = page === "page:news-calendar";
  const fullCalendar = isCalendarPage ? createDesktopCalendar(config) : null;
  const isInformation = page === "page:information-daily";
  const infoCenter = isInformation ? createDesktopInformation(config) : null;
  const isMediaPage = page === "page:sports-gallery";
  const mediaCenter = isMediaPage ? createDesktopMedia(config) : null;
  const isTimetable = page === "page:information-timetable";
  const timetableCenter = isTimetable ? createDesktopTimetable(config) : null;
  const isDocuments = page === "page:information-documents";
  const documentsCenter = isDocuments ? createDesktopDocuments(config) : null;
  const admissionPageId = page.startsWith("page:admission-") ? page.slice(5) : null;
  const isAdmissionHub = ["admission-guide","admission-deadlines","admission-primary","admission-secondary"].includes(admissionPageId);
  const admissionsCenter = isAdmissionHub ? createDesktopAdmissions(config, admissionPageId) : null;
  const admissionLinks = admissionPageId && !isAdmissionHub ? createDesktopAdmissionLinks(config) : null;
  const featurePageId = page.startsWith("page:") ? page.slice(5) : "";
  const featureKind = centerRouteKind(featurePageId);
  const featureCenter = featureKind ? createDesktopFeatureCenter(config,featureKind,featurePageId) : null;
  const isArchive = page === "page:sports-results";
  const successes = isHome || isArchive ? createDesktopSuccesses(config, { archive:isArchive }) : null;
  const carousel = hero ? createHomeCarousel(config,successes.section,
    (onInteract) => createDesktopCalendar(config,onInteract),"desktop") : null;
  if (hero) main.append(hero.track, carousel.section);
  else if (isArchive) main.append(successes.section,
    createDesktopPage(config, "sports-results", { hideHeading:true }));
  else if (featureCenter) main.append(createDesktopPage(config,featurePageId,{hideCards:true}),featureCenter.section);
  else if (isInformation) main.append(createDesktopPage(config, "information-daily", {hideCards:true}), infoCenter.section);
  else if (isMediaPage) main.append(createDesktopPage(config, "sports-gallery", {hideCards:true}), mediaCenter.section);
  else if (isTimetable) main.append(createDesktopPage(config, "information-timetable", {hideCards:true}), timetableCenter.section);
  else if (isDocuments) main.append(createDesktopPage(config, "information-documents", {hideCards:true}), documentsCenter.section);
  else if (isCalendarPage) main.append(createDesktopPage(config, "news-calendar", {hideCards:true}), fullCalendar.section);
  else if (isAdmissionHub) main.append(createDesktopPage(config, admissionPageId, {hideCards:true}), admissionsCenter.section);
  else if (admissionLinks) main.append(createDesktopPage(config, admissionPageId, {extraContent:admissionLinks}));
  else if (isNewsPage) main.append(createDesktopPage(config, newsId, {hideCards:true}), newsPage.section);
  else if (page.startsWith("page:")) main.append(createDesktopPage(config, page.slice(5)));
  home.append(skipLink, desktopHeader.header,
    ...desktopHeader.overlays,
    ...(successes ? [successes.overlay] : []),
    main,
    desktopFooter.footer);
  platformRoot.replaceChildren(home);
  if (hero) {
    window.scrollTo?.({ top: 0, behavior: "instant" });
    hero.updateScroll();
  }
  const successId = /^#\/kezdolap\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const archiveId = /^#\/oldal\/sports-results\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const noticeId = /^#\/kezdolap\/tajekoztatas\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const eventId = /^#\/kezdolap\/esemeny\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  if (successId) successes?.openById(successId);
  if (archiveId) successes?.openById(archiveId);
  if (noticeId) desktopFooter.openById(noticeId);
  if (eventId) carousel?.showEvent(eventId);
  const pageEventId = /^#\/oldal\/news-calendar\/esemeny\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  if (pageEventId) fullCalendar?.showEvent(pageEventId);
  if (storyId) newsPage?.showStory(storyId);
  return () => { featureCenter?.destroy(); admissionsCenter?.destroy(); documentsCenter?.destroy(); infoCenter?.destroy(); mediaCenter?.destroy(); timetableCenter?.destroy(); newsPage?.destroy(); fullCalendar?.destroy(); carousel?.destroy(); successes?.destroy(); hero?.destroy(); desktopHeader.destroy(); desktopFooter.destroy(); };
}
