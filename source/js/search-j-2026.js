import {resolveConfiguredText,setting,settingNumber} from './site-settings-2026.js?v=1.53';
import {validFeaturedRoutes,isFeaturedHit,uniqueSearchEntries,sortSearchHits} from './search-policies-v1-40-6.js';
import {recommendRelatedContent,validateEditorialRules} from './search-recommendations-v1-40-9.js';
const TYPES={page:'Oldal',news:'Hír',event:'Esemény',document:'Dokumentum',image:'Galériakép',video:'Videó'};
const SECTIONS={iskolank:'Iskolánk',oktatas:'Oktatás',sport:'Sport', 'hirek-es-esemenyek':'Hírek és események',informaciok:'Információk',kapcsolat:'Kapcsolat',home:'Kezdőlap'};
const DATASETS=[
 ['news','data/official-news.json'],
 ['event','data/events.json'],
 ['document','data/documents.json'],
 ['image','data/photo-gallery.json'],
 ['video','data/gallery-videos.json']
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
 entry.fuzzyWords=[...new Set((entry.normalTitle+' '+entry.normalTags).split(/[^a-z0-9]+/).filter(Boolean))];
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
  if(type==='news' && item.status!=='verified')continue;
  if(type==='event' && item.status!=='published')continue;
  let route='#/sport/sportgaleriak';
  if(type==='news')route='#/hirek-es-esemenyek/hirek';
  if(type==='event')route='#/hirek-es-esemenyek/esemenynaptar';
  result.push({
   id:item.id||type+':'+result.length,title:item.title,summary:item.summary||item.description||item.alt||'',
   tags:[item.category,item.categoryId].filter(Boolean),body:labelsFrom(null,[item.detail,item.location,item.date]),
   type,href:route,isSample:type==='news'&&item.status==='sample',verified:type!=='event'||item.verified===true
  });
 }
 return result;
}
const normalizeTerm=(term,norm)=>norm(term||'').replace(/[^a-z0-9\u00e1-\u017e\s-]/g,' ').trim();
// Idézőjelek közé tett kifejezés egyetlen keresési egység, maximum nyolc egységig.
export function tokenizeSearchQuery(value,norm){
 const raw=String(value||'').slice(0,160),tokens=[];
 for(const match of raw.matchAll(/"([^"]{1,80})"|([^\s"]+)/g)){
  const item=normalizeTerm(match[1]||match[2],norm).replace(/\s+/g,' ');
  if(item&&!tokens.includes(item))tokens.push(item);
  if(tokens.length===8)break;
 }
 return tokens;
}
export function compileSynonyms(definitions,norm){
 const index=Object.create(null);
 const connect=(a,b)=>{if(a&&b&&a!==b)(index[a]??=new Set()).add(b);};
 for(const [key,alternatives] of Object.entries(definitions||{})){
  if(!Array.isArray(alternatives))continue;
  const root=normalizeTerm(key,norm);
  for(const alternative of alternatives){
   if(typeof alternative!=='string')continue;
   const value=normalizeTerm(alternative,norm);
   connect(root,value);connect(value,root);
  }
 }
 return Object.fromEntries(Object.entries(index).map(([key,values])=>[key,[...values]]));
}
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
 // A demonstrációs hírek továbbra is kereshetők, de soha nem előzhetnek meg
 // egy azonos relevanciájú, ténylegesen közzétett intézményi tájékoztatást.
 return entry.isSample?Math.max(0,points-16):points;
}
export function setupSmartSearch({catalog,loadJSON,norm,dialog,input,results,status,onNavigate}){
 const pageSize=settingNumber('search.pageSize'),suggestionLimit=settingNumber('search.suggestionLimit'),maxResults=settingNumber('search.maxResults');
 // Az ékezetes szinonimák ugyanarra a normalizált kulcsra kerülnek,
 // mint a keresett kifejezések; az oda-vissza kapcsolatok duplikációmentesek.
 const synonyms=compileSynonyms(setting('search.synonyms'),norm);
 const featuredRoutes=validFeaturedRoutes(setting('search.featuredRoutes'));
 const typoMaximum=settingNumber('search.typoMaxDistance'),typoMinimum=settingNumber('search.typoMinimumLength'),statsLimit=settingNumber('search.statsSessionLimit');
 const sessionStats={searches:0,opened:0,empty:0};
 let all=[],query='',type='all',section='all',order='relevance',max=pageSize,rebuildSerial=0,unavailableSources=0,inputTimer=null,curationRules=[];
 let cachedQuery=null,cachedHits=[];
 const resultWrap=results;resultWrap.setAttribute('aria-label','Keresési találatok');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const form=element('div','j-search-tools');
 const typeLabel=element('label','j-search-field','Tartalomtípus');
 const typeSelect=element('select','j-search-select');typeSelect.setAttribute('aria-label','Tartalomtípus szerinti szűrés');
 const sectionLabel=element('label','j-search-field','Témakör');
 const sectionSelect=element('select','j-search-select');sectionSelect.setAttribute('aria-label','Témakör szerinti szűrés');
 const orderLabel=element('label','j-search-field','Találatok sorrendje');
 const orderSelect=element('select','j-search-select');orderSelect.setAttribute('aria-label','Keresési találatok rendezése');
 typeLabel.append(typeSelect);sectionLabel.append(sectionSelect);orderLabel.append(orderSelect);form.append(typeLabel,sectionLabel,orderLabel);
 input.insertAdjacentElement('afterend',form);
 const picks=element('div','j-search-picks');picks.setAttribute('aria-label','Keresési javaslatok');
 const resetBtn=element('button','j-search-clear','Keresés törlése');resetBtn.type='button';resetBtn.addEventListener('click',()=>{if(inputTimer){clearTimeout(inputTimer);inputTimer=null;}input.value='';query='';max=pageSize;type='all';section='all';order='relevance';typeSelect.value='all';sectionSelect.value='all';orderSelect.value='relevance';render();input.focus();});picks.append(resetBtn);
 form.insertAdjacentElement('afterend',picks);
 const more=element('button','j-search-more','További találatok');more.type='button';more.hidden=true;
 resultWrap.insertAdjacentElement('afterend',more);
 const related=element('section','j-search-related');related.hidden=true;related.setAttribute('aria-label','Kapcsolódó ellenőrzött tartalmak');
 const relatedHeading=element('h3','j-search-related-heading','Kapcsolódó ellenőrzött tartalmak');
 const relatedCards=element('div','j-search-related-cards');related.append(relatedHeading,relatedCards);more.insertAdjacentElement('afterend',related);
 const stats=element('p','csn20-search-stats');stats.setAttribute('aria-label','Helyi keresési statisztika');more.insertAdjacentElement('afterend',stats);
 const keyHelp=element('p','j-search-keyboard-help','Billentyűzettel: a keresőmezőből ↓ a találatokhoz lép; a találatok között ↑ és ↓, valamint Home és End használható. Az Escape bezárja a keresőt.');
 keyHelp.id='j-search-keyboard-help';form.insertAdjacentElement('afterend',keyHelp);
 input.setAttribute('aria-describedby',keyHelp.id);
 const list=element('datalist');list.id='j-search-suggestions';input.setAttribute('list',list.id);input.insertAdjacentElement('afterend',list);
 input.autocomplete='off';input.placeholder='Például: felvételi, nyílt nap, kosárlabda, dokumentum…';
 function option(select,value,name){const opt=document.createElement('option');opt.value=value;opt.textContent=name;select.append(opt);}
 function populateFilters(){
  typeSelect.replaceChildren();option(typeSelect,'all','Minden tartalom');
  Object.entries(TYPES).forEach(([value,name])=>option(typeSelect,value,name));
  sectionSelect.replaceChildren();option(sectionSelect,'all','Összes témakör');
  Object.entries(SECTIONS).forEach(([value,name])=>option(sectionSelect,value,name));
  orderSelect.replaceChildren();option(orderSelect,'relevance','Relevancia szerint');
  option(orderSelect,'title-asc','Cím szerint (A–Z)');option(orderSelect,'title-desc','Cím szerint (Z–A)');
 }
 populateFilters();
 function refreshFilterCounts(){
  const types=Object.fromEntries(Object.keys(TYPES).map(key=>[key,0])),sections=Object.fromEntries(Object.keys(SECTIONS).map(key=>[key,0]));
  for(const entry of all){if(entry.type in types)types[entry.type]++;if(entry.section in sections)sections[entry.section]++;}
  for(const option of typeSelect.options)option.textContent=option.value==='all'?`Minden tartalom (${all.length})`:`${TYPES[option.value]} (${types[option.value]??0})`;
  for(const option of sectionSelect.options)option.textContent=option.value==='all'?`Összes témakör (${all.length})`:`${SECTIONS[option.value]} (${sections[option.value]??0})`;
 }
 function rebuildPages(pages){
  return pages.items.filter(entry=>entry.page.lifecycle?.status==='published').map(entry=>{
   const generated=entry.page.searchText||'';
   const loaded=strings(entry.page.blocks||[]).join(' ');
   return {id:entry.page.id,title:entry.page.title,summary:entry.page.summary||'',tags:[...(entry.page.tags||[]),...(entry.page.categories||[])],body:[generated,loaded].filter(Boolean).join(' ').slice(0,settingNumber('search.textCharacterLimit')),href:entry.page.schemaExtensions.route,type:'page'};
  });
 }
 async function rebuild(pages){
  const serial=++rebuildSerial;
  const pageEntries=rebuildPages(pages);
  unavailableSources=0;
  all=pageEntries.map(e=>buildEntry(e,norm));cachedQuery=null;refreshFilterCounts();
  if(!dialog.hidden)render();
  const settled=await Promise.allSettled([
   ...DATASETS.map(async ([t,path])=>({t,data:await loadJSON(path)})),
   loadJSON('data/recommendation-rules-v1-40-10.json').then(data=>({t:'curation',data}))
  ]);
  if(serial!==rebuildSerial)return;
  const indexed=[...pageEntries];
  unavailableSources=settled.filter(r=>r.status==='rejected').length;
  let proposedRules=[];
  for(const r of settled){
   if(r.status==='fulfilled'&&r.value.t==='curation')proposedRules=Array.isArray(r.value.data?.rules)?r.value.data.rules:[];
   else if(r.status==='fulfilled')indexed.push(...indexPayload(r.value.t,r.value.data));
   else console.warn('Kereső: adatforrás átmenetileg nem elérhető:',r.reason);
  }
  all=uniqueSearchEntries(indexed).map(x=>buildEntry(x,norm));cachedQuery=null;refreshFilterCounts();
  const editorial=validateEditorialRules(proposedRules,all);curationRules=editorial.valid;
  if(editorial.problems.length)console.warn('Szerkesztői ajánlások kihagyva:',editorial.problems);
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
  btn.addEventListener('click',()=>{if(inputTimer){clearTimeout(inputTimer);inputTimer=null;}input.value=text;query=text;max=pageSize;render();input.focus();});return btn;
 }
 function firstMatchingTitles(predicate,limit){
  const titles=[];
  if(limit<=0)return titles;
  for(const entry of all){if(predicate(entry)){titles.push(entry.title);if(titles.length>=limit)break;}}
  return titles;
 }
 function renderPicks(){
  picks.replaceChildren(element('span','j-search-picks-label',query.trim()?'Kapcsolódó keresések:':'Gyorskeresések:'));
  const normalizedQuery=query.trim()?tokenizeSearchQuery(query,norm).join(' '):'';
  const suggestions=normalizedQuery
   ? firstMatchingTitles(x=>x.normalTitle.includes(normalizedQuery)&&x.normalTitle!==normalizedQuery,suggestionLimit)
   : setting('search.quickSuggestions');
  let picksList=[...new Set(suggestions)];
  if(normalizedQuery&&!picksList.length){const prefix=normalizedQuery.slice(0,Math.min(settingNumber('search.minimumFuzzyLength'),normalizedQuery.length)),tolerance=settingNumber('search.fuzzyWordLengthTolerance');picksList=firstMatchingTitles(x=>x.normalTitle.split(' ').some(word=>word.startsWith(prefix)&&Math.abs(word.length-normalizedQuery.length)<=tolerance),suggestionLimit);}
  for(const s of [...new Set(picksList)].slice(0,suggestionLimit))picks.append(suggestion(s));
  if(query.trim()||type!=='all'||section!=='all'||order!=='relevance')picks.append(resetBtn);
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
 function makeCard(entry,tokens,featured=false){
  const a=element('a','search-result');a.href=entry.href;a.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown Home End');
  if(featured)a.dataset.featured='true';
  if(entry.external){a.target='_blank';a.rel='noopener noreferrer';}
  const top=element('div','j-search-result-top');top.append(element('span','j-search-type',entry.isSample?'Fiktív minta · Hír':TYPES[entry.type]||'Tartalom'),element('span','j-search-section',SECTIONS[entry.section]||'Tartalom'));
  if(featured)top.append(element('span','j-search-featured','Kiemelt intézményi oldal'));
  const title=element('strong','search-result-title');appendHighlight(title,entry.title,tokens);
  const description=element('small');appendHighlight(description,entry.summary||'Kapcsolódó tartalom megtekintése',tokens);
  a.append(top,title,description);a.addEventListener('click',event=>{sessionStats.opened=Math.min(statsLimit,sessionStats.opened+1);updateStats();onNavigate(entry,query,event);});
  return a;
 }
 function render(){
  results.replaceChildren();renderPicks();
  const tokens=tokenizeSearchQuery(query,norm),q=tokens.join(' ');
  // A témakör- és típusválasztás, valamint a lapozás ugyanazt a rangsort használja;
  // a drágább ékezet-/elgépelés-összevetés csak új keresőszövegnél fut le.
  if(cachedQuery!==q){
   cachedHits=[];
   for(const x of all){const points=score(x,q,tokens,synonyms,typoMaximum,typoMinimum);if(points>=0){
    const featured=isFeaturedHit(x,tokens,featuredRoutes,norm);cachedHits.push({x,featured,score:points+(featured?65:0)});
   }}
   cachedHits=sortSearchHits(cachedHits);
   cachedQuery=q;
  }
  const matches=sortSearchHits(cachedHits.filter(hit=>(type==='all'||hit.x.type===type)&&(section==='all'||hit.x.section===section)),order);
  const shown=matches.slice(0,Math.min(max,maxResults));
  status.textContent=`${matches.length} találat · ${shown.length} megjelenítve`+(unavailableSources?` · ${unavailableSources} kiegészítő adatforrás átmenetileg nem érhető el`:'');
  const fragment=document.createDocumentFragment();
  for(const hit of shown)fragment.append(makeCard(hit.x,tokens,hit.featured));
  results.append(fragment);
  // A kiegészítő ajánlás kizárólag közzétett, nem minta oldalakból, hírekből,
  // ellenőrzött eseményekből és dokumentumokból áll össze.
  // A keresés és a megnyitások története nem kerül tartós tárolásba vagy hálózatra.
  const seed=query.trim()?matches.find(hit=>!hit.x.isSample)?.x:null;
  const relatedItems=seed?recommendRelatedContent(seed,all,{limit:6,perType:2,curationRules}):[];
  relatedCards.replaceChildren(...relatedItems.map(item=>makeCard(item,[],false)));
  related.hidden=relatedItems.length===0;
  if(!matches.length)results.append(element('p','j-search-empty','Nincs találat ezekkel a feltételekkel. Rövidebb keresőkifejezéssel, másik témakörrel vagy a szűrők törlésével próbálkozhatsz.'));
  results.setAttribute('aria-label',query.trim()?`${matches.length} találat a(z) ${query.slice(0,160)} keresésre`:'Keresési találatok');
  more.hidden=shown.length>=matches.length||shown.length>=maxResults;
  updateStats();
 }
 function updateStats(){stats.textContent=`Csak ebben a böngészőlapban: ${sessionStats.searches} keresés · ${sessionStats.opened} megnyitás · ${sessionStats.empty} találat nélküli keresés. Személyes keresőkifejezést nem tárolunk, statisztika nem kerül szerverre.`;}
 function registerSearch(){if(!query.trim())return;sessionStats.searches=Math.min(statsLimit,sessionStats.searches+1);if(!results.querySelector('a.search-result'))sessionStats.empty=Math.min(statsLimit,sessionStats.empty+1);updateStats();}
 function setQuery(value){query=String(value||'').slice(0,160);max=pageSize;render();}
 input.addEventListener('input',()=>{if(inputTimer)clearTimeout(inputTimer);inputTimer=setTimeout(()=>{inputTimer=null;setQuery(input.value);},90);});
 typeSelect.addEventListener('change',()=>{type=typeSelect.value;max=pageSize;render();});
 sectionSelect.addEventListener('change',()=>{section=sectionSelect.value;max=pageSize;render();});
 orderSelect.addEventListener('change',()=>{order=orderSelect.value;max=pageSize;render();});
 more.addEventListener('click',()=>{max+=pageSize;render();});
 input.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){
   const first=results.querySelector('a.search-result');if(first){e.preventDefault();first.focus();}
  }else if(e.key==='Enter'){
   if(inputTimer){clearTimeout(inputTimer);inputTimer=null;setQuery(input.value);}
   registerSearch();
   const first=results.querySelector('a.search-result');if(first){e.preventDefault();first.click();}
  }
 });
 results.addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
   const arr=[...results.querySelectorAll('a.search-result')],pos=arr.indexOf(document.activeElement);
   if(pos>=0){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?arr.length-1:e.key==='ArrowDown'?Math.min(pos+1,arr.length-1):pos-1;
    if(next<0)input.focus();else arr[next].focus();}
  }
 });
 return {rebuild,render,
  snapshot(){return {query,type,section,order,max};},
  restore(state){
   if(inputTimer){clearTimeout(inputTimer);inputTimer=null;}
   query=typeof state?.query==='string'?state.query.trim().slice(0,160):'';
   type=Object.hasOwn(TYPES,state?.type)?state.type:'all';
   section=Object.hasOwn(SECTIONS,state?.section)?state.section:'all';
   order=['relevance','title-asc','title-desc'].includes(state?.order)?state.order:'relevance';
   max=Number.isSafeInteger(state?.max)?Math.min(maxResults,Math.max(pageSize,state.max)):pageSize;
   input.value=query;typeSelect.value=type;sectionSelect.value=section;orderSelect.value=order;render();
  },
  reset(){if(inputTimer){clearTimeout(inputTimer);inputTimer=null;}query='';type='all';section='all';order='relevance';max=pageSize;input.value='';typeSelect.value='all';sectionSelect.value='all';orderSelect.value='relevance';render();}};
}
