import { element } from "../shared/js/dom.js";
import { mountGate } from "../shared/js/gate.js";
import { makeFooter, makeHeaderTools } from "../shared/js/shell.js";

/** Önálló mobilos nézet: csak a fejléc, üres főrész és lábléc. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "mobile-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "mobile", () => { location.hash = config.routes.home; });
  }

  const home = element("div", { className: "mobile-home" });
  const tools = makeHeaderTools(config, "mobile", home);
  const header = element("header", { className: "mobile-header" },
    element("a", { className: "home-brand mobile-brand", attributes: {
      href: config.routes.home, "aria-label": config.site.fullName
    } },
      element("strong", { text: config.home.header.schoolLine1 }),
      element("small", { text: config.home.header.schoolLine2 })),
    element("div", { className: "mobile-toolbar", attributes: {
      "aria-label": config.home.header.motto
    } },
      element("nav", { className: "mobile-links-left", attributes: {
        "aria-label": config.home.header.socialLabel
      } }, ...tools.socials),
      tools.crestToggle,
      element("div", { className: "mobile-links-right" }, tools.searchToggle, tools.themeToggle)),
    element("p", { className: "mobile-motto", text: config.home.header.motto }),
    tools.menuPanel,
    tools.searchPanel);
  home.append(header,
    element("main", { className: "mobile-main", attributes: { id: "content" } }),
    makeFooter(config, "mobile"));
  platformRoot.replaceChildren(home);
  return () => {};
}
