import { schoolBellSchedule, todayBudapest } from "./information-data.js?v=2.43";
const weekdayIds=["mon","tue","wed","thu","fri"];
const label=(v,max=300)=>typeof v==="string"&&!!v.trim()&&v.length<=max;
const safeId=/^[a-z0-9-]+$/;
/** Egyetlen csengetési adatforrás, ellenőrzött JSON órarendpéldákkal. */
export function checkedTimetable(config){
  const c=config.timetableCenter;
  const schedule=schoolBellSchedule(config);
  if(!c||!["eyebrow","title","summary","emptyLabel","sourceNote","updateStatus","officialHref"]
      .every(k=>label(c[k],1000))||!Array.isArray(c.days)||c.days.length!==5||
      !Array.isArray(c.classes)||!c.classes.length||c.classes.length>100||
      !/^https:\/\/csanadi-bp\.edu\.hu\//.test(c.officialHref))throw new Error("Hibás órarend-regiszter.");
  if(c.days.some((d,i)=>d.id!==weekdayIds[i]||!label(d.label,40)||!label(d.short,12)))throw new Error("Hibás hétköznaplista.");
  const ids=new Set();
  for(const item of c.classes){
    if(!safeId.test(item.id||"")||ids.has(item.id)||!label(item.label,100)||!label(item.description,500)||
      typeof item.verified!=="boolean"||!item.days||
      weekdayIds.some(day=>!Array.isArray(item.days[day])||item.days[day].length!==schedule.length||
        item.days[day].some(s=>!label(s,90))))throw new Error("Hibás órarend-JSON: "+item?.id);
    ids.add(item.id);
  }
  return {config:c,schedule};
}
export function budapestClock(now=new Date()){
  const fmt=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Budapest",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
  const parts=Object.fromEntries(fmt.formatToParts(now).map(({type,value})=>[type,value]));
  return {day:({Mon:"mon",Tue:"tue",Wed:"wed",Thu:"thu",Fri:"fri"})[parts.weekday]||null,
    time:`${parts.hour}:${parts.minute}`,date:todayBudapest(now)};
}
export function currentBell(config,now=new Date()){
  const rows=schoolBellSchedule(config),clock=budapestClock(now);
  if(!clock.day)return {clock,type:"closed",text:"Hétvége – a rendes tanítási napok hétfőtől péntekig tartanak."};
  const inClass=rows.findIndex(row=>clock.time>=row.from&&clock.time<row.to);
  if(inClass>=0)return {clock,type:"lesson",index:inClass,text:`${inClass+1}. óra · ${rows[inClass].from}–${rows[inClass].to}`};
  const upcoming=rows.findIndex(row=>row.from>clock.time);
  if(upcoming>=0)return {clock,type:upcoming===0?"upcoming":"break",index:upcoming,
    text:`Következő: ${upcoming+1}. óra · ${rows[upcoming].from}`};
  return {clock,type:"ended",text:"A 8. tanóra véget ért."};
}
export const timetableWeekdays=weekdayIds;
