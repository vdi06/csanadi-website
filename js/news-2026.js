/* Hivatalos forrásokhoz kapcsolt, kereshető és szűrhető hírfelület. */
const SOURCE=new URL('../json/adatok/hirek-hivatalos.json',import.meta.url);
const el=(tag,klass='',text)=>{const n=document.createElement(tag);if(klass)n.className=klass;if(text!==undefined)n.textContent=String(text);return n;};
const add=(n,...children)=>{n.append(...children);return n;};
async function load(){const r=await fetch(SOURCE,{cache:'no-cache'});if(!r.ok)throw Error('A hírgyűjtemény nem érhető el.');const x=await r.json();if(x.schemaVersion!=='1.0.0'||x.collectionId!=='collection:hirek-hivatalos'||!Array.isArray(x.items))throw Error('A hírek szerkezete hibás.');return x.items.filter(v=>v.status==='verified'&&/^https:\/\/csanadi-bp\.edu\.hu\/[a-z0-9\/.-]+$/.test(v.source)&&v.title&&v.summary);}
function newsCard(item){
 const card=el('article','cs-news-card');const top=el('div','cs-news-meta');add(top,el('span','cs-news-cat',item.category),el('span','',item.date?`${item.date} · ${item.dateType}`:'Iskolatörténet'));
 const title=el('h3','',item.title),description=el('p','',item.summary),details=el('details','cs-news-detail');add(details,el('summary','','Részletek'),el('p','',item.detail));
 const link=el('a','cs-news-source','Eredeti iskolai közlemény ↗');link.href=item.source;link.target='_blank';link.rel='noopener noreferrer';
 const route=el('a','cs-news-route','Kapcsolódó oldal →');route.href=item.route;return add(card,top,title,description,details,add(el('div','cs-news-links'),link,route));
}
export function renderNewsTeasers(){
 const section=el('section','cs-news-teasers section-wrap'),container=el('div','container-xxl');
 add(container,el('span','section-overline','ISKOLAI AKTUALITÁSOK'),el('h2','section-title','Hírek és fontos időpontok'));
 const grid=el('div','cs-news-grid');container.append(grid);section.append(container);
 load().then(items=>{if(!section.isConnected)return;items.filter(x=>x.category!=='Archívum').slice(0,3).forEach(x=>grid.append(newsCard(x)));}).catch(()=>grid.append(el('p','','A hírek átmenetileg nem érhetők el.')));
 return section;
}
export function renderNewsCenter(route){
 const section=el('section','cs-news-center'),intro=el('p','cs-news-intro','A hírek forrásai az iskola hivatalos közleményei. Kategóriák szerint böngészhetők és szövegesen kereshetők.');
 const toolbar=el('div','cs-news-toolbar'),input=el('input','form-control'),select=el('select','form-select');input.type='search';input.placeholder='Keresés címben és szövegben…';input.setAttribute('aria-label','Hírek keresése');
 add(toolbar,input,select);const count=el('p','cs-news-count'),grid=el('div','cs-news-grid');add(section,intro,toolbar,count,grid);
 load().then(items=>{
  if(!section.isConnected)return;
  const available=route.endsWith('/sporthirek')?items.filter(x=>/sport/i.test(x.category)):route.endsWith('/hirarchivum')?items.filter(x=>x.category==='Archívum'||(x.date&&x.date<'2026-11-01')):route.endsWith('/iskolai-hirek')?items.filter(x=>x.category!=='Archívum'):route.endsWith('/kozlemenyek')?items.filter(x=>x.category==='Közlemény'||x.category==='Felvételi'):items;
  for(const value of ['',...new Set(available.map(x=>x.category))]){const opt=el('option','',value||'Összes kategória');opt.value=value;select.append(opt);}
  const render=()=>{grid.replaceChildren();const q=input.value.toLocaleLowerCase('hu-HU');const found=available.filter(x=>(!select.value||x.category===select.value)&&(x.title+' '+x.summary+' '+x.detail).toLocaleLowerCase('hu-HU').includes(q));count.textContent=found.length+' ellenőrzött bejegyzés';found.forEach(x=>grid.append(newsCard(x)));if(!found.length)grid.append(el('p','','Nincs találat az aktuális szűrésben.'));};
  input.addEventListener('input',render);select.addEventListener('change',render);render();
 }).catch(err=>grid.append(el('p','',err.message)));
 return section;
}
