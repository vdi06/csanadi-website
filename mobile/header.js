import { createHeaderClock, trackHeaderHeight } from "../shared/js/header-clock.js?v=2.64";
import { crest, element, schoolDisplayNames } from "../shared/js/dom.js?v=2.64";
import { bindAppearance } from "../shared/js/appearance.js?v=2.64";
import { bindSiteHelp } from "../shared/js/site-help.js?v=2.64";
import { makeSocialLink } from "../shared/js/shell.js?v=2.64";
import { createMobileMenu } from "./menu.js?v=2.64";
import { createMobileSearch } from "./search.js?v=2.64";

/** Csak mobilos fejléc: középső címerből nyíló harmonikamenü, külön kereső. */
export function makeMobileHeader(config, home) {
  const data = config.home.header;
  const schoolName = schoolDisplayNames(config.site.fullName);
  const brand = element("a", { className: "home-brand mobile-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: schoolName.line1 }),
    element("small", { text: schoolName.line2 }));
  const crestToggle = element("button", { className: "mobile-crest-toggle shell-crest-toggle",
    attributes: { type: "button", "aria-label": data.menuOpenLabel,
      "aria-controls": "mobile-main-menu", "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "mobile-search-toggle shell-tool",
    text: data.searchGlyph, attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "mobile-search-view", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "mobile-theme-toggle shell-tool shell-theme-toggle",
    attributes: { type: "button", "aria-label": data.themeLabel } });
  const helpToggle = element("button", { className: "mobile-help-toggle shell-tool",
    text: data.helpGlyph, attributes: { type: "button", "aria-label": data.helpLabel,
      "aria-expanded": "false", "aria-haspopup": "dialog", title: data.helpLabel } });

  const search = createMobileSearch(config, searchToggle, () => menu.close(false));
  const menu = createMobileMenu(config, crestToggle, () => search.close(false));
  const unbindHelp = bindSiteHelp(config, helpToggle, () => { search.close(false); menu.close(false); });

  const clock = createHeaderClock(config);
  const header = element("header", { className: "mobile-header" },
    brand,
    element("div", { className: "mobile-toolbar" },
      element("nav", { className: "mobile-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "mobile-social shell-tool"))),
      crestToggle,
      element("div", { className: "mobile-links-right" }, searchToggle, themeToggle, helpToggle), clock.node),
    element("p", { className: "mobile-motto", text: data.motto }),
    menu.overlay, search.overlay);

  const stopTracking = trackHeaderHeight(header, home);
  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: () => {
    clock.destroy(); stopTracking(); search.destroy(); menu.destroy(); unbindHelp(); unbindAppearance();
  } };
}
