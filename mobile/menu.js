import { element } from "../shared/js/dom.js";
import { trapTab } from "../shared/js/focus.js";

/** Mobilos iránytű: hat főpont két íves sorban a címer alatt.
 * Az almenük külön, teljes képernyős nézetben követik a JSON-hierarchiát. */
export function createMobileMenu(config, trigger, beforeOpen = () => {}) {
  const data = config.menu;
  const closeButton = element("button", { className: "mobile-menu-close",
    text: config.home.header.closeSymbol,
    attributes: { type: "button", "aria-label": data.closeLabel } });
  const backButton = element("button", { className: "mobile-compass-back",
    attributes: { type: "button", "aria-label": data.backLabel } },
    element("span", { className: "mobile-compass-back-symbol", text: data.backGlyph }),
    element("span", { text: data.backLabel }));
  const crest = element("img", { className: "mobile-compass-crest-image",
    attributes: { src: config.site.crest, alt: config.site.crestAlt, width: 512, height: 512 } });
  const stage = element("nav", { className: "mobile-compass-stage",
    attributes: { "aria-label": data.categoryLabel } },
    element("span", { className: "mobile-compass-arc mobile-compass-arc-upper",
      attributes: { "aria-hidden": "true" } }),
    element("span", { className: "mobile-compass-arc mobile-compass-arc-lower",
      attributes: { "aria-hidden": "true" } }),
    element("div", { className: "mobile-compass-center" }, crest));
  const rootButtons = data.items.map((item, index) => {
    const button = element("button", { className: "mobile-compass-node",
      attributes: { type: "button", "aria-label": item.label } },
      element("span", { className: "mobile-compass-number",
        text: String(index + 1).padStart(2, "0"), attributes: { "aria-hidden": "true" } }),
      element("span", { className: "mobile-compass-label", text: item.label }));
    button.dataset.sector = String(index + 1);
    button.addEventListener("click", () => navigateTo(item));
    stage.append(button);
    return button;
  });
  const rootView = element("div", { className: "mobile-compass-root-view" }, stage);
  const breadcrumb = element("p", { className: "mobile-compass-breadcrumb" });
  const branchTitle = element("h3", { className: "mobile-compass-branch-title" });
  const branchList = element("div", { className: "mobile-compass-branch-list" });
  const branchView = element("div", { className: "mobile-compass-branch-view" },
    element("div", { className: "mobile-compass-branch-top" }, backButton, breadcrumb),
    branchTitle, branchList);
  branchView.hidden = true;
  const dialog = element("section", { className: "mobile-menu-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.title
  } }, element("div", { className: "mobile-menu-heading" },
    element("h2", { text: data.title }), closeButton), rootView, branchView);
  const backdrop = element("div", { className: "mobile-menu-backdrop",
    attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "mobile-menu-overlay",
    attributes: { id: "mobile-main-menu" } }, backdrop, dialog);
  overlay.hidden = true;
  let stack = [];
  let previousOverflow;

  function showRoot() {
    stack = [];
    rootView.hidden = false;
    branchView.hidden = true;
    rootButtons[0]?.focus({ preventScroll: true });
  }
  function renderBranch() {
    const current = stack.at(-1);
    if (!current) { showRoot(); return; }
    rootView.hidden = true;
    branchView.hidden = false;
    const parents = stack.slice(0, -1);
    breadcrumb.hidden = parents.length === 0;
    breadcrumb.textContent = parents.map((entry) => entry.label).join(" · ");
    branchTitle.textContent = current.label;
    branchList.replaceChildren(...(current.children || []).map((item, index) => {
      const number = element("span", { className: "mobile-compass-branch-number",
        text: String(index + 1).padStart(2, "0"), attributes: { "aria-hidden": "true" } });
      const label = element("span", { text: item.label });
      if (item.children?.length) {
        const action = element("button", { className: "mobile-compass-branch-action",
          attributes: { type: "button", "aria-label": item.label } },
          number, label, element("span", { className: "mobile-compass-next",
            text: data.nextGlyph, attributes: { "aria-hidden": "true" } }));
        action.addEventListener("click", () => navigateTo(item));
        return action;
      }
      if (item.href) {
        return element("a", { className: "mobile-compass-branch-target",
          attributes: { href: item.href } }, number, label);
      }
      return element("div", { className: "mobile-compass-branch-label" }, number, label);
    }));
    backButton.focus({ preventScroll: true });
  }
  function navigateTo(item) {
    if (!item.children?.length) return;
    stack.push(item);
    renderBranch();
  }
  function back() {
    if (stack.length > 1) { stack.pop(); renderBranch(); }
    else showRoot();
  }
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
    showRoot();
  }
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  backButton.addEventListener("click", back);
  closeButton.addEventListener("click", () => close());
  backdrop.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    const focusables = branchView.hidden
      ? [closeButton, ...rootButtons]
      : [closeButton, backButton, ...Array.from(branchList.children)
        .filter((node) => node.tagName === "BUTTON" || node.tagName === "A")];
    trapTab(event, focusables);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target.closest?.("a[href]")) close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
