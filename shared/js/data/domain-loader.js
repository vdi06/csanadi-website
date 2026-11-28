import {checkedCalendar} from "../calendar-data.js?v=2.81";
import {checkedDocumentCenter} from "../document-data.js?v=2.81";
import {checkedMediaCenter} from "../media-data.js?v=2.81";
import {recordDataLoad} from "../layout-health.js?v=2.81";
import {expandMediaCatalog} from "./media-catalog.js?v=2.81";
export const DOMAIN_FILES=Object.freeze({news:"news/public.json",calendar:"calendar/school-year.json",documents:"documents/catalog.json",media:"media/catalog.json"});
const base=new URL("../../data/",import.meta.url), pending=new WeakMap(), recordsCache=new WeakMap();
export function assembleDomains(config, records){
 for(const id of Object.keys(DOMAIN_FILES)){const r=records[id];if(!r||r.id!==id||r.release!==config.release||r.schema!=="domain-1"||!r.data||typeof r.data!=="object")throw Error("Hibás adatkör: "+id);}
 if(!Array.isArray(records.news.data))throw Error("Hibás hírlista");
 const full={...config,publicNews:records.news.data,home:{...config.home,calendar:records.calendar.data},documentCenter:records.documents.data,mediaCenter:expandMediaCatalog(records.media.data)};
 checkedCalendar(full);checkedDocumentCenter(full);checkedMediaCenter(full);return full;
}
function checkManifest(config){
 if(config.domains?.schema!=="domain-1"||Object.keys(config.domains.files||{}).length!==4||Object.entries(DOMAIN_FILES).some(([id,path])=>config.domains.files[id]!==path))throw Error("Érvénytelen adatkörjegyzék");
}
// Request just one known domain. In-flight requests are coalesced by config identity.
// A failed request is never retained in the cache.
export async function loadDomain(config,id){
 checkManifest(config);if(!Object.hasOwn(DOMAIN_FILES,id))throw Error("Ismeretlen adatkör");
 let records=recordsCache.get(config);if(!records){records=new Map();recordsCache.set(config,records);}
 if(records.has(id))return records.get(id);
 const job=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000),start=performance.now();try{const u=new URL(DOMAIN_FILES[id],base);u.searchParams.set("v",config.release);const response=await fetch(u,{signal:controller.signal});if(!response.ok)throw Error("Adatkör HTTP "+response.status);const text=await response.text(),record=JSON.parse(text);if(record.id!==id||record.release!==config.release||record.schema!=="domain-1"||!record.data||typeof record.data!=="object"||(id==='news'&&!Array.isArray(record.data)))throw Error("Hibás adatkör");recordDataLoad("domain",id,new TextEncoder().encode(text).length,performance.now()-start);return record;}catch(error){recordDataLoad("domain",id,0,0,false);throw error;}finally{clearTimeout(timer);}})();
 records.set(id,job);try{return await job;}catch(error){if(records.get(id)===job)records.delete(id);throw error;}
}
export async function hydrateDomains(config){
 if(config.gateOnly)return config;checkManifest(config);if(pending.has(config))return pending.get(config);
 const job=Promise.allSettled(Object.keys(DOMAIN_FILES).map(async id=>[id,await loadDomain(config,id)])).then(results=>{const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;try{return assembleDomains(config,Object.fromEntries(results.map(r=>r.value)));}catch(error){recordsCache.delete(config);throw error;}});
 pending.set(config,job);try{return await job;}finally{pending.delete(config);}
}
