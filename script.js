 
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
  import('./js/app.js?v=1.43.15'),
  import('./js/subpages-v1.js?v=1.43.15'),
  import('./js/release-v1-39-0.js?v=1.42.18'),
  import('./js/release-v1-39-1.js?v=1.43.15'),
  import('./js/header-adaptive-v1-39-18.js?v=1.42.18'),
  import('./js/home-v1-41.js?v=1.42.18'),
  import('./mobile/mobile-scroll-m4-v1-43-10.js?v=1.43.10'),
  import('./mobile/mobile-m9-quality-v1-43-14.js?v=1.43.15'),
  import('./mobile/mobile-m10-workflows-v1-43-15.js?v=1.43.15')
]).then(([{startApp},{initSubpageEnhancements},{initReleaseEnhancements},{initV1391Enhancements},{initAdaptiveHeaderV13918},{initV141HomepageMotion},{initMobileScrollM4},{initMobileQualityM9},{initMobileWorkflowsM10}])=>{
  initMobileScrollM4();
  initMobileQualityM9();
  initMobileWorkflowsM10();
  initSubpageEnhancements();
  initReleaseEnhancements();
  initV1391Enhancements();
  initAdaptiveHeaderV13918();
  return Promise.resolve(startApp()).then(()=>initV141HomepageMotion());
}).catch(startupError);
