import { element } from "../shared/js/dom.js?v=2.26";
import { mountGate } from "../shared/js/gate.js?v=2.26";
import { makeFooter } from "../shared/js/footer.js?v=2.26";
import { makeMobileHeader } from "./header.js?v=2.26";
import { createMobilePage } from "./page.js?v=2.26";
import { createMobileStory } from "./story.js?v=2.26";
import { createMobileSuccesses } from "./successes.js?v=2.26";

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
  const main = element("main", { className: "mobile-main", attributes: { id: "content" } });
  const story = page === "home" ? createMobileStory(config) : null;
  const isArchive = page === "page:sports-results";
  const successes = story || isArchive ? createMobileSuccesses(config, { archive:isArchive }) : null;
  if (story) main.append(story.track, successes.section);
  else if (isArchive) main.append(successes.section);
  else if (page.startsWith("page:")) main.append(createMobilePage(config, page.slice(5)));
  home.append(mobileHeader.header,
    ...(successes ? [successes.overlay] : []),
    main,
    mobileFooter.footer);
  platformRoot.replaceChildren(home);
  story?.updateScroll();
  const successId = /^#\/kezdolap\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const archiveId = /^#\/oldal\/sports-results\/sportsiker\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  const noticeId = /^#\/kezdolap\/tajekoztatas\/([a-z0-9-]+)$/.exec(location.hash)?.[1];
  if (successId) successes?.openById(successId);
  if (archiveId) successes?.openById(archiveId);
  if (noticeId) mobileFooter.openById(noticeId);
  return () => { successes?.destroy(); story?.destroy(); mobileHeader.destroy(); mobileFooter.destroy(); };
}
