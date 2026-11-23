import { element } from "../shared/js/dom.js?v=2.48";
import { checkedCalendar, calendarEntries, schoolMonths, monthLabel } from "../shared/js/calendar-data.js?v=2.48";
import { makeCalendarMonth, makeCalendarWeek, createCalendarPopover, schoolWeeks, weekLabel } from "../shared/js/calendar-view.js?v=2.48";

/** Asztalon: azonos adatú heti / havi / éves nézet; a hónapok 6 hetes, azonos rácsban. */
export function createDesktopCalendar(config,onInteract=()=>{}) {
  const calendar = checkedCalendar(config);
  const entries=calendarEntries(config);
  const months=schoolMonths(calendar);
  const weeks=schoolWeeks(calendar);
  const popover=createCalendarPopover(config,"desktop",onInteract);
  const today=new Date();
  const todayMonth=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;
  let monthIndex=Math.max(0,months.indexOf(todayMonth));
  let weekIndex=Math.max(0,weeks.findIndex((week,i)=>week <= today.toISOString().slice(0,10) &&
    (!weeks[i+1] || weeks[i+1] > today.toISOString().slice(0,10))));
  let mode="month";
  let views=[];
  // A nézetváltás ne építse újra a teljes, 504 cellás éves naptárat.
  const monthCards = new Map();
  const weekCards = new Map();
  const getMonth = (month) => {
    if (!monthCards.has(month)) monthCards.set(month,makeCalendarMonth(config,entries,month,"desktop",popover));
    return monthCards.get(month);
  };
  const getWeek = (week) => {
    if (!weekCards.has(week)) weekCards.set(week,makeCalendarWeek(config,entries,week,"desktop",popover));
    return weekCards.get(week);
  };
  const host=element("div",{className:"desktop-calendar-display"});
  const range=element("span",{className:"calendar-range-label",attributes:{"aria-live":"polite"}});
  const previous=element("button",{className:"calendar-period-arrow",text:"‹",attributes:{type:"button","aria-label":calendar.monthPreviousLabel}});
  const next=element("button",{className:"calendar-period-arrow",text:"›",attributes:{type:"button","aria-label":calendar.monthNextLabel}});
  const period=element("div",{className:"calendar-period-navigation"},previous,range,next);
  const tabs=Object.entries(calendar.viewLabels).map(([view,label])=>element("button",{
    className:`calendar-view-tab${view===mode?" is-active":""}`,text:label,
    attributes:{type:"button","data-calendar-view":view,"aria-pressed":String(view===mode)}
  }));
  const modeBar=element("div",{className:"calendar-view-switch",attributes:{
    role:"group","aria-label":calendar.viewGroupLabel
  }},...tabs);
  const section=element("section",{className:"desktop-calendar-section school-calendar-section",attributes:{
    "aria-label":calendar.title
  }},element("div",{className:"desktop-calendar-inner"},
    element("div",{className:"desktop-calendar-heading"},
      element("span",{text:calendar.eyebrow}),element("h2",{text:calendar.title}),
      element("p",{text:calendar.intro}),
      element("p",{className:"school-calendar-hint",text:calendar.detailsHint})),
    element("div",{className:"calendar-toolbar"},modeBar,period),host));
  function render() {
    popover.close();
    tabs.forEach((tab)=>{
      const isSelected=tab.getAttribute("data-calendar-view")===mode;
      tab.setAttribute("aria-pressed",String(isSelected));
      tab.classList[isSelected?"add":"remove"]("is-active");
    });
    previous.hidden=mode==="year";next.hidden=mode==="year";
    if (mode==="year") {
      range.textContent=calendar.schoolYear;
      views=months.map(getMonth);
      host.replaceChildren(element("div",{className:"desktop-calendar-months"},...views.map((view)=>view.card)));
    } else if (mode==="month") {
      range.textContent=monthLabel(calendar,months[monthIndex]);
      views=[getMonth(months[monthIndex])];
      host.replaceChildren(element("div",{className:"desktop-calendar-focused-month"},views[0].card));
    } else {
      range.textContent=weekLabel(calendar,weeks[weekIndex]);
      views=[getWeek(weeks[weekIndex])];
      host.replaceChildren(element("div",{className:"desktop-calendar-focused-week"},views[0].card));
    }
    previous.disabled=mode==="month" ? monthIndex===0 : weekIndex===0;
    next.disabled=mode==="month" ? monthIndex===months.length-1 : weekIndex===weeks.length-1;
  }
  function changeMode(nextMode) {
    if (!Object.hasOwn(calendar.viewLabels,nextMode)) return;
    onInteract();
    mode=nextMode;
    render();
  }
  function changePeriod(step) {
    const nextIndex=(mode==="month"?monthIndex:weekIndex)+step;
    if (mode==="month" && nextIndex>=0 && nextIndex<months.length) monthIndex=nextIndex;
    else if (mode==="week" && nextIndex>=0 && nextIndex<weeks.length) weekIndex=nextIndex;
    else return;
    onInteract();render();
  }
  tabs.forEach((tab)=>tab.addEventListener("click",()=>changeMode(tab.getAttribute("data-calendar-view"))));
  previous.addEventListener("click",()=>changePeriod(-1));
  next.addEventListener("click",()=>changePeriod(1));
  render();
  return {
    section,closePopover:()=>popover.close(),isOpen:()=>popover.isOpen(),
    showEvent(id) {
      const event=entries.find((entry)=>entry.id===id);
      if (!event) return false;
      const targetMonth=months.indexOf(event.date.slice(0,7));
      if (targetMonth<0) return false;
      monthIndex=targetMonth;
      mode="month";
      render();
      const ok=views[0].openEvent(id);
      if (ok) views[0].card.scrollIntoView?.({block:"center",behavior:"instant"});
      return ok;
    },
    destroy() {popover.destroy();monthCards.clear();weekCards.clear();}
  };
}
