/* Statisztikus kiadási kapu: kizárólag előre ellenőrzött jelentés megjelenítése. */
(()=>{'use strict';const $=id=>document.getElementById(id);let report=null;
 const exportButton=$('gate-export');
 exportButton.addEventListener('click',()=>{if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='csanadi_kiadasi_kapu_v1_40_6.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);});
 fetch('../dokumentacio/KIADASI_KAPU_V1_40_6.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error(`HTTP ${response.status}`);return response.json();}).then(data=>{
  report=data;exportButton.disabled=false;
  $('gate-status').textContent=`A helyi fájlintegritás ${data.packageIntegrity?.passed?'sikeres':'hibás'} (${data.packageIntegrity?.hashesChecked||0} állomány ellenőrizve). Nyilvános kiadás: NEM engedélyezett.`;
  const table=$('gate-results');table.replaceChildren();for(const gate of data.releaseGates||[]){const row=document.createElement('tr');row.dataset.status=gate.passed?'pass':'review';for(const value of [gate.name,gate.passed?'TELJESÜLT':'NYITOTT',gate.requires||'Nincs nyitott teendő']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}table.append(row);}
 }).catch(error=>{$('gate-status').textContent='A kiadási jelentés nem érhető el: '+error.message;});
})();
