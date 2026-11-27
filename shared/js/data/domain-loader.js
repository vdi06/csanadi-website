import {checkedCalendar} from "../calendar-data.js?v=2.71";
import {checkedDocumentCenter} from "../document-data.js?v=2.71";
import {checkedMediaCenter} from "../media-data.js?v=2.71";
import {recordDataLoad} from "../layout-health.js?v=2.71";
import {expandMediaCatalog} from "./media-catalog.js?v=2.71";
export const DOMAIN_FILES=Object.freeze({news:"news/public.json",calendar:"calendar/school-year.json",documents:"documents/catalog.json",media:"media/catalog.json"});
const base=new URL("../../data/",import.meta.url), pending=new WeakMap();
export function assembleDomains(config, records){
 for(const id of Object.keys(DOMAIN_FILES)){const r=records[id];if(!r||r.id!==id||r.release!==config.release||r.schema!=="domain-1"||!r.data||typeof r.data!=="object")throw Error("Hibás adatkör: "+id);}
 if(!Array.isArray(records.news.data))throw Error("Hibás hírlista");
 const full={...config,publicNews:records.news.data,home:{...config.home,calendar:records.calendar.data},documentCenter:records.documents.data,mediaCenter:expandMediaCatalog(records.media.data)};
 checkedCalendar(full);checkedDocumentCenter(full);checkedMediaCenter(full);return full;
}
export async function hydrateDomains(config){
 if(config.gateOnly)return config;
 if(config.domains?.schema!=="domain-1"||Object.keys(config.domains.files||{}).length!==4||Object.entries(DOMAIN_FILES).some(([id,path])=>config.domains.files[id]!==path))throw Error("Érvénytelen adatkörjegyzék");
 if(pending.has(config))return pending.get(config);
 const job=Promise.all(Object.entries(DOMAIN_FILES).map(async ([id,path])=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000),start=performance.now();try{const u=new URL(path,base);u.searchParams.set("v",config.release);const response=await fetch(u,{signal:controller.signal});if(!response.ok)throw Error("Adatkör HTTP "+response.status);const text=await response.text(),record=JSON.parse(text);if(record.id!==id||record.release!==config.release||record.schema!=="domain-1")throw Error("Adatkör kiadása eltér");recordDataLoad("domain",id,new TextEncoder().encode(text).length,performance.now()-start);return [id,record];}catch(error){recordDataLoad("domain",id,0,0,false);throw error;}finally{clearTimeout(timer);}})).then(entries=>assembleDomains(config,Object.fromEntries(entries)));
 pending.set(config,job);try{return await job;}finally{pending.delete(config);}
}
