import {sourceSignature,sameContent,validateEditablePage} from './page-draft-core-v1-42-23.js?v=1.42.25';

const PREFIX='csanadi-c3-content-workflow-v1-';
const SCHEMA=1;
const TTL=60*24*60*60*1000;
const PAGE=/^json\/pages\/[a-z0-9/_-]+\.json$/;
const RELEASE=/^csanadi-website-v\d+\.\d+\.\d+$/;
const STATE=new Set(['draft','checked','approved']);
const copy=value=>JSON.parse(JSON.stringify(value));

export function contentFingerprint(page){
 const value=JSON.stringify([page.title,page.menuLabel,page.summary,page.blocks]);
 let first=2166136261,second=0x9e3779b9;
 for(let i=0;i<value.length;i++){
  const ch=value.charCodeAt(i);
  first=Math.imul(first^ch,16777619);
  second=Math.imul(second^(ch+i%19),2246822519);
 }
 return value.length.toString(16)+'-'+(first>>>0).toString(16).padStart(8,'0')+(second>>>0).toString(16).padStart(8,'0');
}

function key(release){if(!RELEASE.test(release))throw Error('Érvénytelen kiadásazonosító.');return PREFIX+release;}
function assertPath(path){if(!PAGE.test(path))throw Error('Érvénytelen oldalútvonal.');}
function store(storage,release){
 const raw=storage?.getItem(key(release));
 if(!raw)return {schema:SCHEMA,release,records:{}};
 if(raw.length>500000)throw Error('A helyi jóváhagyási napló túl nagy.');
 const data=JSON.parse(raw);
 if(data?.schema!==SCHEMA||data.release!==release||!data.records||Array.isArray(data.records)||typeof data.records!=='object')throw Error('Hibás helyi jóváhagyási napló.');
 return data;
}
function persist(storage,release,data,now){
 if(!storage)throw Error('Helyi tárolás nem érhető el.');
 for(const [path,record] of Object.entries(data.records))if(!PAGE.test(path)||!record||!Number.isFinite(record.savedAt)||record.savedAt<now-TTL||record.savedAt>now)delete data.records[path];
 if(Object.keys(data.records).length>79)throw Error('Túl sok helyi jóváhagyási bejegyzés.');
 storage.setItem(key(release),JSON.stringify(data));
}
function newDraft(original,page,now){return {source:sourceSignature(original),fingerprint:contentFingerprint(page),state:'draft',checkedAt:null,approvedAt:null,savedAt:now,history:[]};}
export function workflowRecord(storage,release,path,original,page,now=Date.now()){
 assertPath(path);
 if(sameContent(original,page))return {state:'baseline',stale:false,history:[],fingerprint:contentFingerprint(page)};
 const fingerprint=contentFingerprint(page),entry=store(storage,release).records[path];
 if(!entry)return {...newDraft(original,page,now),stale:false};
 if(entry.source!==sourceSignature(original)||entry.fingerprint!==fingerprint||!STATE.has(entry.state)||entry.savedAt<now-TTL||entry.savedAt>now)return {...newDraft(original,page,now),stale:true};
 return {...copy(entry),stale:false};
}
export function noteContentChanged(storage,release,path,original,page,now=Date.now()){
 assertPath(path);validateEditablePage(original,page);
 const data=store(storage,release);
 if(sameContent(original,page)){delete data.records[path];persist(storage,release,data,now);return {state:'baseline'};}
 const prior=workflowRecord(storage,release,path,original,page,now);
 if(!data.records[path]||prior.stale){
  const fresh=newDraft(original,page,now);
  const old=data.records[path];fresh.history=[...(old?.source===sourceSignature(original)?old.history||[]:[]),{state:'draft',at:new Date(now).toISOString(),reason:'A tartalom módosult'}].slice(-25);
  data.records[path]=fresh;
 }else data.records[path]={...prior,savedAt:now};
 persist(storage,release,data,now);
 return copy(data.records[path]);
}
export function transitionWorkflow(storage,release,path,original,page,action,now=Date.now()){
 assertPath(path);validateEditablePage(original,page);
 if(sameContent(original,page))throw Error('A kiadott alapoldalhoz nincs ellenőrizendő helyi tervezet.');
 if(!['check','approve','reopen'].includes(action))throw Error('Érvénytelen állapotművelet.');
 const data=store(storage,release),current=workflowRecord(storage,release,path,original,page,now);
 if(current.stale&&action!=='reopen')throw Error('Az oldal időközben módosult. Előbb mentsd újra tervezetként.');
 if(action==='check'&&current.state!=='draft')throw Error('Csak tervezet ellenőrizhető.');
 if(action==='approve'&&(current.state!=='checked'||!current.checkedAt))throw Error('Csak azonos tartalmú, már ellenőrzött tervezet hagyható jóvá.');
 if(action==='reopen'&&current.state==='draft'&&!current.stale)return current;
 const nextState=action==='check'?'checked':action==='approve'?'approved':'draft',timestamp=new Date(now).toISOString();
 const next={...current,source:sourceSignature(original),fingerprint:contentFingerprint(page),state:nextState,savedAt:now,stale:false,
  checkedAt:action==='check'?timestamp:action==='reopen'?null:current.checkedAt,
  approvedAt:action==='approve'?timestamp:null,
  history:[...(current.history||[]),{state:nextState,at:timestamp}].slice(-25)};
 data.records[path]=next;persist(storage,release,data,now);return copy(next);
}

export function workflowOverview(storage,release,pages){
 const all=store(storage,release).records,result={draft:0,checked:0,approved:0,stale:0};
 for(const {path,original,page} of pages){
  const record=workflowRecord(storage,release,path,original,page);
  if(record.stale)result.stale++;
  if(Object.hasOwn(result,record.state))result[record.state]++;
 }
 result.orphanRecords=Object.keys(all).filter(path=>!pages.some(item=>item.path===path)).length;
 return result;
}

export function adoptWorkflowRecord(storage,previousRelease,nextRelease,path,original,page,now=Date.now()){
 assertPath(path);validateEditablePage(original,page);
 const previous=workflowRecord(storage,previousRelease,path,original,page,now);
 if(previous.stale||!['draft','checked','approved'].includes(previous.state))throw Error('A korábbi jóváhagyási állapot nem érvényes az új kiadás tartalmára.');
 const data=store(storage,nextRelease),at=new Date(now).toISOString();
 data.records[path]={...previous,source:sourceSignature(original),fingerprint:contentFingerprint(page),savedAt:now,stale:false,migratedFrom:previousRelease,
  history:[...(previous.history||[]),{state:previous.state,at,reason:'Jóváhagyott verzióközi átvétel'}].slice(-25)};
 persist(storage,nextRelease,data,now);return copy(data.records[path]);
}
