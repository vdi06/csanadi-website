import { element } from "./dom.js?v=2.71";

/** Vészhelyzeti, JSON-tól független nézet. Csak a minimális tartalékfeliratok
 * élnek itt: a normál iskolai tartalom továbbra is kizárólag JSON-alapú. */
export function mountOffline(root, retry) {
  const retryButton = element("button", { className: "offline-retry",
    text: "Próbálkozás most", attributes: { type: "button" } });
  const status = element("p", { className: "offline-status",
    text: "Az automatikus újrapróbálás aktív.",
    attributes: { "aria-live": "polite" } });
  retryButton.addEventListener("click", retry);
  const heading = element("h1", { className: "offline-title", text: "Átmeneti offline nézet",
    attributes: { tabindex: "-1" } });
  const screen = element("main", { className: "offline-screen" },
    element("section", { className: "offline-card", attributes: {
      "aria-labelledby": "offline-heading"
    } },
    element("div", { className: "offline-brand" },
      element("img", { className: "offline-crest", attributes: {
        src: "./shared/assets/media/logo/csanadi-crest-512.webp", alt: "Csanádi Sportiskola címere",
        width: "96", height: "96"
      } }),
      element("span", { text: "CSANÁDI SPORTISKOLA" })),
    element("div", { className: "offline-signal", text: "◈  KAPCSOLAT-ELLENŐRZÉS" }),
    heading,
    element("p", { className: "offline-description",
      text: "A friss tartalom most nem tölthető be. Ez a tartalékoldal addig látható, amíg a webhely újra elérhető nem lesz." }),
    element("p", { className: "offline-description offline-note",
      text: "A rendszer a háttérben ismét próbálkozik, és siker esetén automatikusan visszavált az eredeti oldalra." }),
    element("div", { className: "offline-actions" }, retryButton, status)));
  heading.setAttribute("id", "offline-heading");
  root.replaceChildren(screen);
  heading.focus({ preventScroll:true });

  return {
    setChecking(checking) {
      retryButton.disabled = checking;
      status.textContent = checking ? "Kapcsolat ellenőrzése folyamatban…"
        : "Az automatikus újrapróbálás aktív.";
    }
  };
}
