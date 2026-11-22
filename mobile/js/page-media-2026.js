import {sharedAssetPath,sharedSrcset} from './shared-paths-v152.js?v=1.53';
const INDEX=new URL('../../shared/json/data/page-media-2026.json',import.meta.url);
const els=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
let indexPromise;
async function index(){if(!indexPromise)indexPromise=fetch(INDEX,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Médiaindex nem elérhető');return r.json();});return indexPromise;}
export function renderPageMedia(route){
 const box=els('section','media2026-related');box.setAttribute('aria-label','Kapcsolódó képes tartalmak');
 const head=els('div','media2026-head');const icon=els('img','media2026-symbol');icon.alt='';icon.loading='lazy';
 const text=els('div');text.append(els('span','media2026-eyebrow','TÉMÁHOZ ILLESZKEDŐ MÉDIA'),els('h2','','A témához kapcsolódó képek és segédletek'));
 head.append(icon,text);box.append(head);
 const grid=els('div','media2026-grid');box.append(grid);
 const notice=els('p','media2026-note','A képek tematikus szemléltetőanyagok, nem konkrét intézményi eseményfelvételek.');box.append(notice);
 index().then(data=>{
  if(!box.isConnected)return;
  const config=data.items?.[route];if(!config){box.hidden=true;return;}
  icon.src=sharedAssetPath(config.icon);
  for(const item of config.images){
   const card=els('a','media2026-card');card.href=item.photoId?'?galleryPhoto='+encodeURIComponent(item.photoId)+'#/sport/sportgaleriak':'#/sport/sportgaleriak';card.title='A kiválasztott kép megnyitása a galériában';
   const image=els('img');image.src=sharedAssetPath(item.thumb||item.src);image.alt=item.alt;image.loading='lazy';image.decoding='async';
   if(item.srcset){image.srcset=sharedSrcset(item.srcset);image.sizes='(max-width:600px) 45vw, 330px';}
   card.append(image,els('strong','',item.title));grid.append(card);
  }
  if(config.topic==='oktatas'||config.topic==='sport'){
   const link=els('a','media2026-extra',config.topic==='oktatas'?'Segédletek és dokumentumok ↗':'Sportági képgalériák ↗');
   link.href=config.topic==='oktatas'?'#/informaciok/dokumentumtar':'#/sport/sportgaleriak';grid.append(link);
  }
 }).catch(()=>{box.hidden=true;});
 return box;
}
