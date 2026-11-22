import { element } from "../shared/js/dom.js?v=2.17";
import { trapTab } from "../shared/js/focus.js?v=2.17";
import { menuPageHref } from "../shared/js/menu-data.js?v=2.17";

/** Mobilos iránytű: az alapmenü és minden almenürács ugyanabban a rétegben marad. */
export function createMobileMenu(config, trigger, beforeOpen = () => {}) {
  const data = config.menu;
  const crest = element("img", { className:"mobile-compass-crest-image",
    attributes: { src:config.site.crest, alt:config.site.crestAlt, width:512, height:512 } });
  const centerButton = element("button", { className:"mobile-compass-center",
    attributes: { type:"button", "aria-label":data.closeLabel } }, crest);
  const homeLink = element("a", { className:"mobile-compass-home", text:data.homeGlyph,
    attributes: { href:config.routes.home, "aria-label":data.homeLabel } });
  const stage = element("nav", { className:"mobile-compass-stage",
    attributes: { "aria-label":data.categoryLabel } },
    element("span", { className:"mobile-compass-arc mobile-compass-arc-upper",
      attributes: { "aria-hidden":"true" } }),
    element("span", { className:"mobile-compass-arc mobile-compass-arc-lower",
      attributes: { "aria-hidden":"true" } }),
    element("div", { className:"mobile-compass-center-group" }, centerButton, homeLink));

  const subHeading = element("h3", { className:"mobile-compass-grid-heading" });
  const subGrid = element("div", { className:"mobile-compass-sub-grid" });
  const subSection = element("section", { className:"mobile-compass-sub-section",
    attributes: { id:"mobile-compass-submenu", "aria-label":data.sectionsLabel } },
    subHeading, subGrid);
  subSection.hidden = true;

  const thirdHeading = element("h4", { className:"mobile-compass-grid-heading" });
  const thirdGrid = element("div", { className:"mobile-compass-third-grid" });
  const thirdSection = element("section", { className:"mobile-compass-third-section",
    attributes: { id:"mobile-compass-third", "aria-label":data.sectionsLabel } },
    thirdHeading, thirdGrid);
  thirdSection.hidden = true;

  let currentRoot = -1;
  let currentSecond = null;
  let secondControls = [];
  let previousOverflow;

  function clearThird() {
    currentSecond = null;
    thirdSection.hidden = true;
    thirdGrid.replaceChildren();
    secondControls.forEach((node) => {
      if (node.tagName === "BUTTON") node.setAttribute("aria-expanded", "false");
    });
  }
  function clearRoot() {
    currentRoot = -1;
    rootButtons.forEach((button) => {
      button.classList.remove("is-selected");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-pressed", "false");
    });
    subSection.hidden = true;
    subGrid.replaceChildren();
    secondControls = [];
    clearThird();
  }
  function selectSecond(item, control) {
    if (currentSecond === item.id) { clearThird(); return; }
    clearThird();
    currentSecond = item.id;
    control.setAttribute("aria-expanded", "true");
    thirdHeading.textContent = item.label;
    thirdGrid.replaceChildren(...item.children.map((child) =>
      element("a", { className:"mobile-compass-grid-item mobile-compass-grid-target",
        text:child.label, attributes: { href:child.href || menuPageHref(child.id) } })));
    thirdSection.hidden = false;
  }
  function selectRoot(index) {
    if (currentRoot === index) { clearRoot(); return; }
    clearRoot();
    currentRoot = index;
    const selected = data.items[index];
    rootButtons[index].classList.add("is-selected");
    rootButtons[index].setAttribute("aria-expanded", "true");
    rootButtons[index].setAttribute("aria-pressed", "true");
    subHeading.textContent = selected.label;
    secondControls = (selected.children || []).map((child) => {
      if (child.children?.length) {
        const button = element("button", { className:"mobile-compass-grid-item mobile-compass-grid-action",
          text:child.label, attributes: { type:"button", "aria-expanded":"false",
            "aria-controls":"mobile-compass-third" } });
        button.addEventListener("click", () => selectSecond(child, button));
        return button;
      }
      return element("a", { className:"mobile-compass-grid-item mobile-compass-grid-target",
        text:child.label, attributes: { href:child.href || menuPageHref(child.id) } });
    });
    subGrid.replaceChildren(...secondControls);
    subSection.hidden = secondControls.length === 0;
  }

  const rootButtons = data.items.map((item, index) => {
    const button = element("button", { className:"mobile-compass-node",
      attributes: { type:"button", "aria-label":item.label,
        "aria-controls":"mobile-compass-submenu", "aria-expanded":"false", "aria-pressed":"false" } },
      element("span", { className:"mobile-compass-number", text:String(index + 1).padStart(2,"0"),
        attributes: { "aria-hidden":"true" } }),
      element("span", { className:"mobile-compass-label", text:item.label }));
    button.dataset.sector = String(index + 1);
    button.addEventListener("click", () => selectRoot(index));
    stage.append(button);
    return button;
  });

  const dialog = element("section", { className:"mobile-menu-dialog", attributes: {
    role:"dialog", "aria-modal":"true", "aria-label":data.title
  } }, element("h2", { className:"mobile-menu-title", text:data.title }),
  stage, subSection, thirdSection);
  const backdrop = element("div", { className:"mobile-menu-backdrop",
    attributes: { "aria-hidden":"true" } });
  const overlay = element("div", { className:"mobile-menu-overlay",
    attributes: { id:"mobile-main-menu" } }, backdrop, dialog);
  overlay.hidden = true;

  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    clearRoot();
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", config.home.header.menuOpenLabel);
    if (document.body) document.body.style.overflow = previousOverflow || "";
    if (restoreFocus) trigger.focus({ preventScroll:true });
  }
  function open() {
    beforeOpen();
    if (!overlay.hidden) return;
    previousOverflow = document.body?.style.overflow;
    if (document.body) document.body.style.overflow = "hidden";
    overlay.hidden = false;
    clearRoot();
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", config.home.header.menuCloseLabel);
    centerButton.focus({ preventScroll:true });
  }
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  centerButton.addEventListener("click", () => close());
  homeLink.addEventListener("click", () => close(false));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    trapTab(event, [centerButton, homeLink, ...rootButtons,
      ...secondControls, ...Array.from(thirdGrid.children)]);
  });
  overlay.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const destination = link.getAttribute("href");
    if (destination?.startsWith("#/")) {
      event.preventDefault();
      location.hash = destination;
    }
    close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
