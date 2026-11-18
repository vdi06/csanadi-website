import {analyzeContentPages,contentAuditCsv} from './content-quality-core-v1-40-5.mjs';
const $=id=>document.getElementById(id);
let report=null;
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function paint(){const body=$('content-rows');body.replaceChildren();if(!report)return;
 const kind=$('content-filter').value,issues=report.issues.filter(x=>kind==='all'||x.severity===kind);
 if(!issues.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=4;cell.textContent='Nincs ilyen típusú jelzés.';row.append(cell);body.append(row);return;}
 for(const issue of issues){const row=document.createElement('tr');row.dataset.status=issue.severity==='error'?'review':issue.severity==='warning'?'review':'pass';
  for(const value of [issue.severity,issue.path,issue.code,issue.detail]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}body.append(row);}
}
async function run(){const button=$('content-run');button.disabled=true;$('content-status').textContent='Az oldal-JSON-ok ellenőrzése…';
 try{const fetchJSON=async url=>{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error(`HTTP ${response.status}: ${url}`);return response.json();};
  const index=await fetchJSON('../json/oldalindex.json'),paths=Object.keys(index.pages||{});
  if(paths.length>200)throw Error('A várt legfeljebb 200 oldalnál több szerepel az indexben.');
  const entries=[];for(let i=0;i<paths.length;i+=8){const batch=paths.slice(i,i+8);
   entries.push(...await Promise.all(batch.map(async path=>{
    if(!/^oldalak\/[a-z0-9_/-]+\.json$/.test(path))throw Error('Érvénytelen oldalfájl útvonal: '+path);
    return {path,page:await fetchJSON('../json/'+path)};
   })));
  }
  report=analyzeContentPages(entries,index);
  $('content-pages').textContent=report.totals.pages;$('content-errors').textContent=report.totals.error;
  $('content-warnings').textContent=report.totals.warning;$('content-advice').textContent=report.totals.advice;
  $('content-status').textContent=`${report.totals.pages} oldal ellenőrizve; ${report.totals.issues} jelzés. A szerver tartalma változatlan.`;
  $('content-json').disabled=false;$('content-csv').disabled=false;paint();
 }catch(error){$('content-status').textContent='Az audit megszakadt: '+error.message;console.error('Tartalom-audit',error);}
 finally{button.disabled=false;}
}
$('content-run').addEventListener('click',run);
$('content-filter').addEventListener('change',paint);
$('content-json').addEventListener('click',()=>report&&download('csanadi_tartalom_kereses_v1_40_5.json',JSON.stringify(report,null,2),'application/json'));
$('content-csv').addEventListener('click',()=>report&&download('csanadi_tartalom_kereses_v1_40_5.csv',contentAuditCsv(report),'text/csv;charset=utf-8'));
