/* v1.40.7 – fotóforrások visszaellenőrzése és függő importterve.
   Nem tölti fel a képeket, nem jelöl szerveres forrást jóváhagyottnak. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),list=$('photos-list'),status=$('photos-status');
 let images=[],verifiedManifest=null;
 const formats=new Set(['image/jpeg','image/png','image/webp','image/avif']);
 const sha256=async file=>{
  const bytes=await file.arrayBuffer();
  if(globalThis.crypto?.subtle){const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
  // Az iskola HTTP-alapú, statikus FTP-tárhelyén a SubtleCrypto nem feltétlenül
  // elérhető. A helyi számítás akkor sem igényel adatküldést.
  const {sha256Bytes}=await import('./sha256-local-v1-40-5.mjs');
  return sha256Bytes(new Uint8Array(bytes));
 };
 async function readImage(file){
  if(!formats.has(file.type))throw Error('Nem támogatott képformátum: '+file.name);
  if(file.size>25*1024*1024)throw Error('Túl nagy kép (25 MiB): '+file.name);
  const url=URL.createObjectURL(file);
  try{
   const image=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(Error('A kép nem olvasható: '+file.name));el.src=url;});
   if(image.naturalWidth<600||image.naturalHeight<360)throw Error('A kép nagyon kicsi (legalább 600×360 szükséges): '+file.name);
   const hash=await sha256(file);
   return {name:file.name,mimeType:file.type,sizeBytes:file.size,width:image.naturalWidth,height:image.naturalHeight,sha256:hash};
  }finally{URL.revokeObjectURL(url);}
 }
 function render(){list.replaceChildren();if(!images.length){const p=document.createElement('p');p.textContent='Még nincs felvehető kép.';list.append(p);return;}
  for(const image of images){const row=document.createElement('article');row.className='cs1405-photo-row';const name=document.createElement('strong');name.textContent=image.name;
   const description=document.createElement('span');description.textContent=`${image.width}×${image.height} px · ${(image.sizeBytes/1024/1024).toFixed(2)} MiB · SHA-256: ${image.sha256.slice(0,16)}…`;
   row.append(name,description);list.append(row);
  }
 }
 $('photos-input').addEventListener('change',async event=>{
  images=[];verifiedManifest=null;$('photos-stage-export').disabled=true;render();status.textContent='Képek ellenőrzése…';
  try{const files=[...event.target.files].slice(0,50);const collected=[];
   for(const file of files)collected.push(await readImage(file));
   const seen=new Set();images=collected.filter(item=>{if(seen.has(item.sha256))return false;seen.add(item.sha256);return true;});render();
   status.textContent=`${images.length} különböző kép betöltve. Export előtt az írásos jóváhagyási adatokat is ellenőrizd.`;
  }catch(error){images=[];render();status.textContent=error.message;}
 });
 function exportFile(name,type,body){const blob=new Blob([body],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
 $('photos-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!images.length){status.textContent='Először válassz ki legalább egy érvényes képet.';return;}
  if(!event.currentTarget.reportValidity()){status.textContent='A kötelező bizonyítékmezők és felelősi ellenőrzések hiányosak.';return;}
  const approval={holder:$('photos-holder').value.trim(),permission:$('photos-permission').value.trim(),evidenceId:$('photos-evidence').value.trim(),reviewer:$('photos-reviewer').value.trim(),decisionId:$('photos-decision').value.trim(),sourceDate:$('photos-date').value,privacyBasis:$('photos-privacy').value.trim()};
  if(Object.values(approval).some(x=>!x)){status.textContent='Minden engedélyezési mező kitöltése kötelező.';return;}
  const report={release:'1.40.7',schemaVersion:'1.0.0',purpose:'Intézményi képregisztrálás előkészítése',
   warning:'Ez a nyilatkozat csak a felhasználó által rögzített adatokat tartalmazza, az engedély valódiságát nem bizonyítja. NEM jelent nyilvános publikálást.',
   externallyVerifiedBySystem:false,uploadedToServer:false,approval,images};
  exportFile('csanadi_fotok_jovahagyasi_munkalap_v1_40_7.json','application/json',JSON.stringify(report,null,2));
  const keys=['name','mimeType','sizeBytes','width','height','sha256','holder','permission','evidenceId','reviewer','decisionId','sourceDate','privacyBasis'];
  const escape=v=>'"'+String(v??'').replace(/^[=+\-@]/,"'$&").replace(/"/g,'""')+'"';
  const rows=[keys,...images.map(image=>keys.map(key=>image[key]??approval[key]))];
  exportFile('csanadi_fotok_jovahagyasi_munkalap_v1_40_7.csv','text/csv;charset=utf-8','\ufeff'+rows.map(row=>row.map(escape).join(';')).join('\r\n'));
  status.textContent=`${images.length} helyi kép adatai és a rögzített nyilatkozatok exportálva. A képfájlok nem kerültek feltöltésre.`;
 });
 $('photos-verify-input').addEventListener('change',async event=>{
  const result=$('photos-verify-status'),errors=$('photos-verify-errors');errors.replaceChildren();verifiedManifest=null;$('photos-stage-export').disabled=true;
  try{const file=event.target.files?.[0];if(!file)return;if(file.size>5*1024*1024)throw Error('Túl nagy jegyzék (legfeljebb 5 MiB).');
   const manifest=JSON.parse(await file.text());const {verifyPhotoApproval}=await import('./photo-approval-core-v1-40-6.mjs');
   const outcome=verifyPhotoApproval(manifest,images);
   if(outcome.matched){verifiedManifest=manifest;$('photos-stage-export').disabled=false;}
   result.textContent=`${outcome.rows} jegyzéksor, ${outcome.files} helyi eredeti kép · ${outcome.problems.length} eltérés. ${outcome.disclaimer}`;
   for(const problem of outcome.problems){const item=document.createElement('li');item.textContent=problem;errors.append(item);}
  }catch(error){result.textContent='A jegyzék nem ellenőrizhető: '+error.message;}
 });
 $('photos-stage-export').addEventListener('click',async()=>{
  if(!verifiedManifest||!images.length)return;
  try{
   const response=await fetch('../json/mediatar.json',{cache:'no-store'});if(!response.ok)throw Error('A médiatár nem tölthető be: HTTP '+response.status);
   const registry=await response.json();
   const {buildPhotoStagingPlan}=await import('./photo-staging-core-v1-40-7.mjs');
   const plan=buildPhotoStagingPlan(verifiedManifest,images,registry.items||[]);
   if(!plan.ready){$('photos-verify-status').textContent='Az előkészítés megszakadt: '+plan.issues.join('; ');return;}
   const payload={release:'1.40.7',purpose:'Csak helyi, nem közzétehető médiaimport-terv',createdByTool:true,uploadedToServer:false,...plan};
   exportFile('csanadi_foto_mediatar_elokeszites_v1_40_7.json','application/json',JSON.stringify(payload,null,2));
   $('photos-verify-status').textContent=`${plan.items.length} előkészítő médiasor exportálva. Egyik sem rendelkezik önálló intézményi jóváhagyással; közzététel nem történt.`;
  }catch(error){$('photos-verify-status').textContent='A médiatári terv nem készíthető el: '+error.message;}
 });
})();
