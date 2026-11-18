/* Kiadási manifestek helyi, böngészőoldali összevetése; nincs publikálás. */
(()=>{'use strict';const $=id=>document.getElementById(id);let before=null,after=null,current=null;
 const fileJson=async file=>{if(!file||file.size>8*1024*1024)throw Error('Csak legfeljebb 8 MiB méretű JSON választható.');return JSON.parse(await file.text());};
 const fetchJson=async path=>{const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw Error(`HTTP ${response.status}: ${path}`);return response.json();};
 const write=async()=>{current=null;$('diff-export').disabled=true;$('diff-list').replaceChildren();
  try{
   const {compareReleaseManifests}=await import('./release-diff-core-v1-40-7.mjs');
   current=compareReleaseManifests(before,after);const t=current.totals;
   $('diff-status').textContent=`${current.from} → ${current.to} · ${t.added} új, ${t.changed} módosult, ${t.removed} eltűnt állomány.`;
   $('diff-summary').textContent=current.reviewRequired?'Kritikus változás vagy fájleltávolítás miatt kézi kiadási felülvizsgálat szükséges.':'Az automatikus eltérésvizsgálat nem talált kritikus eltávolítást vagy belépőfájl-változást.';
   const rows=[...current.added.map(x=>['ÚJ',x]),...current.changed.map(x=>['MÓDOSULT',x]),...current.removed.map(x=>['TÖRÖLT',x])];
   for(const [kind,entry] of rows.slice(0,150)){const row=document.createElement('tr');for(const value of [kind,entry.path,entry.category]){const td=document.createElement('td');td.textContent=value;row.append(td);}$('diff-list').append(row);}
   $('diff-export').disabled=false;
  }catch(error){$('diff-status').textContent='Az összevetés nem végezhető el: '+error.message;$('diff-summary').textContent='';}
 };
 async function defaults(){before=null;after=null;try{[before,after]=await Promise.all([fetchJson('../dokumentacio/BAZIS_MANIFEST_V1_40_6.json'),fetchJson('../release-manifest.json')]);await write();}
  catch(error){$('diff-status').textContent='Az alapmanifeszt nem érhető el: '+error.message;}}
 $('diff-before').addEventListener('change',async event=>{try{before=await fileJson(event.target.files?.[0]);if(after)await write();}catch(error){$('diff-status').textContent=error.message;}});
 $('diff-after').addEventListener('change',async event=>{try{after=await fileJson(event.target.files?.[0]);if(before)await write();}catch(error){$('diff-status').textContent=error.message;}});
 $('diff-reload').addEventListener('click',defaults);
 $('diff-export').addEventListener('click',()=>{if(!current)return;const blob=new Blob([JSON.stringify(current,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='csanadi_kiadasi_elteresek_v1_40_7.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);});
 defaults();
})();
