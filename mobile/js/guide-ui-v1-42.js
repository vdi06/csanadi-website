// SPA-only interaction adapter. The original #/informaciok/utmutato remains unchanged.
export async function mountGuide(){
 const input=document.getElementById('guide-search'),status=document.getElementById('guide-count');
 const button=document.getElementById('guide-theme-toggle');
 if(!input||!status||!button)return;
 const host=input.closest('.cs-spa-feature')||document.body;
 const sections=[...host.querySelectorAll('[data-filterable]')];
 const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu-HU');
 document.getElementById('print')?.addEventListener('click',()=>window.print());
 input.addEventListener('input',()=>{
  const query=normalize(input.value.trim());let count=0;
  for(const section of sections){const visible=!query||normalize(section.textContent).includes(query);section.dataset.hidden=String(!visible);if(visible)count++;}
  status.textContent=query?count+' fejezet illeszkedik.':'A teljes kézikönyv látható.';
 });
 status.textContent='A teljes kézikönyv látható.';
 const labels={system:'Automatikus',light:'Világos',dark:'Sötét'},modes=['system','light','dark'];
 let preference='system';try{preference=localStorage.getItem('csanadi-theme')||'system';}catch{}
 if(!modes.includes(preference))preference='system';
 const query=matchMedia('(prefers-color-scheme: dark)');let settings=null;
 const apply=()=>{
  if(!button.isConnected)return;
  const mode=preference==='system'?(query.matches?'dark':'light'):preference;
  document.documentElement.dataset.theme=mode;
  document.documentElement.dataset.themePreference=preference;
  document.documentElement.setAttribute('data-bs-theme',mode);
  const palette=settings?.theme?.[mode+'Colors'];
  if(palette)for(const key of ['page','card','light','line','ink','muted','header','footer','nav','sportGreen','sportYellow']){
   if(typeof palette[key]==='string')document.documentElement.style.setProperty('--'+(key==='sportGreen'?'sport-green':key==='sportYellow'?'sport-yellow':key),palette[key]);
  }
  button.textContent='◐ '+labels[preference]+' mód';
  button.setAttribute('aria-label','Megjelenés: '+labels[preference]+'. Kattints a váltáshoz.');
 };
 const click=()=>{preference=preference==='system'?'light':preference==='light'?'dark':'system';try{localStorage.setItem('csanadi-theme',preference);}catch{}apply();};
 const changed=()=>{if(preference==='system')apply();};
 button.addEventListener('click',click);query.addEventListener?.('change',changed);
 host?.addEventListener('csanadi:feature-unmount',()=>{button.removeEventListener('click',click);query.removeEventListener?.('change',changed);},{once:true});
 apply();
 try{const response=await fetch('../shared/json/config.json',{cache:'no-store'});if(response.ok){settings=await response.json();apply();}}
 catch(error){console.warn('Kézikönyv-paletta betöltése sikertelen:',error);}
}
