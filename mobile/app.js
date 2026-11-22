import { element, homeContent } from "../shared/js/dom.js";
import { mountGate } from "../shared/js/gate.js";

/** Két önálló mobilos képernyő: kapu és egyetlen statikus kezdőoldal. */
export function mount(root, config, page) {
  const platformRoot = element("div", { className: "mobile-app" });
  root.replaceChildren(platformRoot);
  if (page === "gate") {
    return mountGate(platformRoot, config, "mobile", () => { location.hash = config.routes.home; });
  }
  platformRoot.replaceChildren(element("main", { className: "mobile-home", attributes: { id: "content" } },
    element("section", { className: "mobile-home-content" }, homeContent(config))));
  return () => {};
}
