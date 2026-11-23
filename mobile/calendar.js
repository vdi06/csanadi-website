import { element } from "../shared/js/dom.js?v=2.34";
import { checkedCalendar, calendarEntries, schoolMonths, monthLabel } from "../shared/js/calendar-data.js?v=2.34";
import { makeCalendarMonth } from "../shared/js/calendar-view.js?v=2.34";

/** Mobilon célzott hónapválasztó: nem a kezdőlapi Carousel lapozását használja. */
export function createMobileCalendar(config, onInteract) {
  const calendar = checkedCalendar(config);
  const entries = calendarEntries(config);
  const months = schoolMonths(calendar);
  const today = new Date();
  const todayMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
  let index = Math.max(0,months.indexOf(todayMonth));
  let view = null;
  const previous = element("button",{className:"mobile-month-arrow",text:calendar.previousGlyph,attributes:{
    type:"button","aria-label":calendar.monthPreviousLabel
  }});
  const next = element("button",{className:"mobile-month-arrow",text:calendar.nextGlyph,attributes:{
    type:"button","aria-label":calendar.monthNextLabel
  }});
  const select = element("select",{className:"mobile-month-select",attributes:{
    "aria-label":calendar.monthSelectLabel
  }},...months.map((month,i) => element("option",{text:monthLabel(calendar,month),attributes:{value:i}})));
  const monthHost = element("div",{className:"mobile-calendar-month-host"});
  const section = element("section",{className:"mobile-calendar-section",attributes:{
    "aria-label":calendar.title
  }},element("div",{className:"mobile-calendar-inner"},
    element("div",{className:"mobile-calendar-heading"},
      element("span",{text:calendar.eyebrow}),
      element("h2",{text:calendar.title}),
      element("p",{text:calendar.intro}),
      element("p",{className:"school-calendar-hint",text:calendar.detailsHint}),
      element("p",{className:"school-calendar-hint",text:calendar.closeHint})),
    element("div",{className:"mobile-calendar-navigation"},previous,select,next),
    monthHost));
  function renderMonth() {
    view?.close();
    view = makeCalendarMonth(config,entries,months[index],"mobile",onInteract);
    monthHost.replaceChildren(view.card);
    select.value = String(index);
    previous.disabled = index === 0;
    next.disabled = index === months.length - 1;
  }
  function choose(nextIndex) {
    if (nextIndex < 0 || nextIndex >= months.length) return;
    onInteract();
    index = nextIndex;
    renderMonth();
  }
  previous.addEventListener("click",() => choose(index - 1));
  next.addEventListener("click",() => choose(index + 1));
  select.addEventListener("change",() => choose(Number(select.value)));
  renderMonth();
  return {
    section,
    showEvent(id) {
      const event = entries.find((entry) => entry.id === id) ||
        calendar.undated.find((note) => note.id === id);
      if (!event) return false;
      choose(months.indexOf(event.month || event.date.slice(0,7)));
      const opened = view.openEvent(id);
      if (opened) monthHost.scrollIntoView?.({block:"center",behavior:"instant"});
      return opened;
    },
    destroy() { view?.close(); }
  };
}
