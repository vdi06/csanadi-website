import { element } from "./dom.js?v=2.78";

/** Közös állapotkezelés, de platformonként külön fejléc és megjelenítés.
 * Jelenleg nincsenek engedélyezett szerkeszthető tartalmi elemek, így
 * az elfogadás kizárólag visszatér normál módba. */
export function createEditMode(config, home, toggle, platform) {
  const data = config.home.header;
  const bar = element("div", { className: `${platform}-edit-bar`,
    attributes: { role: "status", "aria-live": "polite" } },
    element("strong", { className: `${platform}-edit-title`, text: config.home.editor.title }));
  let editing = false;
  function update() {
    home.dataset.editMode = editing ? "on" : "off";
    bar.hidden = !editing;
    toggle.textContent = editing ? data.finishEditingGlyph : data.settingsGlyph;
    toggle.setAttribute("aria-pressed", String(editing));
    toggle.setAttribute("aria-label", editing ? data.finishEditingLabel : data.settingsLabel);
  }
  function toggleMode() { editing = !editing; update(); }
  toggle.addEventListener("click", toggleMode);
  bar.dataset.adaptiveState="header-edit";bar.adaptiveSnapshot=()=>({editing});bar.adaptiveRestore=s=>{editing=!!s.editing;update();};
  update();
  return { bar, destroy: () => toggle.removeEventListener("click", toggleMode) };
}
