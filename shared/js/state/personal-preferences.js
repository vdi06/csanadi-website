const KEY='csanadi.personal-settings.v1';
export const PROFILES=Object.freeze({visitor:'Látogató',student:'Tanuló',parent:'Szülő',teacher:'Pedagógus'});
let memory=null;
export const cleanName=v=>typeof v==='string'?v.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,60):'';
export const HOME_ORDERS=Object.freeze({'default':['hero','carousel','numbers'],'numbers-first':['hero','numbers','carousel'],'carousel-hero-numbers':['carousel','hero','numbers'],'carousel-numbers-hero':['carousel','numbers','hero'],'numbers-hero-carousel':['numbers','hero','carousel'],'numbers-carousel-hero':['numbers','carousel','hero']});
export function sanitizePersonal(raw,allowed){
 const folders=Object.create(null), groups=Object.create(null);
 for(const [id,value] of Object.entries(raw?.folders||{}))if(allowed.has(id)&&cleanName(value))folders[id]=cleanName(value);
 for(const [id,value] of Object.entries(raw?.groups||{}))if(allowed.has(id)&&cleanName(value))groups[id]=cleanName(value);
 const heights=Object.create(null);for(const [id,value] of Object.entries(raw?.heights||{}))if(allowed.has(id)&&Number.isInteger(value)&&value>=100&&value<=360&&value%20===0)heights[id]=value;
 const charts=Object.create(null);for(const [id,types] of Object.entries({documents:['bar','pie','donut','table'],collections:['bar','pie','donut','table'],schoolYears:['bar','line','table']}))if(types.includes(raw?.charts?.[id]))charts[id]=raw.charts[id];
 const widths=Object.create(null);for(const [id,value] of Object.entries(raw?.widths||{}))if(allowed.has(id)&&Number.isInteger(value)&&value>=40&&value<=100&&value%5===0)widths[id]=value;
 const chartSeries=Object.create(null);for(const id of ['documents','collections','schoolYears'])if(Array.isArray(raw?.chartSeries?.[id])&&raw.chartSeries[id].length<=60&&raw.chartSeries[id].every(x=>typeof x==='string'&&x.length<=150))chartSeries[id]=[...new Set(raw.chartSeries[id])];
 const groupOrder=Array.isArray(raw?.groupOrder)?[...new Set(raw.groupOrder.map(cleanName).filter(Boolean))].slice(0,66):[];
 const defaultChartOrder=['documents','collections','sports'];const chartOrder=Array.isArray(raw?.chartOrder)&&raw.chartOrder.length===3&&new Set(raw.chartOrder).size===3&&raw.chartOrder.every(x=>defaultChartOrder.includes(x))?[...raw.chartOrder]:defaultChartOrder;
 return {version:1,charts,heights,widths,chartSeries,groupOrder,chartOrder,profile:Object.hasOwn(PROFILES,raw?.profile)?raw.profile:'visitor',folders,groups,homeOrder:Object.hasOwn(HOME_ORDERS,raw?.homeOrder)?raw.homeOrder:'default'};
}
export function allowedPages(config){return new Set([...config.menu.items.flatMap(g=>g.children.map(p=>p.id)),...config.pagePreview.localPages.map(p=>p.id)]);}
export function getPersonal(config){let raw=memory;try{if(!raw)raw=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}return sanitizePersonal(raw,allowedPages(config));}
export function setPersonal(config,value){memory=sanitizePersonal(value,allowedPages(config));try{localStorage.setItem(KEY,JSON.stringify(memory));return true;}catch{return false;}}
const rolePages={visitor:['information-contact','news-latest','sports-results'],student:['information-timetable','news-calendar','information-daily'],parent:['information-documents','news-calendar','information-contact'],teacher:['information-timetable','information-documents','news-calendar']};
export function personalRecommendations(config,profile,excluded=[]){const allowed=allowedPages(config);const primary=rolePages[profile]||rolePages.visitor;const neighbors=primary.flatMap(id=>config.pagePreview.catalog?.[id]?.contentMeta?.related||[]).filter(id=>typeof id==='string');return [...new Set([...primary,...neighbors,...(config.contentExpansion?.recommendations?.priorityOrder||[])])].filter(id=>allowed.has(id)&&!excluded.includes(id)).slice(0,3);}
export function cleanIds(value,allowed,max){if(!Array.isArray(value)||value.length>max||new Set(value).size!==value.length||value.some(id=>!allowed.has(id)))throw Error('Érvénytelen oldalazonosítók.');return [...value];}

export function patchPersonal(config,update){const p=getPersonal(config);update(p);return setPersonal(config,p);}
