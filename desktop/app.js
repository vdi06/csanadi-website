import { element, branding, crest, footer, motto, skipLink } from "../shared/js/dom.js";

/** Az asztali felület önálló DOM, nem a mobilos nézet nagyítása. */
export function mount(root, config) {
  const { desktop } = config;
  root.replaceChildren(
    skipLink(config),
    element("div", { className: "desktop-page" },
      element("header", { className: "desktop-header" }, branding(config)),
      element("main", { className: "desktop-main", attributes: { id: "content" } },
        element("section", { className: "desktop-welcome", attributes: { "aria-label": config.ui.contentLabel } },
          element("div", { className: "desktop-crest" }, crest(config)),
          element("div", { className: "golden-gate" },
            element("div", { className: "gate-content" },
              element("p", { className: "eyebrow", text: desktop.eyebrow }),
              element("h1", { text: desktop.title }),
              element("p", { className: "desktop-description", text: desktop.description }),
              motto(config))))),
      footer(config, "desktop-footer")));
}
