import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const index=read('json/oldalindex.json');
const audit=read('json/adatok/tartalmi-audit-v1-39-3.json');
const pages=Object.entries(index.pages).map(([relative,record])=>({relative,record,page:read('json/'+relative)}));
const tests=[];
const test=(name,fn)=>{try{fn();tests.push({name,ok:true});}catch(error){tests.push({name,ok:false,error:error.message});}};
const blocks=p=>p.blocks||[];
const text=p=>blocks(p).flatMap(b=>b.children||[]).map(x=>x.data?.text||'').join('\n');
const routes=new Set(pages.map(x=>x.page.schemaExtensions?.route));

test('Pontosan 71 egyedi útvonal, teljes oldal-JSON-mal',()=>{
 assert.equal(pages.length,71);assert.equal(routes.size,71);
 assert.equal(new Set(pages.map(x=>x.page.id)).size,71);
 for(const {page,record} of pages){
  assert.equal(page.lifecycle.status,'published');
  assert.equal(page.id,record.id);
  assert.equal(page.schemaExtensions.route,record.schemaExtensions.route);
 }
});
test('A 71 oldal mindegyikéhez egyedi szerkesztői ellenőrzési rekord tartozik',()=>{
 assert.equal(audit.pages.length,71);
 assert.equal(new Set(audit.pages.map(p=>p.route)).size,71);
 for(const {page,record} of pages){
  const review=page.schemaExtensions.contentReview;
  assert.equal(review.reviewedAt,'2026-11-17');
  assert.equal(record.schemaExtensions.contentReview.status,review.status);
  assert.ok(audit.pages.some(p=>p.route===page.schemaExtensions.route));
 }
});
test('Különválik a forrásellenőrzés és az intézményi jóváhagyás',()=>{
 const statuses=new Set(['primary-source-checked','editorial-guidance','time-sensitive','institutional-approval-needed']);
 for(const item of audit.pages){
  assert.ok(statuses.has(item.reviewStatus),item.route);
  if(item.sourceId){
   assert.ok(audit.sources[item.sourceId],item.route);
   assert.match(audit.sources[item.sourceId].url,/^https:\/\/csanadi-bp\.edu\.hu\//);
  }
 }
 assert.ok(audit.pages.filter(p=>p.reviewStatus==='institutional-approval-needed').length>=5);
});
test('Nem maradt általános, félrevezető forráslink-címke',()=>{
 for(const {page} of pages)assert.ok(!text(page).includes('Kapcsolódó hivatalos iskolai tájékoztatás'),page.title);
});
test('Nincsenek ismételt hosszú szövegblokkok különböző oldalakon',()=>{
 const seen=new Map();
 for(const {page} of pages){
  for(const paragraph of text(page).split(/\n\n/)){
   const p=paragraph.trim().replace(/\s+/g,' ').toLocaleLowerCase('hu');
   if(p.length<90||/^\[[^\]]+\]\(https:\/\//.test(p))continue;
   assert.ok(!seen.has(p),page.title+' és '+seen.get(p));
   seen.set(p,page.title);
  }
 }
});
test('A könyvtár és a dokumentumtár ugyanazt a tájékoztatást nem másolja kétszer',()=>{
 const library=pages.find(p=>p.page.schemaExtensions.route==='#/oktatas/konyvtar').page;
 const docs=pages.find(p=>p.page.schemaExtensions.route==='#/informaciok/dokumentumtar').page;
 assert.equal(blocks(library).filter(b=>b.title==='Miben segíthet a könyvtár?').length,0);
 assert.equal(blocks(docs).filter(b=>b.title==='Hivatalos dokumentumok').length,0);
 assert.ok(text(docs).includes('A két dokumentumtípust'));
});
test('Hivatalos elsődleges források közvetlenül elérhetők a tárgyalt oldalakról',()=>{
 const routes={
  '#/iskolank/alapitvany':'alapitvany.html',
  '#/informaciok/allaspalyazatok':'allas.html',
  '#/informaciok/dokumentumtar':'docs.html',
  '#/informaciok/mindennapi-tudnivalok/etkezes':'ebed.html',
  '#/informaciok/mindennapi-tudnivalok/csengetesi-rend':'csengetes.html',
  '#/oktatas/felveteli':'felveteli.html',
  '#/informaciok/kozossegi-szolgalat':'kozszol.html',
  '#/iskolank/tortenet':'tortenet.html'
 };
 for(const [route,slug] of Object.entries(routes)){
  const page=pages.find(p=>p.page.schemaExtensions.route===route)?.page;
  assert.ok(page,route);
  assert.ok(text(page).includes('https://csanadi-bp.edu.hu/'+slug),route);
 }
});
test('A böngészős hivatkozáskezelő nem írja át a külön megjelölt elsődleges forrásokat',()=>{
 const source=fs.readFileSync(path.join(root,'js/subpages-v1.js'),'utf8');
 assert.match(source,/eredeti intézményi forrás/);
 assert.match(source,/link\.target = '_blank'/);
 assert.match(source,/link\.rel = 'noopener noreferrer'/);
 for(const {page} of pages){
  for(const match of text(page).matchAll(/\[([^\]]+ – eredeti intézményi forrás)\]\((https:\/\/[^)]+)\)/g)){
   assert.match(match[2],/^https:\/\/csanadi-bp\.edu\.hu\//,page.title);
  }
 }
});
test('Ellentmondásos 1887/1897 kezdőév nem szerepel ellenőrzött idővonalként',()=>{
 const timeline=read('json/adatok/iskolatorteneti-idovonal.json');
 assert.ok(timeline.events.every(e=>e.year!==1887&&e.year!==1897));
 const history=pages.find(p=>p.page.schemaExtensions.route==='#/iskolank/tortenet').page;
 assert.ok(text(history).includes('1887/1897'));
 assert.equal(history.schemaExtensions.verifiedContent,false);
});
test('A szerkesztői helyreigazítás a felhasználó számára is látszik',()=>{
 const jobs=pages.find(p=>p.page.schemaExtensions.route==='#/informaciok/allaspalyazatok').page;
 assert.ok(text(jobs).includes('karbantartói és digitális kultúra'));
 assert.ok(!text(jobs).includes('nincs jóváhagyott, aktuális álláshirdetés'));
 const admission=pages.find(p=>p.page.schemaExtensions.route==='#/oktatas/felveteli').page;
 assert.ok(text(admission).includes('felveteli.html'));
});
test('Címadatok egy közös JSON-forrásból származnak',()=>{
 for(const {page} of pages)assert.doesNotMatch(text(page),/1143 Budapest|Őrnagy utca 5[–-]7\./,page.title);
 assert.ok(text(pages.find(p=>p.page.schemaExtensions.route==='#/megkozelites-es-erkezes').page).includes('{{site.address}}'));
});
test('Nincs üres szövegblokk vagy ismétlődő blokkazonosító egy oldalon',()=>{
 for(const {page} of pages){
  const ids=[];
  for(const b of blocks(page)){
   ids.push(b.id);
   for(const c of b.children||[]){
    ids.push(c.id);
    if(c.type==='markdown')assert.ok(c.data?.text?.trim(),page.title+' '+c.id);
   }
  }
  assert.equal(ids.length,new Set(ids).size,page.title);
 }
});
test('A nyilvános keresőindex az átírt tartalmat és auditstátuszt tárolja',()=>{
 assert.equal(index.searchIndexRevision,'1.39.9');
 for(const {page,record} of pages){
  assert.ok(record.searchText?.length>25,page.title);
  assert.equal(record.schemaExtensions.contentReview.status,page.schemaExtensions.contentReview.status);
 }
});
test('Az archív használati útmutató nem állítja, hogy a mostani kiadást írja le',()=>{
 const docs=read('json/adatok/dokumentumok.json');
 const item=docs.documents.find(d=>d.id==='document:csanadi-weboldal-kezikonyv-2026');
 assert.match(item.summary,/Archív 3\.14-es/);
 assert.match(item.summary,/71 oldala/);
});
test('A strukturált belső kapcsolatok létező oldalakra mutatnak',()=>{
 const broken=[];
 for(const {page} of pages){
  for(const match of text(page).matchAll(/\]\((#\/[^)\s]+)\)/g)){
   const href=match[1].replace(/\?.*/,'');
   if(!routes.has(href))broken.push(page.title+' → '+href);
  }
 }
 assert.deepEqual(broken,[]);
});
test('Minden Markdown-hivatkozás támogatott, a helyi HTML-eszköz valóban létezik',()=>{
 const renderer=fs.readFileSync(path.join(root,'js/blocks.js'),'utf8');
 assert.ok(renderer.includes('embedded=1'));
 for(const {page} of pages){
  for(const match of text(page).matchAll(/\]\(([^)]+)\)/g)){
   const url=match[1];
   if(url.startsWith('#/')||url.startsWith('https://'))continue;
   assert.match(url,/^[a-z0-9-]+\.html(?:\?embedded=1)?(?:#[a-z0-9-]+)?$/,page.title);
   const file=url.split(/[?#]/)[0];
   assert.ok(fs.existsSync(path.join(root,file)),page.title+' – '+file);
  }
 }
});
const failed=tests.filter(t=>!t.ok);
console.log(JSON.stringify({release:'1.39.3',checkedPages:pages.length,tests:tests.length,passed:tests.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
