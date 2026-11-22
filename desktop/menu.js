import { element } from "../shared/js/dom.js";
import { trapTab } from "../shared/js/focus.js";

/** Önálló asztali, címerből nyíló körmenü az 1.53-as felépítését alapul véve.
 * Nem létező oldalhoz soha nem készít látszólag működő hivatkozást. */
export function createDesktopMenu(config, trigger, beforeOpen = () => {}) {
  const data = config.menu;
  const closeButton = element("button", { className: "desktop-wheel-close",
    text: config.home.header.closeSymbol,
    attributes: { type: "button", "aria-label": data.closeLabel } });
  const crest = element("img", { className: "desktop-wheel-crest", attributes: {
    src: config.site.crest, alt: config.site.crestAlt, width: 512, height: 512
  } });
  const middle = element("div", { className: "desktop-wheel-center" }, crest);
  const orbit = element("div", { className: "desktop-wheel-orbit" },
    element("span", { className: "desktop-wheel-ring", attributes: { "aria-hidden": "true" } }), middle);
  const sections = element("div", { className: "desktop-wheel-sections" });
  const levelThree = element("div", { className: "desktop-wheel-level-three" });
  levelThree.hidden = true;
  const selectedTitle = element("h3", { className: "desktop-wheel-selected-title" });
  const details = element("section", { className: "desktop-wheel-details", attributes: {
    "aria-label": data.sectionsLabel
  } }, selectedTitle, sections, levelThree);
  const dialog = element("section", { className: "desktop-wheel-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.title
  } }, element("div", { className: "desktop-wheel-heading" },
    element("h2", { text: data.title }), closeButton), orbit, details);
  const backdrop = element("div", { className: "desktop-wheel-backdrop", attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-wheel-overlay", attributes: {
    id: "desktop-main-menu"
  } }, backdrop, dialog);
  overlay.hidden = true;
  let rootIndex = 0;
  let secondControls = [];
  let previousOverflow;

  function itemNode(item, className) {
    if (item.href) return element("a", { className, text: item.label,
      attributes: { href: item.href } });
    return element("span", { className, text: item.label });
  }
  function showThird(child, selectedButton) {
    for (const control of secondControls) control.setAttribute("aria-expanded", String(control === selectedButton));
    const items = child.children || [];
    levelThree.replaceChildren(...items.map((item) => itemNode(item, "desktop-wheel-third-item")));
    levelThree.hidden = !items.length;
  }
  function selectRoot(index) {
    rootIndex = index;
    const selected = data.items[index];
    for (const [i, button] of rootButtons.entries()) {
      if (i === index) button.classList.add("is-selected");
      else button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", String(i === index));
    }
    selectedTitle.textContent = selected.label;
    secondControls = [];
    sections.replaceChildren(...(selected.children || []).map((item) => {
      if (item.children?.length) {
        const button = element("button", { className: "desktop-wheel-section-button", text: item.label,
          attributes: { type: "button", "aria-expanded": "false" } });
        button.addEventListener("click", () => showThird(item, button));
        secondControls.push(button);
        return button;
      }
      return itemNode(item, "desktop-wheel-section-label");
    }));
    levelThree.replaceChildren();
    levelThree.hidden = true;
  }

  const rootButtons = data.items.map((item, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI / data.items.length);
    const button = element("button", { className: "desktop-wheel-node", text: item.label,
      attributes: { type: "button", "aria-pressed": "false" } });
    button.style.left = `${(50 + Math.cos(angle) * 35).toFixed(3)}%`;
    button.style.top = `${(50 + Math.sin(angle) * 35).toFixed(3)}%`;
    button.addEventListener("click", () => selectRoot(index));
    orbit.append(button);
    return button;
  });
  selectRoot(rootIndex);

  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", config.home.header.menuOpenLabel);
    if (document.body) document.body.style.overflow = previousOverflow || "";
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  function open() {
    beforeOpen();
    if (!overlay.hidden) return;
    previousOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    overlay.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", config.home.header.menuCloseLabel);
    rootButtons[rootIndex].focus({ preventScroll: true });
  }
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  closeButton.addEventListener("click", () => close());
  backdrop.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else trapTab(event, [closeButton, ...rootButtons, ...secondControls]);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
