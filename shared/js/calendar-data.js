/** Közös, adatvezérelt tanévnaptár. A newsRef a már meglévő hírt használja. */
const isoPattern = /^\d{4}-\d{2}-\d{2}$/;

export function validDay(date) {
  if (typeof date !== "string" || !isoPattern.test(date)) return false;
  const time = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date;
}

function dayNumber(date) { return Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000); }

export function schoolMonths(calendar) {
  const [year, month] = calendar.firstMonth.split("-").map(Number);
  return Array.from({ length: calendar.monthCount }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 + i, 1));
    return date.toISOString().slice(0, 7);
  });
}

export function monthLabel(calendar, month) {
  const [year, number] = month.split("-").map(Number);
  return `${year}. ${calendar.monthNames[number - 1]}`;
}

export function fullDayLabel(calendar, day) {
  const [year, month, date] = day.split("-").map(Number);
  return `${year}. ${calendar.monthNames[month - 1]} ${date}.`;
}

export function checkedCalendar(config) {
  const calendar = config.home.calendar;
  if (!calendar || calendar.monthCount !== 12 || !validDay(`${calendar.firstMonth}-01`)) {
    throw new Error("Érvénytelen tanévnaptár-fejléc.");
  }
  if (calendar.weekdayNames?.length !== 7 || calendar.monthNames?.length !== 12 ||
      !Array.isArray(calendar.events)) {
    throw new Error("Hiányos tanévnaptár-megjelenítési adat.");
  }
  const months = schoolMonths(calendar);
  const ids = new Set();
  for (const event of calendar.events) {
    if (!/^[a-z0-9-]+$/.test(event.id) || ids.has(event.id)) throw new Error("Ismétlődő vagy hibás eseményazonosító.");
    ids.add(event.id);
    if (!validDay(event.date) || (event.endDate && (!validDay(event.endDate) || event.endDate < event.date)) ||
        !calendar.categories[event.category] || !months.includes(event.date.slice(0, 7)) ||
        (event.endDate && !months.includes(event.endDate.slice(0, 7)))) {
      throw new Error(`Hibás naptári esemény: ${event.id}`);
    }
    if (event.newsRef && !config.publicNews.some((news) => news.id === event.newsRef)) {
      throw new Error(`Hiányzó közös hír: ${event.newsRef}`);
    }
    if (!event.newsRef && !event.title) throw new Error(`Hiányzó eseménycím: ${event.id}`);
  }
  for (const note of (calendar.undated || [])) {
    if (!/^[a-z0-9-]+$/.test(note.id) || ids.has(note.id) ||
        !months.includes(note.month) || !note.title) throw new Error("Hibás, pontosítandó esemény.");
    ids.add(note.id);
  }
  return calendar;
}

const cachedEntries = new WeakMap();
export function calendarEntries(config) {
  if (config.__staticContent === true && cachedEntries.has(config)) return cachedEntries.get(config);
  const calendar = checkedCalendar(config);
  const news = new Map(config.publicNews.map((record) => [record.id, record]));
  const entries = calendar.events.map((event) => {
    const record = event.newsRef ? news.get(event.newsRef) : null;
    return {
      ...event,
      title: record?.title ?? event.title,
      summary: record?.summary ?? event.summary ?? "",
      details: record?.details ?? event.details ?? [],
      categoryLabel: calendar.categories[event.category]
    };
  });
  if (config.__staticContent === true) cachedEntries.set(config, entries);
  return entries;
}

export function eventDuration(event) {
  return dayNumber(event.endDate ?? event.date) - dayNumber(event.date) + 1;
}

/** A több hónapos mérési időszak nem jelent minden egyes napra kiírt időpontot. */
const indexedDays = new WeakMap();
function buildDayIndex(entries) {
  const byDay = new Map();
  const append = (day, event) => {
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(event);
  };
  for (const event of entries) {
    const duration = eventDuration(event);
    if (duration > 16 && event.category !== "holiday") {
      append(event.date, event);
      if (event.endDate && event.endDate !== event.date) append(event.endDate, event);
      continue;
    }
    const from = dayNumber(event.date);
    for (let i = 0; i < duration; i++) {
      append(new Date((from + i) * 86400000).toISOString().slice(0,10), event);
    }
  }
  return byDay;
}
/** Egyszer indexelt napi lekérés: a 12×42 napcellához nincs újra 88-as teljes szűrés. */
export function eventsOnDay(entries, day) {
  if (!Array.isArray(entries)) return [];
  if (!indexedDays.has(entries)) indexedDays.set(entries, buildDayIndex(entries));
  return indexedDays.get(entries).get(day) ?? [];
}

export function periodsInMonth(entries, month) {
  const first = `${month}-01`;
  const last = `${month}-31`;
  return entries.filter((event) => eventDuration(event) > 16 &&
    event.category !== "holiday" && event.date <= last && (event.endDate ?? event.date) >= first);
}

export function eventById(config, id) {
  return calendarEntries(config).find((event) => event.id === id) ?? null;
}


export function addDayForExport(date){return new Date(Date.parse(date+"T00:00:00Z")+86400000).toISOString().slice(0,10);}
