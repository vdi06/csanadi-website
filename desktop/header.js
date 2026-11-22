import { crest, element } from "../shared/js/dom.js";
import { bindAppearance } from "../shared/js/appearance.js";
import { createEditMode } from "../shared/js/edit-mode.js";
import { makeSocialLink } from "../shared/js/shell.js";
import { createDesktopMenu } from "./menu.js";
import { createDesktopSearch } from "./search.js";

/** Asztali fejléc: címerből nyíló körmenü és külön nagy lebegő keresőablak.
 * A mobilmenü és annak DOM-ja itt nem létezik. */
export function makeDesktopHeader(config, home) {
  const data = config.home.header;
  const brand = element("a", { className: "home-brand desktop-brand", attributes: {
    href: config.routes.home, "aria-label": config.site.fullName
  } },
    element("strong", { text: data.schoolLine1 }),
    element("small", { text: data.schoolLine2 }));
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
  const editToggle = element("button", { className: "desktop-edit-toggle shell-tool",
    text: data.settingsGlyph, attributes: { type: "button", "aria-label": data.settingsLabel,
      "aria-pressed": "false" } });

  const search = createDesktopSearch(config, searchToggle, () => menu.close(false));
  const menu = createDesktopMenu(config, crestToggle, () => search.close(false));
  const editor = createEditMode(config, home, editToggle, "desktop");

  const header = element("header", { className: "desktop-header" },
    element("div", { className: "desktop-headline" }, brand),
    element("div", { className: "desktop-toolbar" },
      element("nav", { className: "desktop-links-left", attributes: { "aria-label": data.socialLabel } },
        ...data.social.map((item) => makeSocialLink(item, "desktop-social shell-tool"))),
      crestToggle,
      element("div", { className: "desktop-links-right" }, searchToggle, themeToggle,
        editToggle)),
    element("p", { className: "desktop-motto", text: data.motto }),
    search.overlay, menu.overlay, editor.bar);

  const unbindAppearance = bindAppearance(config, home, themeToggle);
  return { header, destroy: () => {
    search.destroy(); menu.destroy(); editor.destroy(); unbindAppearance();
  } };
}
