import { element } from "../shared/js/dom.js?v=2.41";
import { checkedMediaCenter, mediaResults } from "../shared/js/media-data.js?v=2.41";
import { createGalleryDialog } from "../shared/js/gallery-dialog.js?v=2.41";
const el=element;
export function createDesktopMedia(config) {
  const settings=checkedMediaCenter(config);
  let category="all",query="",limit=settings.desktopInitialCount;
  const section=el("section",{className:"desktop-media-center",attributes:{"aria-label":"Képgaléria és médiaközpont"}});
  const gallery=createGalleryDialog(section,"desktop");
  const resultCount=el("p",{className:"desktop-media-counter",attributes:{role:"status","aria-live":"polite"}});
  const search=el("input",{className:"desktop-media-search form-control",attributes:{
    type:"search",id:"desktop-media-search",autocomplete:"off",placeholder:settings.searchPlaceholder,
    "aria-label":settings.searchLabel}});
  const categories=el("div",{className:"desktop-media-filters",attributes:{role:"group","aria-label":"Képkategóriák"}});
  const cards=el("div",{className:"desktop-media-grid"});
  const more=el("button",{className:"desktop-media-more btn",text:"További képek",attributes:{type:"button"}});
  const reset=()=>{limit=settings.desktopInitialCount;render();};
  for(const c of settings.categories) {
    const button=el("button",{className:"desktop-media-filter",text:c.label,attributes:{type:"button","data-category":c.id,"aria-pressed":String(category===c.id)}});
    button.addEventListener("click",()=>{category=c.id;reset();}); categories.append(button);
  }
  search.addEventListener("input",()=>{query=search.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.loadStep;render();});
  function render(){
    const results=mediaResults(config,{category,query});
    categories.querySelectorAll("button").forEach((b)=>b.setAttribute("aria-pressed",String(b.dataset.category===category)));
    const shown=results.slice(0,limit);
    cards.replaceChildren(...shown.map((item,i)=>{
      const button=el("button",{className:"desktop-media-card",attributes:{type:"button","aria-label":`Kép megnyitása: ${item.title}`}},
        el("img",{attributes:{src:item.src,alt:item.alt,loading:"lazy",decoding:"async",width:"1672",height:"941"}}),
        el("span",{className:"desktop-media-card-caption"},el("strong",{text:item.title}),
          el("small",{text:settings.categories.find((c)=>c.id===item.category)?.label||""})));
      button.addEventListener("click",()=>gallery.show(results,i,button));
      return button;
    }));
    if(!results.length)cards.append(el("p",{className:"desktop-media-empty",text:"Nincs a keresésnek megfelelő kép. Próbálj másik kifejezést vagy kategóriát."}));
    resultCount.textContent=`${shown.length} / ${results.length} kép`;
    more.hidden=shown.length>=results.length;
  }
  section.append(el("div",{className:"desktop-media-lead"},
    el("p",{className:"desktop-media-eyebrow",text:settings.eyebrow}),
    el("h2",{text:"Válogass képek és témák között"}),
    el("p",{text:settings.note})),
    el("div",{className:"desktop-media-toolbar"},
      el("label",{className:"visually-hidden",text:settings.searchLabel,attributes:{for:"desktop-media-search"}}),search,
      categories),resultCount,cards,more);
  render();return {section,destroy(){gallery.destroy();}};
}
