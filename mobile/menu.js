import { element } from "../shared/js/dom.js";
import { trapTab } from "../shared/js/focus.js";

/** Önálló, érintéses mobilmenü: legfeljebb három szintű harmonika.
 * A jóvá nem hagyott céloldalak puszta címkék, soha nem ál-hivatkozások. */
export function createMobileMenu(config, trigger, beforeOpen = () => {}) {
  const data = config.menu;
  const closeButton = element("button", { className: "mobile-menu-close",
    text: config.home.header.closeSymbol,
    attributes: { type: "button", "aria-label": data.closeLabel } });
  const controls = [];

  function createLevel(items, depth) {
    const list = element("div", { className: `mobile-menu-level mobile-menu-level-${depth}` });
    const expanded = [];
    for (const item of items) {
      const row = element("div", { className: "mobile-menu-entry" });
      if (item.children?.length) {
        const toggle = element("button", { className: "mobile-menu-expand", text: item.label,
          attributes: { type: "button", "aria-expanded": "false", "aria-controls": `mobile-group-${item.id}` } });
        controls.push(toggle);
        const children = createLevel(item.children, depth + 1);
        children.setAttribute("id", `mobile-group-${item.id}`);
        children.hidden = true;
        toggle.addEventListener("click", () => {
          const opening = children.hidden;
          for (const other of expanded) {
            other.panel.hidden = true;
            other.button.setAttribute("aria-expanded", "false");
          }
          children.hidden = !opening;
          toggle.setAttribute("aria-expanded", String(opening));
        });
        expanded.push({ button: toggle, panel: children });
        row.append(toggle, children);
      } else if (item.href) {
        row.append(element("a", { className: "mobile-menu-target", text: item.label,
          attributes: { href: item.href } }));
      } else {
        row.append(element("span", { className: "mobile-menu-label", text: item.label }));
      }
      list.append(row);
    }
    return list;
  }

  const list = createLevel(data.items, 1);
  const dialog = element("section", { className: "mobile-menu-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.title
  } }, element("div", { className: "mobile-menu-heading" },
    element("h2", { text: data.title }), closeButton), list);
  const backdrop = element("div", { className: "mobile-menu-backdrop", attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "mobile-menu-overlay", attributes: {
    id: "mobile-main-menu"
  } }, backdrop, dialog);
  overlay.hidden = true;
  let previousOverflow;

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
    controls[0]?.focus({ preventScroll: true });
  }
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  closeButton.addEventListener("click", () => close());
  backdrop.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    const visible = (node) => {
      for (let parent = node; parent; parent = parent.parentNode) if (parent.hidden) return false;
      return true;
    };
    trapTab(event, [closeButton, ...controls.filter(visible)]);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
