/* v1.40.5 – valódi böngészőben, azonos eredetről futó, kizárólag olvasó QA. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),widths=[320,390,768];
 const frame=$('qa-frame'),status=$('qa-status'),tbody=$('qa-results');
 let results=[],running=false;
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
  const aria=Boolean(doc.querySelector('#cs1404-route-status[role=status][aria-live=polite]')&&doc.querySelector('main#app')&&doc.querySelector('#mobile-menu-toggle[aria-controls=site-map-overlay]'));
  const result={width,actual,route,overflow,tinyTargets:tiny,aria,passed:actual===width&&overflow<=1&&tiny.length===0&&aria};
  return result;
 }
 function paint(){tbody.replaceChildren();for(const result of results){const row=document.createElement('tr');
  const columns=[result.width+' px',result.route,result.overflow+' px',result.tinyTargets.length?result.tinyTargets.join(', '):'Megfelelő',result.aria?'Megvan':'Hiányzik',result.passed?'MEGFELELT':'ELLENŐRZENDŐ'];
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
 $('qa-json').addEventListener('click',()=>download('csanadi_mobil_qa_v1_40_5.json',JSON.stringify({release:'1.40.5',automatedOnly:true,manualScreenReaderCertified:false,results},null,2),'application/json'));
 $('qa-csv').addEventListener('click',()=>{const lines=[['width','actual','route','overflowPx','smallTargets','aria','passed'],...results.map(x=>[x.width,x.actual,x.route,x.overflow,x.tinyTargets.join('|'),x.aria,x.passed])];
  download('csanadi_mobil_qa_v1_40_5.csv','\ufeff'+lines.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';')).join('\r\n'),'text/csv;charset=utf-8');});
 fillRoutes();
})();
