/* Csanádi 2026 – hibát is megjelenítő indítás, egyetlen teljes fájl. */
const target=document.getElementById('app');
function startupError(error){
  console.error('A Csanádi SPA nem indul:',error);
  const shell=document.createElement('section');shell.className='container-xxl py-5';
  const h=document.createElement('h1');h.textContent='Nem sikerült betölteni a weboldalt';
  const p=document.createElement('p');p.textContent='Egy szükséges JavaScript- vagy JSON-fájl nem érhető el, vagy a weboldal hibát talált.';
  const detail=document.createElement('pre');detail.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;padding:1rem;border:1px solid #d4d4d4;border-radius:8px';
  detail.textContent=String(error?.message||error);
  const hint=document.createElement('p');hint.textContent=location.protocol==='file:'?'Az oldal JSON-adatokkal működik, ezért HTTPS/HTTP-kiszolgáló szükséges. Használd a GitHub Pages-oldalt.':'Ha GitHubon teszteled: az index.html, script.js, js/, json/ és assets/ mappáknak a repository gyökerében kell lenniük.';
  shell.append(h,p,detail,hint);target.replaceChildren(shell);
}
import('./js/app.js?v=20261114a').then(({startApp})=>startApp()).catch(startupError);
