import { element } from "../shared/js/dom.js?v=2.16";
import { mountGate } from "../shared/js/gate.js?v=2.16";
import { makeFooter } from "../shared/js/footer.js?v=2.16";
import { makeDesktopHeader } from "./header.js?v=2.16";
import { createDesktopPage } from "./page.js?v=2.16";
import { createDesktopHero } from "./hero.js?v=2.16";

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
  if (hero) main.append(hero.track);
  else if (page.startsWith("page:")) main.append(createDesktopPage(config, page.slice(5)));
  home.append(desktopHeader.header,
    main,
    desktopFooter.footer);
  platformRoot.replaceChildren(home);
  if (hero) {
    window.scrollTo?.({ top: 0, behavior: "instant" });
    hero.updateScroll();
  }
  return () => { hero?.destroy(); desktopHeader.destroy(); desktopFooter.destroy(); };
}
