
 
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const append=(to,...nodes)=>{nodes.filter(Boolean).forEach(n=>to.append(n));return to;};
const formatted=(n)=>Number.isFinite(n)?(n<1000?Math.round(n)+' ms':(n/1000).toFixed(2).replace('.',',')+' s'):'—';
const MAX_CHECKS=110;
let diagnosticsReady=false;
export function initDetailedDiagnostics(){
 if(diagnosticsReady)return;diagnosticsReady=true;
 const panel=document.querySelector('.cs-speed-panel');if(!panel)return;
 const details=el('details','ext26-perf-details'),summary=el('summary','','Részletes betöltési adatok – CSS, JavaScript, JSON, képek');
 const hint=el('p','','A böngésző Performance API-jának mérései. Külső CDN esetén az átviteli méret és a pontos idő a böngésző engedélyeitől függ; ezek nem hálózati sebességmérések.');
 const target=el('div','ext26-perf-grid'),refresh=el('button','ext26-refresh','Mérés frissítése');refresh.type='button';
 details.append(summary,hint,refresh,target);panel.append(details);
 const draw=()=>{
  target.replaceChildren();
  const resources=performance.getEntriesByType?.('resource')||[];
  const groups={JSON:[],JavaScript:[],CSS:[],Képek:[],Videók:[],Egyéb:[]};
  for(const entry of resources){let path='';try{path=new URL(entry.name).pathname;}catch{continue;}
   const group=/\.json$/i.test(path)?'JSON':/\.js$/i.test(path)?'JavaScript':/\.css$/i.test(path)?'CSS':/\.(?:webp|png|jpe?g|svg|gif)$/i.test(path)?'Képek':/\.(?:mp4|webm)$/i.test(path)?'Videók':'Egyéb';groups[group].push(entry);
  }
  for(const [name,items] of Object.entries(groups)){
   const measured=items.map(x=>Math.max(0,x.responseEnd-x.startTime));
   const bytes=items.reduce((total,x)=>total+(x.transferSize||0),0);
   const card=el('div','ext26-perf-card');const speed=items.length?Math.max(...measured):null;
   const label=`${items.length} kérés · leghosszabb ${formatted(speed)} · ${bytes>0?(bytes/1024).toFixed(0)+' KB mért átvitel':'átviteli méret nem ismert'}`;
   card.append(el('strong','',name),el('span','',label));target.append(card);
  }
  const nav=performance.getEntriesByType?.('navigation')?.[0];if(nav){const row=el('p','ext26-perf-final',`HTML válasz (TTFB): ${formatted(nav.responseStart-nav.requestStart)} · DOM feldolgozás: ${formatted(nav.domContentLoadedEventEnd)} · böngészőbetöltés: ${formatted(nav.loadEventEnd||null)}`);target.append(row);}
 };
 refresh.addEventListener('click',draw);details.addEventListener('toggle',()=>{if(details.open)draw();});
 document.addEventListener('csanadi:route-rendered',()=>{if(details.open)requestAnimationFrame(draw);});
}
const isLocalRef=href=>typeof href==='string'&&!/^(?:https?:|mailto:|tel:|data:|blob:)/i.test(href)&&!href.startsWith('#');
export function initSiteHealth(catalog){
 if(document.querySelector('#cs-site-health'))return;
 const footer=document.querySelector('.site-footer');if(!footer)return;
 const panel=el('details','ext26-health container-xxl');panel.id='cs-site-health';
 const title=el('summary','','Honlapállapot ellenőrzése · oldalak, média, JSON és hivatkozások');
 const section=el('div','ext26-health-body'),desc=el('p','','Helyi, böngészős ellenőrzés: csak a saját tárhely fájljait vizsgálja. Az ellenőrzés nem helyettesíti a teljes biztonsági, akadálymentességi vagy böngészőközi auditot.');
 const button=el('button','ext26-run-check','Ellenőrzés indítása');button.type='button';
 const status=el('p','ext26-health-state','Készen áll'),results=el('div','ext26-health-results');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 section.append(desc,button,status,results);panel.append(title,section);
 const speed=footer.querySelector('.cs-speed-panel');speed?speed.after(panel):footer.prepend(panel);
 const mark=(ok,msg)=>{const item=el('div',ok?'ext26-check-pass':'ext26-check-fail',`${ok?'✓':'!'} ${msg}`);results.append(item);};
 button.addEventListener('click',async()=>{
  button.disabled=true;results.replaceChildren();status.textContent='Az ellenőrzés folyamatban…';
  let ok=0,fail=0,skipped=0;
  const check=(condition,message)=>{if(condition)ok++;else fail++;mark(condition,message);};
  try{
   const roots=[...catalog.items].map(x=>x.page?.schemaExtensions?.route);const unique=new Set(roots);
   check(roots.length===unique.size,`${roots.length} regisztrált oldal – az útvonalazonosítók ${roots.length===unique.size?'egyediek':'ütköznek'}`);
   const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);check(ids.length===new Set(ids).size,'A jelenlegi oldalon nincs ismétlődő HTML-azonosító');
   const internal=[...document.querySelectorAll('a[href^="#/"]')].map(x=>x.getAttribute('href'));const broken=internal.filter(h=>!unique.has(h)&&h!=='#/');
   check(!broken.length,broken.length?`Hibás belső hivatkozások: ${[...new Set(broken)].slice(0,5).join(', ')}`:`${internal.length} belső hivatkozás ellenőrizve`);
   const rootURL=new URL('json/',document.baseURI);
   try{const [config,index]=await Promise.all(['config.json','oldalindex.json'].map(async file=>{const response=await fetch(new URL(file,rootURL),{cache:'no-store'});if(!response.ok)throw Error(file+': '+response.status);return response.json();}));check(!!config&&index?.schemaVersion==='1.0.0'&&Object.keys(index.pages||{}).length>=catalog.items.length,`Konfiguráció és oldalindex: ${Object.keys(index?.pages||{}).length} regisztrált fájl, séma ${index?.schemaVersion||'ismeretlen'}`);}catch(e){check(false,'A konfiguráció vagy oldalindex nem vizsgálható: '+e.message);}
   const list=[...new Set([
    ...catalog.items.map(x=>'json/'+x.path),
    ...[...document.querySelectorAll('img[src],video[poster],iframe[src],a[download][href]')].map(e=>e.getAttribute('src')||e.getAttribute('poster')||e.getAttribute('href')).filter(isLocalRef).map(x=>x.split('#')[0].split('?')[0]),
    'json/structure.json','json/config.json','json/oldalindex.json','json/mediatar.json','json/adatok/esemenyek.json','json/adatok/dokumentumok.json'
   ])].filter(x=>/^(?:assets\/|json\/)/.test(x));
   if(list.length>MAX_CHECKS){skipped=list.length-MAX_CHECKS;list.length=MAX_CHECKS;}
   let cursor=0,good=0,bad=[];
   await Promise.all(Array.from({length:Math.min(6,list.length)},async()=>{
    while(cursor<list.length){const path=list[cursor++];try{const response=await fetch(path,{method:'HEAD',cache:'no-store'});if(response.ok)good++;else if([405,501].includes(response.status)){const fallback=await fetch(path,{cache:'no-store'});if(fallback.ok)good++;else bad.push(path+' ('+fallback.status+')');}else bad.push(path+' ('+response.status+')');}catch(e){bad.push(path+' (hálózati hiba)');}}
   }));
   check(bad.length===0,`${good}/${list.length} belső fájl elérhető${bad.length?' · hibák: '+bad.slice(0,6).join(', '):''}`);
   const sourcedImages=[...document.images].filter(img=>{const src=img.currentSrc||img.getAttribute('src')||img.getAttribute('srcset')||'';return src.trim().length>0;});
   const missingImages=sourcedImages.filter(img=>img.complete&&img.naturalWidth===0);
   const imageNames=missingImages.slice(0,4).map(img=>{const path=img.currentSrc||img.getAttribute('src')||img.getAttribute('srcset')||'';try{return new URL(path,location.href).pathname;}catch{return path;}});
   check(missingImages.length===0,`${sourcedImages.length} valódi képforrás vizsgálva · ${missingImages.length} betöltési hiba${imageNames.length?' · hibás fájlok: '+imageNames.join(', '):''}`);
  }catch(e){fail++;mark(false,'Az ellenőrzés megszakadt: '+e.message);}
  status.textContent=`Ellenőrzés vége: ${ok} sikeres, ${fail} hibás ellenőrzési csoport${skipped?', '+skipped+' nem vizsgált fájl':''}.`;button.disabled=false;
 });
}
export function initMobileQuickNav(){
 if(document.getElementById('ext26-mobile-nav'))return;
 const nav=el('nav','ext26-mobile-nav');nav.id='ext26-mobile-nav';nav.setAttribute('aria-label','Mobilos gyorsnavigáció');
 const icon=kind=>{
  if(kind==='menu'){
   const image=el('img','ext26-nav-logo');image.src='assets/media/logo/csanadi-cimer-512.webp';image.alt='';image.width=35;image.height=35;image.decoding='async';image.setAttribute('aria-hidden','true');return image;
  }
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','ext26-nav-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','2.2');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  const shape=kind==='home'?'M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3V10.5':'M21 21l-4.3-4.3M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0';
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',shape);svg.append(path);return svg;
 };
 const entries=[['home','Kezdőlap',()=>location.hash='#/'],['menu','Menü',()=>document.getElementById('orbit-open')?.click()],['search','Keresés',()=>document.getElementById('search-open')?.click()]];
 entries.forEach(([kind,label,action])=>{const b=el('button','ext26-nav-icon-button');b.type='button';b.dataset.navId=kind;b.setAttribute('aria-label',label);b.title=label;append(b,icon(kind));b.addEventListener('click',action);nav.append(b);});
 document.body.append(nav);
 const update=()=>{const route=location.hash||'#/';nav.querySelector('[data-nav-id="home"]')?.setAttribute('aria-current',route==='#/'?'page':'false');};
 window.addEventListener('hashchange',update);update();
}
