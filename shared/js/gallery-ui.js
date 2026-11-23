import { element } from "./dom.js?v=2.48";
import { albumDimensions, mediaGroups, responsiveImageAttributes, premiumAlbumCards } from "./media-data.js?v=2.48";
const el=element;
export function createAlbumControls(config,platform,change){
  const group=el("div",{className:`${platform}-album-controls media-album-controls`,attributes:{"aria-label":"Albumcsoportok és szűrők"}});
  const fields={};
  const choices=[
    {key:"sport",name:"Sportág",options:config.mediaCenter.albums.sport},
    {key:"schoolYear",name:"Tanév",options:config.mediaCenter.albums.schoolYear},
    {key:"event",name:"Rendezvény",options:config.mediaCenter.albums.event},
    {key:"groupBy",name:"Albumok megjelenítése",options:[
      {id:"none",label:"Egyetlen galéria"},{id:"sport",label:"Sportágak szerint"},
      {id:"schoolYear",label:"Tanév szerint"},{id:"event",label:"Rendezvény szerint"}]}];
  for(const option of choices){
    const select=el("select",{className:"media-album-select",attributes:{"aria-label":option.name}});
    for(const o of option.options)select.append(el("option",{text:o.label,attributes:{value:o.id}}));
    select.addEventListener("change",()=>change(option.key,select.value));fields[option.key]=select;
    group.append(el("label",{className:"media-album-field"},el("span",{text:option.name}),select));
  }
  const reset=el("button",{className:"media-album-reset",text:"Albumszűrők törlése",attributes:{type:"button"}});
  reset.addEventListener("click",()=>{for(const field of Object.values(fields))field.value=field.querySelector('option[value="none"]')?"none":"all";change("reset","");});
  group.append(reset);
  return {group,fields,reset};
}
export function groupedCards(config,items,shown,groupBy,cardFactory){
  if(groupBy==="none")return shown.map(item=>cardFactory(item,items.indexOf(item)));
  return mediaGroups(config,shown,groupBy).map(group=>el("section",{className:"media-album-section",attributes:{"aria-label":group.label}},
    el("h3",{className:"media-album-heading",text:`${group.label} · ${group.items.length} kép`}),
    el("div",{className:"media-album-items"},...group.items.map(item=>cardFactory(item,items.indexOf(item))))));
}
export function cardImage(item){return el("img",{attributes:{...responsiveImageAttributes(item),alt:item.alt,loading:"lazy",fetchpriority:"low"}});}
export function allowLocalMediaEditor(){
  return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)&&new URLSearchParams(location.search).has("media-editor");
}

/** 2.46: saját borító, kiemelés, képszám és animált albummegnyitás. */
export function createPremiumAlbumShowcase(config,platform,onOpen){
  const settings=config.mediaCenter.premiumAlbums;
  const wrapper=el("section",{className:`media-premium-showcase ${platform}-premium-showcase`,attributes:{"aria-label":"Képalbumok borítói"}});
  const heading=el("h2",{className:"media-premium-title",text:settings.title});
  const summary=el("p",{className:"media-premium-intro",text:settings.intro});
  const tabs=el("div",{className:"media-premium-tabs",attributes:{role:"group","aria-label":"Albumtípus kiválasztása"}});
  const grid=el("div",{className:"media-premium-grid"});
  const opened=el("div",{className:"media-premium-opened",attributes:{"aria-live":"polite"}});
  let dimension="featured",active=null;
  const labels={featured:"Kiemelt",sport:"Sportágak",schoolYear:"Tanévek",event:"Rendezvények",all:"Összes album"};
  function render(){
    tabs.replaceChildren(...Object.entries(labels).map(([key,label])=>{
      const button=el("button",{className:"media-premium-tab",text:label,attributes:{type:"button","aria-pressed":String(key===dimension)}});
      button.addEventListener("click",()=>{dimension=key;active=null;render();});return button;
    }));
    const albums=premiumAlbumCards(config,dimension==="featured"?{featuredOnly:true}:
      {dimension:dimension==="all"?"all":dimension});
    grid.replaceChildren(...albums.map(album=>{
      const cover=el("button",{className:`media-premium-cover${album.featured?" is-featured":""}`,
        attributes:{type:"button","aria-label":`${album.label} album megnyitása, ${album.count} kép`}},
        el("img",{attributes:{src:album.coverSrc,width:1200,height:690,decoding:"async",alt:`${album.label} – ${album.cover.provenance==="illustration"?"illusztrációs ":""}albumborító`,loading:"lazy"}}),
        el("span",{className:"media-premium-shade"},
          el("span",{className:"media-premium-tag",text:album.featured?"KIEMELT ALBUM":"KÉPALBUM"}),
          el("strong",{text:album.label}),
          el("span",{className:"media-premium-count",text:`${album.count} kép · Megnyitás`})));
      cover.addEventListener("click",()=>openAlbum(album));
      return el("div",{className:"media-premium-tile"},cover);
    }));
    grid.hidden=Boolean(active);tabs.hidden=Boolean(active);opened.replaceChildren();
    if(active){
      const back=el("button",{className:"media-premium-back",text:"← Vissza az albumokhoz",attributes:{type:"button"}});
      back.addEventListener("click",()=>{active=null;onOpen(null);render();});
      opened.append(back,el("p",{className:"media-premium-eyebrow",text:settings.openedLabel}),
        el("h3",{text:active.label}),el("p",{text:active.description}));
    }
    opened.hidden=!active;
  }
  function openAlbum(album){
    active=album;render();onOpen({dimension:album.dimension,id:album.id});
    if(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      wrapper.animate?.([{opacity:.72,transform:"translateY(9px)"},{opacity:1,transform:"translateY(0)"}],{duration:270,easing:"ease-out"});
  }
  function openById(dim,id){
    const album=premiumAlbumCards(config,{dimension:dim}).find(a=>a.id===id);
    if(!album)return false;
    openAlbum(album);return true;
  }
  wrapper.append(heading,summary,tabs,grid,opened);render();
  return {wrapper,openById,clear(){active=null;render();},getActive:()=>active};
}
