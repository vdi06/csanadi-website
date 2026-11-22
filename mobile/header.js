import { crest, element } from "../shared/js/dom.js?v=2.19";
import { bindAppearance } from "../shared/js/appearance.js?v=2.19";
import { createEditMode } from "../shared/js/edit-mode.js?v=2.19";
import { makeSocialLink } from "../shared/js/shell.js?v=2.19";
import { createMobileMenu } from "./menu.js?v=2.19";
import { createMobileSearch } from "./search.js?v=2.19";

/** Csak mobilos fejléc: középső címerből nyíló harmonikamenü, külön kereső. */
export function makeMobileHeader(config, home) {
  const data = config.home.header;
  const brand = element("a", { className: "home-brand mobile-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: data.schoolLine1 }),
    element("small", { text: data.schoolLine2 }));
  const crestToggle = element("button", { className: "mobile-crest-toggle shell-crest-toggle",
    attributes: { type: "button", "aria-label": data.menuOpenLabel,
      "aria-controls": "mobile-main-menu", "aria-expanded": "false" } },
    crest(config, "shell-crest"));
  const searchToggle = element("button", { className: "mobile-search-toggle shell-tool",
    text: data.searchGlyph, attributes: { type: "button", "aria-label": data.searchOpenLabel,
      "aria-controls": "mobile-search-view", "aria-expanded": "false" } });
  const themeToggle = element("button", { className: "mobile-theme-toggle shell-tool shell-theme-toggle",
    attributes: { type: "button", "aria-label": data.themeLabel } });
  const editToggle = element("button", { className: "mobile-edit-toggle shell-tool",
    text: data.settingsGlyph, attributes: { type: "button", "aria-label": data.settingsLabel,
      "aria-pressed": "false" } });

  const search = createMobileSearch(config, searchToggle, () => menu.close(false));
  const menu = createMobileMenu(config, crestToggle, () => search.close(false));
  const editor = createEditMode(config, home, editToggle, "mobile");

  const header = element("header", { className: "mobile-header" },
    brand,
    element("div", { className: "mobile-toolbar" },
      element("nav", { className: "mobile-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "mobile-social shell-tool"))),
      crestToggle,
      element("div", { className: "mobile-links-right" }, searchToggle, themeToggle, editToggle)),
    element("p", { className: "mobile-motto", text: data.motto }),
    menu.overlay, search.overlay, editor.bar);

  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: () => {
    search.destroy(); menu.destroy(); editor.destroy(); unbindAppearance();
  } };
}
