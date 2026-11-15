import {inspectNewsCollection,inspectNewsRecord} from '../js/news-policy-2026.js?v=csanadi-r29k-20261115';
const id=key=>document.getElementById(key);
let original=null,config=null;
const notice=value=>id('status').textContent=value;
const parse=()=>JSON.parse(id('editor').value);
const saveBlob=(name,value)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);};
const check=()=>{const root=parse(),errors=inspectNewsCollection(root,config),preview=id('preview');preview.replaceChildren();
 for(const entry of root.items||[]){const result=inspectNewsRecord(entry,config),row=document.createElement('article');row.dataset.severity=result.ok?'ok':'error';const name=document.createElement('strong'),details=document.createElement('p');
  name.textContent=`${result.kind==='sample'?'MINTA':result.kind==='verified'?'HITELES':'TILTOTT'} · ${entry.title||entry.id||'Névtelen'}`;
  details.textContent=result.ok?`${entry.summary||''} (nem közzétételi engedély)`:`HIBÁK: ${result.findings.join(' · ')}`;row.append(name,details);preview.append(row);}
 notice(errors.length?`${errors.length} bejegyzés hibás. Javítás nélkül nem exportálható.`:`${root.items.length} bejegyzés átment a közös automatikus validátoron. Emberi jóváhagyás továbbra is kötelező.`);return {root,errors};};
id('check').addEventListener('click',()=>{try{check();}catch(error){notice('Érvénytelen JSON: '+error.message);}});
id('download').addEventListener('click',()=>{try{const {root,errors}=check();if(errors.length)return;saveBlob('hirek_hivatalos_forras.json',root);notice('A validált JSON letöltve; a honlap vagy az FTP nem változott.');}catch(error){notice(error.message);}});
id('restore').addEventListener('click',()=>{if(!original)return;id('editor').value=JSON.stringify(original,null,2);check();});
id('sample').addEventListener('click',()=>{try{const root=parse();if(!Array.isArray(root.items))throw Error('Hiányzik az items lista');const number=Date.now(),record={id:'minta:helyi-'+number,title:config.runtime.news.sampleTitlePrefix+'Bemutató sportesemény',summary:'Kitalált, név nélküli iskolai sportesemény, kizárólag szerkesztési előnézethez.',category:'Sport',route:'#/hirek-es-esemenyek/hirek',status:'sample',date:null,url:null,verified:false};root.items.push(record);id('editor').value=JSON.stringify(root,null,2);check();}catch(error){notice(error.message);}});
Promise.all([fetch('../json/config.json',{cache:'no-store'}),fetch('../json/adatok/hirek-hivatalos.json',{cache:'no-store'})]).then(async results=>{for(const response of results)if(!response.ok)throw Error('HTTP '+response.status);[config,original]=await Promise.all(results.map(result=>result.json()));id('editor').value=JSON.stringify(original,null,2);check();}).catch(error=>notice('Nem sikerült betölteni a JSON-t: '+error.message));
