import { calendarEntries } from "./calendar-data.js?v=2.63";
import { newsStoryHref } from "./news-panel.js?v=2.63";

const validText = (v, length=200) => typeof v === "string" && v.trim().length > 0 && v.length <= length;
const validHref = (v) => typeof v === "string" && /^#\/oldal\/[a-z0-9-]+$/.test(v);
const hhmm = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Egyetlen hiteles órarendadatból olvas, nem tárol második, eltérő időrendet. */
export function schoolBellSchedule(config) {
  const groups = config.pagePreview?.pages?.["information-timetable"]?.items?.[0]?.groups;
  const points = groups?.flatMap((g) => g.points || []) || [];
  const intervals = points.map((point,i) => {
    const value = point.details?.[0];
    const match = /^\s*(\d{1,2}:\d\d)\s*[–-]\s*(\d{1,2}:\d\d)\s*$/.exec(value || "");
    if (!match || !validText(point.title,50) || !hhmm.test(match[1].padStart(5,"0")) ||
      !hhmm.test(match[2].padStart(5,"0"))) throw new Error(`Hibás csengetési adat: ${i+1}`);
    const from = match[1].padStart(5,"0"), to = match[2].padStart(5,"0");
    if (from >= to) throw new Error(`Fordított csengetési idősáv: ${i+1}`);
    return { title:point.title, from, to };
  });
  if (intervals.length !== 8 || intervals.some((row,i)=>i>0 && row.from<intervals[i-1].to)) {
    throw new Error("A nyolc órás, időrendben rendezett csengetés hiányzik.");
  }
  return intervals;
}

export function checkedInformationCenter(config) {
  const info = config.informationCenter;
  if (!info || !["eyebrow","dateLabel","scheduleTitle","scheduleNote","eventsTitle",
    "newsTitle","linksTitle"].every((key)=>validText(info[key],500)) ||
    !Number.isInteger(info.eventsLimit) || info.eventsLimit<1 || info.eventsLimit>12 ||
    !Number.isInteger(info.newsLimit) || info.newsLimit<1 || info.newsLimit>12 ||
    !Array.isArray(info.quickLinks) || info.quickLinks.length<4 || info.quickLinks.length>16) {
    throw new Error("Hiányos iskolai információs központ.");
  }
  const validPages = new Set(config.menu.items.flatMap((root)=>root.children?.map((p)=>`#/oldal/${p.id}`)||[]));
  const ids = new Set();
  for (const link of info.quickLinks) {
    if (!link || !/^[a-z0-9-]+$/.test(link.id || "") || ids.has(link.id) ||
      !validText(link.title,90) || !validText(link.subtitle,140) ||
      !validText(link.icon,4) || !validHref(link.href) || !validPages.has(link.href)) {
      throw new Error("Érvénytelen gyorselérési hivatkozás.");
    }
    ids.add(link.id);
  }
  schoolBellSchedule(config);
  return info;
}

export function todayBudapest(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Budapest",
    year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const o=Object.fromEntries(parts.map(({type,value})=>[type,value]));
  return `${o.year}-${o.month}-${o.day}`;
}

export function informationView(config, date=todayBudapest()) {
  const info=checkedInformationCenter(config);
  if (!/^\d{4}-\d\d-\d\d$/.test(date)) throw new Error("Érvénytelen vizsgált nap.");
  const events=calendarEntries(config).filter((e)=>(e.endDate||e.date)>=date)
    .sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,"hu"))
    .slice(0,info.eventsLimit);
  const news=[...config.publicNews].sort((a,b)=>b.date.localeCompare(a.date))
    .slice(0,info.newsLimit).map((n)=>({ ...n, href:newsStoryHref(config,n) }));
  return {info,date,events,news,schedule:schoolBellSchedule(config),quickLinks:info.quickLinks};
}
