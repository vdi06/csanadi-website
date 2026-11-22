import { element } from "../shared/js/dom.js";
import { mountGate } from "../shared/js/gate.js";
import { makeFooter } from "../shared/js/shell.js";
import { makeDesktopHeader } from "./header.js";

/** Önálló asztali nézet: a középső tartalom nem aktív és nem renderelődik. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "desktop-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "desktop", () => { location.hash = config.routes.home; });
  }

  const home = element("div", { className: "desktop-home" });
  const desktopHeader = makeDesktopHeader(config, home);
  home.append(desktopHeader.header,
    element("main", { className: "desktop-main", attributes: { id: "content" } }),
    makeFooter(config, "desktop"));
  platformRoot.replaceChildren(home);
  return desktopHeader.destroy;
}
