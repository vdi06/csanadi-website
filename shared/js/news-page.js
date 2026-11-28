import { element } from "./dom.js?v=2.83";
import { menuPageHref } from "./menu-data.js?v=2.83";
import { newsDateLabel, newsStoryHref, publicNewsForPage, newsProvenance } from "./news-panel.js?v=2.83";
import { calendarEntries } from "./calendar-data.js?v=2.83";

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
  const detailNodes=new Map(), cards=new Map();
  const dateOf=(record)=>record.endDate ? `${newsDateLabel(record.date)} – ${newsDateLabel(record.endDate)}`
    :newsDateLabel(record.date);
  const today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Budapest",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  function cardFor(record) {
    if(cards.has(record.id))return cards.get(record.id);
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
    cards.set(record.id,article);
    if(platform==="mobile")article.addEventListener("click",e=>{if(!e.target.closest("a,button,summary,details"))summary.click();});
    return article;
  }
  const search=element("input",{className:"feature-search",attributes:{type:"search",placeholder:"Hír keresése…","aria-label":"Hírek keresése"}});
  const categoryFilter=element("select",{attributes:{"aria-label":"Hírkategória"}},element("option",{text:"Minden kategória",attributes:{value:"all"}}),...[...new Set(records.flatMap(r=>r.tags))].map(t=>element("option",{text:spot.tagLabels[t]||t,attributes:{value:t}})));
  const provenance=element("select",{attributes:{"aria-label":"Hírek hitelessége"}},...[["verified","Ellenőrzött hírek"],["pending","Ellenőrzésre váró hírek"],["demo","Bemutatóadatok"],["all","Minden bejegyzés (mintákkal)"]].map(([v,t])=>element("option",{text:t,attributes:{value:v}})));
  if(requested) provenance.value=newsProvenance(requested);
  const sort=element("select",{attributes:{"aria-label":"Hírek rendezése"}},...[["new","Legújabb elöl"],["old","Legrégebbi elöl"],["title","Cím szerint"]].map(([v,t])=>element("option",{text:t,attributes:{value:v}})));
  const count=element("p",{className:"content-count",attributes:{role:"status"}}),more=element("button",{className:"content-action",text:"További hírek",attributes:{type:"button"}});
  const norm=x=>String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const step=platform==="mobile"?8:12;let limit=step;
  function draw(){const q=norm(search.value).split(/\s+/).filter(Boolean);const hits=records.filter(r=>(provenance.value==="all"||newsProvenance(r)===provenance.value)&&(categoryFilter.value==="all"||r.tags.includes(categoryFilter.value))&&q.every(w=>norm([r.title,r.summary,...r.details].join(" ")).includes(w)));if(sort.value==="old")hits.sort((a,b)=>a.date.localeCompare(b.date));if(sort.value==="title")hits.sort((a,b)=>a.title.localeCompare(b.title,"hu"));list.replaceChildren(...hits.slice(0,limit).map(cardFor));count.textContent=`${hits.length} találat · ${Math.min(hits.length,limit)} megjelenítve`;more.hidden=hits.length<=limit;if(!hits.length)list.append(element("p",{className:"school-news-empty",text:"Nincs találat a megadott szűrőkkel."}));}
  for(const el of [search,categoryFilter,sort,provenance])el.addEventListener(el===search?"input":"change",()=>{limit=step;draw();});more.addEventListener("click",()=>{limit+=step;draw();});
  const section=element("section",{className:`school-news-page school-news-page--${platform}${pageId==="news-announcements"?" school-news-page--announcements":""}`,attributes:{"aria-label":"Nyilvános intézményi hírek"}},navigation,element("div",{className:"content-filters"},search,categoryFilter,sort,provenance),element("p",{className:"content-count",text:"A bemutatóadatok és ellenőrzésre váró bejegyzések külön szűrővel érhetők el. Nem hivatalos közlemények."}),count,list,more);draw();
  const showStory=(id)=>{
    const record=records.find(r=>r.id===id);
    if(!record)return false;
    cardFor(record);
    const detail=detailNodes.get(id);
    if(!detail)return false;
    if(!detail.isConnected){search.value="";categoryFilter.value="all";provenance.value=newsProvenance(records.find(r=>r.id===id));sort.value="new";limit=Math.max(limit,records.findIndex(r=>r.id===id)+1);draw();}
    const article=detail.parentNode;
    article.classList.add("is-targeted");
    // A hivatkozás célja szemantikus cím: közvetlenül az eredeti tartalomra lép a fókusz.
    const title=article.querySelector?.("h2");
    title?.setAttribute("tabindex","-1");
    title?.focus?.({preventScroll:true});
    article.scrollIntoView?.({block:"center",behavior:"instant"});
    if(platform==="mobile")detail.querySelector("summary").click();else detail.open=true;
    return true;
  };
  section.dataset.adaptiveState='news';section.adaptiveSnapshot=()=>({query:search.value,category:categoryFilter.value,sort:sort.value,provenance:provenance.value,limit,open:[...detailNodes].filter(([id,n])=>n.open).map(([id])=>id)});section.adaptiveRestore=state=>{search.value=state.query;categoryFilter.value=state.category;sort.value=state.sort;provenance.value=state.provenance;limit=state.limit;draw();for(const id of state.open)if(detailNodes.has(id))detailNodes.get(id).open=true;};
  return {section,showStory,destroy(){}};
}
