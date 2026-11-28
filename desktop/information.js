import { element } from "../shared/js/dom.js?v=2.78";
import { informationView } from "../shared/js/information-data.js?v=2.78";
const el=element;
const huDate=(day)=>new Intl.DateTimeFormat("hu-HU",{year:"numeric",month:"long",day:"numeric",weekday:"long",timeZone:"Europe/Budapest"}).format(new Date(`${day}T12:00:00Z`));
function linkToEvent(e){return `#/oldal/news-calendar/esemeny/${e.id}`;}
export function createDesktopInformation(config) {
  const vm=informationView(config), {info,date,events,news,schedule,quickLinks}=vm;
  const section=el("section",{className:"desktop-info-center",attributes:{"aria-label":"Iskolai információs központ"}},
    el("div",{className:"desktop-info-head"},
      el("div",{},el("p",{className:"desktop-info-overline",text:info.eyebrow}),
        el("h2",{text:"Tudnivalók egy helyen"}),
        el("p",{text:"Csengetés, következő események, közlemények és ügyintézési elérések."})),
      el("div",{className:"desktop-info-today"},
        el("span",{text:info.dateLabel}),
        el("time",{attributes:{datetime:date},text:huDate(date)}))),
    el("div",{className:"desktop-info-quick",attributes:{"aria-label":info.linksTitle}},
      ...quickLinks.map((link)=>el("a",{className:"desktop-info-shortcut",attributes:{href:link.href}},
        el("span",{className:"desktop-info-shortcut-icon",text:link.icon,attributes:{"aria-hidden":"true"}}),
        el("strong",{text:link.title}),el("small",{text:link.subtitle})))),
    el("div",{className:"desktop-info-layout"},
      el("section",{className:"desktop-info-panel desktop-info-schedule",attributes:{"aria-labelledby":"desktop-info-bells"}},
        el("div",{className:"desktop-info-panel-heading"},
          el("h2",{attributes:{id:"desktop-info-bells"},text:info.scheduleTitle}),
          el("a",{attributes:{href:"#/oldal/information-timetable"},text:"Részletek"})),
        el("ol",{className:"desktop-info-bell-grid"},...schedule.map((row)=>el("li",{},
          el("span",{text:row.title}),
          el("time",{text:`${row.from}–${row.to}`})))),
        el("p",{className:"desktop-info-disclaimer",text:info.scheduleNote})),
      el("div",{className:"desktop-info-side"},
        el("section",{className:"desktop-info-panel",attributes:{"aria-labelledby":"desktop-info-events"}},
          el("div",{className:"desktop-info-panel-heading"},
            el("h2",{attributes:{id:"desktop-info-events"},text:info.eventsTitle}),
            el("a",{attributes:{href:"#/oldal/news-calendar"},text:"Teljes naptár"})),
          events.length?el("ul",{className:"desktop-info-feed"},...events.map((e)=>el("li",{},
            el("time",{attributes:{datetime:e.date},text:huDate(e.date)}),
            el("a",{attributes:{href:linkToEvent(e)},text:e.title})))):
            el("p",{text:"Jelenleg nincs a naptárban további dátumos esemény."})),
        el("section",{className:"desktop-info-panel",attributes:{"aria-labelledby":"desktop-info-news"}},
          el("div",{className:"desktop-info-panel-heading"},
            el("h2",{attributes:{id:"desktop-info-news"},text:info.newsTitle}),
            el("a",{attributes:{href:"#/oldal/news-latest"},text:"Összes hír"})),
          news.length?el("ul",{className:"desktop-info-feed"},...news.map((n)=>el("li",{},
            el("time",{attributes:{datetime:n.date},text:n.date}),
            el("a",{attributes:{href:n.href},text:n.title})))):
            el("p",{text:"Jelenleg nincs közzétett hír."})))));
  return {section,destroy(){}};
}
