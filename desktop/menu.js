import { element } from "../shared/js/dom.js?v=2.14";
import { trapTab } from "../shared/js/focus.js?v=2.14";
import { menuPageHref } from "../shared/js/menu-data.js?v=2.14";

/** Asztali kétgyűrűs menü: az almenük valós, JSON-vázlatos belső oldalakra visznek. */
export function createDesktopMenu(config, trigger, beforeOpen = () => {}) {
  const data = config.menu;
  const crest = element("img", { className: "desktop-wheel-crest", attributes: {
    src: config.site.crest, alt: config.site.crestAlt, width: 512, height: 512
  } });
  const centerButton = element("button", { className: "desktop-wheel-center",
    attributes: { type: "button", "aria-label": data.closeLabel } }, crest);
  const homeLink = element("a", { className: "desktop-wheel-home", text: data.homeGlyph,
    attributes: { href: config.routes.home, "aria-label": data.homeLabel } });
  const innerRing = element("nav", { className: "desktop-wheel-ring-main",
    attributes: { "aria-label": data.categoryLabel } });
  const outerRing = element("nav", { className: "desktop-wheel-ring-sub",
    attributes: { id: "desktop-wheel-outer-ring", "aria-label": data.sectionsLabel, "aria-live": "polite" } });
  outerRing.hidden = true;
  const outerGuide = element("span", { className: "desktop-wheel-guide desktop-wheel-guide-sub",
    attributes: { "aria-hidden": "true" } });
  outerGuide.hidden = true;
  const stage = element("div", { className: "desktop-wheel-stage" },
    element("span", { className: "desktop-wheel-guide desktop-wheel-guide-main", attributes: { "aria-hidden": "true" } }),
    outerGuide,
    element("div", { className: "desktop-wheel-center-group" }, centerButton, homeLink),
    innerRing, outerRing);
  const thirdTitle = element("h3", { className: "desktop-wheel-third-title" });
  const levelThree = element("div", { className: "desktop-wheel-level-three" });
  const thirdPanel = element("section", { className: "desktop-wheel-third-panel",
    attributes: { "aria-label": data.sectionsLabel } }, thirdTitle, levelThree);
  thirdPanel.hidden = true;
  const dialog = element("section", { className: "desktop-wheel-dialog", attributes: {
    role: "dialog", "aria-modal": "true", "aria-label": data.title
  } }, stage, thirdPanel);
  const backdrop = element("div", { className: "desktop-wheel-backdrop", attributes: { "aria-hidden": "true" } });
  const overlay = element("div", { className: "desktop-wheel-overlay", attributes: {
    id: "desktop-main-menu"
  } }, backdrop, dialog);
  overlay.hidden = true;
  let rootIndex = -1;
  let secondControls = [];
  let previousOverflow;

  function itemNode(item, className) {
    return element("a", { className, text: item.label,
      attributes: { href: item.href || menuPageHref(item.id) } });
  }
  function showThird(child, selectedButton) {
    for (const control of secondControls) if (control.tagName === "BUTTON")
      control.setAttribute("aria-expanded", String(control === selectedButton));
    const items = child.children || [];
    levelThree.replaceChildren(...items.map((item) => itemNode(item, "desktop-wheel-third-item")));
    thirdTitle.textContent = child.label;
    thirdPanel.hidden = !items.length;
  }
  function clearSelection() {
    rootIndex = -1;
    for (const button of rootButtons) {
      button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-expanded", "false");
    }
    secondControls = [];
    outerRing.replaceChildren();
    outerRing.hidden = true;
    outerGuide.hidden = true;
    levelThree.replaceChildren();
    thirdPanel.hidden = true;
  }
  function selectRoot(index) {
    // A kiválasztott főág újabb kattintásra összecsukódik;
    // másik főág választása az előző ág teljes tartalmát lecseréli.
    if (rootIndex === index) { clearSelection(); return; }
    rootIndex = index;
    const selected = data.items[index];
    for (const [i, button] of rootButtons.entries()) {
      if (i === index) button.classList.add("is-selected");
      else button.classList.remove("is-selected");
      button.setAttribute("aria-pressed", String(i === index));
      button.setAttribute("aria-expanded", String(i === index));
    }
    secondControls = [];
    outerRing.replaceChildren(...(selected.children || []).map((item, i, items) => {
      let node;
      if (item.children?.length) {
        const button = element("button", { className: "desktop-wheel-sub-node", text: item.label,
          attributes: { type: "button", "aria-expanded": "false" } });
        button.addEventListener("click", () => showThird(item, button));
        secondControls.push(button);
        node = button;
      } else {
        node = itemNode(item, "desktop-wheel-sub-node");
        secondControls.push(node);
      }
      // Minden külső gyűrűn pontosan 360/n szögköz: nincs aszimmetrikus ív.
      const angle = -90 + i * 360 / items.length;
      const radians = angle * Math.PI / 180;
      node.style.left = `${(50 + Math.cos(radians) * 40).toFixed(3)}%`;
      node.style.top = `${(50 + Math.sin(radians) * 40).toFixed(3)}%`;
      return node;
    }));
    outerRing.hidden = secondControls.length === 0;
    outerGuide.hidden = outerRing.hidden;
    levelThree.replaceChildren();
    thirdPanel.hidden = true;
  }

  const rootButtons = data.items.map((item, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI / data.items.length);
    const button = element("button", { className: "desktop-wheel-node", text: item.label,
      attributes: { type: "button", "aria-pressed": "false" } });
    button.style.left = `${(50 + Math.cos(angle) * 18).toFixed(3)}%`;
    button.style.top = `${(50 + Math.sin(angle) * 18).toFixed(3)}%`;
    button.setAttribute("aria-controls", "desktop-wheel-outer-ring");
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => selectRoot(index));
    innerRing.append(button);
    return button;
  });

  function close(restoreFocus = true) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    clearSelection();
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
    rootButtons[Math.max(0, rootIndex)].focus({ preventScroll: true });
  }
  trigger.addEventListener("click", () => overlay.hidden ? open() : close());
  centerButton.addEventListener("click", () => close());
  homeLink.addEventListener("click", () => close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else trapTab(event, [centerButton, homeLink, ...rootButtons,
      ...secondControls.filter((node) => node.tagName === "BUTTON" || node.tagName === "A"),
      ...Array.from(levelThree.children).filter((node) => node.tagName === "A")]);
  });
  overlay.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const destination = link.getAttribute("href");
    if (destination?.startsWith("#/")) {
      // A menü bezárásakor a link DOM-eleme eltűnik. Navigáljunk még előtte,
      // különben a böngésző eldobhatja a leválasztott <a> alapműveletét.
      event.preventDefault();
      location.hash = destination;
    }
    close(false);
  });
  return { overlay, close, destroy: () => close(false) };
}
