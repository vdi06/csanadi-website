import { element } from "../shared/js/dom.js?v=2.53";
import { informationView } from "../shared/js/information-data.js?v=2.53";
const el=element;
const shortDate=(s)=>new Intl.DateTimeFormat("hu-HU",{month:"short",day:"numeric",timeZone:"Europe/Budapest"}).format(new Date(`${s}T12:00:00Z`));
export function createMobileInformation(config) {
  const {info,date,events,news,schedule,quickLinks}=informationView(config);
  const section=el("section",{className:"mobile-info-center",attributes:{"aria-label":"Iskolai információs központ"}},
    el("header",{className:"mobile-info-head"},
      el("p",{text:info.eyebrow}),
      el("time",{attributes:{datetime:date},text:new Intl.DateTimeFormat("hu-HU",{dateStyle:"full",timeZone:"Europe/Budapest"}).format(new Date(`${date}T12:00:00Z`))})),
    el("nav",{className:"mobile-info-shortcuts",attributes:{"aria-label":info.linksTitle}},
      ...quickLinks.map((link)=>el("a",{attributes:{href:link.href}},
        el("span",{text:link.icon,attributes:{"aria-hidden":"true"}}),
        el("strong",{text:link.title}),el("small",{text:link.subtitle})))),
    el("section",{className:"mobile-info-panel"},
      el("h2",{text:info.eventsTitle}),
      events.length?el("ul",{className:"mobile-info-feed"},...events.map((event)=>el("li",{},
        el("time",{attributes:{datetime:event.date},text:shortDate(event.date)}),
        el("a",{attributes:{href:`#/oldal/news-calendar/esemeny/${event.id}`},text:event.title})))):
        el("p",{text:"Jelenleg nincs további dátumos naptári esemény."}),
      el("a",{className:"mobile-info-more",attributes:{href:"#/oldal/news-calendar"},text:"Teljes tanévi naptár"})),
    el("details",{className:"mobile-info-bell-details"},
      el("summary",{text:info.scheduleTitle}),
      el("ol",{},...schedule.map((row)=>el("li",{},
        el("span",{text:row.title}),el("strong",{text:`${row.from}–${row.to}`})))),
      el("p",{text:info.scheduleNote}),
      el("a",{attributes:{href:"#/oldal/information-timetable"},text:"Csengetési rend részletesen"})),
    el("section",{className:"mobile-info-panel"},
      el("h2",{text:info.newsTitle}),
      news.length?el("ul",{className:"mobile-info-feed"},...news.map((n)=>el("li",{},
        el("time",{attributes:{datetime:n.date},text:shortDate(n.date)}),
        el("a",{attributes:{href:n.href},text:n.title})))):
        el("p",{text:"Jelenleg nincs közzétett hír."}),
      el("a",{className:"mobile-info-more",attributes:{href:"#/oldal/news-latest"},text:"Hírek megnyitása"})));
  return {section,destroy(){}};
}
