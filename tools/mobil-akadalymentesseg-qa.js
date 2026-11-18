/* v1.40.9 – mobil QA: méret, szemantika, billentyűzet- és hivatkozási audit. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),widths=[320,390,768];
 const frame=$('qa-frame'),status=$('qa-status'),tbody=$('qa-results');
 let results=[],running=false,beforeQa=null,afterQa=null,difference=null;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const safeRoute=value=>/^#\/[a-z0-9/-]*$/.test(value)?value:'#/';
 function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),2500);}
 async function fillRoutes(){
  try{const response=await fetch('../json/oldalindex.json',{cache:'no-store'});if(!response.ok)throw Error(String(response.status));const data=await response.json();
   const existing=new Set(['#/']);for(const page of Object.values(data.pages||{})){
    if(page?.lifecycle?.status!=='published')continue;
    const route=safeRoute(page.schemaExtensions?.route);if(existing.has(route))continue;existing.add(route);
    const option=document.createElement('option');option.value=route;option.textContent=(page.title||route)+' · '+route;$('qa-route').append(option);
   }
  }catch(error){console.warn('QA: az útvonalak betöltése sikertelen',error);}
 }
 async function ensureFrame(route){
  const target='../index.html'+route;
  if(frame.dataset.route!==route){frame.dataset.route=route;await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Az oldal betöltése időtúllépésbe ütközött.')),12000);
   frame.onload=()=>{clearTimeout(timer);resolve();};frame.src=target;
  });}
  for(let i=0;i<28;i++){
   try{const doc=frame.contentDocument;if(doc?.querySelector('#app')&&!doc.querySelector('#app .loading-area'))break;}catch{}
   await pause(150);
  }
 }
 function measure(width,route){
  const win=frame.contentWindow,doc=frame.contentDocument;
  if(!win||!doc)throw Error('A keret nem azonos eredetű: HTTP(S) alatt, ugyanazon tárhelyről indítsd az eszközt.');
  const actual=Math.round(win.innerWidth),root=doc.documentElement,body=doc.body;
  const overflow=Math.max(0,Math.ceil(Math.max(root.scrollWidth,body?.scrollWidth||0)-actual));
  const visible=selector=>[...doc.querySelectorAll(selector)].filter(el=>{const box=el.getBoundingClientRect(),style=win.getComputedStyle(el);return box.width>0&&box.height>0&&style.visibility!=='hidden'&&style.display!=='none'});
  const targets=visible('button,input[type=button],input[type=search],a[href]');
  const tiny=targets.filter(el=>{const r=el.getBoundingClientRect();return r.width<24||r.height<24;}).slice(0,12).map(el=>el.id||el.getAttribute('aria-label')||el.textContent?.trim().slice(0,50)||el.tagName);
  const headerItems=visible('#site-header .brand, #site-header .header-kreta, #site-header #search-open, #site-header #theme-toggle, #site-header #portal-replay, #site-header #mobile-menu-toggle');
  const headerOverlaps=[];
  for(let i=0;i<headerItems.length;i++)for(let j=i+1;j<headerItems.length;j++){
   const a=headerItems[i].getBoundingClientRect(),b=headerItems[j].getBoundingClientRect();
   if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>3&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>3){
    headerOverlaps.push((headerItems[i].id||headerItems[i].className)+' / '+(headerItems[j].id||headerItems[j].className));
   }
  }
  const aria=Boolean(doc.querySelector('#cs1404-route-status[role=status][aria-live=polite]')&&doc.querySelector('main#app')&&doc.querySelector('#mobile-menu-toggle[aria-controls=site-map-overlay]'));
  const a11yIssues=[];
  if(!doc.documentElement.lang?.trim())a11yIssues.push('Hiányzó dokumentumnyelv');
  const missingAlts=visible('img:not([alt])');if(missingAlts.length)a11yIssues.push(`${missingAlts.length} kép alt attribútum nélkül`);
  const idSet=new Set();for(const element of doc.querySelectorAll('[id]')){if(idSet.has(element.id))a11yIssues.push(`Duplikált ID: ${element.id}`);idSet.add(element.id);if(a11yIssues.length>=18)break;}
  const unnamed=visible('input:not([type=hidden]),select,textarea').filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')&&!el.getAttribute('title'));
  if(unnamed.length)a11yIssues.push(`${unnamed.length} mező hozzáférhető név nélkül`);
  const headings=visible('h1,h2,h3,h4,h5,h6');
  if(!headings.some(el=>el.tagName==='H1'))a11yIssues.push('Nincs látható H1 címsor');
  let lastLevel=0;
  for(const heading of headings){const level=Number(heading.tagName.slice(1));if(lastLevel&&level>lastLevel+1){a11yIssues.push(`Címsorszint-ugrás: H${lastLevel} → H${level}`);break;}lastLevel=level;}
  const brokenAria=visible('[aria-expanded][aria-controls]').filter(el=>!doc.getElementById(el.getAttribute('aria-controls')));
  if(brokenAria.length)a11yIssues.push(`${brokenAria.length} kibontó vezérlőhöz nem tartozik célazonosító`);
  const unsafeBlanks=visible('a[target="_blank"]').filter(el=>!String(el.getAttribute('rel')||'').split(/\s+/).includes('noopener'));
  if(unsafeBlanks.length)a11yIssues.push(`${unsafeBlanks.length} új lapra nyíló hivatkozáson nincs noopener`);
  const result={width,actual,route,overflow,tinyTargets:tiny,headerOverlaps,aria,a11yIssues,passed:actual===width&&overflow<=1&&tiny.length===0&&headerOverlaps.length===0&&aria&&a11yIssues.length===0};
  return result;
 }
 function paint(){tbody.replaceChildren();for(const result of results){const row=document.createElement('tr');
  const columns=[result.width+' px',result.route,result.overflow+' px',result.tinyTargets.length?result.tinyTargets.join(', '):'Megfelelő',result.headerOverlaps.length?result.headerOverlaps.join(', '):'Nincs',result.aria?'Megvan':'Hiányzik',result.a11yIssues?.join(', ')||'Nincs automatikusan feltárt hiba',result.passed?'MEGFELELT':'ELLENŐRZENDŐ'];
  for(const value of columns){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}row.dataset.status=result.passed?'pass':'review';tbody.append(row);
 }}
 async function run(){if(running)return;running=true;results=[];$('qa-run').disabled=true;$('qa-json').disabled=true;$('qa-csv').disabled=true;tbody.replaceChildren();
  const route=safeRoute($('qa-route').value);try{
   await ensureFrame(route);
   for(const width of widths){frame.style.width=width+'px';$('qa-width').textContent=width+' CSS px · '+route;status.textContent=width+' pixeles vizsgálat…';await pause(250);
    // A böngészőnek szüksége van két képkockára a stílusok újraszámításához.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    results.push(measure(width,route));paint();
   }
   const passed=results.filter(x=>x.passed).length;status.textContent=`${passed}/${results.length} méret felelt meg az automatikus ellenőrzéseken. A kézi lista ettől független.`;
   $('qa-json').disabled=false;$('qa-csv').disabled=false;
  }catch(error){status.textContent='A mérés nem fejezhető be: '+error.message;console.warn('Mobil QA:',error);}
  finally{running=false;$('qa-run').disabled=false;}
 }
 $('qa-run').addEventListener('click',run);
 $('qa-json').addEventListener('click',()=>download('csanadi_mobil_qa_v1_40_9.json',JSON.stringify({release:'1.40.9',automatedOnly:true,manualScreenReaderCertified:false,results},null,2),'application/json'));
 $('qa-csv').addEventListener('click',()=>{const lines=[['width','actual','route','overflowPx','smallTargets','headerOverlaps','aria','a11yIssues','passed'],...results.map(x=>[x.width,x.actual,x.route,x.overflow,x.tinyTargets.join('|'),x.headerOverlaps.join('|'),x.aria,x.a11yIssues?.join('|'),x.passed])];
  download('csanadi_mobil_qa_v1_40_9.csv','\ufeff'+lines.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');});
 async function readQaFile(file){if(!file)throw Error('Nincs fájl.');if(file.size>5*1024*1024)throw Error('A JSON túl nagy (legfeljebb 5 MiB).');return JSON.parse(await file.text());}
 async function compareQa(){
  const status=$('qa-diff-status'),list=$('qa-diff-list');list.replaceChildren();difference=null;$('qa-diff-export').disabled=true;
  if(!beforeQa||!afterQa){status.textContent='Az összevetéshez két külön jegyzőkönyv szükséges.';return;}
  const {compareMobileQaReports}=await import('./qa-diff-core-v1-40-7.mjs');difference=compareMobileQaReports(beforeQa,afterQa);
  status.textContent=`${difference.resolved.length} megszűnt, ${difference.introduced.length} új, ${difference.persistent.length} fennmaradó hiba · ${difference.coverageGaps.length} lefedettségi hiány. ${difference.manualCertificationMissing?'Kézi képernyőolvasós tanúsítás nincs igazolva.':''}`;
  const entries=[...difference.resolved.map(x=>['Megszűnt',x]),...difference.introduced.map(x=>['Új',x]),...difference.persistent.map(x=>['Fennmaradt',x]),...difference.coverageGaps.map(x=>['Nincs összevethető mérés',{scope:x.scope,issue:x.missing}])];
  for(const [category,item] of entries){const li=document.createElement('li');li.textContent=`${category} · ${item.scope} · ${item.issue}`;list.append(li);}
  $('qa-diff-export').disabled=false;
 }
 $('qa-import').addEventListener('change',async event=>{
  const output=$('qa-import-status'),list=$('qa-import-issues');list.replaceChildren();beforeQa=null;
  try{const file=event.target.files?.[0];if(!file)return;
   const data=await readQaFile(file);const {analyzeMobileQa}=await import('./qa-import-core-v1-40-6.mjs');const review=analyzeMobileQa(data);beforeQa=data;
   output.textContent=`${review.measurements} mérés · ${review.issues.length} figyelmeztetés · ${review.passed?'Teljes ellenőrzési sor':'További vizsgálat szükséges'}.`;
   for(const issue of review.issues){const item=document.createElement('li');item.textContent=issue;list.append(item);}
  }catch(error){output.textContent='A jegyzőkönyv nem értelmezhető: '+error.message;}
  await compareQa();
 });
 $('qa-after-import').addEventListener('change',async event=>{
  afterQa=null;difference=null;$('qa-diff-export').disabled=true;try{afterQa=await readQaFile(event.target.files?.[0]);await compareQa();}
  catch(error){$('qa-diff-status').textContent='Az új jegyzőkönyv nem értelmezhető: '+error.message;}
 });
 $('qa-diff-export').addEventListener('click',()=>{if(!difference)return;download('csanadi_mobil_qa_valtozasok_v1_40_7.json',JSON.stringify({release:'1.40.7',...difference},null,2),'application/json');});
 fillRoutes();
})();
