import { element } from "../shared/js/dom.js";
import { mountGate } from "../shared/js/gate.js";
import { makeFooter } from "../shared/js/shell.js";
import { makeMobileHeader } from "./header.js";

/** Önálló mobilos nézet: csak a fejléc, üres főrész és lábléc. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "mobile-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "mobile", () => { location.hash = config.routes.home; });
  }

  const home = element("div", { className: "mobile-home" });
  const mobileHeader = makeMobileHeader(config, home);
  home.append(mobileHeader.header,
    element("main", { className: "mobile-main", attributes: { id: "content" } }),
    makeFooter(config, "mobile"));
  platformRoot.replaceChildren(home);
  return mobileHeader.destroy;
}
