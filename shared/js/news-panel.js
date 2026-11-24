import { element } from "./dom.js?v=2.62";
import { menuPageHref } from "./menu-data.js?v=2.62";
import { calendarEntries } from "./calendar-data.js?v=2.62";

/** Az intézmény JSON-ban rögzített hírei. Az időpontok a hír/esemény dátumai,
 * nem feltételezett közzétételi időpontok. Az összes szöveg textContent-ként kerül a DOM-ba. */
export function newsTargetId(item) {
  return item.tags.includes("announcement") ? "news-announcements" : "news-latest";
}
export function newsDetailHref(item) {
  return `${menuPageHref(newsTargetId(item))}/hir/${item.id}`;
}
/** Ismeretlen vagy másik hírgyűjteményhez tartozó címhez soha nem jelenik meg adat. */
export function newsForRoute(config,pageId,id) {
  if (!["news-latest","news-announcements"].includes(pageId)) return null;
  const item=config.publicNews.find((news)=>news.id===id);
  if (!item || newsTargetId(item)!==pageId) return null;
  return item;
}
const budapestToday = () => new Intl.DateTimeFormat("sv-SE", {timeZone:"Europe/Budapest",
  year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const shiftDay = (iso,offset) => {
  const d=new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate()+offset);
  return d.toISOString().slice(0,10);
};
export function selectedNews(config,panel,today=budapestToday()) {
  const {maxAgeDays,maxFutureDays,maxItems}=config.home.newsSpotlight;
  const earliest=shiftDay(today,-maxAgeDays);
  const latest=shiftDay(today,maxFutureDays);
  return config.publicNews.filter((item) =>
    (item.endDate ?? item.date) >= earliest && item.date <= latest &&
    (!panel.tags || panel.tags.some((tag)=>item.tags.includes(tag))))
    .sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)) ||
      b.date.localeCompare(a.date) || a.id.localeCompare(b.id,"hu"))
    .slice(0,maxItems);
}

/** Az azonos hír végleges, megosztható, menüből is elérhető céloldala. */
export function newsDateLabel(iso) {
  return new Intl.DateTimeFormat("hu-HU",{timeZone:"Europe/Budapest",
    year:"numeric",month:"long",day:"numeric"}).format(new Date(`${iso}T12:00:00Z`));
}
export function newsStoryPage(config,record,today=budapestToday()) {
  if (record.tags.includes("announcement")) return "news-announcements";
  const latestLimit=shiftDay(today,-config.home.newsSpotlight.maxAgeDays);
  return (record.endDate??record.date)<latestLimit ? "news-archive" : "news-latest";
}
export function newsStoryHref(config,record,today=budapestToday()) {
  return `${menuPageHref(newsStoryPage(config,record,today))}/hir/${record.id}`;
}
export function publicNewsForPage(config,pageId,today=budapestToday()) {
  const limit=shiftDay(today,-config.home.newsSpotlight.maxAgeDays);
  return config.publicNews.filter((record)=>{
    if(pageId==="news-announcements") return record.tags.includes("announcement");
    if(pageId==="news-archive") return (record.endDate??record.date)<limit;
    if(pageId==="news-latest") return !record.tags.includes("announcement") &&
      (record.endDate??record.date)>=limit;
    return false;
  }).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id,"hu"));
}

/** Kezdőlapi, adatvezérelt hírszemle. Az egyes kártyákhoz menüből elérhető
 * teljes híroldal és külön közleménygyűjtemény tartozik. */
export function createNewsPanel(config,onInteract=()=>{},panel={label:"Kiemelt hírek"}) {
  const settings=config.home.newsSpotlight;
  const today=budapestToday();
  const articles=selectedNews(config,panel,today);
  const dateLabel=newsDateLabel;
  const heading=element("h2",{text:settings.heading});
  const cards=element("div",{className:"home-news-grid"});
  const detailNodes=[];
  for (const item of articles) {
    const end=item.endDate ?? item.date;
    const status=item.date > today ? "upcoming" : end < today ? "past" : "ongoing";
    const tag=item.tags.find((t)=>settings.tagLabels[t]) ?? item.tags[0];
    const target=newsTargetId(item);
    const details=element("details",{className:"home-news-more"},
      element("summary",{text:settings.detailsLabel}),
      element("div",{className:"home-news-detail-content"},
        ...item.details.map((line)=>element("p",{text:line})),
        element("a",{className:"home-news-story-link",text:"A hír részletes adatlapja",
          attributes:{href:newsStoryHref(config,item)}}),
        ...calendarEntries(config).filter((event)=>event.newsRef===item.id).slice(0,2)
          .map((event)=>element("a",{className:"home-news-calendar-link",
            text:`Naptári időpont: ${newsDateLabel(event.date)}`,
            attributes:{href:`${menuPageHref("news-calendar")}/esemeny/${event.id}`}}))));
    details.addEventListener("toggle",()=>{if(details.open)onInteract();});
    detailNodes.push(details);
    const tagText=settings.tagLabels[tag] ?? tag;
    cards.append(element("article",{className:`home-news-card home-news-card--${status}`,
      attributes:{"data-news-id":item.id}},
      element("div",{className:"home-news-card-head"},
        element("span",{className:"home-news-tag",text:tagText}),
        element("span",{className:`home-news-status home-news-status--${status}`,
          text:settings.stateLabels[status]})),
      ...(item.featured?[element("p",{className:"home-news-featured",text:settings.featuredLabel})]:[]),
      element("time",{className:"home-news-date",text:item.endDate ?
        `${newsDateLabel(item.date)} – ${newsDateLabel(item.endDate)}`:newsDateLabel(item.date),
        attributes:{datetime:item.date}}),
      element("h3",{},element("a",{className:"home-news-title-link",
        text:item.title,attributes:{href:newsStoryHref(config,item)}})),
      element("p",{className:"home-news-summary",text:item.summary}),
      details));
  }
  if(!articles.length) cards.append(element("p",{className:"home-news-empty",
    text:settings.emptyLabel,attributes:{role:"status"}}));
  const links=element("nav",{className:"home-news-links",attributes:{"aria-label":settings.linksLabel}},
    element("a",{className:"home-news-link",text:settings.allNewsLabel,
      attributes:{href:menuPageHref("news-latest")}}),
    element("a",{className:"home-news-link",text:settings.announcementsLabel,
      attributes:{href:menuPageHref("news-announcements")}}));
  const section=element("section",{className:"home-news-panel",
    attributes:{"aria-label":panel.label}},
    element("header",{className:"home-news-heading"},
      element("p",{className:"home-news-eyebrow",text:settings.eyebrow}),
      heading,element("p",{className:"home-news-intro",text:settings.intro})),
    cards,links);
  return {section,isOpen:()=>detailNodes.some((detail)=>detail.open),
    closeDetails:()=>detailNodes.forEach((detail)=>{detail.open=false;}),destroy:()=>{}};
}

/** A menüből és a kezdőlapi hírből közvetlenül elérhető, teljes hír-adatlap.
 * Nem igényel új menüpontot vagy szerveroldali útvonalat. */
export function createNewsDetail(config,pageId,id) {
  const item=newsForRoute(config,pageId,id);
  if (!item) return null;
  const settings=config.home.newsSpotlight;
  const titleId=`news-detail-title-${id}`;
  const matchingEvents=calendarEntries(config).filter((event)=>event.newsRef===item.id);
  const tag=item.tags.find((name)=>settings.tagLabels[name]) ?? item.tags[0];
  return element("article",{className:"news-detail-article",
    attributes:{"data-news-id":item.id,"aria-labelledby":titleId}},
    element("p",{className:"news-detail-eyebrow",text:settings.tagLabels[tag] ?? tag}),
    element("h2",{className:"news-detail-title",text:item.title,
      attributes:{id:titleId,tabindex:"-1"}}),
    element("time",{className:"news-detail-date",
      text:item.endDate ? `${formatNewsDate(item.date)} – ${formatNewsDate(item.endDate)}` :
        formatNewsDate(item.date),attributes:{datetime:item.date}}),
    element("p",{className:"news-detail-lead",text:item.summary}),
    element("div",{className:"news-detail-body"},
      ...item.details.map((line)=>element("p",{text:line}))),
    element("nav",{className:"news-detail-actions",attributes:{"aria-label":"Híroldalak"}},
      element("a",{text:pageId==="news-announcements" ? "Vissza a közleményekhez" :
        "Vissza a hírekhez",attributes:{href:menuPageHref(pageId)}}),
      element("a",{text:"Összes hír",attributes:{href:menuPageHref("news-latest")}}),
      element("a",{text:"Tanévi eseménynaptár",attributes:{href:menuPageHref("news-calendar")}}),
      ...matchingEvents.map((event)=>element("a",{
        text:`Kapcsolódó esemény: ${newsDateLabel(event.date)}`,
        attributes:{href:`${menuPageHref("news-calendar")}/esemeny/${event.id}`}
      }))));
}
function formatNewsDate(iso) {
  return new Intl.DateTimeFormat("hu-HU",{timeZone:"Europe/Budapest",
    year:"numeric",month:"long",day:"numeric"}).format(new Date(`${iso}T12:00:00Z`));
}
