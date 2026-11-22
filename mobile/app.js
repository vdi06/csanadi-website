import { element } from "../shared/js/dom.js?v=2.15";
import { mountGate } from "../shared/js/gate.js?v=2.15";
import { makeFooter } from "../shared/js/footer.js?v=2.15";
import { makeMobileHeader } from "./header.js?v=2.15";
import { createMobilePage } from "./page.js?v=2.15";

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
  if (page.startsWith("page:")) main.append(createMobilePage(config, page.slice(5)));
  home.append(mobileHeader.header,
    main,
    mobileFooter.footer);
  platformRoot.replaceChildren(home);
  return () => { mobileHeader.destroy(); mobileFooter.destroy(); };
}
