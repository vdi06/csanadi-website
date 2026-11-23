import { calendarEntries, validDay } from './calendar-data.js?v=2.53';
import { checkedMediaCenter } from './media-data.js?v=2.53';
import { budapestToday } from './admission-data.js?v=2.53';

const idPattern=/^[a-z0-9-]+$/;
const safeText=(v,n=2000)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
const anchor=(v)=>typeof v==='string'&&/^https:\/\/[a-z0-9.-]+(?:\/[\w/.?=#&%+-]*)?$/i.test(v);
const featureCache=new WeakMap();
const pageSet=(config)=>new Set(config.menu.items.flatMap(m=>m.children.map(c=>c.id)));
const checkedPages=(links,pages)=>Array.isArray(links)&&links.every(p=>pages.has(p.pageId)&&(!p.label||safeText(p.label,90)));
/** Közös adatséma: csak a meglévő menüvégpontok és médiák hivatkozhatók. */
export function checkedFeatureCenters(config){
  if(config?.__staticContent===true && featureCache.has(config))return featureCache.get(config);
  const c=config?.featureCenters;
  if(!c||!['education','sports','exams','community'].every(k=>c[k]))throw Error('Hiányzó 2.43-as központadatok.');
  const pages=pageSet(config);
  const media=checkedMediaCenter(config);
  const imageIds=new Set(media.items.map(m=>m.id));
  for(const [name,group] of Object.entries(c)){
    if(!['education','sports','exams','community'].includes(name))throw Error('Ismeretlen központ.');
    if(!['eyebrow','title','intro','note'].every(k=>safeText(group[k])))throw Error(`Hiányos központ: ${name}`);
  }
  const education=c.education;
  if(!Array.isArray(education.programs)||education.programs.length<2||!Array.isArray(education.pillars)||
    !anchor(education.source?.url)||!safeText(education.source.label,220))throw Error('Hibás képzési központ.');
  const seen=new Set();
  for(const p of education.programs){
    if(!idPattern.test(p.id)||seen.has(p.id)||!pages.has(p.pageId)||
      !['name','level','summary'].every(k=>safeText(p[k],800))||
      !Array.isArray(p.points)||!p.points.length||p.points.some(v=>!safeText(v,260))||
      !Array.isArray(p.related)||p.related.some(r=>!pages.has(r)))throw Error('Hibás képzési kártya.');
    seen.add(p.id);
  }
  if(!checkedPages(education.pillars,pages)||education.pillars.some(p=>!safeText(p.title)||!safeText(p.description)))throw Error('Hibás képzési kapcsolat.');
  const sports=c.sports;
  if(!Array.isArray(sports.topics)||!sports.topics.length||!Array.isArray(sports.facilities)||!sports.facilities.length)throw Error('Hibás sportközpont.');
  seen.clear();
  for(const p of sports.topics){
    if(!idPattern.test(p.id)||seen.has(p.id)||!imageIds.has(p.mediaId)||
      !safeText(p.name)||!safeText(p.summary))throw Error('Hibás sportág-bemutató.');
    seen.add(p.id);
  }
  for(const p of sports.facilities){
    if(!idPattern.test(p.id)||!safeText(p.title)||!safeText(p.description)||
      !safeText(p.status)||!pages.has(p.pageId))throw Error('Hibás létesítmény-adat.');
  }
  for(const name of ['exams','community']){
    const part=c[name];const seenFilters=new Set();
    if(!Array.isArray(part.filters)||part.filters[0]?.id!=='all'||!checkedPages(part.links,pages))throw Error('Hiányzó szűrő.');
    for(const f of part.filters){
      if(!idPattern.test(f.id)||seenFilters.has(f.id)||!safeText(f.label,80)||
        (f.id!=='all'&&!(name==='exams'?['exam','school','holiday']:['school','community','sports']).includes(f.id)))throw Error('Hibás központszűrő.');
      seenFilters.add(f.id);
    }
  }
  if(config.__staticContent===true)featureCache.set(config,c);
  return c;
}
/** Pontosan meghatározott, menüből nyitható központok – egyéb oldalakon nincs duplikált modul. */
export function centerRouteKind(id){
  if(id==='education-programs')return 'education';
  if(['sports-disciplines','sports-facilities'].includes(id))return 'sports';
  if(['education-exams','education-years'].includes(id))return 'exams';
  if(['news-events','news-community','education-community'].includes(id))return 'community';
  return null;
}
export function normalizeCenterText(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU').trim();}
export function centerEvents(config,kind,{category='all',query='',max=80}={}){
  checkedFeatureCenters(config);
  const allowed=kind==='exams'?new Set(['exam','school','holiday']):new Set(['school','community','sports']);
  const terms=normalizeCenterText(query).split(/\s+/).filter(Boolean).slice(0,10);
  const entries=calendarEntries(config).filter(e=>allowed.has(e.category)&&
    (category==='all'||e.category===category)&&
    terms.every(t=>normalizeCenterText(`${e.title} ${e.summary} ${e.categoryLabel}`).includes(t)));
  const now=budapestToday();
  entries.sort((a,b)=>Number((a.endDate||a.date)<now)-Number((b.endDate||b.date)<now)||
    a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'hu'));
  return entries.slice(0,Math.max(0,Math.min(max,200)));
}
export function centerDateLabel(event){
  if(!validDay(event.date))throw Error('Hibás eseménydátum.');
  const fmt=d=>new Date(`${d}T12:00:00Z`).toLocaleDateString('hu-HU',{timeZone:'UTC',year:'numeric',month:'short',day:'numeric'});
  return fmt(event.date)+(event.endDate&&event.endDate!==event.date?` – ${fmt(event.endDate)}`:'')+(event.time?` · ${event.time}`:'');
}
export const centerHref=(id)=>`#/oldal/${id}`;
export const centerEventHref=(event)=>`#/oldal/news-calendar/esemeny/${event.id}`;
export function centerSportResults(config,query=''){
  const {sports}=checkedFeatureCenters(config);
  const term=normalizeCenterText(query);
  const media=new Map(config.mediaCenter.items.map(x=>[x.id,x]));
  return sports.topics.filter(x=>normalizeCenterText(`${x.name} ${x.summary}`).includes(term)).map(x=>({...x,media:media.get(x.mediaId)}));
}
