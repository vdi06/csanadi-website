/** 79 JSON-oldal teljes, rekurzív elemtérképe és fájlhivatkozás-ellenőrzése. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const pages=read('source/json/page-index.json').pages;
const registry=read('source/json/media-library.json');
const documents=read('source/json/data/documents.json');
const routes=new Set(Object.values(pages).map(x=>x.schemaExtensions?.route));
const media=new Set(registry.items.map(x=>x.id));
const supported=new Set(['hero','sports-successes','live-dashboard','home-editorial','quick-links','section','markdown','cards','card','image','gallery','accordion']);
const allIssues=[];
const report=[];
const totals={pages:0,blocks:0,sections:0,cards:0,accordionItems:0,mediaIds:0,markdownParagraphs:0,markdownTables:0,links:0};
function inspect(node,file,issue,key=''){
 if(typeof node==='string'){
  if((key==='mediaId'||key==='mobileMediaId'||key==='bannerMediaId'||key==='imageId')&&node.startsWith('media:')){
   totals.mediaIds++;if(!media.has(node))issue.push(`Nem regisztrált média: ${node}`);
  }
  if(['href','route'].includes(key)&&node.startsWith('#/')){totals.links++;if(!routes.has(node))issue.push(`Nem létező oldal: ${node}`);}
  if(node.startsWith('assets/')&&/\.(?:pdf|webp|svg|mp4|docx|txt)$/i.test(node)){
   if(!fs.existsSync(path.join(root,'shared',node)))issue.push(`Hiányzó közös állomány: ${node}`);
  }
  return;
 }
 if(Array.isArray(node)){node.forEach(x=>inspect(x,file,issue,key));return;}
 if(node&&typeof node==='object')for(const [k,v] of Object.entries(node))inspect(v,file,issue,k);
}
function walk(block,levels,issue,seen){
 if(!block||typeof block!=='object')return;
 totals.blocks++;levels[block.type]=(levels[block.type]||0)+1;
 if(!supported.has(block.type))issue.push('Ismeretlen blokk: '+block.type);
 if(!block.id||seen.has(block.id))issue.push('Hiányzó/ismételt blokkazonosító: '+block.id);
 seen.add(block.id);
 if(block.type==='section')totals.sections++;
 if(['cards','quick-links','gallery','home-editorial'].includes(block.type))totals.cards+=(block.data?.items||[]).length;
 if(block.type==='accordion')totals.accordionItems+=(block.data?.items||[]).length;
 if(block.type==='markdown'){
  const text=String(block.data?.text||'');
  if(!text.trim())issue.push('Üres Markdown: '+block.id);
  totals.markdownParagraphs+=text.split(/\n\s*\n/).filter(Boolean).length;
  totals.markdownTables+=(text.match(/\|\s*:?-{3,}:?\s*\|/g)||[]).length;
 }
 if(['cards','gallery','accordion'].includes(block.type)&&!(block.data?.items||[]).length)issue.push('Üres elemlista: '+block.id);
 inspect(block,'',issue);
 for(const child of block.children||[])walk(child,levels,issue,seen);
}
for(const [file,indexed] of Object.entries(pages)){
 const page=read('source/json/'+file),issue=[],levels={},seen=new Set();
 totals.pages++;
 if(indexed.id!==page.id||indexed.schemaExtensions?.route!==page.schemaExtensions?.route)issue.push('A gyors oldalindex és a forrás eltér');
 for(const block of page.blocks||[])walk(block,levels,issue,seen);
 inspect(page.schemaExtensions,file,issue);
 report.push({source:'shared/json/'+file,route:page.schemaExtensions?.route,title:page.title,blockCount:Object.values(levels).reduce((a,b)=>a+b,0),types:levels,issues:[...new Set(issue)]});
 allIssues.push(...issue.map(x=>file+': '+x));
}
for(const item of registry.items)for(const asset of [item.original,...(item.variants||[])]){
 if(asset?.path&&!fs.existsSync(path.join(root,'shared',asset.path)))allIssues.push('Médiaállomány: '+asset.path);
}
for(const item of documents.documents)if(item.filePath&&!fs.existsSync(path.join(root,'shared',item.filePath)))allIssues.push('Dokumentum: '+item.filePath);
assert.equal(totals.pages,79);
const destination=path.join(root,'reports/page-layout-inventory-v152.json');
fs.mkdirSync(path.dirname(destination),{recursive:true});
fs.writeFileSync(destination,JSON.stringify({method:'Forrás-JSON és blocks.js által generált DOM-típusok statikus bejárása; nem vizuális teszt.',totals,report,issues:[...new Set(allIssues)]},null,2)+'\n');
console.log(`Kódaudit: ${totals.pages} oldal · ${totals.blocks} blokk · ${totals.cards} kártya/galériaelem · ${totals.accordionItems} lenyíló tétel · ${allIssues.length} jelzés.`);
if(allIssues.length){console.error(allIssues.slice(0,20).join('\n'));process.exitCode=1;}
