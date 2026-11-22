/** Csanádi 1.51: ugyanaz a JSON-szerkezetellenőrzés böngészőben és kiadáskor. */
import {JSON_ALLOWED_ATTR,JSON_ALLOWED_TAGS,safeJsonURL} from './json-dom-v149.js';

export function validateJsonShell(config,{kind='site',maxNodes=3000}={}){
 const errors=[],warnings=[],ids=new Set();let nodes=0;
 const error=(place,message)=>{if(errors.length<100)errors.push(`${place}: ${message}`)};
 const warn=(place,message)=>{if(warnings.length<100)warnings.push(`${place}: ${message}`)};
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 if(!object(config))return {valid:false,errors:['gyökér: JSON objektum szükséges'],warnings,nodes,ids:[]};
 if(config.schemaVersion!=='1.0.0')error('schemaVersion','nem támogatott séma; 1.0.0 szükséges');
 if(!object(config.document))error('document','hiányzó dokumentumbeállítások');
 else{
  if(typeof config.document.title!=='string'||!config.document.title.trim())
   error('document.title','hiányzó oldalcím');
  for(const key of ['meta','links']){
   if(config.document[key]!==undefined&&!Array.isArray(config.document[key]))
    error(`document.${key}`,'tömb szükséges');
   else for(const [i,item] of (config.document[key]||[]).entries()){
    const place=`document.${key}[${i}]`;
    if(!object(item)){error(place,'attribútumobjektum szükséges');continue}
    for(const [attr,value] of Object.entries(item)){
     if(!JSON_ALLOWED_ATTR.test(attr)||/^on/i.test(attr))
      error(`${place}.${attr}`,'nem engedélyezett attribútum');
     if(['href','src'].includes(attr.toLowerCase())&&!safeJsonURL(value))
      error(`${place}.${attr}`,'nem biztonságos URL');
    }
   }
  }
 }
 if(!object(config.assets))error('assets','hiányzó függőségleírás');
 else{
  for(const [key,property] of [['stylesheets','href'],['scripts','src']]){
   const list=config.assets[key];
   if(!Array.isArray(list)){error(`assets.${key}`,'tömb szükséges');continue}
   for(const [i,asset] of list.entries()){
    const place=`assets.${key}[${i}]`,url=asset?.[property];
    if(!object(asset)||!safeJsonURL(url))error(place,`hibás vagy veszélyes ${property}`);
    else if(key==='scripts'&&!/^https:\/\//i.test(url)&&!url.startsWith('js/'))
     warn(place,'szokatlan JavaScript-útvonal');
   }
  }
  if(kind==='site'&&(!/^script\.js\?v=\d+\.\d+$/.test(config.assets.entryModule||'')))
   error('assets.entryModule','hiányzó vagy érvénytelen indítómodul');
 }
 const walk=(value,place,depth)=>{
  if(typeof value==='string')return;
  if(++nodes>maxNodes){error(place,`túl sok elem (maximum ${maxNodes})`);return}
  if(depth>32){error(place,'túl mély elemtartalom (maximum 32 szint)');return}
  if(!object(value)){error(place,'szöveg vagy elemobjektum szükséges');return}
  if(!JSON_ALLOWED_TAGS.has(value.tag))error(`${place}.tag`,'nem engedélyezett elem: '+String(value.tag));
  if(value.attrs!==undefined&&!object(value.attrs))error(`${place}.attrs`,'attribútumobjektum szükséges');
  else for(const [name,item] of Object.entries(value.attrs||{})){
   if(!JSON_ALLOWED_ATTR.test(name)||/^on/i.test(name))error(`${place}.attrs.${name}`,'nem engedélyezett attribútum');
   if(!['string','number','boolean'].includes(typeof item))
    error(`${place}.attrs.${name}`,'csak szöveg, szám vagy logikai érték lehet');
   if(['href','src'].includes(name.toLowerCase())&&!safeJsonURL(item))
    error(`${place}.attrs.${name}`,'nem biztonságos URL');
   if(name==='id'&&typeof item==='string'){
    if(ids.has(item))error(`${place}.attrs.id`,'ismétlődő elem-azonosító: '+item);
    ids.add(item);
   }
  }
  if(!Array.isArray(value.children))error(`${place}.children`,'gyerekelem-tömb szükséges');
  else for(const [i,child] of value.children.entries())walk(child,`${place}.children[${i}]`,depth+1);
 };
 if(!Array.isArray(config.body))error('body','hiányzó elemtömb');
 else{
  if(!config.body.length)error('body','nem lehet üres');
  config.body.forEach((item,index)=>walk(item,`body[${index}]`,0));
 }
 if(kind==='site')for(const id of ['app','site-header','search-panel'])
  if(!ids.has(id))error('body','hiányzó kötelező felületelem: '+id);
 if(kind==='offline'&&!config.body?.some(item=>item.tag==='main'))
  error('body','az offline képernyő főtartalma hiányzik');
 return {valid:errors.length===0,errors,warnings,nodes,ids:[...ids]};
}

export function requireValidJsonShell(config,options){
 const result=validateJsonShell(config,options);
 if(!result.valid)throw Error(`Hibás JSON-oldalváz: ${result.errors.slice(0,5).join(' | ')}`);
 return result;
}
