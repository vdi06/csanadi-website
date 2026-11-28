import {GALLERY_WIDTHS, galleryVariants} from "./data/media-catalog.js?v=2.81";
import {dataSaving, adaptiveBreakpoints} from "./layout-controller.js?v=2.81";
const validText=(s,max=350)=>typeof s==="string"&&s.trim().length>0&&s.length<=max;
const id=/^[a-z0-9-]+$/;
const acceptedSource=/^\.\/shared\/assets\/media\/web\/(?:desktop-hero|mobile-story|sport-successes|imported)\/[a-z0-9-]+\.webp$/;
const variants=GALLERY_WIDTHS;
export const albumDimensions=["sport","schoolYear","event"];
/** A szerkesztési és a nyilvános megjelenítési adatokat ugyanaz a validátor ellenőrzi. */
export function checkedMediaCenter(config) {
  const media=config.mediaCenter;
  if (!media || !["eyebrow","searchLabel","searchPlaceholder","detailsLabel","note","albumInfo","editorNotice"]
    .every((key)=>validText(media[key],650)) ||
    !Array.isArray(media.categories) || media.categories.length<2 ||
    !Array.isArray(media.items) || media.items.length<6 ||
    !Number.isInteger(media.desktopInitialCount)||media.desktopInitialCount<1||
    !Number.isInteger(media.mobileInitialCount)||media.mobileInitialCount<1||
    !Number.isInteger(media.loadStep)||media.loadStep<1) throw new Error("Érvénytelen médiaközpont.");
  const categories=new Set(), ids=new Set(), albumKeys={};
  for (const cat of media.categories) {
    if (!cat||!id.test(cat.id||"")||categories.has(cat.id)||!validText(cat.label,60))
      throw new Error("Érvénytelen médiakategória.");
    categories.add(cat.id);
  }
  if (!categories.has("all")) throw new Error("Az összes kép kategória hiányzik.");
  for (const dimension of albumDimensions) {
    const opts=media.albums?.[dimension];
    if(!Array.isArray(opts)||opts.length<2)throw new Error(`Hiányzó albumlista: ${dimension}`);
    const keys=new Set();
    for(const entry of opts){
      if(!entry||!id.test(entry.id||"")||keys.has(entry.id)||!validText(entry.label,90))
        throw new Error(`Hibás albumlista: ${dimension}`);
      keys.add(entry.id);
    }
    if(!keys.has("all")||!keys.has("nincs"))throw new Error(`Hiányos albumlista: ${dimension}`);
    albumKeys[dimension]=keys;
    for(const entry of opts.filter(a=>a.id!=="all")) {
      if(entry.coverId!==undefined && (!id.test(entry.coverId)||!validText(entry.description,250)||typeof entry.featured!=="boolean"||
        entry.cover!==`./shared/assets/media/gallery/covers/${dimension}-${entry.id}.webp`))
        throw new Error(`Érvénytelen albumborító: ${dimension}/${entry.id}`);
    }
  }
  const pages=new Set(config.menu.items.flatMap((root)=>root.children?.map((p)=>`#/oldal/${p.id}`)||[]));
  for (const item of media.items) {
    if (!item||!id.test(item.id||"")||ids.has(item.id)||!categories.has(item.category)||
      item.category==="all"||!["title","alt","caption"].every((key)=>validText(item[key]))||
      !acceptedSource.test(item.src||"")||!pages.has(item.href)||!([undefined,"draft","published"].includes(item.publication))||!(["illustration","verified"].includes(item.provenance))||
      !item.album || albumDimensions.some((dimension)=>
        !albumKeys[dimension].has(item.album[dimension])||item.album[dimension]==="all")||
      !item.responsive||variants.some((w)=>item.responsive[String(w)]!==
        galleryVariants(item.id)[String(w)])) {
      throw new Error(`Érvénytelen médiabejegyzés: ${item?.id||"ismeretlen"}`);
    }
    if(item.provenance==="verified"&&item.publication==="published"&&
      (!validText(item.sourceNote,500)||item.rightsConfirmed!==true||
       !/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt||"")))
      throw new Error(`A kép publikálásához forrás- és jogellenőrzés szükséges: ${item.id}`);
    ids.add(item.id);
  }
  for(const dimension of albumDimensions)for(const entry of media.albums[dimension]){
    if(!entry.coverId)continue;
    const cover=media.items.find(i=>i.id===entry.coverId);
    if(!cover||cover.album[dimension]!==entry.id||cover.publication==="draft")
      throw new Error(`Érvénytelen albumborító-hivatkozás: ${dimension}/${entry.id}`);
  }
  return media;
}
export function normalizeMediaText(value) {
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLocaleLowerCase("hu-HU").trim();
}
export function mediaResults(config,{category="all",query="",sport="all",schoolYear="all",event="all"}={}) {
  const media=checkedMediaCenter(config);
  if (!media.categories.some((c)=>c.id===category)) category="all";
  const selection={sport,schoolYear,event};
  for(const dimension of albumDimensions)
    if(!media.albums[dimension].some((a)=>a.id===selection[dimension])) selection[dimension]="all";
  const tokens=normalizeMediaText(query).split(/\s+/).filter(Boolean).slice(0,8);
  const labels=Object.fromEntries(albumDimensions.map(d=>[d,new Map(media.albums[d].map(a=>[a.id,a.label]))]));
  return media.items.filter((item)=>item.publication!=="draft" && (category==="all"||item.category===category) &&
    albumDimensions.every((d)=>selection[d]==="all"||item.album[d]===selection[d])&&
    tokens.every((term)=>normalizeMediaText([
      item.title,item.alt,item.caption,item.category,...albumDimensions.map(d=>labels[d].get(item.album[d]))
    ].join(" ")).includes(term)));
}
/** A nézet albumcsoportjai ugyanazokból a szűrt képekből állnak. */
export function mediaGroups(config,items,groupBy="none"){
  const media=checkedMediaCenter(config);
  if(!albumDimensions.includes(groupBy))return [{id:"all",label:"Összes kép",items}];
  return media.albums[groupBy].filter(a=>a.id!=="all")
    .map(a=>({id:a.id,label:a.label,items:items.filter(i=>i.album[groupBy]===a.id)}))
    .filter(a=>a.items.length>0);
}
export function responsiveImageAttributes(item,stage=false){
  const [small,mobile,tablet]=adaptiveBreakpoints();const candidates=dataSaving()?[400,800]:[400,800,1280];return {src:item.responsive[stage&&!dataSaving()?"1280":"400"],srcset:candidates.map(w=>`${item.responsive[String(w)]} ${w}w`).join(", "),sizes:stage?`(max-width: ${mobile-1}px) 94vw, (max-width: ${tablet-1}px) 78vw, 900px`:`(max-width: ${small-1}px) 95vw, (max-width: ${mobile-1}px) 47vw, (max-width: ${tablet-1}px) 43vw, 340px`,width:1280,height:720,decoding:"async"};
}

/** 2.46: csak ténylegesen publikálható képekhez készül borító és képszámláló. */
export function premiumAlbumCards(config,{featuredOnly=false,dimension="all"}={}){
  const media=checkedMediaCenter(config);
  return albumDimensions.filter(d=>dimension==="all"||d===dimension).flatMap(dim=>
    media.albums[dim].filter(a=>a.id!=="all"&&a.coverId&&(!featuredOnly||a.featured)).map(a=>{
      const items=media.items.filter(i=>i.album[dim]===a.id&&i.publication!=="draft");
      const cover=items.find(i=>i.id===a.coverId);
      return cover?{dimension:dim,id:a.id,label:a.label,description:a.description,featured:a.featured,
        count:items.length,cover,coverSrc:a.cover,sharePath:`./share/album/${dim}/${a.id}/`}:null;
    }).filter(Boolean).filter(a=>a.count>0));
}
