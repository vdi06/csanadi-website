/** v1.40.6 – Statisztikus és tartalmi HTTP(S)-ellenőrzés, kizárólag olvasva.
 * Példa: node tools/check-release-target-v1-40-6.mjs http://127.0.0.1:4173/
 * A cél kizárólag lekérdezés; nem ír szerveres fájlokat, nem aktivál kiadást. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=new URL(process.argv[2]||'http://127.0.0.1:4173/');
if(!['http:','https:'].includes(base.protocol)||base.username||base.password||base.hash)throw Error('Csak tiszta HTTP(S) kiadási gyökér URL adható meg.');
const localJson=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const want='csanadi-website-v1.40.6';
const critical=['script.js','js/app.js','js/hero-2026.js','js/release-v1-39-1.js',
 'css/tools-unified-v1-40-5.css','css/accessibility-v1-40-4.css',
 'tools/mobil-akadalymentesseg-qa.js','tools/iskolai-fotok-jovahagyasa.js',
 'tools/content-quality-core-v1-40-5.mjs','tools/sha256-local-v1-40-5.mjs','tools/tartalom-kereses-audit.js',
 'tools/tool-ui-2026.js','json/oldalak/kezdolap.json',
 'js/search-policies-v1-40-6.js','css/search-polish-v1-40-6.css',
 'tools/photo-approval-core-v1-40-6.mjs','tools/qa-import-core-v1-40-6.mjs',
 'tools/kiadasi-kapu-v1-40-6.html','tools/kiadasi-kapu-v1-40-6.js'];
const expectedPages=Object.keys(localJson('json/oldalindex.json').pages).length;
const expectedAssets=localJson('json/assets-inventory.json').items.length;
const expectedSamples=Math.ceil(expectedPages/7);
const result={target:base.href,expected:want,observed:null,version:'unknown',pages:{checked:0,failed:[]},assets:{checked:0,failed:[]},entry:{ok:false,details:''},manifest:{fileCount:0,matching:false},criticalFiles:{checked:0,failed:[]},samplePages:{checked:0,failed:[]},warnings:[]};
const endpoint=relative=>new URL(relative,base);
async function fetchText(relative){const response=await fetch(endpoint(relative),{cache:'no-store',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`HTTP ${response.status}: ${relative}`);return response.text();}
async function fetchBytes(relative){const response=await fetch(endpoint(relative),{cache:'no-store',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`HTTP ${response.status}: ${relative}`);return Buffer.from(await response.arrayBuffer());}
async function exists(relative){
 const address=endpoint(relative);
 try{
  let response=await fetch(address,{method:'HEAD',cache:'no-store',signal:AbortSignal.timeout(15000)});
  if([405,501].includes(response.status))response=await fetch(address,{method:'GET',cache:'no-store',signal:AbortSignal.timeout(15000)});
  return response.ok;
 }catch{return false;}
}
async function inspectMany(paths,field){
 let next=0;
 await Promise.all(Array.from({length:8},async()=>{
  while(next<paths.length){const relative=paths[next++];if(!await exists(relative))result[field].failed.push(relative);result[field].checked++;}
 }));
 result[field].failed.sort();
}
try{
 const html=await fetchText('index.html');
 const match=html.match(/script\.js\?v=(\d+\.\d+\.\d+)/);
 result.entry={ok:html.includes('bootstrap@5.3.9')&&html.includes('script.js?v=1.40.6'),details:'HTML belépő: '+(match?.[1]||'ismeretlen')};
 const manifest=JSON.parse(await fetchText('release-manifest.json'));
 const localManifest=localJson('release-manifest.json');
 const paths=Object.keys(localManifest.files||{}),remotePaths=Object.keys(manifest.files||{});
 const matching=paths.length===remotePaths.length&&paths.every(name=>localManifest.files[name].sha256===manifest.files?.[name]?.sha256&&localManifest.files[name].sizeBytes===manifest.files?.[name]?.sizeBytes);
 result.manifest={fileCount:remotePaths.length,matching};
 if(!matching)result.warnings.push('Az élő fájljegyzék eltér a helyben ellenőrzött kiadási manifesttől.');
 result.observed=manifest.release||null;
 result.version=result.observed===want?'match':'stale';
 if(result.version!=='match')result.warnings.push(`A cél jelenleg ${result.observed||'ismeretlen'}; a v1.40.6 csomag nincs itt aktiválva.`);
 if(result.version==='match'){
  if(!await exists('dokumentacio/KIADASI_KAPU_V1_40_6.json'))result.warnings.push('A helyi kiadási kapu jelentése hiányzik.');
  const index=localJson('json/oldalindex.json');
  const inventory=localJson('json/assets-inventory.json');
  const pagePaths=Object.keys(index.pages).map(p=>'json/'+p);
  const assetPaths=[...new Set(inventory.items.map(item=>item.path))];
  await Promise.all([inspectMany(pagePaths,'pages'),inspectMany(assetPaths,'assets')]);
  const config=JSON.parse(await fetchText('json/config.json'));
  if(config.performance?.cacheVersion!=='csanadi-r-v1.40.6')result.warnings.push('Eltérő élő gyorsítótárverzió.');
  const missing=pagePaths.filter(p=>!manifest.files?.[p]);
  if(missing.length)result.warnings.push(`A kiadási jegyzékből ${missing.length} oldal-JSON hiányzik.`);
  // A legfontosabb kódot és a kétállapotú tervezőt tényleges bájthash alapján
  // ellenőrizzük: egy hibás cache vagy hiányzó munkalap így is azonnal kiderül.
  await Promise.all(critical.map(async name=>{
   try{const bytes=await fetchBytes(name),hash=createHash('sha256').update(bytes).digest('hex');
    if(hash!==manifest.files?.[name]?.sha256)result.criticalFiles.failed.push(name);
   }catch{result.criticalFiles.failed.push(name);}
   result.criticalFiles.checked++;
  }));
  result.criticalFiles.failed.sort();
  const samples=pagePaths.filter((_,index)=>index%7===0);
  await Promise.all(samples.map(async name=>{
   try{const page=JSON.parse(await fetchText(name));if(!page||typeof page!=='object')throw Error('Hibás oldal-JSON');}
   catch{result.samplePages.failed.push(name);}
   result.samplePages.checked++;
  }));
  result.samplePages.failed.sort();
 }
}catch(error){result.warnings.push('A cél ellenőrzése megszakadt: '+error.message);}
const pass=result.version==='match'&&result.entry.ok&&result.manifest.matching&&result.pages.checked===expectedPages&&!result.pages.failed.length&&result.assets.checked===expectedAssets&&!result.assets.failed.length&&result.criticalFiles.checked===critical.length&&!result.criticalFiles.failed.length&&result.samplePages.checked===expectedSamples&&!result.samplePages.failed.length&&!result.warnings.length;
console.log(JSON.stringify({...result,pass},null,2));
if(!pass)process.exitCode=result.version==='stale'?2:1;
