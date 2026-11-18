/* Load only the explicitly registered interactive center inside its own frame.
   Separate window/document isolates CSS, dialogs, timers and DOM identifiers. */
const modules={
 explorer:()=>import('./round21-explorer.js?v=1.42.3').then(module=>module.mountExplorer()),
 compass:()=>import('./round22-center.js?v=1.42.3').then(module=>module.mountCompass()),
 workshop:()=>import('./round23-workshop.js?v=1.42.3').then(module=>module.mountWorkshop()),
 heritage:()=>import('./round24-heritage.js?v=1.42.8').then(module=>module.mountHeritage()),
 community:()=>import('./round25-community.js?v=1.42.8').then(module=>module.mountCommunity()),
 offline:()=>import('./offline-reader-20.js?v=1.42.3').then(module=>module.mountOfflineReader()),
 guide:()=>import('./guide-ui-v1-42.js?v=1.42.3').then(module=>module.mountGuide())
};
const key=document.body?.dataset.spaFeature;
if(!Object.hasOwn(modules,key)){
 console.error('Ismeretlen SPA-interaktív központ:',key);
}else{
 modules[key]().catch(error=>{
  console.error('SPA-központ inicializálási hiba:',key,error);
  const status=document.createElement('p');status.setAttribute('role','alert');
  status.textContent='Az interaktív eszköz betöltése nem sikerült.';
  document.body.prepend(status);
 });
}
