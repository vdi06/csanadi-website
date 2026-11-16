/* Hálózatfüggetlen kiadásellenőrzés a statikus FTP-csomaghoz. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const structure=JSON.parse(read('json/structure.json'));
const media=JSON.parse(read('json/mediatar.json'));
const mediaIds=new Set(media.items.map(x=>x.id));
let pages=[],jsonCount=0,brokenDocuments=new Set(),legacyRefs=[];
function scan(dir){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,e.name);
  if(e.isDirectory())scan(file);
  else if(e.name.endsWith('.json')){
   const raw=fs.readFileSync(file,'utf8');JSON.parse(raw);jsonCount++;
   if(/https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu/i.test(raw))legacyRefs.push(path.relative(root,file));
   for(const x of raw.matchAll(/assets\/documents\/[a-z0-9_.-]+/gi))if(!fs.existsSync(path.join(root,x[0])))brokenDocuments.add(x[0]);
  }
 }
}
scan(path.join(root,'json'));
function walk(nodes){for(const n of nodes){
 const p=JSON.parse(read('json/'+n.path));pages.push(p);
 if(n.children)walk(n.children);
}}
walk(structure.nodes);
const routes=new Set(pages.map(x=>x.schemaExtensions?.route));
const problems=[];
if(jsonCount!==95)problems.push('A JSON-fájlok száma megváltozott: '+jsonCount);
if(pages.length!==65)problems.push('A regisztrált aloldalak száma megváltozott: '+pages.length);
if(legacyRefs.length)problems.push('Régi domaines JSON-hivatkozás: '+legacyRefs.join(', '));
if(brokenDocuments.size)problems.push('Hiányzó dokumentum: '+[...brokenDocuments].join(', '));
for(const page of pages){
 const route=page.schemaExtensions?.route;
 const banner=page.schemaExtensions?.bannerMediaId;
 if(!route?.startsWith('#/'))problems.push('Hibás útvonal: '+page.id);
 if(banner&&!mediaIds.has(banner))problems.push('Hiányzó borítókép: '+route+' '+banner);
 for(const m of JSON.stringify(page).matchAll(/\]\((#\/[a-z0-9/-]+)\)/gi))if(m[1]===route)problems.push('Felesleges önhivatkozás: '+route);
 for(const match of JSON.stringify(page).matchAll(/#\/[a-z0-9/-]+/gi)){
  if(match[0]!=='#/'&&!routes.has(match[0]))problems.push('Nem létező belső link: '+route+' → '+match[0]);
 }
}
for(const file of ['script.js','js/app.js','js/subpages-v1.js','js/documents.js','js/round26-arrival.js','js/next10-2026.js']){
 try{cp.execFileSync('node',['--check',path.join(root,file)],{stdio:'pipe'});}catch{problems.push('JavaScript szintaktikai hiba: '+file);}
}
const htmls=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
for(const file of htmls)if(/href=["']https?:\/\/(?:www\.)?csanadi-bp\.edu\.hu/i.test(read(file)))problems.push('Régi domaines HTML-link: '+file);
if(/<nav\s+class="r23-jump"/.test(read('megkozelites-es-tanulas.html')))problems.push('Megközelítési oldalon megmaradt a tíz ugrólink');
if(/class:'cs-arrival-return'/.test(read('js/app.js')))problems.push('Megmaradt a megközelítési oldal vissza-gombja');
const result={checkedAt:new Date().toISOString(),jsonCount,pageCount:pages.length,mediaItems:mediaIds.size,brokenDocuments:brokenDocuments.size,legacyRefs:legacyRefs.length,problems,passed:problems.length===0,visualTesting:'Nem futott; külön böngészős teszt szükséges.'};
fs.writeFileSync(path.join(root,'dokumentacio','AUTOMATIKUS_KIADAS_TESZT_V1.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
if(problems.length)process.exitCode=1;
