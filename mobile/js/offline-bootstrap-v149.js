/** Az offline oldalon sincs beégetett tartalom: saját JSON-adatot renderel. */
import {appendJsonStyles,installJsonDocument} from './json-dom-v149.js';
import {requireValidJsonShell} from './json-validator-v149.js';

async function start(){
 try{
  const response=await fetch('json/offline-shell.json?v=1.51',{cache:'no-store'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const shell=await response.json();
  requireValidJsonShell(shell,{kind:'offline'});
  appendJsonStyles(shell.assets?.stylesheets||[]);
  installJsonDocument(shell);
 }catch(error){
  console.warn('Az offline oldal JSON-ja sem érhető el:',error);
  // Teljesen kiürült gyorsítótárban már JSON sem olvasható: az egyetlen
  // elkerülhetetlen vészhelyzeti tájékoztatás programból jön létre.
  const main=document.createElement('main');
  const title=document.createElement('h1');title.textContent='Nincs hálózati kapcsolat';
  const hint=document.createElement('p');hint.textContent='Az offline tartalom nem érhető el ezen a készüléken.';
  main.append(title,hint);document.body.replaceChildren(main);
 }
}

void start();
