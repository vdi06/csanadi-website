/* A single entry point for the full browser-local maintenance studio. */
export function createAuthoringWorkbench(){
 const root=document.createElement('section');root.className='cs-editor-workbench';root.id='cs-editor-workbench';
 const title=document.createElement('h2');title.textContent='Helyi szerkesztői műhely';
 const intro=document.createElement('p');intro.textContent='Egy helyen kezelheted az oldalakat, a képeket és a dokumentumokat. A változtatások csak ebben a böngészőben élnek; az ellenőrzött teljes ZIP-et kézzel lehet közzétenni.';
 const button=document.createElement('button');button.type='button';button.className='cs-editor-button is-primary';button.textContent='Szerkesztői műhely megnyitása';
 const status=document.createElement('p');status.className='cs-editor-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 button.addEventListener('click',async()=>{
  button.disabled=true;status.textContent='A szerkesztő betöltése…';
  try{const {openMaintenanceStudio}=await import('../tools/maintenance-studio.js?v=1.45');await openMaintenanceStudio();status.textContent='A szerkesztő megnyílt. Az adatok nem kerülnek automatikusan a tárhelyre.';}
  catch(error){status.textContent='A szerkesztő nem indult: '+error.message;console.error(error);}
  finally{button.disabled=false;}
 });
 root.append(title,intro,button,status);return root;
}
