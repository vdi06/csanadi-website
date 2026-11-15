'use strict';
(function(){
 const space=document.querySelector('.mm-bulk')||document.querySelector('.mm-workspace');if(!space)return;
 const wrap=document.createElement('section');wrap.className='r10-media-quality';
 const heading=document.createElement('h3');heading.textContent='Médiaállományok minőségi áttekintése';
 const intro=document.createElement('p');intro.textContent='A jelenleg közzétett fájlnyilvántartás méret-, típus- és duplikátumvizsgálata. A még nem exportált szerkesztéseket ez a kimutatás nem tartalmazza.';
 const button=document.createElement('button');button.type='button';button.textContent='Médiatár ellenőrzése';
 const download=document.createElement('button');download.type='button';download.textContent='Duplikátumjegyzék CSV';download.disabled=true;
 const state=document.createElement('p');state.setAttribute('role','status');state.setAttribute('aria-live','polite');state.textContent='Ellenőrzésre kész.';
 const content=document.createElement('div');content.className='r10-media-report';
 wrap.append(heading,intro,button,download,state,content);space.after(wrap);
 let matches=[];
 const save=(filename,value)=>{const url=URL.createObjectURL(new Blob([value],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);};
 const quote=text=>'"'+String(text??'').replace(/"/g,'""')+'"';
 download.addEventListener('click',()=>{const csv=['Azonos SHA-256;Állományútvonalak',...matches.map(item=>[item.hash,item.paths.join(' | ')].map(quote).join(';'))].join('\r\n');save('csanadi_media_duplikatumok.csv','\ufeff'+csv);});
 button.addEventListener('click',async()=>{
  button.disabled=true;state.textContent='A médiatár nyilvántartásának ellenőrzése…';content.replaceChildren();
  try{
   const response=await fetch('../json/assets-inventory.json',{cache:'no-store'});if(!response.ok)throw Error('A médiaállomány-index nem érhető el.');
   const index=await response.json(),items=index.items||[],groups=new Map(),types=new Map();
   for(const item of items){const type=item.type||'egyéb';const group=types.get(type)||{count:0,bytes:0};group.count++;group.bytes+=(Number(item.sizeBytes)||0);types.set(type,group);
    if(item.sha256&&/^[a-f0-9]{64}$/i.test(item.sha256))groups.set(item.sha256,[...(groups.get(item.sha256)||[]),item.path]);
   }
   matches=[...groups].filter(([,paths])=>paths.length>1).map(([hash,paths])=>({hash,paths}));
   const card=(label,value)=>{const node=document.createElement('div');node.className='r10-media-metric';const count=document.createElement('strong');count.textContent=String(value);const text=document.createElement('span');text.textContent=label;node.append(count,text);content.append(node);};
   card('Állomány a nyilvántartásban',items.length);card('Összes fájlméret',(items.reduce((sum,item)=>sum+(Number(item.sizeBytes)||0),0)/1048576).toFixed(2)+' MiB');card('Egyező SHA-256-csoport',matches.length);card('Médiatípus',types.size);
   const list=document.createElement('ul');list.className='r10-media-types';for(const [name,group] of [...types].sort((a,b)=>b[1].count-a[1].count)){const li=document.createElement('li');li.textContent=`${name}: ${group.count} állomány · ${(group.bytes/1048576).toFixed(2)} MiB`;list.append(li);}content.append(list);
   state.textContent=`${items.length} állomány ellenőrizve. ${matches.length} egyező tartalmú fájlcsoport. Az egyezés nem feltétlenül hiba, törlés előtt a felhasználást is ellenőrizni kell.`;
   download.disabled=false;
  }catch(error){state.textContent='Hiba: '+error.message;}finally{button.disabled=false;}
 });
})();
