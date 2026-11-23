import { element } from "../shared/js/dom.js?v=2.34";
import { checkedCalendar, calendarEntries, schoolMonths } from "../shared/js/calendar-data.js?v=2.34";
import { makeCalendarMonth } from "../shared/js/calendar-view.js?v=2.34";

/** Asztali tanéváttekintés: a mind a tizenkét hónap önálló, középre zárt rácsa. */
export function createDesktopCalendar(config, onInteract) {
  const calendar = checkedCalendar(config);
  const entries = calendarEntries(config);
  const months = schoolMonths(calendar);
  const cards = months.map((month) => makeCalendarMonth(config,entries,month,"desktop",onInteract));
  const section = element("section",{className:"desktop-calendar-section",attributes:{
    "aria-label":calendar.title
  }}, element("div",{className:"desktop-calendar-inner"},
    element("div",{className:"desktop-calendar-heading"},
      element("span",{text:calendar.eyebrow}),
      element("h2",{text:calendar.title}),
      element("p",{text:calendar.intro}),
      element("p",{className:"school-calendar-hint",text:calendar.detailsHint}),
      element("p",{className:"school-calendar-hint",text:calendar.closeHint})),
    element("div",{className:"desktop-calendar-months"},...cards.map((view) => view.card))));
  return {
    section,
    showEvent(id) {
      const event = entries.find((entry) => entry.id === id) ||
        calendar.undated.find((note) => note.id === id);
      if (!event) return false;
      const view = cards[months.indexOf(event.month || event.date.slice(0,7))];
      if (!view?.openEvent(id)) return false;
      view.card.scrollIntoView?.({block:"center",behavior:"instant"});
      return true;
    },
    destroy() { for (const card of cards) card.close(); }
  };
}
