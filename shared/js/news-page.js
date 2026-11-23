import { element } from "./dom.js?v=2.41";
import { menuPageHref } from "./menu-data.js?v=2.41";
import { newsDateLabel, newsStoryHref, publicNewsForPage } from "./news-panel.js?v=2.41";
import { calendarEntries } from "./calendar-data.js?v=2.41";

/** Ugyanazok a központi, ellenőrzött JSON-hírek jelennek meg a kezdőlapon és
 * a menüből elérhető részletes oldalakon. Mobilon és asztalon közös adatlogika,
 * platformonként külön hívott megjelenítővel. Soha nem értelmezünk JSON-szöveget HTML-ként. */
export function createNewsArchivePage(config, pageId, platform, selectedId = null) {
  if (!["news-latest", "news-announcements", "news-archive"].includes(pageId)) {
    throw new Error("Nem támogatott híroldal.");
  }
  const spot = config.home.newsSpotlight;
  const records = publicNewsForPage(config,pageId);
  const requested=selectedId && config.publicNews.find((news)=>news.id===selectedId);
  if (requested && !records.some((news)=>news.id===requested.id) &&
      ((pageId==="news-announcements")===requested.tags.includes("announcement"))) {
    records.unshift(requested); // Egy korábbi mélylink az archiválás után sem válik elérhetetlenné.
  }
  const linkedEvents=calendarEntries(config);
  const navItems = [
    ["news-latest", "Legfrissebb hírek"],
    ["news-announcements", "Fontos közlemények"],
    ["news-archive", "Korábbi hírek"],
    ["news-calendar", "Iskolai eseménynaptár"]
  ];
  const navigation = element("nav",{className:"school-news-navigation",attributes:{
    "aria-label":"Hírek és naptár menüpontjai"
  }},...navItems.map(([id,label])=>element("a",{
    className:`school-news-navigation-link${id===pageId?" is-current":""}`,text:label,
    attributes:{href:menuPageHref(id),...(id===pageId?{"aria-current":"page"}:{})}
  })));
  const list=element("div",{className:"school-news-page-grid"});
  const detailNodes=new Map();
  const dateOf=(record)=>record.endDate ? `${newsDateLabel(record.date)} – ${newsDateLabel(record.endDate)}`
    :newsDateLabel(record.date);
  const today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Budapest",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  for (const record of records) {
    const tag=record.tags.find(t=>spot.tagLabels[t])??record.tags[0];
    const category=spot.tagLabels[tag]??tag;
    const end=record.endDate??record.date;
    const status=record.date>today?"upcoming":end<today?"past":"ongoing";
    const summary=element("summary",{text:"Részletes hír elolvasása"});
    const details=element("details",{className:"school-news-story-details"},summary,
      element("div",{className:"school-news-story-body"},
        ...record.details.map((text)=>element("p",{text})),
        element("a",{className:"school-news-story-share",text:"Hivatkozás erre a hírre",
          attributes:{href:newsStoryHref(config,record)}}),
        ...linkedEvents.filter((event)=>event.newsRef===record.id).map((event)=>
          element("a",{className:"school-news-story-share",
            text:`Kapcsolódó naptári esemény: ${newsDateLabel(event.date)}`,
            attributes:{href:`${menuPageHref("news-calendar")}/esemeny/${event.id}`}}))));
    detailNodes.set(record.id,details);
    const article=element("article",{className:"school-news-story",attributes:{
      "data-news-id":record.id,id:`school-news-${platform}-${record.id}`
    }},element("div",{className:"school-news-story-labels"},
      element("span",{className:"school-news-story-category",text:category}),
      ...(record.featured?[element("span",{className:"school-news-story-featured",text:spot.featuredLabel})]:[]),
      element("span",{className:"school-news-story-status",text:spot.stateLabels[status]})),
      element("time",{className:"school-news-story-date",text:dateOf(record),attributes:{datetime:record.date}}),
      element("h2",{text:record.title}),element("p",{className:"school-news-story-summary",text:record.summary}),
      details);
    list.append(article);
  }
  if (!records.length) list.append(element("p",{
    className:"school-news-empty",text:"Ebben a kategóriában jelenleg nincs közzétett hír.",
    attributes:{role:"status"}}));
  const section=element("section",{className:`school-news-page school-news-page--${platform}`,
    attributes:{"aria-label":"Nyilvános intézményi hírek"}},navigation,list);
  const showStory=(id)=>{
    const detail=detailNodes.get(id);
    if(!detail)return false;
    detail.open=true;
    const article=detail.parentNode;
    article.classList.add("is-targeted");
    // A hivatkozás célja szemantikus cím: közvetlenül az eredeti tartalomra lép a fókusz.
    const title=article.querySelector?.("h2");
    title?.setAttribute("tabindex","-1");
    title?.focus?.({preventScroll:true});
    article.scrollIntoView?.({block:"center",behavior:"instant"});
    return true;
  };
  return {section,showStory,destroy(){}};
}
