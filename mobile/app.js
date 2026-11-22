import { element, branding, crest, footer, motto, skipLink } from "../shared/js/dom.js";

/** Mobilon nincs asztali elem, nagykép, galéria vagy képváltó. */
export function mount(root, config) {
  const { mobile } = config;
  root.replaceChildren(
    skipLink(config),
    element("div", { className: "mobile-page" },
      element("header", { className: "mobile-header" },
        branding(config),
        element("a", { className: "mobile-home-link", text: config.ui.homeLink,
          attributes: { href: "./index.html" } })),
      element("main", { className: "mobile-main", attributes: { id: "content" } },
        element("section", { className: "mobile-welcome", attributes: { "aria-label": config.ui.contentLabel } },
          element("div", { className: "mobile-crest" }, crest(config)),
          element("p", { className: "eyebrow", text: mobile.eyebrow }),
          element("h1", { text: mobile.title }),
          element("p", { className: "mobile-description", text: mobile.description }),
          motto(config))),
      footer(config, "mobile-footer")));
}
