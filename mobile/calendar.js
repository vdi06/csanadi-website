import { element } from "../shared/js/dom.js?v=2.53";
import { checkedCalendar, calendarEntries, schoolMonths, monthLabel } from "../shared/js/calendar-data.js?v=2.53";
import { makeCalendarMonth, makeCalendarWeek, createCalendarPopover, schoolWeeks, weekLabel } from "../shared/js/calendar-view.js?v=2.53";

/** Telefonon kizárólag heti és havi mód, jól olvasható, kattintható napokkal. */
export function createMobileCalendar(config,onInteract=()=>{}) {
  const calendar=checkedCalendar(config);
  const entries=calendarEntries(config);
  const months=schoolMonths(calendar);
  const weeks=schoolWeeks(calendar);
  const popover=createCalendarPopover(config,"mobile",onInteract);
  const today=new Date();
  const currentDay=today.toISOString().slice(0,10);
  const todayMonth=currentDay.slice(0,7);
  let monthIndex=Math.max(0,months.indexOf(todayMonth));
  let weekIndex=Math.max(0,weeks.findIndex((week,i)=>week<=currentDay &&
    (!weeks[i+1]||weeks[i+1]>currentDay)));
  let mode="month";
  let view=null;
  const monthCards = new Map();
  const weekCards = new Map();
  const getMonth = (month) => {
    if (!monthCards.has(month)) monthCards.set(month,makeCalendarMonth(config,entries,month,"mobile",popover));
    return monthCards.get(month);
  };
  const getWeek = (week) => {
    if (!weekCards.has(week)) weekCards.set(week,makeCalendarWeek(config,entries,week,"mobile",popover));
    return weekCards.get(week);
  };
  const previous=element("button",{className:"mobile-month-arrow",text:"‹",attributes:{type:"button","aria-label":calendar.monthPreviousLabel}});
  const next=element("button",{className:"mobile-month-arrow",text:"›",attributes:{type:"button","aria-label":calendar.monthNextLabel}});
  const select=element("select",{className:"mobile-month-select",attributes:{"aria-label":calendar.monthSelectLabel}},
    ...months.map((month,i)=>element("option",{text:monthLabel(calendar,month),attributes:{value:i}})));
  const weekRange=element("span",{className:"calendar-week-range",attributes:{"aria-live":"polite"}});
  const period=element("div",{className:"mobile-calendar-navigation"},previous,select,weekRange,next);
  const host=element("div",{className:"mobile-calendar-month-host"});
  const tabs=["week","month"].map((view)=>element("button",{
    className:`calendar-view-tab${mode===view?" is-active":""}`,text:calendar.viewLabels[view],
    attributes:{type:"button","data-calendar-view":view,"aria-pressed":String(mode===view)}
  }));
  const switcher=element("div",{className:"calendar-view-switch",attributes:{
    role:"group","aria-label":calendar.viewGroupLabel
  }},...tabs);
  const section=element("section",{className:"mobile-calendar-section school-calendar-section",attributes:{
    "aria-label":calendar.title
  }},element("div",{className:"mobile-calendar-inner"},
    element("div",{className:"mobile-calendar-heading"},
      element("span",{text:calendar.eyebrow}),element("h2",{text:calendar.title}),
      element("p",{text:calendar.intro}),
      element("p",{className:"school-calendar-hint",text:calendar.detailsHint})),
    switcher,period,host));
  function render() {
    popover.close();
    const isMonth=mode==="month";
    tabs.forEach((tab)=>{
      const selected=tab.getAttribute("data-calendar-view")===mode;
      tab.setAttribute("aria-pressed",String(selected));
      tab.classList[selected?"add":"remove"]("is-active");
    });
    select.hidden=!isMonth;
    weekRange.hidden=isMonth;
    previous.setAttribute("aria-label",isMonth ? calendar.monthPreviousLabel : calendar.weekPreviousLabel);
    next.setAttribute("aria-label",isMonth ? calendar.monthNextLabel : calendar.weekNextLabel);
    const idx=isMonth ? monthIndex : weekIndex;
    const length=isMonth ? months.length : weeks.length;
    previous.disabled=idx===0;next.disabled=idx===length-1;
    if (isMonth) {
      select.value=String(monthIndex);
      view=getMonth(months[monthIndex]);
    } else {
      weekRange.textContent=weekLabel(calendar,weeks[weekIndex]);
      view=getWeek(weeks[weekIndex]);
    }
    host.replaceChildren(view.card);
  }
  function changeMode(nextMode) {
    if (!["week","month"].includes(nextMode)) return;
    onInteract();mode=nextMode;render();
  }
  function changePeriod(step) {
    const nextIdx=(mode==="month"?monthIndex:weekIndex)+step;
    if (mode==="month"&&nextIdx>=0&&nextIdx<months.length) monthIndex=nextIdx;
    else if (mode==="week"&&nextIdx>=0&&nextIdx<weeks.length) weekIndex=nextIdx;
    else return;
    onInteract();render();
  }
  tabs.forEach((tab)=>tab.addEventListener("click",()=>changeMode(tab.getAttribute("data-calendar-view"))));
  previous.addEventListener("click",()=>changePeriod(-1));
  next.addEventListener("click",()=>changePeriod(1));
  select.addEventListener("change",()=>{monthIndex=Number(select.value);onInteract();render();});
  render();
  return {
    section,isOpen:()=>popover.isOpen(),closePopover:()=>popover.close(),
    showEvent(id) {
      const event=entries.find((entry)=>entry.id===id);
      if (!event) return false;
      const target=months.indexOf(event.date.slice(0,7));
      if (target<0) return false;
      monthIndex=target;mode="month";render();
      const ok=view.openEvent(id);
      if (ok) host.scrollIntoView?.({block:"center",behavior:"instant"});
      return ok;
    },
    destroy() {popover.destroy();monthCards.clear();weekCards.clear();}
  };
}
