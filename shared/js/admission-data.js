/** 2.41 — hiteles országos határidők + külön ellenőrzendő helyi információk. */
const idPattern=/^[a-z0-9-]+$/;
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
const text=(v,max=1100)=>typeof v==='string' && !!v.trim() && v.length<=max;
export const validIsoDate=(value)=> datePattern.test(value||'') &&
  !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
  new Date(`${value}T12:00:00Z`).toISOString().slice(0,10)===value;
const validHref=(value)=>/^https:\/\/[a-z0-9.-]+(?:\/[\w./?=&%+-]*)?$/i.test(value||'');
const validPage=(value)=>/^admission-[a-z-]+$/.test(value||'');
export function checkedAdmissions(config){
  const a=config?.admissionCenter;
  if(!a||!/^20\d{2}\/20\d{2}$/.test(a.year||'')||!text(a.intro,1500)||!text(a.notice,1200)||
    !validIsoDate(a.checkedAt)||!Array.isArray(a.sources)||!Array.isArray(a.programs)||
    !Array.isArray(a.milestones)||!Array.isArray(a.relatedPages)||!Array.isArray(a.schoolPending)||
    typeof a.steps!=='object'||!a.steps)throw Error('Hibás felvételi központ metaadat.');
  const sources=new Set();
  for(const s of a.sources){
    if(!s||!idPattern.test(s.id||'')||sources.has(s.id)||!text(s.title,250)||!validHref(s.url)||
      !['national','school'].includes(s.kind)||!validIsoDate(s.checkedAt))throw Error('Hibás felvételi forrás.');
    sources.add(s.id);
  }
  const programs=new Set();
  for(const p of a.programs){
    if(!p||!idPattern.test(p.id||'')||programs.has(p.id)||!text(p.label,100)||!text(p.summary)||
      !validPage(p.pageId))throw Error('Érvénytelen felvételi képzés.');
    programs.add(p.id);
  }
  if(programs.size!==2||!programs.has('primary')||!programs.has('secondary'))throw Error('Hiányzó felvételi eljárás.');
  const ids=new Set();
  for(const m of a.milestones){
    if(!m||!idPattern.test(m.id||'')||ids.has(m.id)||!programs.has(m.program)||!text(m.title,180)||
      !text(m.detail,1100)||!validIsoDate(m.start)||!validIsoDate(m.end)||m.end<m.start||
      !sources.has(m.sourceId)||!validPage(m.link)||
      (m.time!==undefined&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(m.time)))throw Error(`Érvénytelen felvételi dátum: ${m?.id||'?'}`);
    ids.add(m.id);
  }
  if(!a.milestones.length)throw Error('Nincsenek felvételi határidők.');
  for(const program of programs){
    if(!Array.isArray(a.steps[program])||!a.steps[program].length)throw Error('Hiányzó felvételi lépések.');
    const stepIds=new Set();
    for(const s of a.steps[program]){
      if(!s||!idPattern.test(s.id||'')||stepIds.has(s.id)||!text(s.title,180)||!text(s.detail)||
        !validPage(s.pageId))throw Error('Hibás felvételi folyamatlépés.');
      stepIds.add(s.id);
    }
  }
  if(a.relatedPages.some(p=>!/^([a-z]+-)+[a-z]+$/.test(p)))throw Error('Hibás kapcsolódó oldal.');
  if(a.schoolPending.some(p=>!text(p,280)))throw Error('Hibás helyi ellenőrzési tétel.');
  return a;
}
/** Időzóna-függetlenül a budapesti naptári nap, elkerülve a mobiltelefon más zónáját. */
export function budapestToday(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const p=Object.fromEntries(parts.map(({type,value})=>[type,value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function milestoneStatus(m,today=budapestToday()){
  if(!validIsoDate(today))throw Error('Hibás mai dátum.');
  if(today>m.end)return 'expired';
  if(today>=m.start)return 'active';
  const d=Math.round((Date.parse(m.start+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);
  return d<=30?'soon':'later';
}
export const statusLabel={expired:'Lejárt',active:'Aktuális',soon:'30 napon belül',later:'Később'};
export const normalizedAdmissionText=(v)=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
export function admissionMilestones(config,{program='all',status='all',query='',today=budapestToday()}={}){
  const a=checkedAdmissions(config);
  if(program!=='all'&&!a.programs.some(p=>p.id===program))program='all';
  const terms=normalizedAdmissionText(query).trim().split(/\s+/).filter(Boolean).slice(0,12);
  return a.milestones.filter(m=>(program==='all'||m.program===program) &&
    (status==='all'||(status==='upcoming'&&milestoneStatus(m,today)!=='expired')||milestoneStatus(m,today)===status)&&
    terms.every(t=>normalizedAdmissionText(`${m.title} ${m.detail}`).includes(t)))
    .sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title,'hu'));
}
export const admissionDateLabel=(m)=>{
  const fmt=(s)=>new Date(s+'T12:00:00Z').toLocaleDateString('hu-HU',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'});
  return fmt(m.start)+(m.end!==m.start?` – ${fmt(m.end)}`:'')+(m.time?` · ${m.time}`:'');
};
export function nextAdmissionMilestone(config,program='all',today=budapestToday()){
  return admissionMilestones(config,{program,status:'upcoming',today})[0]||null;
}
