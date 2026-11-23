import { element } from "../shared/js/dom.js?v=2.29";
import { mountGate } from "../shared/js/gate.js?v=2.29";
import { makeFooter } from "../shared/js/footer.js?v=2.29";
import { makeDesktopHeader } from "./header.js?v=2.29";
import { createDesktopPage } from "./page.js?v=2.29";
import { createDesktopHero } from "./hero.js?v=2.29";
import { createDesktopSuccesses } from "./successes.js?v=2.29";

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
  const main = element("main", { className: "desktop-main", attributes: { id: "content" } });
  const hero = isHome ? createDesktopHero(config, {
    openMenu: desktopHeader.openMenu, headerCrest: desktopHeader.crestToggle,
    setCompact: desktopHeader.setCompact
  }) : null;
  const isArchive = page === "page:sports-results";
  const successes = isHome || isArchive ? createDesktopSuccesses(config, { archive:isArchive }) : null;
  if (hero) main.append(hero.track, successes.section);
  else if (isArchive) main.append(successes.section);
  else if (page.startsWith("page:")) main.append(createDesktopPage(config, page.slice(5)));
  home.append(desktopHeader.header,
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
  if (successId) successes?.openById(successId);
  if (archiveId) successes?.openById(archiveId);
  if (noticeId) desktopFooter.openById(noticeId);
  return () => { successes?.destroy(); hero?.destroy(); desktopHeader.destroy(); desktopFooter.destroy(); };
}
