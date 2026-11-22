// Shared theme binding with lifecycle cleanup for SPA-mounted legacy centers.
export function bindFeatureTheme(buttonId){
 const button=document.getElementById(buttonId);
 if(!button)throw Error('Hiányzó témaváltó: '+buttonId);
 const modes=['system','light','dark'],labels={system:'Automatikus',light:'Világos',dark:'Sötét'};
 let preference='system';
 try{preference=localStorage.getItem('csanadi-theme')||'system';}catch{}
 if(!modes.includes(preference))preference='system';
 const query=matchMedia('(prefers-color-scheme:dark)');
 const apply=()=>{
  if(!button.isConnected)return;
  const theme=preference==='system'?(query.matches?'dark':'light'):preference;
  document.documentElement.dataset.theme=theme;document.documentElement.setAttribute('data-bs-theme',theme);document.documentElement.dataset.themePreference=preference;
  button.textContent='◐ '+labels[preference];
 };
 const click=()=>{preference=modes[(modes.indexOf(preference)+1)%modes.length];try{localStorage.setItem('csanadi-theme',preference);}catch{}apply();};
 const systemChange=()=>{if(preference==='system')apply();};
 button.addEventListener('click',click);
 query.addEventListener?.('change',systemChange);
 (button.closest('.cs-spa-feature')||document.body)?.addEventListener('csanadi:feature-unmount',()=>{
  button.removeEventListener('click',click);
  query.removeEventListener?.('change',systemChange);
 },{once:true});
 apply();
}
