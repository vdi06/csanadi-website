 
(()=>{
  'use strict';
  const button=document.getElementById('tool-theme-toggle');
  if(!button)return;
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let selected='system';
  try{const value=localStorage.getItem('csanadi-theme');if(['system','light','dark'].includes(value))selected=value;}catch{}
  const resolve=()=>selected==='system'?(media.matches?'dark':'light'):selected;
  const labels={system:'Automatikus',light:'Világos',dark:'Sötét'};
  const update=()=>{
    const theme=resolve();
    document.documentElement.dataset.theme=theme;
    document.documentElement.setAttribute('data-bs-theme',theme);
    button.textContent='◐ '+labels[selected]+' mód';
    button.setAttribute('aria-label','Megjelenés: '+labels[selected]+'. Váltás a következő megjelenésre');
    button.title='Megjelenési mód váltása';
  };
  button.addEventListener('click',()=>{selected=selected==='system'?'light':selected==='light'?'dark':'system';try{localStorage.setItem('csanadi-theme',selected);}catch{}update();});
  media.addEventListener?.('change',()=>{if(selected==='system')update();});
  update();
})();
