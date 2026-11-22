import { element, homeContent } from "../shared/js/dom.js";
import { mountGate } from "../shared/js/gate.js";

/** Két önálló asztali képernyő: kapu és egyetlen statikus kezdőoldal. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "desktop-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "desktop", () => { location.hash = config.routes.home; });
  }
  platformRoot.replaceChildren(element("main", { className: "desktop-home", attributes: { id: "content" } },
    element("section", { className: "desktop-home-content" }, homeContent(config))));
  return () => {};
}
