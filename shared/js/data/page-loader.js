import {fetchJSON} from "./json-transport.js?v=2.84";
import {validatePageContent} from "../menu-data.js?v=2.84";
import {recordDataLoad} from "../layout-health.js?v=2.84";
const pending=new WeakMap();
const base=new URL("../../data/",import.meta.url);
export async function ensurePage(config,routeId){
 if(config.pagePreview?.schema!=="split-1")return;
 const id=config.pagePreview.localPages.find(p=>p.id===routeId)?.parentId||routeId;
 const meta=config.pagePreview.catalog[id];
 if(!meta||!Object.hasOwn(config.pagePreview.catalog,id)||!/^[a-z0-9-]+$/.test(id))throw Error("Ismeretlen oldalazonosító.");
 if(Object.hasOwn(config.pagePreview.pages,id))return config.pagePreview.pages[id];
 let cache=pending.get(config);if(!cache){cache=new Map();pending.set(config,cache);}
 if(cache.has(id))return cache.get(id);
 const task=(async()=>{
 try{const u=new URL(`pages/${id}.json`,base);u.searchParams.set("v",config.release);const {data,bytes,elapsed}=await fetchJSON(u,{maxBytes:1000000});
 if(data.release!==config.release||data.id!==id||!Array.isArray(data.items)||data.items.length!==meta.cardCount)throw Error("Oldalverzió vagy tartalom eltér.");
 const {cardCount,highlights,...fields}=meta;const page={...fields,items:data.items};validatePageContent(config,id,page);config.pagePreview.pages[id]=page;recordDataLoad("page",id,bytes,elapsed);return page;
 }catch(error){recordDataLoad("page",id,0,0,false);throw error;}})();
 cache.set(id,task);try{return await task;}finally{if(cache.get(id)===task)cache.delete(id);}
}
