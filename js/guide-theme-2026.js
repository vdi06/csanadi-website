(()=>{
 const button=document.getElementById('guide-theme-toggle');if(!button)return;
 const media=matchMedia('(prefers-color-scheme: dark)');
 let selected='system',settings=null;
 try{const value=localStorage.getItem('csanadi-theme');if(['system','light','dark'].includes(value))selected=value;}catch{}
 const labels={system:'Automatikus',light:'Világos',dark:'Sötét'};
 const apply=()=>{
  const mode=selected==='system'?(media.matches?'dark':'light'):selected;
  document.documentElement.dataset.theme=mode;
  document.documentElement.setAttribute('data-bs-theme',mode);
  const palette=settings?.theme?.[mode+'Colors'];
  if(palette)for(const key of ['page','card','light','line','ink','muted','header','footer','nav','sportGreen','sportYellow'])if(typeof palette[key]==='string')document.documentElement.style.setProperty('--'+(key==='sportGreen'?'sport-green':key==='sportYellow'?'sport-yellow':key),palette[key]);
  button.textContent='◐ '+labels[selected]+' mód';
  button.setAttribute('aria-label','Megjelenés: '+labels[selected]+'. Kattints a váltáshoz.');
 };
 button.addEventListener('click',()=>{selected=selected==='system'?'light':selected==='light'?'dark':'system';try{localStorage.setItem('csanadi-theme',selected);}catch{}apply();});
 media.addEventListener?.('change',()=>{if(selected==='system')apply();});
 fetch('json/config.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(data=>{settings=data;apply();}).catch(error=>console.warn('A kézikönyv központi színpalettája nem érhető el:',error));
 apply();
})();
