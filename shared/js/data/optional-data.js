import {recordDataLoad} from "../layout-health.js?v=2.82";
const cache=new WeakMap();
const paths=Object.freeze({help:"help/topics.json",documentAudit:"documents/release-audit.json"});
export async function optionalData(config,id){
 if(!Object.hasOwn(paths,id))throw Error("Ismeretlen adatkör.");
 let items=cache.get(config);if(!items){items=new Map();cache.set(config,items);}if(items.has(id))return items.get(id);
 const job=(async()=>{const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),8000),start=performance.now();try{
 const u=new URL('../../data/'+paths[id],import.meta.url);u.searchParams.set('v',config.release);const r=await fetch(u,{signal:ctl.signal});if(!r.ok)throw Error('Adatkör HTTP '+r.status);const text=await r.text(),data=JSON.parse(text);if(id==='help'?(data.release!==config.release||data.schema!=='help-1'||!Array.isArray(data.topics)):(data.to!==config.release||data.schema!=='local-document-audit-1'||!Array.isArray(data.items)||data.items.length>300||data.items.some(x=>typeof x.id!=='string'||!['unchanged','added','removed','changed'].includes(x.change))))throw Error('Hibás opcionális adat.');recordDataLoad('domain',id,new TextEncoder().encode(text).length,performance.now()-start);return data;
 }catch(e){recordDataLoad('domain',id,0,0,false);throw e;}finally{clearTimeout(timer);}})();items.set(id,job);try{return await job;}catch(e){items.delete(id);throw e;}
}