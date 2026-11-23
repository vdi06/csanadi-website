import { element } from "../shared/js/dom.js?v=2.53";
import { checkedMediaCenter, mediaResults } from "../shared/js/media-data.js?v=2.53";
import { createGalleryDialog } from "../shared/js/gallery-dialog.js?v=2.53";
import { createAlbumControls, groupedCards, cardImage, allowLocalMediaEditor, createPremiumAlbumShowcase } from "../shared/js/gallery-ui.js?v=2.53";
import { createMediaEditor } from "../shared/js/media-editor.js?v=2.53";
const el=element;
export function createDesktopMedia(config) {
  const settings=checkedMediaCenter(config);
  let category="all",query="",limit=settings.desktopInitialCount;
  const selections={sport:"all",schoolYear:"all",event:"all",groupBy:"none"};
  // Külső, előnézeti oldalról nyitott album engedélyezett azonosítóval indul.
  const incoming=new URLSearchParams(location.search).get("album")||"";
  const initial=/^(sport|schoolYear|event):([a-z0-9-]+)$/.exec(incoming);
  if(initial && config.mediaCenter.albums[initial[1]].some(a=>a.id===initial[2]&&a.coverId))
    selections[initial[1]]=initial[2];
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
  const showcase=createPremiumAlbumShowcase(config,"desktop",selection=>{
    for(const key of Object.keys(selections))selections[key]=key==="groupBy"?"none":"all";
    category="all";query="";search.value="";
    if(selection)selections[selection.dimension]=selection.id;
    for(const [key,field] of Object.entries(albums.fields))field.value=selections[key];
    const u=new URL(location.href);
    if(selection)u.searchParams.set("album",`${selection.dimension}:${selection.id}`);
    else u.searchParams.delete("album");
    history.replaceState(history.state,"",u);reset();
    if(selection)cards.scrollIntoView?.({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"});
  });
  const albums=createAlbumControls(config,"desktop",(key,value)=>{if(key==="reset")for(const dim in selections)selections[dim]=dim==="groupBy"?"none":"all";else selections[key]=value;reset();});
  for(const c of settings.categories) {
    const button=el("button",{className:"desktop-media-filter",text:c.label,attributes:{type:"button","data-category":c.id,"aria-pressed":String(category===c.id)}});
    button.addEventListener("click",()=>{category=c.id;reset();}); categories.append(button);
  }
  search.addEventListener("input",()=>{query=search.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.loadStep;render();});
  function render(){
    const results=mediaResults(config,{category,query,...selections});
    categories.querySelectorAll("button").forEach((b)=>b.setAttribute("aria-pressed",String(b.dataset.category===category)));
    const shown=results.slice(0,limit);
    cards.replaceChildren(...groupedCards(config,results,shown,selections.groupBy,(item,i)=>{
      const button=el("button",{className:"desktop-media-card",attributes:{type:"button","aria-label":`Kép megnyitása: ${item.title}`}},
        cardImage(item),
        el("span",{className:"desktop-media-card-caption"},el("strong",{text:item.title}),
          el("small",{text:settings.categories.find((c)=>c.id===item.category)?.label||""})));
      button.addEventListener("click",()=>gallery.show(results,i,button));return button;
    }));
    if(!results.length)cards.append(el("p",{className:"desktop-media-empty",text:"Nincs a keresésnek megfelelő kép. Próbálj másik kifejezést vagy albumot."}));
    resultCount.textContent=`${shown.length} / ${results.length} kép`;
    more.hidden=shown.length>=results.length;
  }
  section.append(showcase.wrapper,
    el("section",{className:"desktop-media-browser",attributes:{"aria-label":"Képek keresése és szűrése"}},
      el("h2",{className:"media-browser-title",text:"Képek keresése és szűrése"}),
      el("div",{className:"desktop-media-toolbar"},
        el("label",{className:"visually-hidden",text:settings.searchLabel,attributes:{for:"desktop-media-search"}}),search,
        categories),albums.group,resultCount,cards,more));
  const editor=allowLocalMediaEditor()?createMediaEditor(section,config,reset):null;
  render();
  if(initial)showcase.openById(initial[1],initial[2]);
  return {section,destroy(){gallery.destroy();editor?.destroy();}};
}
