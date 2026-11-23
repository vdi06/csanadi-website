import { element } from "./dom.js?v=2.34";
import { eventsOnDay, periodsInMonth, fullDayLabel, monthLabel } from "./calendar-data.js?v=2.34";

/** Hónapnézet: a desktop hover és a mobil click külön, ugyanabból az adatból. */
export function makeCalendarMonth(config, entries, month, mode, onInteract = () => {}) {
  const calendar = config.home.calendar;
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const card = element("article", { className: `school-month school-month--${mode}` });
  const heading = element("h3", { className: "school-month-title", text: monthLabel(calendar, month) });
  const grid = element("div", { className: "school-month-grid", attributes:{
    role:"group", "aria-label":monthLabel(calendar,month)
  } });
  for (const weekday of calendar.weekdayNames) grid.append(element("span", {
    className:"school-month-weekday", text:weekday, attributes:{"aria-hidden":"true"}
  }));
  for (let empty = 0; empty < firstWeekday; empty++) grid.append(
    element("span", { className:"school-month-empty", attributes:{"aria-hidden":"true"} }));
  const detail = element("div", { className:"school-day-detail", attributes:{
    id:`${mode}-calendar-detail-${month}`, "aria-live":"polite"
  } });
  detail.hidden = true;
  let activeDay = null;
  let activeButton = null;
  const buttons = new Map();
  function close() {
    activeDay = null;
    activeButton?.setAttribute("aria-expanded","false");
    activeButton = null;
    detail.hidden = true;
    detail.replaceChildren();
  }
  function open(day, button) {
    const events = eventsOnDay(entries, day);
    if (!events.length) { close(); return; }
    close();
    activeDay = day;
    activeButton = button;
    button.setAttribute("aria-expanded","true");
    detail.append(element("strong",{ className:"school-day-detail-title",
      text:`${fullDayLabel(calendar,day)} · ${calendar.dayDetailsLabel}` }));
    for (const event of events) {
      const range = event.endDate ? `${fullDayLabel(calendar,event.date)} – ${fullDayLabel(calendar,event.endDate)}` : "";
      detail.append(element("div",{ className:`school-day-event school-day-event--${event.category}` },
        element("span",{ className:"school-day-category",text:event.categoryLabel }),
        element("h4",{ text:event.title }),
        ...(event.time ? [element("time",{text:event.time})] : []),
        ...(range ? [element("p",{className:"school-day-range",text:range})] : []),
        ...(event.summary ? [element("p",{text:event.summary})] : []),
        ...event.details.map((text) => element("p",{text}))));
    }
    detail.hidden = false;
  }
  for (let n = 1; n <= daysInMonth; n++) {
    const date = `${month}-${String(n).padStart(2,"0")}`;
    const events = eventsOnDay(entries,date);
    const count = events.length;
    const label = `${fullDayLabel(calendar,date)}${count ? `, ${count} ${calendar.eventCountLabel}: ${events.map((entry) => entry.title).join(", ")}` : ""}`;
    const day = element("button", { className:`school-day${count ? " has-events" : ""}`,
      text:n, attributes:{ type:"button", "aria-label":label, "aria-expanded":"false",
        "aria-controls":detail.getAttribute("id"), ...(count ? {} : { disabled:"" }) } });
    if (count) {
      buttons.set(date, day);
      day.addEventListener("click", () => {
        onInteract();
        // Az ismételt kattintás asztali hover közben is bezár.
        if (activeDay === date) close(); else open(date, day);
      });
      if (mode === "desktop") {
        day.addEventListener("mouseenter", () => { onInteract(); open(date, day); });
        day.addEventListener("mouseleave", () => { if (activeDay === date) close(); });
        day.addEventListener("focus", () => {
          if (day.matches?.(":focus-visible")) open(date, day);
        });
      }
      day.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { close(); event.stopPropagation(); }
      });
      day.addEventListener("blur", () => {
        if (mode === "desktop" && activeDay === date) close();
      });
    }
    grid.append(day);
  }
  const notes = calendar.undated.filter((note) => note.month === month);
  const periods = periodsInMonth(entries,month);
  const extras = element("div",{className:"school-month-extras"});
  if (periods.length) extras.append(
    ...periods.map((entry) => element("p",{className:"school-month-period",
      text:`${entry.title}: ${fullDayLabel(calendar,entry.date)} – ${fullDayLabel(calendar,entry.endDate)}` })));
  if (notes.length) extras.append(element("strong",{text:calendar.monthNotesLabel}),
    ...notes.map((note) => element("p",{className:"school-month-note",
      text:`${note.title}: ${note.summary}`,attributes:{"data-event-id":note.id}})));
  const hasAny = entries.some((entry) => entry.date.slice(0,7) === month ||
    entry.endDate?.slice(0,7) === month || (entry.date < month && entry.endDate?.slice(0,7) >= month));
  if (!hasAny && !notes.length) extras.append(element("p",{text:calendar.emptyMonth}));
  if (!extras.children.length) extras.hidden = true;
  card.append(heading,grid,detail,extras);
  return {card,close,openEvent(id) {
    const note = notes.find((item) => item.id === id);
    if (note) {
      close();
      const item = [...extras.children].find((child) => child.getAttribute?.("data-event-id") === id);
      item?.scrollIntoView?.({block:"center",behavior:"instant"});
      item?.classList.add("is-highlighted");
      return true;
    }
    const event = entries.find((entry) => entry.id === id);
    if (!event || !(event.date.slice(0,7) === month ||
        event.endDate?.slice(0,7) === month || (event.date < month && event.endDate?.slice(0,7) >= month))) return false;
    const date = event.date.slice(0,7) === month ? event.date : `${month}-01`;
    const button = buttons.get(date) || buttons.get(event.endDate);
    if (!button) return false;
    open(buttons.has(date) ? date : event.endDate,button);
    return true;
  }};
}
