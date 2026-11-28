import { layoutNow, subscribeLayout } from "../shared/js/layout-controller.js?v=2.78";
import { createHeaderClock, trackHeaderHeight } from "../shared/js/header-clock.js?v=2.78";
import { crest, element, schoolDisplayNames } from "../shared/js/dom.js?v=2.78";
import { bindAppearance } from "../shared/js/appearance.js?v=2.78";
import { bindSiteHelp } from "../shared/js/site-help.js?v=2.78";
import { makeSocialLink } from "../shared/js/shell.js?v=2.78";
import { createDesktopMenu } from "./menu.js?v=2.78";
import { createDesktopSearch } from "./search.js?v=2.78";

/** Asztali fejléc: címerből nyíló körmenü és külön nagy lebegő keresőablak.
 * A mobilmenü és annak DOM-ja itt nem létezik. */
export function makeDesktopHeader(config, home, { heroMode = false } = {}) {
  const data = config.home.header;
  const schoolName = schoolDisplayNames(config.site.fullName);
  const brand = element("a", { className: "home-brand desktop-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: schoolName.line1 }),
    element("small", { text: schoolName.line2 }));
  const crestToggle = element("button", { className: "desktop-crest-toggle shell-crest-toggle",
    attributes: { type: "button", "aria-label": data.menuOpenLabel,
      "aria-controls": "desktop-main-menu", "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "desktop-search-toggle shell-tool",
    text: data.searchGlyph,
    attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "desktop-floating-search", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "desktop-theme-toggle shell-tool shell-theme-toggle",
    attributes: { type: "button", "aria-label": data.themeLabel } });
  const helpToggle = element("button", { className: "desktop-help-toggle shell-tool",
    text: data.helpGlyph, attributes: { type: "button", "aria-label": data.helpLabel,
      "aria-expanded": "false", "aria-haspopup": "dialog", title: data.helpLabel } });

  const search = createDesktopSearch(config, searchToggle, () => menu.close(false));
  const menu = createDesktopMenu(config, crestToggle, () => search.close(false));
  const unbindHelp = bindSiteHelp(config, helpToggle, () => { search.close(false); menu.close(false); });
  home.dataset.heroHome = String(heroMode);
  function setCompact(compact) {
    home.dataset.heroCompact = String(compact);
    if (heroMode) {
      const shown=compact || layoutNow().family!=="desktop" || layoutNow().low;
      crestToggle.setAttribute("tabindex", shown ? "0" : "-1");
      crestToggle.setAttribute("aria-hidden", String(!shown));
    }
  }
  setCompact(!heroMode);
  const stopLayout=subscribeLayout(()=>setCompact(home.dataset.heroCompact==="true"));

  const clock = createHeaderClock(config);
  const header = element("header", { className: "desktop-header" },
    element("div", { className: "desktop-headline" }, brand),
    element("div", { className: "desktop-toolbar" },
      element("nav", { className: "desktop-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "desktop-social shell-tool"))),
      crestToggle,
      element("div", { className: "desktop-links-right" }, searchToggle, themeToggle,
        helpToggle), clock.node),
    element("p", { className: "desktop-motto", text: data.motto }));

  const stopTracking = trackHeaderHeight(header, home);
  const unbindAppearance = bindAppearance(config, home, themeToggle);
  // A rögzített fejléc backdrop-filtere új pozicionálási környezetet hoz létre.
  // A teljes nézetet fedő menü és kereső ezért a fejléc testvére kell legyen.
  return { header, overlays: [search.overlay, menu.overlay], crestToggle,
    openMenu: (origin) => menu.open(origin), setCompact,
    destroy: () => {
    stopLayout(); clock.destroy(); stopTracking(); search.destroy(); menu.destroy(); unbindHelp(); unbindAppearance();
  } };
}
