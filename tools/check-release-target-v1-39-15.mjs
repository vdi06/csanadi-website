/** v1.39.15 – Az adott statikus HTTP(S)-gyökér tényleges, felületi kiadáspróbája.
 * Példa: node tools/check-release-target-v1-39-15.mjs http://127.0.0.1:4173/
 * A cél kizárólag lekérdezés; nem ír szerveres fájlokat, nem aktivál kiadást. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=new URL(process.argv[2]||'http://127.0.0.1:4173/');
if(!['http:','https:'].includes(base.protocol)||base.username||base.password||base.hash)throw Error('Csak tiszta HTTP(S) kiadási gyökér URL adható meg.');
const localJson=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const want='csanadi-website-v1.39.15';
const result={target:base.href,expected:want,observed:null,version:'unknown',pages:{checked:0,failed:[]},assets:{checked:0,failed:[]},entry:{ok:false,details:''},warnings:[]};
const endpoint=relative=>new URL(relative,base);
async function fetchText(relative){const response=await fetch(endpoint(relative),{cache:'no-store',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`HTTP ${response.status}: ${relative}`);return response.text();}
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
 result.entry={ok:html.includes('bootstrap@5.3.9')&&html.includes('script.js?v=1.39.15'),details:'HTML belépő: '+(match?.[1]||'ismeretlen')};
 const manifest=JSON.parse(await fetchText('release-manifest.json'));
 result.observed=manifest.release||null;
 result.version=result.observed===want?'match':'stale';
 if(result.version!=='match')result.warnings.push(`A cél jelenleg ${result.observed||'ismeretlen'}; a v1.39.15 csomag nincs itt aktiválva.`);
 if(result.version==='match'){
  const index=localJson('json/oldalindex.json');
  const inventory=localJson('json/assets-inventory.json');
  const pagePaths=Object.keys(index.pages).map(p=>'json/'+p);
  const assetPaths=[...new Set(inventory.items.map(item=>item.path))];
  await Promise.all([inspectMany(pagePaths,'pages'),inspectMany(assetPaths,'assets')]);
  const config=JSON.parse(await fetchText('json/config.json'));
  if(config.performance?.cacheVersion!=='csanadi-r-v1.39.15')result.warnings.push('Eltérő élő gyorsítótárverzió.');
  const missing=pagePaths.filter(p=>!manifest.files?.[p]);
  if(missing.length)result.warnings.push(`A kiadási jegyzékből ${missing.length} oldal-JSON hiányzik.`);
 }
}catch(error){result.warnings.push('A cél ellenőrzése megszakadt: '+error.message);}
const pass=result.version==='match'&&result.entry.ok&&result.pages.checked===71&&!result.pages.failed.length&&result.assets.checked===748&&!result.assets.failed.length&&!result.warnings.length;
console.log(JSON.stringify({...result,pass},null,2));
if(!pass)process.exitCode=result.version==='stale'?2:1;
