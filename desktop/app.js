import { element } from "../shared/js/dom.js";
import { mountGate } from "../shared/js/gate.js";
import { makeFooter, makeHeaderTools } from "../shared/js/shell.js";

/** Önálló asztali nézet: a középső tartalom nem aktív és nem renderelődik. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "desktop-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "desktop", () => { location.hash = config.routes.home; });
  }

  const home = element("div", { className: "desktop-home" });
  const tools = makeHeaderTools(config, "desktop", home);
  const header = element("header", { className: "desktop-header" },
    element("a", { className: "home-brand desktop-brand", attributes: {
      href: config.routes.home, "aria-label": config.site.fullName
    } },
      element("strong", { text: config.home.header.schoolLine1 }),
      element("small", { text: config.home.header.schoolLine2 })),
    element("div", { className: "desktop-toolbar" },
      element("nav", { className: "desktop-links-left", attributes: {
        "aria-label": config.home.header.socialLabel
      } }, ...tools.socials),
      tools.crestToggle,
      element("div", { className: "desktop-links-right" }, tools.searchToggle, tools.themeToggle)),
    element("p", { className: "desktop-motto", text: config.home.header.motto }),
    tools.menuPanel,
    tools.searchPanel);
  home.append(header,
    element("main", { className: "desktop-main", attributes: { id: "content" } }),
    makeFooter(config, "desktop"));
  platformRoot.replaceChildren(home);
  return () => {};
}
