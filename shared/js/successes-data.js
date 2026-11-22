import { getMenuPage } from "./menu-data.js?v=2.21";

/** Közös tartalmi szabályok, eltérő mobilos és asztali megjelenítéshez. */
export const successImageRoot = "./shared/assets/media/web/sport-successes/";

export function checkedSportSuccesses(config) {
  const data = config?.home?.sportSuccesses;
  const fields = ["ariaLabel", "eyebrow", "title", "intro", "openLabel",
    "closeLabel", "detailLabel", "linkLabel"];
  if (!data || fields.some((field) => typeof data[field] !== "string" || !data[field].trim()) ||
    !Array.isArray(data.items) || data.items.length !== 6) {
    throw new Error("Érvénytelen sportsiker-tartalom.");
  }
  const ids = new Set();
  for (const item of data.items) {
    if (!item || !/^[a-z0-9-]{3,64}$/.test(item.id || "") || ids.has(item.id) ||
      (item.image != null && item.image !== "" && !/^[a-z0-9-]+\.webp$/.test(item.image)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(item.date || "") ||
      !Number.isFinite(Date.parse(`${item.date}T12:00:00Z`)) ||
      !["name", "sport", "result", "competition", "summary"].every((field) =>
        typeof item[field] === "string" && item[field].trim().length >= 2 && item[field].length < 350) ||
      !Array.isArray(item.details) || item.details.length < 1 || item.details.length > 4 ||
      item.details.some((detail) => typeof detail !== "string" || !detail.trim() || detail.length > 600) ||
      !/^#\/oldal\/[a-z0-9-]+$/.test(item.href || "") ||
      !getMenuPage(config, item.href.slice("#/oldal/".length))) {
      throw new Error(`Érvénytelen sportsiker-bejegyzés: ${item?.id || "ismeretlen"}.`);
    }
    ids.add(item.id);
  }
  return data;
}

export function successDateText(date) {
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest", year: "numeric", month: "long", day: "numeric"
  }).format(new Date(`${date}T12:00:00Z`));
}
