/* v1.42.3 – isolated SPA host for the original, static interactivity centers.
   All content and script names are release-controlled, not provided by visitors. */
const KNOWN={
 explorer:'#/iskolank/felfedezo',
 compass:'#/iskolank/iskolai-iranytu',
 workshop:'#/iskolank/iskolai-muhely',
 heritage:'#/sport/olimpiai-orokseg-es-tudastar',
 community:'#/oktatas/tanulas-es-kozosseg',
 offline:'#/informaciok/offline-olvaso',
 guide:'#/informaciok/utmutato',
 arrival:'#/megkozelites-es-erkezes'
};
const STYLE=/^css\/[a-z0-9-]+\.css$/;
let dataPromise=null,activation=0,dispose=null;
let requestedSection=null;
export function isSpaFeature(page){return Object.hasOwn(KNOWN,page?.schemaExtensions?.spaFeature||'');}
export function featurePlaceholder(page){
 const shell=document.createElement('div');shell.className='cs-spa-feature';
 shell.dataset.feature=page.schemaExtensions.spaFeature;
 shell.setAttribute('aria-busy','true');shell.setAttribute('role','region');
 shell.setAttribute('aria-label',page.title);
 shell.textContent='Az interaktív központ betöltése…';
 return shell;
}
export function releaseSpaFeatureStyles(){
 activation++;
 if(dispose){dispose();dispose=null;}
}
async function data(){
 if(!dataPromise)dataPromise=fetch('json/data/spa-features-42.json',{cache:'no-store'}).then(response=>{
  if(!response.ok)throw Error('A SPA-komponensadat nem érhető el.');return response.json();
 }).catch(error=>{dataPromise=null;throw error;});
 return dataPromise;
}
/* The feature HTML is release-controlled JSON, but still gets a strict boundary.
   No active content, arbitrary style/event attributes or executable URLs are accepted. */
const ALLOWED_TAGS=new Set('a article aside button canvas circle code dialog div figcaption figure footer form h1 h2 h3 header img input label li main nav ol option output p path section select small span strong svg table tbody td th thead tr ul'.split(' '));
const ALLOWED_ATTRIBUTES=new Set('id class title role aria-label aria-labelledby aria-hidden aria-live aria-expanded aria-controls alt href src type value placeholder required min max step for maxlength accept tabindex width height target rel download fill stroke stroke-width viewbox d cx cy r hidden data-filterable'.split(' '));
function validURL(raw,kind){
 const value=String(raw||'').trim();if(!value||/[\u0000-\u001f\u007f]/.test(value))return false;
 if(value.startsWith('#'))return true;
 if(kind==='src')return /^assets\/media\/[a-z0-9/_.-]+\.(?:webp|png|jpe?g|svg)$/i.test(value) && !value.includes('..');
 if(/^(?:https:\/\/[^\s<>]+|assets\/documents\/[a-z0-9/_.-]+\.pdf|(?:\.\/)?index\.html#\/[a-z0-9\-/#]+)$/i.test(value))return true;
 return false;
}
function sanitizedHTML(source){
 const template=document.createElement('template');template.innerHTML=source;
 for(const element of [...template.content.querySelectorAll('*')]){
  if(!ALLOWED_TAGS.has(element.localName)){
   element.remove();continue;
  }
  for(const attribute of [...element.attributes]){
   const key=attribute.name.toLowerCase();
   if(!ALLOWED_ATTRIBUTES.has(key)||((key==='href'||key==='src')&&!validURL(attribute.value,key))){element.removeAttribute(attribute.name);continue;}
  }
  if(element.localName==='a'&&element.getAttribute('target')==='_blank')element.setAttribute('rel','noopener noreferrer');
 }
 return template.innerHTML;
}
function safeAttribute(value){return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');}
function frameDocument(key,component){
 const css=component.styles.map(path=>`<link rel="stylesheet" href="${safeAttribute(path)}?v=1.53">`).join('')+'<link rel="stylesheet" href="css/spa-frame-unified-v1-42-16.css?v=1.53"><link rel="stylesheet" href="css/theme-coverage-v1-42-21.css?v=1.53">';
 const base=new URL('./',document.baseURI).href;
 // Bootstrap remains pinned to the same CDN version as the original SPA.
 const bootstrap='https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css';
 return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><base href="${safeAttribute(base)}"><link rel="stylesheet" href="${bootstrap}" integrity="sha384-yEPZ7jP9S0QKiUQ0m3jjsO4ProIW7wvR9gXkI7JOGa2XVsw53Yke2bsdkBbjmmiX" crossorigin="anonymous">${css}</head><body data-spa-feature="${key}" class="${key==='arrival'?'arrival2':''}">${sanitizedHTML(component.html)}<script type="module" src="js/spa-frame-bootstrap-v1-42.js?v=1.53"></script></body></html>`;
}
export async function activateSpaFeature(shell,page){
 const token=activation,key=page?.schemaExtensions?.spaFeature;
 if(!isSpaFeature(page)||KNOWN[key]!==page.schemaExtensions.route||!shell.isConnected)return;
 try{
  const bundle=await data(),component=bundle?.components?.[key];
  if(bundle.schemaVersion!=='1.0.0'||component?.id!==key||typeof component.html!=='string'||!Array.isArray(component.styles)||component.styles.some(path=>!STYLE.test(path)))throw Error('Érvénytelen SPA-komponensadat.');
  if(!shell.isConnected||token!==activation)return;
  const iframe=document.createElement('iframe');
  iframe.className='cs-spa-feature-frame';
  iframe.title=page.title;iframe.loading='eager';iframe.referrerPolicy='no-referrer';
  iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads allow-modals');
  iframe.style.cssText='display:block;width:100%;min-height:520px;height:100vh;border:0;overflow:hidden;background:transparent;';
  iframe.srcdoc=frameDocument(key,component);
  shell.replaceChildren(iframe);shell.removeAttribute('aria-busy');
  let observer=null,themeObserver=null,started=false,readinessFrame=0,readinessChecks=0,resizeFrame=0;
  const onLoad=()=>{
   if(started||!shell.isConnected||token!==activation)return;
   const doc=iframe.contentDocument;if(!doc?.body||doc.body.dataset.spaFeature!==key)return;
   started=true;
   // Tables in the long guide stay horizontally scrollable on narrow phones.
   for(const table of doc.querySelectorAll('table')){
    if(table.closest('.cs-spa-data-table-scroll'))continue;
    const scroll=doc.createElement('div');scroll.className='cs-spa-data-table-scroll';
    scroll.tabIndex=0;scroll.setAttribute('role','region');
    scroll.setAttribute('aria-label','Táblázat vízszintes görgetése');
    table.parentNode.insertBefore(scroll,table);scroll.append(table);
   }
   // Defer writes from ResizeObserver to rAF to avoid resize loops.
   const resize=()=>{if(resizeFrame||!iframe.isConnected)return;
    resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;if(!iframe.isConnected||token!==activation)return;
     const height=Math.max(doc.body.scrollHeight,doc.documentElement.scrollHeight);
     const desired=Math.max(520,Math.ceil(height)+6);
     if(Math.abs(iframe.getBoundingClientRect().height-desired)>8)iframe.style.height=desired+'px';
    });
   };
   observer=new ResizeObserver(resize);observer.observe(doc.body);observer.observe(doc.documentElement);
   // Changing the parent's theme must immediately update the embedded center.
   const syncTheme=()=>{
    const mode=document.documentElement.dataset.theme||'light',style=getComputedStyle(document.documentElement);
    doc.documentElement.dataset.theme=mode;doc.documentElement.setAttribute('data-bs-theme',mode);
    for(const key of ['page','card','light','line','ink','muted','header','footer','nav']){
     const value=style.getPropertyValue('--'+key).trim();if(value)doc.documentElement.style.setProperty('--'+key,value);
    }
   };
   syncTheme();themeObserver=new MutationObserver(syncTheme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-bs-theme']});
   // SPA links belong to the parent's hash router; section links stay in-frame.
   doc.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const anchor=event.target?.closest?.('a[href]');if(!anchor)return;
    const href=(anchor.getAttribute('href')||'').trim();
    if(!href)return;
    let routeAndSection=null;
    if(href.startsWith('#/'))routeAndSection=href;
    else if(/^(?:\.\/)?index\.html#\//i.test(href))routeAndSection=href.slice(href.indexOf('#'));
    if(routeAndSection){
     const sectionIndex=routeAndSection.indexOf('#',1);
     const route=sectionIndex<0?routeAndSection:routeAndSection.slice(0,sectionIndex);
     const section=sectionIndex<0?'':routeAndSection.slice(sectionIndex+1);
     if(!/^#\/[a-z0-9\-/]*$/.test(route)|| (section&&!/^[a-zA-Z][\w:.-]*$/.test(section)))return;
     event.preventDefault();
     if(section){
      const immediate=route===window.location.hash?doc.getElementById(section):null;
      if(immediate){
       const top=window.scrollY+iframe.getBoundingClientRect().top+immediate.getBoundingClientRect().top-100;
       window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
       return;
      }
      requestedSection={route,section};
     }else requestedSection=null;
     if(window.location.hash!==route)window.location.hash=route;
     else if(!section)window.scrollTo({top:0,behavior:'instant'});
    }else if(/^#[A-Za-z][\w:.-]*$/.test(href)){
     const target=doc.getElementById(href.slice(1));
     if(target){event.preventDefault();
      const top=window.scrollY+iframe.getBoundingClientRect().top+target.getBoundingClientRect().top-100;
      window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
     }
    }
   });
   if(requestedSection?.route===window.location.hash){
    const target=doc.getElementById(requestedSection.section);
    if(target){
     requestedSection=null;
     requestAnimationFrame(()=>{
      if(!iframe.isConnected||token!==activation)return;
      const top=window.scrollY+iframe.getBoundingClientRect().top+target.getBoundingClientRect().top-100;
      window.scrollTo({top:Math.max(0,top),behavior:'instant'});
     });
    }
   }
   resize();
   doc.fonts?.ready?.then(()=>{if(iframe.isConnected)resize();}).catch(()=>{});
  };
  iframe.addEventListener('load',onLoad);
  // The external CDN can delay iframe load indefinitely on a poor connection.
  // Initialize on DOM readiness, not only when every stylesheet finishes loading.
  const checkReady=()=>{
   if(started||!iframe.isConnected||token!==activation)return;
   onLoad();
   if(!started&&++readinessChecks<120)readinessFrame=requestAnimationFrame(checkReady);
  };
  readinessFrame=requestAnimationFrame(checkReady);
  dispose=()=>{
   cancelAnimationFrame(readinessFrame);cancelAnimationFrame(resizeFrame);
   try{iframe.contentDocument?.body?.dispatchEvent(new Event('csanadi:feature-unmount'));}catch{}
   observer?.disconnect();observer=null;themeObserver?.disconnect();themeObserver=null;
   iframe.removeEventListener('load',onLoad);
   iframe.srcdoc='';
   iframe.remove();
  };
 }catch(error){
  console.error('SPA-komponens betöltési hiba:',key,error);
  if(shell.isConnected&&token===activation){shell.removeAttribute('aria-busy');shell.textContent='Ez az interaktív központ átmenetileg nem érhető el.';}
 }
}
