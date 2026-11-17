import {resolveConfiguredText,setting,settingNumber} from './site-settings-2026.js';
const TYPES={page:'Oldal',news:'Hír',event:'Esemény',document:'Dokumentum',image:'Galériakép',video:'Videó'};
const SECTIONS={iskolank:'Iskolánk',oktatas:'Oktatás',sport:'Sport', 'hirek-es-esemenyek':'Hírek és események',informaciok:'Információk',kapcsolat:'Kapcsolat',home:'Kezdőlap'};
const DATASETS=[
 ['news','adatok/hirek-hivatalos.json'],
 ['event','adatok/esemenyek.json'],
 ['document','adatok/dokumentumok.json'],
 ['image','adatok/kepgaleria.json'],
 ['video','adatok/galeriavideok.json']
];
const element=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=String(text);return el;};
const sectionOf=(route,type)=>{
 const base=String(route||'').replace(/^#\//,'').split('/')[0];
 if(base==='megkozelites-es-erkezes')return 'informaciok';
 if(base==='tanulastamogatas')return 'oktatas';
 if(base in SECTIONS)return base;
 if(type==='image'||type==='video')return 'sport';
 if(type==='document')return 'informaciok';
 if(type==='event'||type==='news')return 'hirek-es-esemenyek';
 return 'home';
};
const strings=(input,parts=[],depth=0)=>{
 if(depth>14||parts.length>180)return parts;
 if(typeof input==='string')parts.push(input);
 else if(Array.isArray(input))for(const x of input)strings(x,parts,depth+1);
 else if(input&&typeof input==='object')for(const key of ['title','heading','label','text','summary','description','detail','caption','body','content','lead','data','children','items','blocks','intro']){
  if(key in input)strings(input[key],parts,depth+1);
 }
 return parts;
};
const labelsFrom=(entry,fields=[])=>fields.filter(Boolean).map(x=>String(x)).join(' ');
function buildEntry(x,norm){
 const entry={...x,section:sectionOf(x.href,x.type)};
 entry.title=resolveConfiguredText(x.title||'');entry.summary=resolveConfiguredText(x.summary||'');entry.body=resolveConfiguredText(x.body||'');
 entry.normalTitle=norm(entry.title);entry.normalSummary=norm(entry.summary);
 entry.normalTags=norm(labelsFrom(null,Array.isArray(x.tags)?x.tags.filter(value=>typeof value==='string'):[]));entry.normalBody=norm(entry.body||'');
 entry.fuzzyWords=(entry.normalTitle+' '+entry.normalTags).split(/[^a-z0-9]+/).filter(Boolean);
 entry.normalSection=norm(SECTIONS[entry.section]||'');
 return entry;
}
function makeDocumentsPayload(doc){
 const out=[];
 for(const d of doc?.documents||[]){
  if(d?.status!=='published'||!d.title)continue;
  const local=typeof d.filePath==='string'&&/^assets\/documents\/[a-z0-9._-]+\.pdf$/.test(d.filePath);
  out.push({id:d.id,title:d.title,summary:d.summary||'',tags:[...(d.tags||[]),...(d.keywords||[])],body:labelsFrom(null,[d.documentKind,d.description]),type:'document',href:local?d.filePath:'#/informaciok/dokumentumtar',section:'informaciok',external:local});
 }
 return out;
}
function indexPayload(type,data){
 if(type==='document')return makeDocumentsPayload(data);
 const result=[];
 for(const item of data?.items||[]){
  if(!item?.title)continue;
  if(type==='news' && !['verified','sample'].includes(item.status))continue;
  if(type==='event' && item.status!=='published')continue;
  let route='#/sport/sportgaleriak';
  if(type==='news')route='#/hirek-es-esemenyek/hirek';
  if(type==='event')route='#/hirek-es-esemenyek/esemenynaptar';
  result.push({
   id:item.id||type+':'+result.length,title:item.title,summary:item.summary||item.description||item.alt||'',
   tags:[item.category,item.categoryId].filter(Boolean),body:labelsFrom(null,[item.detail,item.location,item.date]),
   type,href:route
  });
 }
 return result;
}
const normalizeTerm=(term,norm)=>norm(term||'').replace(/[^a-z0-9\u00e1-\u017e\s-]/g,' ').trim();
// Rövid, korlátos szerkesztési távolság: a szinonimáknál szigorúbban pontoz.
export function boundedDistance(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let previous=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const next=[i];let minimum=i;for(let j=1;j<=b.length;j++){const value=Math.min(previous[j]+1,next[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));next.push(value);minimum=Math.min(minimum,value);}if(minimum>max)return max+1;previous=next;}return previous[b.length];}
function score(entry,query,tokens,synonyms,typoMaximum,typoMinimum){
 if(!query)return (entry.type==='page'?30:0)+(entry.href==='#/'?14:0);
 let points=0;
 for(const term of tokens){
  if(!term)continue;
  let score=0;
  if(entry.normalTitle===term)score=90;
  else if(entry.normalTitle.startsWith(term))score=45;
  else if(entry.normalTitle.includes(term))score=29;
  if(entry.normalTags.includes(term))score+=18;
  if(entry.normalSection.includes(term))score+=9;
  if(entry.normalSummary.includes(term))score+=10;
  if(entry.normalBody.includes(term))score+=5;
  if(score===0){
   const alternatives=synonyms[term]||[];
   const matched=alternatives.some(word=>entry.normalTitle.includes(word)||entry.normalTags.includes(word)||entry.normalSummary.includes(word)||entry.normalBody.includes(word));
   if(matched)score=7;
  }
  if(score===0&&term.length>=typoMinimum&&typoMaximum>0){
   if(entry.fuzzyWords.some(word=>word.length>=typoMinimum&&boundedDistance(term,word,typoMaximum)<=typoMaximum))score=4;
  }
  if(score===0)return -1;
  points+=score;
 }
 if(entry.normalTitle.includes(query))points+=36;
 if(entry.type==='page')points+=5;
 return points;
}
export function setupSmartSearch({catalog,loadJSON,norm,dialog,input,results,status,onNavigate}){
 const pageSize=settingNumber('search.pageSize'),suggestionLimit=settingNumber('search.suggestionLimit'),maxResults=settingNumber('search.maxResults');
 // A szinonimák oda-vissza kereshető indexe csak egyszer készül el.
 const synonyms=Object.create(null);
 for(const [key,alternatives] of Object.entries(setting('search.synonyms')||{})){
  if(!Array.isArray(alternatives))continue;
  (synonyms[key]??=[]).push(...alternatives);
  for(const alternative of alternatives)(synonyms[alternative]??=[]).push(key);
 }
 const typoMaximum=settingNumber('search.typoMaxDistance'),typoMinimum=settingNumber('search.typoMinimumLength'),statsLimit=settingNumber('search.statsSessionLimit');
 const sessionStats={searches:0,opened:0,empty:0};
 let all=[],query='',type='all',section='all',max=pageSize,rebuildSerial=0,unavailableSources=0;
 const resultWrap=results;resultWrap.setAttribute('aria-label','Keresési találatok');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const form=element('div','j-search-tools');
 const typeLabel=element('label','j-search-field','Tartalomtípus');
 const typeSelect=element('select','j-search-select');typeSelect.setAttribute('aria-label','Tartalomtípus szerinti szűrés');
 const sectionLabel=element('label','j-search-field','Témakör');
 const sectionSelect=element('select','j-search-select');sectionSelect.setAttribute('aria-label','Témakör szerinti szűrés');
 typeLabel.append(typeSelect);sectionLabel.append(sectionSelect);form.append(typeLabel,sectionLabel);
 input.insertAdjacentElement('afterend',form);
 const picks=element('div','j-search-picks');picks.setAttribute('aria-label','Keresési javaslatok');
 const resetBtn=element('button','j-search-clear','Keresés törlése');resetBtn.type='button';resetBtn.addEventListener('click',()=>{input.value='';query='';max=pageSize;type='all';section='all';typeSelect.value='all';sectionSelect.value='all';render();input.focus();});picks.append(resetBtn);
 form.insertAdjacentElement('afterend',picks);
 const more=element('button','j-search-more','További találatok');more.type='button';more.hidden=true;
 resultWrap.insertAdjacentElement('afterend',more);
 const stats=element('p','csn20-search-stats');stats.setAttribute('aria-label','Helyi keresési statisztika');more.insertAdjacentElement('afterend',stats);
 const list=element('datalist');list.id='j-search-suggestions';input.setAttribute('list',list.id);input.insertAdjacentElement('afterend',list);
 input.autocomplete='off';input.placeholder='Például: felvételi, nyílt nap, kosárlabda, dokumentum…';
 function option(select,value,name){const opt=document.createElement('option');opt.value=value;opt.textContent=name;select.append(opt);}
 function populateFilters(){
  typeSelect.replaceChildren();option(typeSelect,'all','Minden tartalom');
  Object.entries(TYPES).forEach(([value,name])=>option(typeSelect,value,name));
  sectionSelect.replaceChildren();option(sectionSelect,'all','Összes témakör');
  Object.entries(SECTIONS).forEach(([value,name])=>option(sectionSelect,value,name));
 }
 populateFilters();
 function rebuildPages(pages){
  return pages.items.map((entry)=>({id:entry.page.id,title:entry.page.title,summary:entry.page.summary||'',tags:[...(entry.page.tags||[]),...(entry.page.categories||[])],body:entry.page.searchText||strings(entry.page.blocks||[]).join(' ').slice(0,settingNumber('search.textCharacterLimit')),href:entry.page.schemaExtensions.route,type:'page'}));
 }
 async function rebuild(pages){
  const serial=++rebuildSerial;
  const pageEntries=rebuildPages(pages);
  unavailableSources=0;
  all=pageEntries.map(e=>buildEntry(e,norm));
  if(!dialog.hidden)render();
  const settled=await Promise.allSettled(DATASETS.map(async ([t,path])=>({t,data:await loadJSON(path)})));
  if(serial!==rebuildSerial)return;
  const indexed=[...pageEntries];
  unavailableSources=settled.filter(r=>r.status==='rejected').length;
  for(const r of settled){
   if(r.status==='fulfilled')indexed.push(...indexPayload(r.value.t,r.value.data));
   else console.warn('Kereső: adatforrás átmenetileg nem elérhető:',r.reason);
  }
  all=indexed.map(x=>buildEntry(x,norm));
  const unique=new Set();list.replaceChildren();
  for(const item of all){
   if(unique.has(item.title))continue;unique.add(item.title);
   if(unique.size>settingNumber('search.datalistLimit'))break;
   const opt=document.createElement('option');opt.value=item.title;list.append(opt);
  }
  if(!dialog.hidden)render();
 }
 function suggestion(text){
  const btn=element('button','j-search-chip',text);btn.type='button';
  btn.addEventListener('click',()=>{input.value=text;query=text;max=pageSize;render();input.focus();});return btn;
 }
 function firstMatchingTitles(predicate,limit){
  const titles=[];
  if(limit<=0)return titles;
  for(const entry of all){if(predicate(entry)){titles.push(entry.title);if(titles.length>=limit)break;}}
  return titles;
 }
 function renderPicks(){
  picks.replaceChildren(element('span','j-search-picks-label',query.trim()?'Kapcsolódó keresések:':'Gyorskeresések:'));
  const normalizedQuery=query.trim()?norm(query):'';
  const suggestions=normalizedQuery
   ? firstMatchingTitles(x=>x.normalTitle.includes(normalizedQuery)&&x.normalTitle!==normalizedQuery,suggestionLimit)
   : setting('search.quickSuggestions');
  let picksList=[...new Set(suggestions)];
  if(normalizedQuery&&!picksList.length){const prefix=normalizedQuery.slice(0,Math.min(settingNumber('search.minimumFuzzyLength'),normalizedQuery.length)),tolerance=settingNumber('search.fuzzyWordLengthTolerance');picksList=firstMatchingTitles(x=>x.normalTitle.split(' ').some(word=>word.startsWith(prefix)&&Math.abs(word.length-normalizedQuery.length)<=tolerance),suggestionLimit);}
  for(const s of [...new Set(picksList)].slice(0,suggestionLimit))picks.append(suggestion(s));
  if(query.trim()||type!=='all'||section!=='all')picks.append(resetBtn);
 }
 function appendHighlight(target,value,tokens){
  const plain=String(value||'');
  if(!tokens.length){target.textContent=plain;return;}
  const chars=[...plain];let folded='',positions=[];
  for(let i=0;i<chars.length;i++){
   const normalized=norm(chars[i]);
   for(const char of normalized){folded+=char;positions.push(i);}
  }
  const spans=[];
  for(const word of tokens){let at=0;while(at<folded.length){const pos=folded.indexOf(word,at);if(pos<0)break;spans.push([positions[pos],positions[Math.min(pos+word.length-1,positions.length-1)]+1]);at=pos+word.length;}}
  spans.sort((a,b)=>a[0]-b[0]);let cursor=0;
  for(const [start,end] of spans){if(start<cursor)continue;target.append(document.createTextNode(chars.slice(cursor,start).join('')),element('mark','',chars.slice(start,end).join('')));cursor=end;}
  target.append(document.createTextNode(chars.slice(cursor).join('')));
 }
 function makeCard(entry,tokens){
  const a=element('a','search-result');a.href=entry.href;
  if(entry.external){a.target='_blank';a.rel='noopener noreferrer';}
  const top=element('div','j-search-result-top');top.append(element('span','j-search-type',TYPES[entry.type]||'Tartalom'),element('span','j-search-section',SECTIONS[entry.section]||'Tartalom'));
  const title=element('strong','search-result-title');appendHighlight(title,entry.title,tokens);
  const description=element('small');appendHighlight(description,entry.summary||'Kapcsolódó tartalom megtekintése',tokens);
  a.append(top,title,description);a.addEventListener('click',event=>{sessionStats.opened=Math.min(statsLimit,sessionStats.opened+1);updateStats();onNavigate(entry,query,event);});
  return a;
 }
 function render(){
  results.replaceChildren();renderPicks();
  const q=normalizeTerm(query,norm),tokens=[...new Set(q.split(/\s+/).filter(Boolean))];
  const matches=[];
  for(const x of all){
   if(type!=='all'&&x.type!==type||section!=='all'&&x.section!==section)continue;
   const points=score(x,q,tokens,synonyms,typoMaximum,typoMinimum);
   if(points>=0)matches.push({x,score:points});
  }
  matches.sort((a,b)=>b.score-a.score||a.x.title.localeCompare(b.x.title,'hu'));
  const shown=matches.slice(0,Math.min(max,maxResults));
  status.textContent=`${matches.length} találat · ${shown.length} megjelenítve`+(unavailableSources?` · ${unavailableSources} kiegészítő adatforrás átmenetileg nem érhető el`:'');
  for(const hit of shown)results.append(makeCard(hit.x,tokens));
  if(!matches.length)results.append(element('p','j-search-empty','Nincs pontos találat. Válassz egy javaslatot, egyszerűsítsd a kifejezést, vagy módosítsd a témakör szűrőjét.'));
  if(matches.length && query.trim())results.setAttribute('aria-label',`${matches.length} találat a(z) ${query} keresésre`);
  more.hidden=shown.length>=matches.length||shown.length>=maxResults;
  updateStats();
 }
 function updateStats(){stats.textContent=`Csak ebben a böngészőlapban: ${sessionStats.searches} keresés · ${sessionStats.opened} megnyitás · ${sessionStats.empty} találat nélküli keresés. Személyes keresőkifejezést nem tárolunk, statisztika nem kerül szerverre.`;}
 function registerSearch(){if(!query.trim())return;sessionStats.searches=Math.min(statsLimit,sessionStats.searches+1);if(!results.querySelector('a.search-result'))sessionStats.empty=Math.min(statsLimit,sessionStats.empty+1);updateStats();}
 function setQuery(value){query=String(value||'');max=pageSize;render();}
 input.addEventListener('input',()=>setQuery(input.value));
 typeSelect.addEventListener('change',()=>{type=typeSelect.value;max=pageSize;render();});
 sectionSelect.addEventListener('change',()=>{section=sectionSelect.value;max=pageSize;render();});
 more.addEventListener('click',()=>{max+=pageSize;render();});
 input.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){
   const first=results.querySelector('a.search-result');if(first){e.preventDefault();first.focus();}
  }else if(e.key==='Enter'){
   registerSearch();
   const first=results.querySelector('a.search-result');if(first){e.preventDefault();first.click();}
  }
 });
 results.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   const arr=[...results.querySelectorAll('a.search-result')],pos=arr.indexOf(document.activeElement);
   if(pos>=0){e.preventDefault();const next=e.key==='ArrowDown'?Math.min(pos+1,arr.length-1):pos-1;
    if(next<0)input.focus();else arr[next].focus();}
  }
 });
 return {rebuild,render,
  snapshot(){return {query,type,section,max};},
  restore(state){
   query=typeof state?.query==='string'?state.query.trim().slice(0,300):'';
   type=Object.hasOwn(TYPES,state?.type)?state.type:'all';
   section=Object.hasOwn(SECTIONS,state?.section)?state.section:'all';
   max=Number.isSafeInteger(state?.max)?Math.min(maxResults,Math.max(pageSize,state.max)):pageSize;
   input.value=query;typeSelect.value=type;sectionSelect.value=section;render();
  },
  reset(){query='';type='all';section='all';max=pageSize;input.value='';typeSelect.value='all';sectionSelect.value='all';render();}};
}
