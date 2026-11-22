/** Biztonságos, deklaratív HTML-váz renderelése JSON-ból. */
export const JSON_ALLOWED_TAGS=new Set([
 'a','aside','article','b','button','div','em','footer','form','h1','h2','h3',
 'h4','h5','h6','header','i','img','input','kbd','label','li','main','nav','ol',
 'p','pre','section','small','span','strong','summary','details','ul','svg',
 'circle','path','rect','line','polygon','polyline','title','select','option'
]);
const SVG_NS='http://www.w3.org/2000/svg';
export const JSON_ALLOWED_ATTR=/^(?:id|class|role|type|name|content|placeholder|href|src|alt|title|value|width|height|viewBox|d|cx|cy|r|x|y|rx|ry|fill|stroke|stroke-width|target|rel|for|tabindex|hidden|disabled|autocomplete|download|integrity|crossorigin|media|as|loading|decoding|fetchpriority|open|aria-[a-z0-9_-]+|data-[a-z0-9_-]+)$/i;
const URL_ATTR=new Set(['href','src']);

export function safeJsonURL(value){
 if(typeof value!=='string'||!value.trim())return false;
 const url=value.trim();
 // A deklaratív fájlok nem tartalmazhatnak futtatható URL-sémát.
 return !/[\u0000-\u001f\u007f\\]/.test(url)&&
  !/^(?:javascript|vbscript|data|file|blob):/i.test(url)&&
  (/^(?:https:\/\/|mailto:|tel:|#|\/\/)/i.test(url)||
   !/^[a-z][a-z\d+.-]*:/i.test(url));
}

function setAttributes(element,attributes){
 for(const [key,value] of Object.entries(attributes||{})){
  if(!JSON_ALLOWED_ATTR.test(key)||/^on/i.test(key)||value===null||value===undefined)continue;
  if(URL_ATTR.has(key.toLowerCase())&&!safeJsonURL(value))continue;
  if(typeof value!=='string'&&typeof value!=='number'&&typeof value!=='boolean')continue;
  element.setAttribute(key,String(value===true?'':value));
 }
}

export function jsonNode(input,namespace='html',ownerDocument=document){
 if(typeof input==='string')return ownerDocument.createTextNode(input);
 if(!input||typeof input!=='object'||!JSON_ALLOWED_TAGS.has(input.tag))return null;
 const isSvg=namespace==='svg'||input.tag==='svg';
 const element=isSvg?ownerDocument.createElementNS(SVG_NS,input.tag):ownerDocument.createElement(input.tag);
 setAttributes(element,input.attrs);
 for(const child of input.children||[]){
  const node=jsonNode(child,isSvg?'svg':'html',ownerDocument);
  if(node)element.append(node);
 }
 if(element.dataset?.jsonAction==='reload'&&element.tagName==='BUTTON')
  element.addEventListener('click',()=>location.reload());
 return element;
}

export function installJsonDocument(config){
 if(!config||!Array.isArray(config.body)||!config.document)throw Error('Hiányzó JSON-oldalváz');
 if(config.document.lang)document.documentElement.lang=config.document.lang;
 document.title=String(config.document.title||'Csanádi Sportiskola');
 for(const item of config.document.meta||[]){
  const meta=document.createElement('meta');setAttributes(meta,item);document.head.append(meta);
 }
 for(const item of config.document.links||[]){
  const link=document.createElement('link');setAttributes(link,item);document.head.append(link);
 }
 const nodes=config.body.map(item=>jsonNode(item)).filter(Boolean);
 document.body.replaceChildren(...nodes);
}

export function appendJsonStyles(stylesheets=[]){
 return stylesheets.map(item=>{
  if(!safeJsonURL(item?.href))return Promise.resolve(false);
  const link=document.createElement('link');link.rel='stylesheet';
  setAttributes(link,item);
  if(!link.href)link.href=item.href;
  const done=new Promise(resolve=>{
   link.addEventListener('load',()=>resolve(true),{once:true});
   link.addEventListener('error',()=>resolve(false),{once:true});
  });
  document.head.append(link);return done;
 });
}
