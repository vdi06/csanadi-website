import { createMobileFeatureCenter } from "./centers.js?v=2.52";
import { centerRouteKind } from "../shared/js/feature-centers-data.js?v=2.52";
import { element } from "../shared/js/dom.js?v=2.52";
import { mountGate } from "../shared/js/gate.js?v=2.52";
import { makeFooter } from "../shared/js/footer.js?v=2.52";
import { makeMobileHeader } from "./header.js?v=2.52";
import { createMobilePage } from "./page.js?v=2.52";
import { createMobileStory } from "./story.js?v=2.52";
import { createMobileHomeHighlights } from "./home-highlights.js?v=2.52";
import { createMobileSuccesses } from "./successes.js?v=2.52";
import { createMobileCalendar } from "./calendar.js?v=2.52";
import { createHomeCarousel } from "../shared/js/home-carousel.js?v=2.52";
import { createNewsArchivePage } from "../shared/js/news-page.js?v=2.52";
import { createMobileInformation } from "./information.js?v=2.52";
import { createMobileMedia } from "./gallery.js?v=2.52";
import { createMobileTimetable } from "./timetable.js?v=2.52";
import { createMobileDocuments } from "./documents.js?v=2.52";
import { createMobileAdmissions, createMobileAdmissionLinks } from "./admissions.js?v=2.52";

/** Önálló mobilos nézet: saját fejléc, JSON-vázlatos aloldal és kompakt lábléc. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "mobile-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "mobile", () => { location.hash = config.routes.home; });
  }
  const home = element("div", { className: "mobile-home" });
  const mobileHeader = makeMobileHeader(config, home);
  const mobileFooter = makeFooter(config, "mobile");
  const main = element("main", { className: "mobile-main", attributes: { id: "content", tabindex: "-1" } });
  const skipLink = element("a", { className: "skip-to-content", text: config.home.header.skipLinkLabel,
    attributes: { href: "#content" } });
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    main.focus({ preventScroll:true });
    main.scrollIntoView?.({ block:"start", behavior:"instant" });
  });
  const story = page === "home" ? createMobileStory(config) : null;
  const isNewsPage = ["page:news-latest","page:news-announcements","page:news-archive"].includes(page);
  const newsId = page.slice(5);
  const storyId = /^#\/oldal\/(?:news-latest|news-announcements|news-archive)\/hir\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const newsPage = isNewsPage ? createNewsArchivePage(config, newsId, "mobile", storyId) : null;
  const isCalendarPage = page === "page:news-calendar";
  const fullCalendar = isCalendarPage ? createMobileCalendar(config) : null;
  const isInformation = page === "page:information-daily";
  const infoCenter = isInformation ? createMobileInformation(config) : null;
  const isMediaPage = page === "page:sports-gallery";
  const mediaCenter = isMediaPage ? createMobileMedia(config) : null;
  const isTimetable = page === "page:information-timetable";
  const timetableCenter = isTimetable ? createMobileTimetable(config) : null;
  const isDocuments = page === "page:information-documents";
  const documentsCenter = isDocuments ? createMobileDocuments(config) : null;
  const admissionPageId = page.startsWith("page:admission-") ? page.slice(5) : null;
  const isAdmissionHub = ["admission-guide","admission-deadlines","admission-primary","admission-secondary"].includes(admissionPageId);
  const admissionsCenter = isAdmissionHub ? createMobileAdmissions(config, admissionPageId) : null;
  const admissionLinks = admissionPageId && !isAdmissionHub ? createMobileAdmissionLinks(config) : null;
  const featurePageId = page.startsWith("page:") ? page.slice(5) : "";
  const featureKind = centerRouteKind(featurePageId);
  const featureCenter = featureKind ? createMobileFeatureCenter(config,featureKind,featurePageId) : null;
  const isArchive = page === "page:sports-results";
  const successes = story || isArchive ? createMobileSuccesses(config, { archive:isArchive }) : null;
  const carousel = story ? createHomeCarousel(config,successes.section,
    (onInteract) => createMobileCalendar(config,onInteract),"mobile") : null;
  if (story) main.append(story.track, createMobileHomeHighlights(config), carousel.section);
  else if (isArchive) main.append(successes.section,
    createMobilePage(config, "sports-results", { hideHeading:true }));
  else if (featureCenter) main.append(createMobilePage(config,featurePageId,{hideCards:true,hideIntro:true}),featureCenter.section);
  else if (isInformation) main.append(createMobilePage(config, "information-daily", {hideCards:true}), infoCenter.section);
  else if (isMediaPage) main.append(createMobilePage(config, "sports-gallery", {hideCards:true}), mediaCenter.section);
  else if (isTimetable) main.append(createMobilePage(config, "information-timetable", {hideCards:true}), timetableCenter.section);
  else if (isDocuments) main.append(createMobilePage(config, "information-documents", {hideCards:true,hideIntro:true}), documentsCenter.section);
  else if (isCalendarPage) main.append(createMobilePage(config, "news-calendar", {hideCards:true}), fullCalendar.section);
  else if (isAdmissionHub) main.append(createMobilePage(config, admissionPageId, {hideCards:true}), admissionsCenter.section);
  else if (admissionLinks) main.append(createMobilePage(config, admissionPageId, {extraContent:admissionLinks}));
  else if (isNewsPage) main.append(createMobilePage(config, newsId, {hideCards:true}), newsPage.section);
  else if (page.startsWith("page:")) main.append(createMobilePage(config, page.slice(5)));
  home.append(skipLink, mobileHeader.header,
    ...(successes ? [successes.overlay] : []),
    main,
    mobileFooter.footer);
  platformRoot.replaceChildren(home);
  story?.updateScroll();
  const successId = /^#\/kezdolap\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const archiveId = /^#\/oldal\/sports-results\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const noticeId = /^#\/kezdolap\/tajekoztatas\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const eventId = /^#\/kezdolap\/esemeny\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  if (successId) successes?.openById(successId);
  if (archiveId) successes?.openById(archiveId);
  if (noticeId) mobileFooter.openById(noticeId);
  if (eventId) carousel?.showEvent(eventId);
  const pageEventId = /^#\/oldal\/news-calendar\/esemeny\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  if (pageEventId) fullCalendar?.showEvent(pageEventId);
  if (storyId) newsPage?.showStory(storyId);
  return () => { featureCenter?.destroy(); admissionsCenter?.destroy(); documentsCenter?.destroy(); infoCenter?.destroy(); mediaCenter?.destroy(); timetableCenter?.destroy(); newsPage?.destroy(); fullCalendar?.destroy(); carousel?.destroy(); successes?.destroy(); story?.destroy(); mobileHeader.destroy(); mobileFooter.destroy(); };
}
