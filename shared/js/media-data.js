const validText=(s,max=350)=>typeof s==="string"&&s.trim().length>0&&s.length<=max;
const id=/^[a-z0-9-]+$/;
const acceptedSource=/^\.\/shared\/assets\/media\/web\/(?:desktop-hero|mobile-story|sport-successes)\/[a-z0-9-]+\.webp$/;

/** Csak az ellenőrzött, csomagban lévő WebP médiák engedélyezettek. */
export function checkedMediaCenter(config) {
  const media=config.mediaCenter;
  if (!media || !["eyebrow","searchLabel","searchPlaceholder","detailsLabel","note"]
    .every((key)=>validText(media[key],650)) ||
    !Array.isArray(media.categories) || media.categories.length<2 ||
    !Array.isArray(media.items) || media.items.length<6 ||
    !Number.isInteger(media.desktopInitialCount)||media.desktopInitialCount<1||
    !Number.isInteger(media.mobileInitialCount)||media.mobileInitialCount<1||
    !Number.isInteger(media.loadStep)||media.loadStep<1) throw new Error("Érvénytelen médiaközpont.");
  const categories=new Set(), ids=new Set();
  for (const cat of media.categories) {
    if (!cat||!id.test(cat.id||"")||categories.has(cat.id)||!validText(cat.label,60))
      throw new Error("Érvénytelen médiakategória.");
    categories.add(cat.id);
  }
  if (!categories.has("all")) throw new Error("Az összes kép kategória hiányzik.");
  const pages=new Set(config.menu.items.flatMap((root)=>root.children?.map((p)=>`#/oldal/${p.id}`)||[]));
  for (const item of media.items) {
    if (!item||!id.test(item.id||"")||ids.has(item.id)||!categories.has(item.category)||
      item.category==="all"||!["title","alt","caption"].every((key)=>validText(item[key]))||
      !acceptedSource.test(item.src||"")||!pages.has(item.href)) {
      throw new Error(`Érvénytelen médiabejegyzés: ${item?.id||"ismeretlen"}`);
    }
    ids.add(item.id);
  }
  return media;
}
export function normalizeMediaText(value) {
  return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLocaleLowerCase("hu-HU").trim();
}
export function mediaResults(config,{category="all",query=""}={}) {
  const media=checkedMediaCenter(config);
  if (!media.categories.some((c)=>c.id===category)) category="all";
  const tokens=normalizeMediaText(query).split(/\s+/).filter(Boolean).slice(0,8);
  return media.items.filter((item)=> (category==="all"||item.category===category) &&
    tokens.every((term)=>normalizeMediaText(`${item.title} ${item.alt} ${item.caption} ${item.category}`).includes(term)));
}
