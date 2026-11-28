import {selectFooterTimeline,budapestDay,timelineStatusLabel} from './components/footer-timeline-model.js?v=2.82';
import {revalidateDomain} from './data/domain-loader.js?v=2.82';
import {checkedNews} from './menu-data.js?v=2.82';
import {addTimelineControls} from './components/timeline-controls.js?v=2.82';
import {createHistoryExplorer} from './components/history-explorer.js?v=2.82';
import {createChartPanel,animateCounter} from './components/svg-charts.js?v=2.82';
import {getPersonal,patchPersonal} from './state/personal-preferences.js?v=2.82';
import {verifiedSports,filterSports,groupYears,loadHistory} from "./components/number-model.js?v=2.82";
import { element as el } from './dom.js?v=2.82';
import { openContentDialog } from './content-expansion.js?v=2.82';

// Every number is derived from the current JSON, never from a decorative sample.
export function homeDataMetrics(config) {
 const docs=config.documentCenter.items;
 const sports=verifiedSports(config.home.sportSuccesses.items).map(x=>({...x,sourceUrl:config.contentExpansion.sources[x.source]?.url}));
 const years=[...new Set(sports.map(x=>x.date.slice(0,4)))].sort();
 return {documents:{available:docs.filter(x=>x.status==='available'&&x.file).length,total:docs.length},
  collections:[{id:'news',value:config.publicNews.length},{id:'events',value:config.home.calendar.events.length},{id:'media',value:config.mediaCenter.items.filter(x=>x.publication!=='draft').length}],
  sports:{total:sports.length,years:years.map(year=>({year,value:sports.filter(x=>x.date.startsWith(year+'-')).length})),items:sports}};
}
// A három eltérő mutató külön skálát kap; a sportsikerek dátumai a forrásrekordokból érkeznek.
const fmt=n=>new Intl.NumberFormat('hu-HU').format(n);
function availability(available,total,labels){const percent=total?Math.round(available/total*100):0;return el('div',{className:'numbers-availability'},el('span',{className:'numbers-percent',text:`${percent}%`}),el('span',{className:'numbers-progress',attributes:{'aria-hidden':'true'}},el('span',{attributes:{style:`--fill:${percent}%`}})),el('span',{className:'numbers-legend'},el('span',{text:`${fmt(available)} megnyitható fájl`}),el('span',{text:`${fmt(total-available)} függő tétel`})))}
function timeline(items,interactive=false){const ordered=[...items].sort((a,b)=>a.date.localeCompare(b.date));const list=ordered.length?el('ol',{className:'numbers-timeline'},...ordered.map(x=>el('li',{},el('time',{text:new Intl.DateTimeFormat('hu-HU',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(x.date+'T00:00:00Z')),attributes:{datetime:x.date}}),el('strong',{text:`${x.sport} · ${x.result}`}),el('span',{text:x.competition}),x.dateKind==='publication'?el('small',{text:'A beszámoló közzétételének dátuma'}):null,x.sourceUrl?.startsWith('https://')?el('a',{text:'Forrás',attributes:{href:x.sourceUrl,target:'_blank'}}):null))):el('p',{text:'Nincs igazolt eredmény a nyilvántartásban.'});if(!interactive||!ordered.length)return list;const tools=addTimelineControls(list,'Sportsikerek idővonala');return el('div',{},tools.controls,list);}
export function createHomeDataStrip(config,platform,expanded=false){
 const settings=config.home.dataStrip;if(!settings?.enabled)return null;
 if(!expanded)return createCompactStrip(config,platform);
 const m=homeDataMetrics(config),labels=settings.labels,charts=settings.charts||{};
 const titleId=`${platform}-home-data-detail-title`;
 const section=el('section',{className:`numbers-full-content`,attributes:{'aria-labelledby':titleId,'data-home-data-strip':platform}},el('div',{className:'numbers-heading'},el('span',{className:'numbers-kicker',text:'Adatok és eredmények'}),el('h2',{text:settings.title,attributes:{id:titleId}}),el('p',{text:'A honlap nyilvántartásainak áttekintése és az ellenőrzött sportsikerek idővonala.'})));
 const row=el('div',{className:'home-data-row'});if(charts.animation===true)section.classList.add("numbers-animated");
 function add(id,graphic,value,summary,detail){
  const def=settings.cards[id];const button=el('button',{className:'numbers-detail-button',text:labels.details+' →',attributes:{type:'button','aria-haspopup':'dialog','aria-label':`${def.title}: ${summary}. ${labels.details}`}}); const card=el('article',{className:'home-data-card',attributes:{'data-metric':id}},el('h3',{className:'home-data-label',text:def.title}),el('strong',{className:'home-data-value',text:value}),el('div',{className:'home-data-graphic'},graphic),button);
  button.addEventListener('click',()=>openContentDialog({title:def.title,trigger:button,views:[()=>el('div',{className:'home-data-detail'},el('p',{className:'content-kicker',text:settings.detailKicker}),el('p',{text:def.note}),detail(),el('a',{className:'content-action recommendation-visit',text:labels.open,attributes:{href:'#/oldal/'+def.page}}))]}));row.append(card);
 }
 const docs=m.documents;
 const chart=(id,title,items)=>{const def=charts.svg?.[id]||{};return createChartPanel({items,title,type:getPersonal(config).charts[id]||def.type||'bar',allowed:def.allowed||['bar','table'],animate:charts.animation===true,selected:getPersonal(config).chartSeries[id]??null,onSelection:series=>patchPersonal(config,p=>p.chartSeries[id]=series),onChange:type=>patchPersonal(config,p=>p.charts[id]=type)});};
 add('documents',el('div',{},availability(docs.available,docs.total,labels),chart('documents','Dokumentumok',[{label:'Megnyitható',value:docs.available},{label:'Függő',value:docs.total-docs.available}])),`${docs.available}/${docs.total}`,`${docs.available} elérhető dokumentum a(z) ${docs.total} tételből`,()=>el('dl',{className:'home-data-detail-list'},el('dt',{text:labels.available}),el('dd',{text:docs.available}),el('dt',{text:labels.pending}),el('dd',{text:docs.total-docs.available})));
 const sum=m.collections.reduce((a,x)=>a+x.value,0);
 add('collections',chart('collections','Tartalmi bejegyzések',m.collections.map(x=>({label:labels[x.id]||x.id,value:x.value}))),sum, m.collections.map(x=>`${labels[x.id]}: ${x.value}`).join(', '),()=>el('dl',{className:'home-data-detail-list'},...m.collections.flatMap(x=>[el('dt',{text:labels[x.id]||x.id}),el('dd',{text:x.value})])));
 add('sports',timeline(m.sports.items),m.sports.total,`${m.sports.total} forrással jelölt eredmény`,()=>el('ul',{className:'home-data-result-list'},...m.sports.items.map(x=>el('li',{text:`${x.date.slice(0,4)} · ${x.sport} · ${x.result} – ${x.competition}`}))));
 // Keep the original three metric cards; the extended explorer is a separate full-width region.
 const select=(label,values)=>el('select',{attributes:{'aria-label':label}},el('option',{text:'Összes',attributes:{value:''}}),...values.map(v=>el('option',{text:v,attributes:{value:v}})));
 const year=select('Sportsiker éve',m.sports.years.map(x=>x.year)),sport=select('Sportág',[...new Set(m.sports.items.map(x=>x.sport))].sort((a,b)=>a.localeCompare(b,'hu')));
 const filterStatus=el('p',{className:'numbers-filter-status',attributes:{role:'status','aria-live':'polite'}}),results=el('div',{className:'numbers-filter-results'});
 const explorer=el('div',{className:'numbers-explorer'},el('h3',{text:'Sportsikerek szűrése'}),el('div',{className:'numbers-filters'},el('label',{},el('span',{text:'Év'}),year),el('label',{},el('span',{text:'Sportág'}),sport)),filterStatus,results);
 const sportCard=row.querySelector('[data-metric=sports] .home-data-graphic');sportCard.replaceChildren(explorer);
 function update(){const items=filterSports(m.sports.items,year.value,sport.value);filterStatus.textContent=`${items.length} forrással jelölt eredmény`;results.replaceChildren(timeline(items,true));}
 year.addEventListener('change',update);sport.addEventListener('change',update);update();
 const years=groupYears(m.sports.items),yearLabels=Object.fromEntries(years.map(x=>[x.id,x.id+' tanév']));const yearView=el('div',{className:'numbers-year-view'},chart('schoolYears','Tanévi sportsikerek',years.map(x=>({label:yearLabels[x.id],value:x.value}))));
 const viewButton=el('button',{className:'numbers-detail-button',text:'Adatok táblázatban',attributes:{type:'button','aria-pressed':'false'}});let table=yearView.querySelector('select').value==='table';const syncButton=()=>{table=yearView.querySelector('select').value==='table';viewButton.textContent=table?'Grafikon megjelenítése':'Adatok táblázatban';viewButton.setAttribute('aria-pressed',String(table));};yearView.querySelector('select').addEventListener('change',syncButton);syncButton();viewButton.addEventListener('click',()=>{table=!table;const input=yearView.querySelector('select');input.value=table?'table':(charts.svg?.schoolYears?.type||'bar');input.dispatchEvent(new Event('change'));viewButton.textContent=table?'Grafikon megjelenítése':'Adatok táblázatban';viewButton.setAttribute('aria-pressed',String(table));});
 const annual=el('article',{className:'numbers-extra'},el('h3',{text:'Forrással jelölt sportsikerek tanévenként'}),el('p',{text:'A nyilvántartásban található igazolt rekordok száma a rekord dátuma szerint, szeptemberi tanévkezdéssel. A nem szereplő tanév ismeretlen, nem nulla. Nem teljesítménytrend.'}),yearView,viewButton);
 const history=el('details',{className:'numbers-extra numbers-history'},el('summary',{text:'Az iskola történetének idővonala'}));const historyBody=el('div',{className:'numbers-history-body'});history.append(historyBody);let loading=false,loaded=false,historyRange=null;
 async function drawHistory(){if(!history.open||loading||loaded)return;loading=true;historyBody.replaceChildren(el('p',{text:'Történeti adatok betöltése…',attributes:{role:'status'}}));try{const items=await loadHistory(config);const panel=createHistoryExplorer(items);panel.setRange(historyRange);historyBody.replaceChildren(panel);loaded=true;}catch(e){const retry=el('button',{className:'numbers-detail-button',text:'Újrapróbálás',attributes:{type:'button'}});retry.addEventListener('click',drawHistory);historyBody.replaceChildren(el('p',{text:'A történeti adatforrás nem tölthető be.',attributes:{role:'status'}}),retry);}finally{loading=false;}}
 history.addEventListener('toggle',drawHistory);
 section.adaptiveSnapshot=()=>({year:year.value,sport:sport.value,table,history:history.open,historyRange:historyBody.firstElementChild?.getRange?.()||historyRange});section.adaptiveRestore=x=>{year.value=x?.year||'';sport.value=x?.sport||'';update();if(!!x?.table!==table)viewButton.click();historyRange=x?.historyRange||null;historyBody.firstElementChild?.setRange?.(historyRange);history.open=!!x?.history;};

 if(charts.animation===true){animateCounter(row.querySelector('[data-metric=collections] .home-data-value'),sum);animateCounter(row.querySelector('[data-metric=sports] .home-data-value'),m.sports.total);}
 const order=el('select',{attributes:{'aria-label':'Adatközpont kártyasorrendje'}});const ids=['documents','collections','sports'],orders=ids.flatMap(a=>ids.filter(b=>b!==a).map(b=>[a,b,ids.find(c=>c!==a&&c!==b)]));for(const seq of orders)order.append(el('option',{text:seq.map(id=>settings.cards[id].title).join(' → '),attributes:{value:seq.join(',')}}));const applyOrder=seq=>{for(const id of seq){const card=row.querySelector(`[data-metric=${id}]`);if(card)row.append(card);}};const savedOrder=getPersonal(config).chartOrder;order.value=savedOrder.join(',');applyOrder(savedOrder);order.addEventListener('change',()=>{const seq=orders.find(x=>x.join(',')===order.value);if(!seq)return;patchPersonal(config,p=>p.chartOrder=seq);applyOrder(seq);});section.querySelector('.numbers-heading').append(el('label',{className:'numbers-card-order'},el('span',{text:'Adatkártyák sorrendje'}),order));
 section.append(row,annual,history,el('p' ,{className:'numbers-footnote',text:'A tartalmi darabszám bemutató- és ellenőrizendő rekordokat is tartalmaz. Az idővonal nem az iskola teljes eredménytörténete.'}));return section;
}

// Egy kiadáson belül a sikeresen ellenőrzött hír-pillanatkép a nézetváltást is túléli.
const footerFeedCache=new WeakMap();
function footerFeed(config){let feed=footerFeedCache.get(config);if(!feed){feed={news:config.publicNews,lastFetch:Date.now(),pending:null};footerFeedCache.set(config,feed);}return feed;}
// A kezdőlapon csak egy vízszintes idősáv; a részletes, közös komponens az első megnyitáskor készül el.
function createCompactStrip(config,platform){
 const dialogId=`${platform}-numbers-dialog`;
 const feed=footerFeed(config);let lastSignature='',disposed=false;
 const policy=config.home.dataStrip.footerTimeline||{};
 const refreshMs=Math.max(60,Math.min(3600,Number(policy.refreshSeconds)||300))*1000;
 const open=el('button',{className:'numbers-compact-trigger',attributes:{type:'button','aria-haspopup':'dialog','aria-controls':dialogId,'aria-label':'Csanádi számokban – részletes adatközpont megnyitása'}},el('span',{className:'numbers-compact-title'},el('span',{text:config.home.dataStrip.title}),el('span',{className:'numbers-compact-arrow',text:'↗',attributes:{'aria-hidden':'true'}})));
 const line=el('div',{className:'numbers-compact-line',attributes:{role:'group','aria-label':'Az iskola története és aktuális közleményei'}});
 const outer=el('section',{className:`home-data-strip home-data-strip-${platform} numbers-compact footer-timeline`,attributes:{'aria-label':config.home.dataStrip.title,'data-home-data-strip':platform,'data-adaptive-state':'numbers-explorer'}},open,line);
 let content=null,dialog=null,saved=null,activeTrigger=open,detail=null;
 function ensure(){if(content)return;content=createHomeDataStrip(config,platform,true);if(saved)content.adaptiveRestore(saved);const close=el('button',{className:'numbers-detail-button numbers-dialog-close',text:'Bezárás ×',attributes:{type:'button'}});detail=el('article',{className:'numbers-selected-event',attributes:{'aria-live':'polite'}});detail.hidden=true;dialog=el('dialog',{className:'school-data-dialog',attributes:{id:dialogId,'aria-labelledby':`${platform}-home-data-detail-title`}},close,detail,content);outer.append(dialog);close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(activeTrigger.isConnected)activeTrigger.focus({preventScroll:true});else open.focus({preventScroll:true});draw();});dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});}
 function show(trigger,event){ensure();activeTrigger=trigger;detail.hidden=!event;detail.replaceChildren();if(event)detail.append(el('h3',{text:event.period+' – '+event.title}),el('p',{className:'numbers-event-status',text:timelineStatusLabel(config,event.status)}),el('p',{text:event.description}),event.verifiedAt?el('p',{className:'numbers-event-source-date',text:'Forrás ellenőrzése: '+event.verifiedAt}):null,el('a',{text:'Esemény forrása',attributes:{href:event.source,target:'_blank',rel:'noopener noreferrer'}}));if(!dialog.open){dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.numbers-dialog-close').focus({preventScroll:true});}}
 function draw(){
  if(disposed)return;const points=selectFooterTimeline(config,feed.news,budapestDay()),signature=JSON.stringify(points);
  if(signature===lastSignature||dialog?.open||line.contains(document.activeElement))return;
  lastSignature=signature;line.replaceChildren();
  for(const x of points){const label=timelineStatusLabel(config,x.status), dynamic=!['history','result'].includes(x.status);const button=el('button',{className:'numbers-compact-point',attributes:{type:'button','aria-haspopup':'dialog','aria-controls':dialogId,'aria-label':x.period+' – '+x.title+(dynamic?' – '+label:''),'data-event-status':x.status,'data-event-id':x.id}},el('span',{className:'numbers-compact-date',text:x.period}),el('span',{className:'numbers-compact-dot',attributes:{'aria-hidden':'true'}}),el('span',{className:'numbers-compact-result'},el('span',{text:x.title}),dynamic?el('small',{className:'numbers-compact-status',text:label}):null));button.addEventListener('click',()=>show(button,x));line.append(button);}
 }
 draw();line.addEventListener('focusout',()=>queueMicrotask(draw));
 outer.refreshTimeline=async()=>{
  if(disposed)return;draw();
  if(!feed.pending&&Date.now()-feed.lastFetch>=refreshMs){
   feed.lastFetch=Date.now();feed.pending=revalidateDomain(config,'news').then(record=>{checkedNews({...config,publicNews:record.data});feed.news=record.data;}).catch(e=>console.warn('[Csanádi] Az idővonal híreinek frissítése nem sikerült.',e)).finally(()=>{feed.pending=null;});
  }
  if(feed.pending){await feed.pending;draw();}
 };
 outer.destroyTimeline=()=>{disposed=true;};
 open.addEventListener('click',()=>show(open,null));
 outer.adaptiveSnapshot=()=>content?.adaptiveSnapshot?.()||saved;outer.adaptiveRestore=value=>{saved=value;if(content&&value)content.adaptiveRestore(value);};
 return outer;
}
