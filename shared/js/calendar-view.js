import { layoutNow } from "./layout-controller.js?v=2.81";
import { element } from "./dom.js?v=2.81";
import { eventsOnDay, fullDayLabel, monthLabel } from "./calendar-data.js?v=2.81";
import { newsStoryHref } from "./news-panel.js?v=2.81";

export function addCalendarDays(day, count) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0,10);
}
export function startOfCalendarWeek(day) {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return addCalendarDays(day, -((weekday+6)%7));
}
export function monthGridStart(month) { return startOfCalendarWeek(`${month}-01`); }
export function schoolWeeks(calendar) {
  const first = monthGridStart(calendar.firstMonth);
  const [y,m] = calendar.firstMonth.split("-").map(Number);
  const last = new Date(Date.UTC(y,m - 1 + calendar.monthCount,0)).toISOString().slice(0,10);
  const weeks=[];
  for (let day=first;day<=last;day=addCalendarDays(day,7)) weeks.push(day);
  return weeks;
}
export function weekLabel(calendar,week) {
  return `${fullDayLabel(calendar,week)} – ${fullDayLabel(calendar,addCalendarDays(week,6))}`;
}

/** A felugró részletezés mindig a téma gyökeréhez kapcsolódik, nem a rácshoz:
 * nem nyújtja meg a hónapot, és a Carousel overflow-ja sem vághatja le. */
export function createCalendarPopover(config, platformOrEntries, onInteract = () => {}) {
  const platform = typeof platformOrEntries === "string" ? platformOrEntries : "shared";
  const settings = config.home.calendar;
  const id = `${platform}-calendar-floating-detail`;
  const title = element("strong", {className:"calendar-popover-title",
    attributes:{id:`${id}-title`}});
  const list = element("div", {className:"calendar-popover-content"});
  const closeButton = element("button", {className:"calendar-popover-close",text:"×",
    attributes:{type:"button","aria-label":"Eseményablak bezárása"}});
  const header = element("div", {className:"calendar-popover-top"},title,closeButton);
  const popover = element("div", {className:"school-calendar-popover", attributes:{
    id,role:"dialog","aria-labelledby":`${id}-title`,"aria-modal":"false"
  }}, header,list);
  popover.hidden = true;
  let activeDate = null;
  let activeButton = null;
  let dismissedOnHover = null;
  let hoverLeaveTimer = null;
  const cancelHoverLeave = () => {
    if (hoverLeaveTimer !== null) clearTimeout(hoverLeaveTimer);
    hoverLeaveTimer = null;
  };
  const anchorHost = () => document.body;
  const themeHost = () => document.querySelector?.(`.${platform}-home`) || null;
  const updateTheme = () => {
    const theme=themeHost()?.dataset?.theme;
    popover.setAttribute("data-calendar-theme",theme==="light"?"light":"dark");
  };
  let themeWatcher = null;
  if (typeof MutationObserver !== "undefined") {
    themeWatcher = new MutationObserver(() => {if (!popover.hidden) updateTheme();});
    themeWatcher.observe(document.getElementById?.("app") || document.body,{
      subtree:true,attributes:true,attributeFilter:["data-theme"]
    });
  }
  function place() {
    if (popover.hidden || !activeButton?.getBoundingClientRect) return;
    const rect = activeButton.getBoundingClientRect();
    const screenWidth = window.innerWidth || 390;
    const screenHeight = window.innerHeight || 760;
    // 400%-os böngészőnagyításnál is férjen ki a lebegő ablak.
    const width = Math.min(390, Math.max(1, screenWidth - 20));
    const measuredHeight = popover.getBoundingClientRect?.().height || 270;
    const left = Math.max(10, Math.min(rect.left + rect.width/2 - width/2, screenWidth-width-10));
    const below = rect.bottom + 10;
    const top = below + measuredHeight <= screenHeight-10 ? below
      : Math.max(10, Math.min(rect.top-measuredHeight-10,screenHeight-measuredHeight-10));
    popover.style.setProperty("--popover-width", `${width}px`);
    popover.style.setProperty("--popover-left", `${left}px`);
    popover.style.setProperty("--popover-top", `${top}px`);
    popover.style.setProperty("--popover-max-height", `${Math.max(1,screenHeight-25)}px`);
  }
  function close() {
    cancelHoverLeave();
    if (activeButton) activeButton.setAttribute("aria-expanded","false");
    activeDate = null;
    activeButton = null;
    popover.hidden = true;
    list.replaceChildren();
  }
  function open(day, button, entries, {fromHover=false,focusDetails=false} = {}) {
    const events = eventsOnDay(entries,day);
    if (!events.length) { close(); return false; }
    close();
    activeDate = day;
    activeButton = button;
    dismissedOnHover = null;
    button.setAttribute("aria-expanded","true");
    title.textContent = `${fullDayLabel(settings,day)} · ${settings.dayDetailsLabel}`;
    for (const event of events) {
      const range = event.endDate ? `${fullDayLabel(settings,event.date)} – ${fullDayLabel(settings,event.endDate)}` : "";
      list.append(element("div",{className:`calendar-popover-event calendar-popover-event--${event.category}`},
        element("span",{className:"calendar-popover-category",text:event.categoryLabel}),
        element("h4",{text:event.title}),
        ...(event.time ? [element("time",{className:"calendar-popover-time",text:event.time})] : []),
        ...(range ? [element("p",{className:"calendar-popover-range",text:range})] : []),
        ...(event.summary ? [element("p",{text:event.summary})] : []),
        ...event.details.map((text) => element("p",{text})),
        ...(event.newsRef ? (() => {
          const article=config.publicNews.find((news)=>news.id===event.newsRef);
          if (!article) return [];
          return [element("a",{className:"calendar-related-news-link",
            text:"Kapcsolódó hír és részletes tájékoztatás",
            attributes:{href:newsStoryHref(config,article)}})];
        })() : [])));
    }
    const parent = anchorHost();
    if (popover.parentNode !== parent) parent.append(popover);
    updateTheme();
    popover.hidden = false;
    onInteract();
    place();
    // Billentyűzettel/switch eszközzel nyitva a hírhivatkozások és a bezárás
    // közvetlenül elérhetők, nem a teljes naptáron kell újra tabolni.
    if (focusDetails) closeButton.focus?.({preventScroll:true});
    return true;
  }
  function toggle(day, button, entries, {focusDetails=false} = {}) {
    if (activeDate === day && activeButton === button) {
      dismissedOnHover = button;
      close();
      return false;
    }
    return open(day,button,entries,{focusDetails});
  }
  function hover(day,button,entries) {
    if (dismissedOnHover === button) return;
    if (activeDate === day && activeButton === button) return;
    open(day,button,entries,{fromHover:true});
  }
  function leave(button) {
    if (activeButton === button) {
      // A lebegő ablakból a hírre vezető link egérrel is elérhető legyen:
      // a kurzor a napcella és a popover közti rövid távolságot áthidalhatja.
      cancelHoverLeave();
      hoverLeaveTimer = setTimeout(() => {
        hoverLeaveTimer = null;
        if (activeButton === button && !popover.matches?.(":hover") &&
            !popover.contains?.(document.activeElement)) close();
      }, 190);
    }
    if (dismissedOnHover === button) dismissedOnHover = null;
  }
  popover.addEventListener("mouseenter", cancelHoverLeave);
  popover.addEventListener("mouseleave", () => {
    if (!popover.contains?.(document.activeElement)) close();
  });
  popover.addEventListener("focusin", cancelHoverLeave);
  closeButton.addEventListener("click",() => { const button = activeButton; close(); button?.focus?.(); });
  const keydown = (event) => {
    if (event.key === "Escape" && !popover.hidden) {
      const opener = activeButton;
      close();
      opener?.focus?.({preventScroll:true});
      event.preventDefault?.();
      event.stopPropagation?.();
    }
  };
  const pointerdown = (event) => {
    if (!popover.hidden && event.target !== activeButton &&
      !popover.contains?.(event.target) && !event.target?.closest?.(".school-day")) close();
  };
  const scroll = () => { if (!popover.hidden) place(); };
  document.addEventListener?.("keydown",keydown);
  document.addEventListener?.("pointerdown",pointerdown);
  window.addEventListener?.("resize",scroll);
  window.addEventListener?.("scroll",scroll,true);
  return {id,popover,open,toggle,hover,leave,close,isOpen:()=>!popover.hidden,snapshot:()=>!popover.hidden?{date:activeDate,focus:popover.contains(document.activeElement)}:null,
    destroy() {
      close();
      document.removeEventListener?.("keydown",keydown);
      document.removeEventListener?.("pointerdown",pointerdown);
      window.removeEventListener?.("resize",scroll);
      window.removeEventListener?.("scroll",scroll,true);
      themeWatcher?.disconnect();
      popover.remove?.();
    }
  };
}

function makeDayButton(config,entries,day,mode,popover,{labelDay=true}={}) {
  const dayEvents = eventsOnDay(entries,day);
  const count = dayEvents.length;
  const number = Number(day.slice(-2));
  const text = labelDay ? number : fullDayLabel(config.home.calendar,day);
  const label = `${fullDayLabel(config.home.calendar,day)}${count ? `, ${count} ${config.home.calendar.eventCountLabel}: ${dayEvents.map((entry)=>entry.title).join(", ")}` : ""}`;
  const button = element("button",{className:`${labelDay?"school-day":"school-week-day"}${count ? " has-events" : ""}`,
    text,attributes:{type:"button","aria-label":label,"aria-expanded":"false",
      "aria-controls":popover.id,"data-calendar-date":day, ...(count ? {} : {disabled:""})}});
  if (count) {
    if (labelDay) button.append(element("span",{className:"school-day-marker",text:count>1?String(count):"",attributes:{"aria-hidden":"true"}}));
    button.addEventListener("click",(event) => popover.toggle(day,button,entries,
      {focusDetails:event.detail === 0}));
    button.addEventListener("pointerenter",event => { if(event.pointerType==="mouse" && ["mouse","hybrid"].includes(layoutNow().input)) popover.hover(day,button,entries); });
    button.addEventListener("pointerleave",event => { if(event.pointerType==="mouse") popover.leave(button); });
  }
  return button;
}

/** Egy hónap pontosan 6×7 cella: egyetlen eseményablak sem része a kártyának. */
export function makeCalendarMonth(config, entries, month, mode, popover) {
  const calendar = config.home.calendar;
  const card = element("article",{className:`school-month school-month--${mode}`});
  const heading = element("h3",{className:"school-month-title",text:monthLabel(calendar,month)});
  const grid = element("div",{className:"school-month-grid",attributes:{role:"group","aria-label":monthLabel(calendar,month)}});
  for (const weekday of calendar.weekdayNames) grid.append(element("span",{className:"school-month-weekday",text:weekday,attributes:{"aria-hidden":"true"}}));
  const buttons = new Map();
  const first = monthGridStart(month);
  for (let offset=0;offset<42;offset++) {
    const day = addCalendarDays(first,offset);
    if (day.slice(0,7) !== month) {
      grid.append(element("span",{className:"school-month-empty",attributes:{"aria-hidden":"true"}}));
      continue;
    }
    const button = makeDayButton(config,entries,day,mode,popover);
    if (eventsOnDay(entries,day).length) buttons.set(day,button);
    grid.append(button);
  }
  card.append(heading,grid);
  return {card,close:popover.close,openEvent(id) {
    const event=entries.find((entry)=>entry.id===id);
    if (!event || (event.date.slice(0,7)!==month && event.endDate?.slice(0,7)!==month)) return false;
    const date=event.date.slice(0,7)===month ? event.date : event.endDate;
    const button=buttons.get(date);
    if (!button) return false;
    return popover.open(date,button,entries);
  }};
}

/** Heti nézet: egy teljes hét, minden nap azonos méretű helyen. */
export function makeCalendarWeek(config, entries, weekStart, mode, popover) {
  const calendar=config.home.calendar;
  const weekEnd=addCalendarDays(weekStart,6);
  const card=element("article",{className:`school-week school-week--${mode}`});
  const heading=element("h3",{className:"school-week-title",
    text:`${fullDayLabel(calendar,weekStart)} – ${fullDayLabel(calendar,weekEnd)}`});
  const grid=element("div",{className:"school-week-grid",attributes:{role:"group","aria-label":heading.textContent}});
  const buttons=new Map();
  for (let i=0;i<7;i++) {
    const day=addCalendarDays(weekStart,i);
    const count=eventsOnDay(entries,day).length;
    const dayName=calendar.weekdayNames[i];
    const button=makeDayButton(config,entries,day,mode,popover,{labelDay:false});
    button.className=`school-week-day${count ? " has-events" : ""}`;
    const text=element("span",{className:"school-week-day-label",text:dayName});
    const countLabel=element("span",{className:"school-week-event-count",text:count?`${count} esemény`:"—"});
    button.replaceChildren(element("span",{className:"school-week-day-meta"},
      element("span",{className:"school-week-day-name",text:dayName}),
      element("span",{className:"school-week-day-date",text:String(Number(day.slice(-2)))})),
      element("span",{className:"school-week-day-events",text:count
        ? eventsOnDay(entries,day).slice(0,2).map((e)=>e.title).join(" · ")+(count>2?` +${count-2}`:"")
        :"Nincs meghirdetett esemény"}));
    if (count) buttons.set(day,button);
    grid.append(button);
  }
  card.append(heading,grid);
  return {card,close:popover.close,openEvent(id) {
    const event=entries.find((entry)=>entry.id===id);
    if (!event) return false;
    const date=event.date>=weekStart && event.date<=weekEnd ? event.date : event.endDate;
    const button=buttons.get(date);
    return button ? popover.open(date,button,entries) : false;
  }};
}
