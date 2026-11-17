 
const target=document.getElementById('app');
function startupError(error){
  console.error('A Csanádi SPA nem indul:',error);
  const shell=document.createElement('section');shell.className='container-xxl py-5';
  const h=document.createElement('h1');h.textContent='Nem sikerült betölteni a weboldalt';
  const p=document.createElement('p');p.textContent='Egy szükséges JavaScript- vagy JSON-fájl nem érhető el, vagy a weboldal hibát talált.';
  const detail=document.createElement('pre');detail.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-width:100%;padding:1rem;border:1px solid #d4d4d4;border-radius:8px';
  detail.textContent=String(error?.message||error);
  const hint=document.createElement('p');hint.textContent=location.protocol==='file:'?'Az oldal JSON-adatokkal működik, ezért HTTPS/HTTP-kiszolgáló szükséges. Indítsd HTTP/HTTPS kiszolgálón.':'Az index.html, script.js, js/, json/ és assets/ mappáknak a webkiszolgáló megfelelő gyökérkönyvtárában kell lenniük.';
  shell.append(h,p,detail,hint);target.replaceChildren(shell);
}
Promise.all([
  import('./js/app.js?v=1.39.10'),
  import('./js/subpages-v1.js?v=1.39.1'),
  import('./js/release-v1-39-0.js?v=1.39.10'),
  import('./js/release-v1-39-1.js?v=1.39.10')
]).then(([{startApp},{initSubpageEnhancements},{initReleaseEnhancements},{initV1391Enhancements}])=>{
  initSubpageEnhancements();
  initReleaseEnhancements();
  initV1391Enhancements();
  return startApp();
}).catch(startupError);
