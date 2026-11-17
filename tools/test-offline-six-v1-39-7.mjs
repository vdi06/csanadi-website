/* Hat helyi fejlesztés célzott, böngészőt nem igénylő funkcionális tesztje. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fetchJSONResilient,ContentFetchError} from '../js/fetch-resilience-v1-39-7.js';
import {loadJSON,norm} from '../js/content.js';
import {compileSynonyms} from '../js/search-j-2026.js';
import {inspectMediaBytes,validateBrowserMediaFile} from './media-validation-v1-39-7.mjs';
import {updatePageMeta} from '../js/next10-2026.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const json=name=>JSON.parse(read(name));
const checks=[];
async function test(name,callback){try{await callback();checks.push({name,ok:true});}catch(error){checks.push({name,ok:false,error:String(error)});}}
const response=(value,status=200)=>({ok:status>=200&&status<300,status,async json(){return value;}});

await test('Átmeneti hálózati hiba után legfeljebb korlátozott újrapróbálkozás',async()=>{
 let attempts=0,waits=0;
 const item=await fetchJSONResilient('https://example.invalid/demo',{path:'demo.json',retryDelaysMs:[1],
  pause:async()=>{waits++;},fetcher:async()=>{if(++attempts===1)throw Error('offline');return response({ok:true});}});
 assert.equal(item.ok,true);assert.equal(attempts,2);assert.equal(waits,1);
});
await test('HTTP 404 végleges hiba, nincs újrapróbálkozás',async()=>{
 let attempts=0;
 await assert.rejects(()=>fetchJSONResilient('test',{retryDelaysMs:[1,1],pause:async()=>{},
  fetcher:async()=>{attempts++;return response(null,404);}}),error=>error instanceof ContentFetchError&&error.kind==='http'&&error.status===404);
 assert.equal(attempts,1);
});
await test('HTTP 503 egyszer megismételhető és helyreáll',async()=>{
 let attempts=0;
 const item=await fetchJSONResilient('test',{retryDelaysMs:[1],pause:async()=>{},
  fetcher:async()=>++attempts===1?response(null,503):response({ready:true})});
 assert.equal(attempts,2);assert.equal(item.ready,true);
});
await test('Hibás JSON nem szennyezheti a gyorsítótárat',async()=>{
 let attempts=0;
 await assert.rejects(()=>fetchJSONResilient('test',{retryDelaysMs:[1],pause:async()=>{},
  fetcher:async()=>{attempts++;return{ok:true,status:200,async json(){throw SyntaxError('invalid');}};}}),
  error=>error.kind==='parse');assert.equal(attempts,1);
});
await test('Időtúllépés önállóan felismerhető',async()=>{
 await assert.rejects(()=>fetchJSONResilient('test',{timeoutMs:1,retryDelaysMs:[],
  fetcher:async(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(Error('timeout'),{name:'AbortError'}))))}),
  error=>error.kind==='timeout');
});
await test('A központi JSON-gyorsítótár lekérés-összevonása működik',async()=>{
 const original=globalThis.fetch;let requests=0;
 globalThis.fetch=async()=>{requests++;return response({version:'test'});};
 try{const [a,b]=await Promise.all([loadJSON('adatok/proba-v1397.json'),loadJSON('adatok/proba-v1397.json')]);
  assert.deepEqual(a,b);assert.equal(requests,1);}finally{globalThis.fetch=original;}
});
await test('Rövid hálózati hiba alatt a legutóbbi jó JSON megmaradhat',async()=>{
 const originalFetch=globalThis.fetch,originalNow=Date.now;
 globalThis.fetch=async()=>response({revision:1});
 try{
  await loadJSON('adatok/stale-v1397.json');
  const start=originalNow();Date.now=()=>start+11000;
  globalThis.fetch=async()=>{throw Error('offline');};
  const stale=await loadJSON('adatok/stale-v1397.json');assert.equal(stale.revision,1);
 }finally{globalThis.fetch=originalFetch;Date.now=originalNow;}
});
await test('404-nél régi adat még rövid tárolás esetén sem jelenik meg',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>response({revision:1});
 try{await loadJSON('adatok/removed-v1397.json');globalThis.fetch=async()=>response(null,404);
  await assert.rejects(()=>loadJSON('adatok/removed-v1397.json',{fresh:true}),error=>error.status===404);
 }finally{globalThis.fetch=originalFetch;}
});
await test('Ékezetes szinonimák kétirányú normalizálása',()=>{
 const map=compileSynonyms({'felvételi':['Jelentkezés','beíratkozás'],'JELENTKEZÉS':['felvételi']},norm);
 assert.deepEqual(map.felveteli.sort(),['beiratkozas','jelentkezes']);
 assert.deepEqual(map.jelentkezes,['felveteli']);
});
await test('A kereső nem ismétel szinonimákat és töredékes eredményeket',()=>{
 const map=compileSynonyms({'Sporteredmény':['Bajnokság','bajnoksag',42,'Sporteredmény']},norm);
 assert.deepEqual(map.sporteredmeny,['bajnoksag']);
 assert.match(read('js/search-j-2026.js'),/createDocumentFragment\(\)/);
});
await test('Valódi PNG fájlaláírás elfogadott',()=>{
 const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0,0]);
 assert.equal(inspectMediaBytes('iskola.png','image/png',bytes),null);
});
await test('Átnevezett, valójában nem PDF fájl elutasítva',()=>{
 assert.match(inspectMediaBytes('bizonyitek.pdf','application/pdf',new TextEncoder().encode('<html>')),/nem egyezik/);
});
await test('Aktív scriptet tartalmazó SVG elutasítva',()=>{
 const svg=new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
 assert.match(inspectMediaBytes('abra.svg','image/svg+xml',svg),/nem megengedett/);
});
await test('Külső hivatkozásos SVG nem kerül automatikusan be',()=>{
 const svg=new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.org/p.png"/></svg>');
 assert.match(inspectMediaBytes('abra.svg','image/svg+xml',svg),/nem megengedett/);
});
await test('CSS-importot és rejtett külső betöltést tartalmazó SVG elutasítva',()=>{
 const svg=new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><style>@import url(https://example.org/css)</style></svg>');
 assert.match(inspectMediaBytes('abra.svg','image/svg+xml',svg),/nem megengedett/);
});
await test('MIME-kiterjesztés eltérése és üres fájl elutasítva',async()=>{
 assert.match(inspectMediaBytes('proba.png','application/pdf',Uint8Array.from([137,80,78,71,13,10,26,10])),/MIME/);
 await assert.rejects(()=>validateBrowserMediaFile(new File([],'ures.pdf',{type:'application/pdf'}),1000),/üres/);
});
await test('Érvényes File objektum importja és túlméret-védelme',async()=>{
 const file=new File([Uint8Array.from([37,80,68,70,45,49])],'dokumentum.pdf',{type:'application/pdf'});
 assert.equal(await validateBrowserMediaFile(file,1000),true);
 await assert.rejects(()=>validateBrowserMediaFile(file,2),/meghaladja/);
});
await test('Médiakezelő ellenőrzi a tartalmat importkor és cserekor',()=>{
 const source=read('tools/media-manager-2026.js');
 assert.equal((source.match(/await validateBrowserMediaFile\(file,MAX_SIZE\)/g)||[]).length,2);
 assert.match(source,/Azonos tartalmú állomány már létezik/);
});
await test('SEO/OG/Twitter metaadatok oldalfüggő frissítése és a noindex megőrzése',()=>{
 const originalDoc=globalThis.document,originalLocation=globalThis.location;
 const nodes=[];const head={querySelector(selector){const m=selector.match(/(?:meta\[(name|property)="([^"]+)"\]|link\[rel="canonical"\])/);
  return nodes.find(n=>m?.[2]?n[m[1]]===m[2]:n.rel==='canonical')||null;},append(node){nodes.push(node);}};
 const document={title:'',baseURI:'https://example.org/csanadi-website/',head,
  createElement(){return{setAttribute(key,value){this[key]=value;}};}};
 globalThis.document=document;globalThis.location={href:'https://example.org/csanadi-website/#/sport'};
 try{
  head.append({name:'robots',content:'noindex,nofollow'});
  updatePageMeta({title:'Iskolai élet',summary:'Sport és közösség',seo:{title:'Iskolai élet a Csanádiban',description:'A sportiskola mindennapjai.'}},'#/sport');
  assert.match(document.title,/Iskolai élet a Csanádiban/);
  assert.equal(head.querySelector('meta[name="description"]').content,'A sportiskola mindennapjai.');
  assert.equal(head.querySelector('meta[property="og:locale"]').content,'hu_HU');
  assert.equal(head.querySelector('meta[name="twitter:description"]').content,'A sportiskola mindennapjai.');
  assert.equal(head.querySelector('meta[name="robots"]').content,'noindex,nofollow');
 }finally{globalThis.document=originalDoc;globalThis.location=originalLocation;}
});
await test('Az oldalmetaadatok nem lesznek felülírva a megjelenítés után',()=>{
 const source=read('js/app.js');assert.match(source,/updatePageMeta\(node\?\.page\|\|/);
 assert.doesNotMatch(source,/document\.title=title\+' \| Csanádi Árpád Sportiskola'/);
});
await test('Mind a 71 oldal tartalmi auditja lezárult, 628 média megmaradt',()=>{
 const audit=json('dokumentacio/TARTALMI_AUDIT_v1_39_7.json');
 assert.equal(audit.auditedPages,71);assert.equal(audit.registeredAssets,628);
 assert.equal(audit.errors.length,0);
});
await test('Teljesítmény: azonos lekérések összevonása és keresési DOM-gyűjtés',()=>{
 assert.match(read('js/content.js'),/if\(prior\?\.pending\)return prior\.pending/);
 assert.match(read('js/search-j-2026.js'),/fragment\.append\(makeCard/);
 assert.match(read('js/fetch-resilience-v1-39-7.js'),/retryDelaysMs=\[180,600\]/);
});

const failed=checks.filter(x=>!x.ok);
console.log(JSON.stringify({version:'1.39.7',checks:checks.length,passed:checks.length-failed.length,failed},null,2));
if(failed.length)process.exitCode=1;
