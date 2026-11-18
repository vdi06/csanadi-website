/* v1.40.7 T – statikus kiadási manifestek biztonságos összevetése. */
const sha=/^[a-f0-9]{64}$/i;
const safePath=name=>typeof name==='string'&&name.length>0&&!name.startsWith('/')&&!name.includes('\\')&&!name.includes('\0')&&!name.split('/').includes('..')&&!name.split('/').includes('.');
function category(path){if(path.startsWith('json/'))return 'json';if(path.startsWith('assets/'))return 'asset';if(path.startsWith('tools/'))return 'tool';if(path.startsWith('css/'))return 'css';if(path.startsWith('js/')||path.endsWith('.js')||path.endsWith('.mjs'))return 'script';if(path.startsWith('dokumentacio/'))return 'documentation';return 'other';}
function validate(manifest){
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest)||typeof manifest.release!=='string'||!manifest.files||typeof manifest.files!=='object'||Array.isArray(manifest.files))throw Error('Érvénytelen kiadási manifest.');
 const names=Object.keys(manifest.files);if(names.length>20000)throw Error('Túl sok állomány a manifestben.');
 for(const name of names){const entry=manifest.files[name];if(!safePath(name)||!entry||!Number.isSafeInteger(entry.sizeBytes)||entry.sizeBytes<0||!sha.test(String(entry.sha256||'')))throw Error('Hibás vagy nem biztonságos fájljegyzék-bejegyzés: '+name);}
 return names;
}
export function compareReleaseManifests(previous,current){
 const beforeNames=validate(previous),afterNames=validate(current),before=previous.files,after=current.files;
 const added=[],removed=[],changed=[];let unchanged=0,bytesBefore=0,bytesAfter=0;
 for(const path of beforeNames)bytesBefore+=before[path].sizeBytes;
 for(const path of afterNames)bytesAfter+=after[path].sizeBytes;
 for(const path of afterNames){
  if(!Object.hasOwn(before,path))added.push({path,category:category(path),bytes:after[path].sizeBytes});
  else if(before[path].sha256!==after[path].sha256||before[path].sizeBytes!==after[path].sizeBytes)
   changed.push({path,category:category(path),fromBytes:before[path].sizeBytes,toBytes:after[path].sizeBytes});
  else unchanged++;
 }
 for(const path of beforeNames)if(!Object.hasOwn(after,path))removed.push({path,category:category(path),bytes:before[path].sizeBytes});
 const sorted=items=>items.sort((a,b)=>a.path.localeCompare(b.path,'hu'));sorted(added);sorted(removed);sorted(changed);
 const risk=removed.filter(x=>x.category==='json'||x.category==='asset'||x.category==='script'||x.category==='css');
 const critical=changed.filter(x=>['index.html','script.js','json/config.json','json/structure.json','json/oldalindex.json'].includes(x.path));
 return {from:previous.release,to:current.release,
  totals:{previous:beforeNames.length,current:afterNames.length,added:added.length,removed:removed.length,changed:changed.length,unchanged,bytesBefore,bytesAfter,byteDelta:bytesAfter-bytesBefore},
  added,removed,changed,
  reviewRequired:risk.length>0||critical.length>0,
  flagged:{removedCoreFiles:risk.map(x=>x.path),changedEntrypoints:critical.map(x=>x.path)},
  note:'A különbség technikai fájl- és SHA-256-összevetés, nem jelenti a tartalom jogi vagy intézményi jóváhagyását.'};
}
