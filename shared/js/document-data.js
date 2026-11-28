import {fold} from "./components/search-text.js?v=2.81";
/** Kiadás előtt ellenőrzött helyi dokumentumregiszter, nem külső dokumentumlinkek. */
const label=(v,max=500)=>typeof v==="string"&&v.trim().length>0&&v.length<=max;
const id=/^[a-z0-9-]+$/;
const localFile=/^\.\/shared\/assets\/documents\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(?:pdf|txt|png|jpg|webp)$/;
const validDate=(date)=>/^\d{4}-\d{2}-\d{2}$/.test(date||"") &&
  !Number.isNaN(Date.parse(`${date}T12:00:00Z`)) &&
  new Date(`${date}T12:00:00Z`).toISOString().startsWith(date);
export function checkedDocumentCenter(config) {
  const src=config.documentCenter;
  if (!src||!label(src.eyebrow,100)||!label(src.intro,1000)||!label(src.searchPlaceholder,100)||
    !Array.isArray(src.categories)||src.categories.length<2||!Array.isArray(src.items)||
    !Number.isInteger(src.desktopPageSize)||src.desktopPageSize<1||
    !Number.isInteger(src.mobilePageSize)||src.mobilePageSize<1||
    !["title","date"].includes(src.defaultSort)) throw new Error("Hibás dokumentumközpont-beállítás.");
  const cats=new Set(), ids=new Set();
  for (const cat of src.categories) {
    if(!cat||!id.test(cat.id||"")||cats.has(cat.id)||!label(cat.label,80))throw new Error("Érvénytelen dokumentumkategória.");
    cats.add(cat.id);
  }
  if(!cats.has("all"))throw new Error("Az összes dokumentum kategória hiányzik.");
  for(const item of src.items){
    if(!item||!id.test(item.id||"")||ids.has(item.id)||!cats.has(item.category)||item.category==="all"||
      !label(item.title,160)||!label(item.summary,900)||!["pdf","txt","png","jpg","webp"].includes(item.kind)||
      !["available","pending"].includes(item.status)||!Array.isArray(item.tags)||item.tags.length<1||
      item.tags.some((t)=>!label(t,70))) throw new Error(`Érvénytelen dokumentum: ${item?.id||"ismeretlen"}`);
    if(item.status==="available") {
      if((item.pageTextSource!==undefined&&(item.pageTextSource!==true||item.kind!=="pdf"||!Number.isInteger(item.pageCount)||item.pageCount<1))||!localFile.test(item.file||"")||!item.file.endsWith(`.${item.kind}`)||!validDate(item.date)||
        (item.kind==="pdf"&&item.pages!==undefined&&(!Array.isArray(item.pages)||!item.pages.length||
          item.pages.some((p)=>!/^\.\/shared\/assets\/documents\/previews\/[a-z0-9_-]+\.webp$/.test(p))||
          item.pageCount!==item.pages.length)) ||
        (item.pageTexts!==undefined && (!Array.isArray(item.pageTexts)||item.pageTexts.length!==(item.pageCount||item.pages?.length)||
          item.pageTexts.some((t)=>!label(t,30000))))) throw new Error(`Hibás közzétett dokumentum: ${item.id}`);
    } else if(item.file!==undefined||item.pages!==undefined||item.pageTextSource!==undefined||item.date!==undefined) {
      throw new Error(`Feltöltésre váró dokumentumhoz nem tartozhat közzétett fájl: ${item.id}`);
    }
    ids.add(item.id);
  }
  return src;
}
export const normalizedDocumentText=(s)=>fold(s).trim();
export function documentResults(config,{query="",category="all",status="all",sort="title"}={}){
  const data=checkedDocumentCenter(config);
  if(!data.categories.some((c)=>c.id===category))category="all";
  if(!["all","available","pending"].includes(status))status="all";
  const terms=normalizedDocumentText(query).split(/\s+/).filter(Boolean).slice(0,12);
  return data.items.filter((d)=>(category==="all"||d.category===category)&&
    (status==="all"||status===d.status)&&
    terms.every((t)=>normalizedDocumentText([d.title,d.summary,...d.tags].join(" ")).includes(t)))
    .sort((a,b)=>sort==="date" ?
      (b.date||"").localeCompare(a.date||"")||a.title.localeCompare(b.title,"hu") :
      a.title.localeCompare(b.title,"hu"));
}
export function documentById(config,id){ return checkedDocumentCenter(config).items.find((d)=>d.id===id)||null; }
