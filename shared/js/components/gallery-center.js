import {registerAdaptiveState} from "../state/component-state.js?v=2.71";
import { element } from "../dom.js?v=2.71";
import { checkedMediaCenter, mediaResults } from "../media-data.js?v=2.71";
import { createGalleryDialog } from "../gallery-dialog.js?v=2.71";
import { createAlbumControls, groupedCards, cardImage, allowLocalMediaEditor, createPremiumAlbumShowcase } from "../gallery-ui.js?v=2.71";
import { createMediaEditor } from "../media-editor.js?v=2.71";
const el=element;
export function createMediaCenter(config,platform){
  const settings=checkedMediaCenter(config);
  let category="all",query="",limit=settings[platform+"InitialCount"];
  const selections={sport:"all",schoolYear:"all",event:"all",groupBy:"none"};
  // Külső, előnézeti oldalról nyitott album engedélyezett azonosítóval indul.
  const incoming=new URLSearchParams(location.search).get("album")||"";
  const initial=/^(sport|schoolYear|event):([a-z0-9-]+)$/.exec(incoming);
  if(initial && config.mediaCenter.albums[initial[1]].some(a=>a.id===initial[2]&&a.coverId))
    selections[initial[1]]=initial[2];
  const desktop=platform==="desktop";
  const section=el("section",{className:`${platform}-media-center`,attributes:{"aria-label":"Képgaléria és médiaközpont"}});
  const gallery=createGalleryDialog(section,platform);
  const resultCount=el("p",{className:desktop?"desktop-media-counter":"mobile-media-count",attributes:{role:"status","aria-live":"polite"}});
  const search=el("input",{className:`${platform}-media-search form-control`,attributes:{type:"search",...(desktop?{id:"desktop-media-search",autocomplete:"off"}:{}),placeholder:settings.searchPlaceholder,"aria-label":settings.searchLabel}});
  const categories=el("div",{className:`${platform}-media-filters`,attributes:{role:"group","aria-label":"Képkategóriák"}});
  const cards=el("div",{className:`${platform}-media-grid`});
  const more=el("button",{className:`${platform}-media-more btn`,text:"További képek",attributes:{type:"button"}});
  const reset=()=>{limit=settings[platform+"InitialCount"];render();};
  const showcase=createPremiumAlbumShowcase(config,platform,selection=>{
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
  const albums=createAlbumControls(config,platform,(key,value)=>{if(key==="reset")for(const dim in selections)selections[dim]=dim==="groupBy"?"none":"all";else selections[key]=value;reset();});
  for(const c of settings.categories) {
    const button=el("button",{className:`${platform}-media-filter`,text:c.label,attributes:{type:"button","data-category":c.id,"aria-pressed":String(category===c.id)}});
    button.addEventListener("click",()=>{category=c.id;reset();}); categories.append(button);
  }
  search.addEventListener("input",()=>{query=search.value;reset();});
  more.addEventListener("click",()=>{limit+=settings.loadStep;render();});
  function render(){
    const results=mediaResults(config,{category,query,...selections}),shown=results.slice(0,limit);
    categories.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.category===category)));
    cards.replaceChildren(...groupedCards(config,results,shown,selections.groupBy,(item,i)=>{
      const caption=desktop?el("span",{className:"desktop-media-card-caption"},el("strong",{text:item.title}),el("small",{text:settings.categories.find(c=>c.id===item.category)?.label||""})):el("span",{className:"mobile-media-tile-text",text:item.title});
      const button=el("button",{className:desktop?"desktop-media-card":"mobile-media-tile",attributes:{type:"button","aria-label":`Kép megnyitása: ${item.title}`}},cardImage(item),caption);
      button.addEventListener("click",()=>gallery.show(results,i,button));return button;
    }));
    if(!results.length)cards.append(el("p",{className:`${platform}-media-empty`,text:desktop?"Nincs a keresésnek megfelelő kép. Próbálj másik kifejezést vagy albumot.":"Nincs ilyen kép. Válassz másik kategóriát vagy albumot!"}));
    resultCount.textContent=`${shown.length} / ${results.length} kép`;more.hidden=shown.length>=results.length;
  }
  const controls=desktop?[el("div",{className:"desktop-media-toolbar"},el("label",{className:"visually-hidden",text:settings.searchLabel,attributes:{for:"desktop-media-search"}}),search,categories)]:[search,categories];
  section.append(showcase.wrapper,el("section",{className:`${platform}-media-browser`,attributes:{"aria-label":"Képek keresése és szűrése"}},el("h2",{className:"media-browser-title",text:"Képek keresése és szűrése"}),...controls,albums.group,resultCount,cards,more));
  const editor=allowLocalMediaEditor()?createMediaEditor(section,config,reset):null;
  render();if(initial)showcase.openById(initial[1],initial[2]);
  registerAdaptiveState(section,'gallery',{canSwitch:()=>!section.querySelector('.media-editor-dialog[open]'),snapshot:()=>({category,query,limit,selections:{...selections},showcase:showcase.snapshot(),gallery:gallery.snapshot(),editor:editor?.snapshot()}),restore:state=>{category=state.category;query=state.query;limit=state.limit;Object.assign(selections,state.selections);search.value=query;for(const [k,field] of Object.entries(albums.fields))field.value=selections[k];showcase.restoreState(state.showcase);render();editor?.restore(state.editor);if(state.gallery){const data=mediaResults(config,{category,query,...selections});const item=data.find(i=>i.id===state.gallery.id);const trigger=[...section.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Kép megnyitása: '+item?.title);gallery.restoreState(state.gallery,data,trigger);}}});
  return {section,destroy(){gallery.destroy();editor?.destroy();}};
}
