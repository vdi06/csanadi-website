'use strict';
// FTP-kompatibilis kiadási lépés: az oldal-JSON-ok VALÓDI szövegét írja a
// nyilvános oldalindexbe, így a statikus tárhelyen nem kell keresőszerver.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const indexPath=path.join(root,'json/oldalindex.json');
const IGNORED=new Set(['id','type','route','href','url','target','src','mediaId','bannerMediaId','class','className','variant','layout','style','icon','schemaVersion','filePath','action','actionId','file','mimeType']);

function collectContent(value,key='',parts=[],depth=0){
 if(depth>30||parts.length>15000)return parts;
 if(typeof value==='string'){
  const s=value.trim();
  if(s&&!IGNORED.has(key)&&!/^((https?:)?\/\/|#\/|assets\/)/i.test(s))parts.push(s);
 }else if(Array.isArray(value)){
  for(const item of value)collectContent(item,key,parts,depth+1);
 }else if(value&&typeof value==='object'){
  for(const [field,child] of Object.entries(value))if(!IGNORED.has(field))collectContent(child,field,parts,depth+1);
 }
 return parts;
}
function makeSearchText(page){
 return collectContent(page.blocks||[]).join(' ').replace(/\s+/g,' ').trim();
}
function rebuildIndex(){
 const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
 let rebuilt=0,characters=0;
 for(const [relative,entry] of Object.entries(index.pages||{})){
  const source=path.resolve(root,'json',relative);
  if(!source.startsWith(path.join(root,'json','oldalak')+path.sep))throw Error('Nem oldalfájl: '+relative);
  const page=JSON.parse(fs.readFileSync(source,'utf8'));
  if(page.id!==entry.id||page.schemaExtensions?.route!==entry.schemaExtensions?.route)throw Error('Eltérő oldalkulcs: '+relative);
  if(page.lifecycle?.status!=='published'){
   // Nem publikált tartalomból nem készül keresőbejegyzés.
   throw Error('Nem publikált oldal szerepel a nyilvános indexben: '+relative);
  }
  entry.searchText=makeSearchText(page);
  entry.title=page.title;
  entry.menuLabel=page.menuLabel;
  entry.summary=page.summary;
  entry.tags=page.tags;
  entry.categories=page.categories;
  entry.schemaExtensions={...page.schemaExtensions};
  rebuilt++;characters+=entry.searchText.length;
 }
 index.searchIndexRevision='1.39.9';
 index.generatedFor='csanadi-static-ftp';
 fs.writeFileSync(indexPath,JSON.stringify(index,null,2)+'\n');
 return {rebuilt,characters};
}
if(require.main===module){console.log(JSON.stringify(rebuildIndex(),null,2));}
module.exports={collectContent,makeSearchText,rebuildIndex};
