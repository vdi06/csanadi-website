import { element } from "../shared/js/dom.js?v=2.48";
import { checkedMediaCenter, mediaResults } from "../shared/js/media-data.js?v=2.48";
import { createGalleryDialog } from "../shared/js/gallery-dialog.js?v=2.48";
import { createAlbumControls, groupedCards, cardImage, allowLocalMediaEditor, createPremiumAlbumShowcase } from "../shared/js/gallery-ui.js?v=2.48";
import { createMediaEditor } from "../shared/js/media-editor.js?v=2.48";
const el=element;
export function createMobileMedia(config) {
  const settings=checkedMediaCenter(config);
  let category="all",query="",limit=settings.mobileInitialCount;
  const selections={sport:"all",schoolYear:"all",event:"all",groupBy:"none"};
  // Külső, előnézeti oldalról nyitott album engedélyezett azonosítóval indul.
  const incoming=new URLSearchParams(location.search).get("album")||"";
  const initial=/^(sport|schoolYear|event):([a-z0-9-]+)$/.exec(incoming);
  if(initial && config.mediaCenter.albums[initial[1]].some(a=>a.id===initial[2]&&a.coverId))
    selections[initial[1]]=initial[2];
  const section=el("section",{className:"mobile-media-center",attributes:{"aria-label":"Képgaléria és médiaközpont"}});
  const gallery=createGalleryDialog(section,"mobile");
  const search=el("input",{className:"mobile-media-search form-control",attributes:{type:"search",
    placeholder:settings.searchPlaceholder,"aria-label":settings.searchLabel}});
  const filters=el("div",{className:"mobile-media-filters",attributes:{role:"group","aria-label":"Képkategóriák"}});
  const grid=el("div",{className:"mobile-media-grid"});
  const status=el("p",{className:"mobile-media-count",attributes:{role:"status","aria-live":"polite"}});
  const more=el("button",{className:"mobile-media-more btn",attributes:{type:"button"},text:"További képek"});
  const showcase=createPremiumAlbumShowcase(config,"mobile",selection=>{
    for(const key of Object.keys(selections))selections[key]=key==="groupBy"?"none":"all";
    category="all";query="";search.value="";
    if(selection)selections[selection.dimension]=selection.id;
    for(const [key,field] of Object.entries(albums.fields))field.value=selections[key];
    const u=new URL(location.href);
    if(selection)u.searchParams.set("album",`${selection.dimension}:${selection.id}`);
    else u.searchParams.delete("album");
    history.replaceState(history.state,"",u);reset();
    if(selection)grid.scrollIntoView?.({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"nearest"});
  });
  const albums=createAlbumControls(config,"mobile",(key,value)=>{if(key==="reset")for(const dim in selections)selections[dim]=dim==="groupBy"?"none":"all";else selections[key]=value;reset();});
  function render(){
    const results=mediaResults(config,{category,query,...selections}),shown=results.slice(0,limit);
    filters.querySelectorAll("button").forEach((b)=>b.setAttribute("aria-pressed",String(b.dataset.category===category)));
    grid.replaceChildren(...groupedCards(config,results,shown,selections.groupBy,(item,i)=>{
      const button=el("button",{className:"mobile-media-tile",attributes:{type:"button","aria-label":`Kép megnyitása: ${item.title}`}},
        cardImage(item),el("span",{className:"mobile-media-tile-text",text:item.title}));
      button.addEventListener("click",()=>gallery.show(results,i,button));return button;
    }));
    if(!results.length)grid.append(el("p",{className:"mobile-media-empty",text:"Nincs ilyen kép. Válassz másik kategóriát vagy albumot!"}));
    status.textContent=`${shown.length} / ${results.length} kép`;
    more.hidden=shown.length>=results.length;
  }
  function reset(){limit=settings.mobileInitialCount;render();}
  for(const cat of settings.categories){
    const button=el("button",{className:"mobile-media-filter",text:cat.label,attributes:{
      type:"button","data-category":cat.id,"aria-pressed":String(cat.id===category)}});
    button.addEventListener("click",()=>{category=cat.id;reset();});filters.append(button);
  }
  search.addEventListener("input",()=>{query=search.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.loadStep;render();});
  section.append(showcase.wrapper,
    el("section",{className:"mobile-media-browser",attributes:{"aria-label":"Képek keresése és szűrése"}},
      el("h2",{className:"media-browser-title",text:"Képek keresése és szűrése"}),
      search,filters,albums.group,status,grid,more));
  const editor=allowLocalMediaEditor()?createMediaEditor(section,config,reset):null;
  render();
  if(initial)showcase.openById(initial[1],initial[2]);
  return {section,destroy(){gallery.destroy();editor?.destroy();}};
}
