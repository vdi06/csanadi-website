import { element } from "../shared/js/dom.js?v=2.15";
import { mountGate } from "../shared/js/gate.js?v=2.15";
import { makeFooter } from "../shared/js/footer.js?v=2.15";
import { makeDesktopHeader } from "./header.js?v=2.15";
import { createDesktopPage } from "./page.js?v=2.15";

/** Önálló asztali nézet: a főoldali közép üres, az aloldal csak jóváhagyott vázlat. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "desktop-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "desktop", () => { location.hash = config.routes.home; });
  }

  const home = element("div", { className: "desktop-home" });
  const desktopHeader = makeDesktopHeader(config, home);
  const desktopFooter = makeFooter(config, "desktop");
  const main = element("main", { className: "desktop-main", attributes: { id: "content" } });
  if (page.startsWith("page:")) main.append(createDesktopPage(config, page.slice(5)));
  home.append(desktopHeader.header,
    main,
    desktopFooter.footer);
  platformRoot.replaceChildren(home);
  return () => { desktopHeader.destroy(); desktopFooter.destroy(); };
}
