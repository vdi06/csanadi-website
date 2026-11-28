import { orderedSportSuccesses, featuredSportSuccesses } from "./successes-data.js?v=2.79";
import { searchSportSuccessIds } from "./search-index.js?v=2.79";

const KEY = "csanadi-sports-archive-2.25";
const defaults = Object.freeze({ query:"", sport:"", year:"", order:"newest", page:1 });
let memory = null;

function normalizeState(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  return {
    query:typeof input.query === "string" ? input.query.slice(0, 120) : "",
    sport:typeof input.sport === "string" ? input.sport.slice(0, 120) : "",
    year:/^\d{4}$/.test(input.year || "") ? input.year : "",
    order:input.order === "oldest" ? "oldest" : "newest",
    page:Number.isSafeInteger(input.page) && input.page > 0 ? Math.min(input.page, 10000) : 1
  };
}

export function readArchiveState() {
  if (!memory) {
    try { memory = normalizeState(JSON.parse(sessionStorage.getItem(KEY))); }
    catch { memory = { ...defaults }; }
  }
  return { ...memory };
}

export function saveArchiveState(next) {
  memory = normalizeState(next);
  try { sessionStorage.setItem(KEY, JSON.stringify(memory)); } catch { /* Nincs tárhely: memóriában marad. */ }
  return { ...memory };
}

export function resetArchiveState() {
  memory = { ...defaults };
  try { sessionStorage.removeItem(KEY); } catch { /* A visszaállítás így is működik. */ }
}

export function archiveOptions(config) {
  const all = orderedSportSuccesses(config);
  return {
    sports:[...new Set(all.map((item) => item.sport))].sort((a,b) => a.localeCompare(b,"hu")),
    years:[...new Set(all.map((item) => item.date.slice(0,4)))].sort().reverse()
  };
}

export function archiveView(config, rawState) {
  const state = normalizeState(rawState);
  const all = orderedSportSuccesses(config);
  const featured = new Set(featuredSportSuccesses(config).map((item) => item.id));
  const options = archiveOptions(config);
  if (!options.sports.includes(state.sport)) state.sport = "";
  if (!options.years.includes(state.year) || options.years.length < 2) state.year = "";
  const filtering = Boolean(state.query.trim() || state.sport || state.year);
  const hits = state.query.trim() ? new Set(searchSportSuccessIds(config,state.query)) : null;
  const items = all.filter((item) =>
    (filtering || !featured.has(item.id)) &&
    (!hits || hits.has(item.id)) &&
    (!state.sport || item.sport === state.sport) &&
    (!state.year || item.date.startsWith(state.year)));
  if (state.order === "oldest") items.reverse();
  const pageCount = Math.max(1,Math.ceil(items.length / 6));
  state.page = Math.min(state.page,pageCount);
  const start = (state.page - 1) * 6;
  return { state, items, visible:items.slice(start,start+6), featured,
    total:items.length, pageCount, start, filtering, options };
}
