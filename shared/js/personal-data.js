import { reservedWidgetPages } from "./carousel-data.js?v=2.71";
/** Validate the local dashboard and help configuration before mounting either platform. */
export function validatePersonalData(config){
 const ids=new Set([...config.menu.items.flatMap(g=>g.children.map(p=>p.id)),...config.pagePreview.localPages.map(p=>p.id)]);
 reservedWidgetPages(config); // A főfülek és a deklarált útvonalak korai ellenőrzése.
 const w=config.home.widgets,h=config.home.help,header=config.home.header;
 const text=(v,max=400)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 if(!w||!text(w.title,60)||!text(w.intro)||!Number.isInteger(w.maxItems)||w.maxItems<1||w.maxItems>24||!Array.isArray(w.defaults)||w.defaults.length>w.maxItems||new Set(w.defaults).size!==w.defaults.length||w.defaults.some(id=>!ids.has(id))||!config.menu.items.every(g=>text(w.icons?.[g.id],12)))throw Error('Hibás személyes kezdőlap konfiguráció.');
 if(!h||!text(h.title,80)||!text(h.intro)||!text(header.helpGlyph,12)||!text(header.helpLabel,100)||!Array.isArray(h.categories)||!h.categories.length||h.categories.some(c=>!text(c,80))||new Set(h.categories).size!==h.categories.length||!Array.isArray(h.topics)||!h.topics.length||new Set(h.topics.map(t=>t.title)).size!==h.topics.length||h.topics.some(t=>!text(t.title,150)||!h.categories.includes(t.category)||!text(t.keywords)||!Array.isArray(t.steps)||!t.steps.length||t.steps.some(s=>!text(s,800))||(t.page!==undefined&&!ids.has(t.page))))throw Error('Hibás használati útmutató konfiguráció.');
 return true;
}
