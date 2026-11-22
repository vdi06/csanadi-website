import { element } from "../shared/js/dom.js";
import { trapTab } from "../shared/js/focus.js";
import { chooseAppearanceMode, currentAppearanceMode } from "../shared/js/appearance.js";

/** Az asztali beállítások önálló, lebegő felülete. */
export function createDesktopSettings(config, trigger, beforeOpen = () => {}) {
  const data = config.home.settings;
  const closeButton = element("button", { className: "desktop-settings-close",
    text: config.home.header.closeSymbol,
    attributes: { type: "button", "aria-label": data.closeLabel } });
  const buttons = config.appearance.cycle.map((mode) => {
    const button = element("button", { className: "desktop-settings-option",
      text: config.appearance.labels[mode], attributes: { type: "button" } });
    button.dataset.mode = mode;
    button.addEventListener("click", () => { chooseAppearanceMode(config, mode); update(); });
    return button;
  });
  const dialog = element("section", { className: "desktop-settings-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.title
  } }, element("div", { className: "desktop-settings-heading" },
    element("h2", { text: data.title }), closeButton),
    element("p", { text: data.description }),
    element("div", { className: "desktop-settings-options" }, ...buttons));
  const backdrop = element("div", { className: "desktop-settings-backdrop", attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-settings-overlay", attributes: {
    id: "desktop-settings"
  } }, backdrop, dialog);
  overlay.hidden = true;
  let previousOverflow;
  function update() {
    const selected = currentAppearanceMode(config);
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.mode === selected));
  }
  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (document.body) document.body.style.overflow = previousOverflow || "";
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  function open() {
    beforeOpen();
    if (!overlay.hidden) return;
    update();
    previousOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    overlay.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    buttons[config.appearance.cycle.indexOf(currentAppearanceMode(config))].focus({ preventScroll: true });
  }
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  closeButton.addEventListener("click", () => close());
  backdrop.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else trapTab(event, [closeButton, ...buttons]);
  });
  return { overlay, close, destroy: () => close(false) };
}
