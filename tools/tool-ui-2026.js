 
(()=>{
  'use strict';
  const button=document.getElementById('tool-theme-toggle');
  if(!button)return;
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let selected='system';
  try{const value=localStorage.getItem('csanadi-theme');if(['system','light','dark'].includes(value))selected=value;}catch{}
  const resolve=()=>selected==='system'?(media.matches?'dark':'light'):selected;
  const labels={system:'Automatikus',light:'Világos',dark:'Sötét'};
  let palette=null;
  const applyPalette=()=>{
    if(!palette)return;
    const mode=resolve(),colors=palette.theme?.[mode+'Colors'];if(!colors)return;
    for(const key of ['page','card','light','line','ink','muted','header','footer','nav','sportGreen','sportYellow'])if(typeof colors[key]==='string')document.documentElement.style.setProperty('--'+(key==='sportGreen'?'sport-green':key==='sportYellow'?'sport-yellow':key),colors[key]);
  };
  const update=()=>{
    const theme=resolve();
    document.documentElement.dataset.theme=theme;
    document.documentElement.setAttribute('data-bs-theme',theme);
    button.textContent='◐ '+labels[selected]+' mód';
    button.setAttribute('aria-label','Megjelenés: '+labels[selected]+'. Váltás a következő megjelenésre');
    button.title='Megjelenési mód váltása';
    applyPalette();
  };
  button.addEventListener('click',()=>{selected=selected==='system'?'light':selected==='light'?'dark':'system';try{localStorage.setItem('csanadi-theme',selected);}catch{}update();});
  media.addEventListener?.('change',()=>{if(selected==='system')update();});
  fetch('../json/config.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();}).then(config=>{palette=config;applyPalette();}).catch(error=>console.warn('A központi színpaletta nem érhető el a segédoldalon:',error));
  update();
})();
