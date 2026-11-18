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
function sanitizedHTML(source){
 const template=document.createElement('template');template.innerHTML=source;
 for(const element of template.content.querySelectorAll('*')){
  if(['SCRIPT','IFRAME','OBJECT','EMBED','BASE','META','LINK'].includes(element.tagName)){element.remove();continue;}
  for(const attribute of [...element.attributes]){
   if(/^on/i.test(attribute.name)||(/^(?:href|src|action|formaction|srcdoc)$/i.test(attribute.name)&&/^(?:javascript|data):/i.test(attribute.value.trim())))element.removeAttribute(attribute.name);
  }
 }
 return template.innerHTML;
}
function safeAttribute(value){return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');}
function frameDocument(key,component){
 const css=component.styles.map(path=>`<link rel="stylesheet" href="${safeAttribute(path)}?v=1.42.3">`).join('');
 const base=new URL('./',document.baseURI).href;
 // Bootstrap remains pinned to the same CDN version as the original SPA.
 const bootstrap='https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css';
 return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><base href="${safeAttribute(base)}"><link rel="stylesheet" href="${bootstrap}">${css}</head><body data-spa-feature="${key}" class="${key==='arrival'?'arrival2':''}">${sanitizedHTML(component.html)}<script type="module" src="js/spa-frame-bootstrap-v1-42.js?v=1.42.13"></script></body></html>`;
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
  iframe.title=page.title;iframe.loading='eager';iframe.referrerPolicy='same-origin';
  iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads allow-modals');
  iframe.style.cssText='display:block;width:100%;min-height:80vh;height:100vh;border:0;overflow:hidden;';
  iframe.srcdoc=frameDocument(key,component);
  shell.replaceChildren(iframe);shell.removeAttribute('aria-busy');
  let observer=null;
  const onLoad=()=>{
   if(!shell.isConnected||token!==activation)return;
   const doc=iframe.contentDocument;if(!doc?.body)return;
   const resize=()=>{if(!iframe.isConnected)return;const height=Math.max(doc.documentElement.scrollHeight,doc.body.scrollHeight);iframe.style.height=Math.max(400,Math.ceil(height)+2)+'px';};
   observer=new ResizeObserver(resize);observer.observe(doc.body);observer.observe(doc.documentElement);
   // Internal SPA links belong to the parent router, not the frame's hash.
   doc.addEventListener('click',event=>{
    const anchor=event.target.closest?.('a[href]');if(!anchor)return;
    const href=anchor.getAttribute('href')||'';
    const route=href.startsWith('#/')?href:href.startsWith('index.html#/')?href.slice('index.html'.length):null;
    if(route&&/^#\/[a-z0-9\-/]*$/.test(route)){
     event.preventDefault();window.location.hash=route;
    }else if(/^#[A-Za-z][\w:.-]*$/.test(href)){
     const target=doc.getElementById(href.slice(1));
     if(target){event.preventDefault();window.scrollTo({top:window.scrollY+iframe.getBoundingClientRect().top+target.getBoundingClientRect().top,behavior:'smooth'});}
    }
   });
   resize();
  };
  iframe.addEventListener('load',onLoad);
  dispose=()=>{
   observer?.disconnect();observer=null;
   iframe.removeEventListener('load',onLoad);
   iframe.srcdoc='';
   iframe.remove();
  };
 }catch(error){
  console.error('SPA-komponens betöltési hiba:',key,error);
  if(shell.isConnected&&token===activation){shell.removeAttribute('aria-busy');shell.textContent='Ez az interaktív központ átmenetileg nem érhető el.';}
 }
}
