import {validDay} from '../calendar-data.js?v=2.82';

const dayNumber=d=>Date.parse(d+'T00:00:00Z')/86400000;
export function budapestDay(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=k=>parts.find(p=>p.type===k).value;return `${get('year')}-${get('month')}-${get('day')}`;
}
const text=(v,max=600)=>typeof v==='string'&&v.trim()&&v.length<=max;
function safeSource(s){try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function sourceOf(config,id){const source=config.contentExpansion?.sources?.[id];if(!source)return null;return safeSource(source.url)||(/^\/[a-zA-Z0-9/_.-]+$/.test(source.sourcePath||'')?safeSource('https://csanadi-bp.edu.hu'+source.sourcePath):null);}
const period=(a,b)=>a.replaceAll('-','.')+'.'+(b&&b!==a?(a.slice(0,7)===b.slice(0,7)?'–'+b.slice(8)+'.':' – '+b.replaceAll('-','.')+'.'):'');
function status(point,today,recentDays){if(point.date>today)return point.kind==='deadline'?'deadline':'upcoming';if(point.endDate&&point.endDate>=today)return 'active';return dayNumber(today)-dayNumber(point.endDate||point.date)<=recentDays?'recent':'archive';}
function validRecord(x){return x&&text(x.title,180)&&text(x.description)&&validDay(x.date)&&(!x.endDate||(validDay(x.endDate)&&x.endDate>=x.date));}
export function selectFooterTimeline(config,news=config.publicNews,today=budapestDay()){
 const settings=config.home.dataStrip, policy=settings.footerTimeline||{},fixedCount=policy.fixedCount===4&&policy.dynamicCount===2?policy.fixedCount:4, dynamicCount=6-fixedCount;
 const recentDays=Number.isInteger(policy.recentDays)&&policy.recentDays>=1&&policy.recentDays<=366?policy.recentDays:120;
 const futureDays=Number.isInteger(policy.futureDays)&&policy.futureDays>=1&&policy.futureDays<=366?policy.futureDays:120;
 if(!validDay(today))throw Error('Érvénytelen idővonaldátum.');
 const fixed=(settings.footerMilestones||[]).slice(0,fixedCount).filter(x=>text(x?.period,60)&&text(x.title,180)&&text(x.description)&&safeSource(x.source)).map(x=>({...x,status:x.kind==='result'?'result':'history'}));
 const allowed=new Set(Array.isArray(policy.sourceIds)?policy.sourceIds:[]), candidates=new Map();
 for(const row of Array.isArray(news)?news:[]){
  if(row?.verification!=='verified'||!validDay(row.verifiedAt)||!allowed.has(row.source)||!Array.isArray(row.tags)||row.tags.includes('demo')||row.publication==='draft'||row.publication==='withdrawn'||!text(row.id,100))continue;
  const source=sourceOf(config,row.source);if(!source)continue;
  const records=Array.isArray(row.timeline)?row.timeline.slice(0,20):[{id:row.id,title:row.title,date:row.date,endDate:row.endDate,description:row.summary,kind:'announcement'}];
  for(const entry of records){if(!validRecord(entry)||!text(entry.id,100)||!['announcement','deadline'].includes(entry.kind))continue;
   const id=row.id+':'+entry.id;if(candidates.has(id))continue;
   const p={id,newsId:row.id,period:period(entry.date,entry.endDate),title:entry.title,description:entry.description,source,date:entry.date,endDate:entry.endDate,kind:entry.kind,verifiedAt:row.verifiedAt};p.status=status(p,today,recentDays);candidates.set(id,p);
  }
 }
 const all=[...candidates.values()], byDate=(a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id);
 const current=all.filter(p=>p.status==='recent'||p.status==='active').sort((a,b)=>(b.endDate||b.date).localeCompare(a.endDate||a.date)||byDate(b,a));
 const future=all.filter(p=>p.date>today&&dayNumber(p.date)-dayNumber(today)<=futureDays).sort(byDate);
 const past=all.filter(p=>p.date<=today).sort((a,b)=>byDate(b,a));
 const chosen=[];const add=p=>{if(p&&chosen.length<dynamicCount&&!chosen.some(x=>x.id===p.id))chosen.push(p);};
 // One recent/active and one upcoming when both exist; otherwise fill with eligible items.
 add(current[0]);add(future[0]);for(const p of [...current,...future,...past])add(p);
 // The two approved 2.81 fallback records guarantee six real points if the feed is unavailable.
 for(const p of (settings.footerMilestones||[]).slice(fixedCount)){
  if(!validRecord(p)||!safeSource(p.source)||chosen.some(x=>x.newsId===p.newsId))continue;
  add({...p,status:status(p,today,recentDays)});
 }
 return [...fixed,...chosen.sort(byDate)];
}
export function timelineStatusLabel(config,status){return config.home.dataStrip.footerTimeline?.labels?.[status]||'Tájékoztatás';}
