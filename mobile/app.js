import { element } from "../shared/js/dom.js?v=2.33";
import { mountGate } from "../shared/js/gate.js?v=2.33";
import { makeFooter } from "../shared/js/footer.js?v=2.33";
import { makeMobileHeader } from "./header.js?v=2.33";
import { createMobilePage } from "./page.js?v=2.33";
import { createMobileStory } from "./story.js?v=2.33";
import { createMobileSuccesses } from "./successes.js?v=2.33";
import { createMobileCalendar } from "./calendar.js?v=2.33";
import { createHomeCarousel } from "../shared/js/home-carousel.js?v=2.33";

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
  const isArchive = page === "page:sports-results";
  const successes = story || isArchive ? createMobileSuccesses(config, { archive:isArchive }) : null;
  const carousel = story ? createHomeCarousel(config,successes.section,
    (onInteract) => createMobileCalendar(config,onInteract),"mobile") : null;
  if (story) main.append(story.track, carousel.section);
  else if (isArchive) main.append(successes.section,
    createMobilePage(config, "sports-results", { hideHeading:true }));
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
  return () => { carousel?.destroy(); successes?.destroy(); story?.destroy(); mobileHeader.destroy(); mobileFooter.destroy(); };
}
