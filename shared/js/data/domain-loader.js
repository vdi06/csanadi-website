import {fetchJSON} from "./json-transport.js?v=2.84";
import {checkedCalendar} from "../calendar-data.js?v=2.84";
import {checkedDocumentCenter} from "../document-data.js?v=2.84";
import {checkedMediaCenter} from "../media-data.js?v=2.84";
import {recordDataLoad} from "../layout-health.js?v=2.84";
import {expandMediaCatalog} from "./media-catalog.js?v=2.84";
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
 const job=requestDomain(config,id);
 records.set(id,job);try{return await job;}catch(error){if(records.get(id)===job)records.delete(id);throw error;}
}
// A frissítő olvasás nem írja felül a már érvényesített teljes konfigurációt.
const revalidating=new WeakMap();
function requestDomain(config,id,refresh=false){
 return (async()=>{try{const u=new URL(DOMAIN_FILES[id],base);u.searchParams.set('v',config.release);const {data:record,bytes,elapsed}=await fetchJSON(u,{refresh});if(record.id!==id||record.release!==config.release||record.schema!=="domain-1"||!record.data||typeof record.data!=="object"||(id==='news'&&!Array.isArray(record.data)))throw Error("Hibás adatkör");recordDataLoad("domain",id,bytes,elapsed);return record;}catch(error){recordDataLoad("domain",id,0,0,false);throw error;}})();
}
export async function revalidateDomain(config,id){
 checkManifest(config);if(!Object.hasOwn(DOMAIN_FILES,id))throw Error("Ismeretlen adatkör");
 let jobs=revalidating.get(config);if(!jobs){jobs=new Map();revalidating.set(config,jobs);}
 if(jobs.has(id))return jobs.get(id);
 const job=requestDomain(config,id,true);jobs.set(id,job);try{return await job;}finally{if(jobs.get(id)===job)jobs.delete(id);}
}
export async function hydrateDomains(config){
 if(config.gateOnly)return config;checkManifest(config);if(pending.has(config))return pending.get(config);
 const job=Promise.allSettled(Object.keys(DOMAIN_FILES).map(async id=>[id,await loadDomain(config,id)])).then(results=>{const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;try{return assembleDomains(config,Object.fromEntries(results.map(r=>r.value)));}catch(error){recordsCache.delete(config);throw error;}});
 pending.set(config,job);try{return await job;}finally{pending.delete(config);}
}

// A dokumentumkatalógus nem szükséges a normál navigációhoz.
// A teljes validálás továbbra is rendelkezésre áll a kiadás előtti ellenőrzéshez.
export async function hydrateStartupDomains(config){
 if(config.gateOnly)return config;checkManifest(config);
 const ids=['news','calendar','media'];const records=Object.fromEntries(await Promise.all(ids.map(async id=>[id,await loadDomain(config,id)])));
 const full={...config,publicNews:records.news.data,home:{...config.home,calendar:records.calendar.data},mediaCenter:expandMediaCatalog(records.media.data)};
 checkedCalendar(full);checkedMediaCenter(full);return full;
}
const documentsPending=new WeakMap();
export async function ensureDocuments(config){
 if(config.documentCenter)return checkedDocumentCenter(config);
 if(documentsPending.has(config))return documentsPending.get(config);
 const job=(async()=>{const record=await loadDomain(config,'documents');const checked=checkedDocumentCenter({...config,documentCenter:record.data});config.documentCenter=checked;return checked;})();
 documentsPending.set(config,job);try{return await job;}catch(error){recordsCache.get(config)?.delete('documents');throw error;}finally{if(documentsPending.get(config)===job)documentsPending.delete(config);}
}
