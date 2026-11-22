


import {openImageViewer} from './site-viewers-v1-43-3.js?v=1.53';
import {sharedAssetPath,sharedSrcset} from './shared-paths-v152.js?v=1.53';
const PHOTO_URL = new URL('../json/data/photo-gallery.json', import.meta.url);
const VIDEO_URL = new URL('../json/data/gallery-videos.json', import.meta.url);
const albums = [['mind','Összes album','✦'],['sport','Sportpillanatok','🏅'],['oktatas','Tanulás és tudás','✎'],['kozosseg','Közösségi élet','♡']];
const disciplines=[['mind','Minden sportág'],['kosarlabda','Kosárlabda'],['atletika','Atlétika'],['labdarugas','Labdarúgás'],['uszas','Úszás'],['roplabda','Röplabda'],['asztalitenisz','Asztalitenisz'],['egyeb','További sportágak']];
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const add=(parent,...children)=>{children.filter(Boolean).forEach(c=>parent.append(c));return parent;};
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const validPhoto=x=>x&&typeof x.title==='string'&&typeof x.alt==='string'&&['sport','oktatas','kozosseg'].includes(x.category)&&x.verifiedSchoolPhoto===false&&(/^(?:assets\/media\/web\/[a-z0-9-]+\.webp|assets\/graphics\/ikon-[a-z0-9-]+\.svg)$/.test(x.src));
const validVideo=x=>x&&typeof x.title==='string'&&typeof x.description==='string'&&['sport','oktatas','kozosseg'].includes(x.category)&&x.type==='illustrative-montage'&&/^assets\/media\/video\/[a-z0-9-]+\.mp4$/.test(x.src)&&/^assets\/media\/web\/[a-z0-9-]+\.webp$/.test(x.poster);
async function getJSON(url){const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);return res.json();}
function galleryButton(label,cls,handler){const b=el('button',cls,label);b.type='button';b.addEventListener('click',handler);return b;}
export function renderMediaGallery({compact=false}={}){
 const section=el('section','media26-section section-wrap');section.id=compact?'media26-home':'media26-library';
 const inner=el('div','container-xxl media26-container');
 const header=el('header','media26-heading');add(header,el('span','media26-eyebrow','MULTIMÉDIÁS GALÉRIA'),el('h2','media26-title',compact?'Sport és iskolai élet – képekben':'Sport, tudás, közösség – galériaközpont'),el('p','media26-lead','Tematikus képalbumok, nagyítható képek és rövid, helyben lejátszható képmontázsok.'));
 inner.append(header);
 const albumsBar=el('div','media26-albums');albumsBar.setAttribute('role','group');albumsBar.setAttribute('aria-label','Galéria témakörének kiválasztása');
 const sportBar=el('div','media26-sport-filters d-flex flex-wrap gap-2');sportBar.setAttribute('role','group');sportBar.setAttribute('aria-label','Sportágak szerinti szűrés');
 const videoPlaylists=el('div','r10-video-playlists');videoPlaylists.setAttribute('role','group');videoPlaylists.setAttribute('aria-label','Tematikus videólejátszási listák');
 const toolbar=el('div','media26-toolbar');
 const tabs=el('div','media26-tabs btn-group');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Médiatípus kiválasztása');
 const searchWrap=el('label','media26-search-label');add(searchWrap,el('span','visually-hidden','Keresés a galériában'));
 const search=el('input','media26-search form-control');search.type='search';search.placeholder='Keresés képek és videók között…';search.autocomplete='off';search.setAttribute('aria-label','Keresés a galériában');searchWrap.append(search);
 const info=el('p','media26-counter','Galéria betöltése…');info.setAttribute('role','status');info.setAttribute('aria-live','polite');
 const grid=el('div','media26-grid'),videoGrid=el('div','media26-video-grid');
 const loadMore=galleryButton('További képek megjelenítése','media26-more btn btn-outline-primary',()=>{limit+=settingNumber('runtime.display.mediaBatch');draw();});
 const visual=el('div','media26-content');add(visual,grid,videoGrid,loadMore);
 const foot=document.createDocumentFragment();
 const direct=compact?el('a','media26-full-link','A teljes galériaközpont megnyitása ↗'):null;if(direct)direct.href='#/sport/sportgaleriak';
 add(toolbar,tabs,searchWrap);const sorting=el('select','media26-sort form-select');sorting.setAttribute('aria-label','Képek rendezése');[['original','Alapértelmezett sorrend'],['az','Cím szerint A–Z'],['za','Cím szerint Z–A']].forEach(([value,text])=>{const option=el('option','',text);option.value=value;sorting.append(option);});toolbar.append(sorting);add(inner,albumsBar,sportBar,videoPlaylists,toolbar,info,visual,foot,direct);section.append(inner);
 const deep=compact?new URLSearchParams():new URLSearchParams(location.search);
 const requestedPhoto=deep.get('galleryPhoto')||'';const requestedVideo=deep.get('galleryVideo')||'';
 let openedDeep=false;
 let photos=[],videos=[],album=['mind','sport','oktatas','kozosseg'].includes(deep.get('galleryAlbum'))?deep.get('galleryAlbum'):'mind',discipline=disciplines.some(x=>x[0]===deep.get('galleryDiscipline'))?deep.get('galleryDiscipline'):'mind',type=deep.get('galleryType')==='video'?'video':'photo',limit=compact?settingNumber('runtime.display.mediaCompactInitial'):settingNumber('runtime.display.mediaFullInitial'),activeImages=[],at=0,oldFocus=null,lightboxOpen=false;
 function shareUrl(photo=null,video=null){const u=new URL(location.href);u.hash='/sport/sportgaleriak';for(const k of ['galleryPhoto','galleryAlbum','galleryDiscipline','galleryType','galleryVideo'])u.searchParams.delete(k);u.searchParams.set('galleryAlbum',album);if(discipline!=='mind')u.searchParams.set('galleryDiscipline',discipline);if(type==='video')u.searchParams.set('galleryType','video');if(photo)u.searchParams.set('galleryPhoto',photo.id);if(video)u.searchParams.set('galleryVideo',video.id);return u;}
 function syncLink(photo=null){if(compact||!['http:','https:'].includes(location.protocol))return;history.replaceState(history.state,'',shareUrl(photo));}
 const linkActions=el('div','media26-share-actions');const shareButton=galleryButton('Galériahivatkozás másolása','media26-share btn btn-outline-secondary',async()=>{const url=shareUrl(activeImages[at]&&lightboxOpen?activeImages[at]:null).href;try{await navigator.clipboard.writeText(url);shareButton.textContent='Hivatkozás másolva';}catch{shareButton.textContent='A címsorból másold a hivatkozást';}});const directShare=el('a','media26-direct-link','Albumhivatkozás megnyitása ↗');directShare.href=shareUrl().href;directShare.rel='noopener';linkActions.append(shareButton,directShare);inner.append(linkActions);
 function openImage(filtered,index,source){
  // Kizárólag az aktuális album/sportág/keresés szűrt képei kerülnek a Carousel-be.
  activeImages=filtered;at=index;oldFocus=source;lightboxOpen=true;
  const topic=album==='sport'&&discipline!=='mind'?disciplines.find(x=>x[0]===discipline)?.[1]:albums.find(x=>x[0]===album)?.[1];
  const opened=openImageViewer(filtered,index,{title:topic||'Tematikus képgaléria',
   onChange:(item,i)=>{at=i;syncLink(item);directShare.href=shareUrl(item).href;},
   onClose:()=>{lightboxOpen=false;if(!compact)syncLink();directShare.href=shareUrl().href;if(oldFocus?.isConnected&&oldFocus.getClientRects?.().length)oldFocus.focus({preventScroll:true});}});
  if(!opened)lightboxOpen=false;
 }
 function matching(rows){const q=normal(search.value.trim());const found=rows.filter(item=>(album==='mind'||item.category===album)&&(discipline==='mind'||album!=='sport'||type==='video'||item.sportDiscipline===discipline)&&(!q||normal([item.title,item.alt||'',item.description||'',item.sportDiscipline||''].join(' ')).includes(q)));if(sorting.value==='az')found.sort((a,b)=>a.title.localeCompare(b.title,'hu'));if(sorting.value==='za')found.sort((a,b)=>b.title.localeCompare(a.title,'hu'));return found;}
 function draw(){
  albumsBar.replaceChildren();for(const [id,label,mark] of albums){const b=galleryButton('','media26-album'+(album===id?' is-active':''),()=>{album=id;discipline='mind';limit=compact?settingNumber('runtime.display.mediaCompactInitial'):settingNumber('runtime.display.mediaFullInitial');draw();});
   b.setAttribute('aria-pressed',String(album===id));const cover=photos.find(x=>id==='mind'||x.category===id);if(cover){const preview=el('img','media26-album-image');preview.src=sharedAssetPath(cover.thumb||cover.src);preview.alt='';preview.loading='lazy';b.append(preview);}
   const source=type==='video'?videos:photos;
   add(b,el('span','media26-album-icon',mark),el('strong','media26-album-label',label),el('span','media26-album-count',`${id==='mind'?source.length:source.filter(x=>x.category===id).length} ${type==='video'?'videó':'kép'}`));albumsBar.append(b);}
  sportBar.replaceChildren();sportBar.hidden=album!=='sport';if(album==='sport'){for(const [id,label] of disciplines){const total=photos.filter(x=>x.category==='sport'&&(id==='mind'||x.sportDiscipline===id)).length;if(!total&&id!=='mind')continue;const b=galleryButton(label+' · '+total,'media26-discipline btn btn-outline-secondary'+(discipline===id?' is-active active':''),()=>{discipline=id;limit=compact?settingNumber('runtime.display.mediaCompactInitial'):settingNumber('runtime.display.mediaFullInitial');draw();});b.setAttribute('aria-pressed',String(discipline===id));sportBar.append(b);}}
  videoPlaylists.replaceChildren();videoPlaylists.hidden=type!=='video';
  if(type==='video'){
   videoPlaylists.append(el('span','r10-video-playlist-title','Videós tematikus listák'));
   for(const [id,label] of [['mind','Összes videó'],['sport','Sportos összeállítások'],['oktatas','Tanulás és tudás'],['kozosseg','Iskolai közösség']]){
    const amount=videos.filter(x=>id==='mind'||x.category===id).length;
    const entry=galleryButton(`${label} · ${amount}`,'r10-video-playlist'+(album===id?' is-active':''),()=>{album=id;discipline='mind';draw();});
    entry.setAttribute('aria-pressed',String(album===id));videoPlaylists.append(entry);
   }
  }
  tabs.replaceChildren();for(const [t,label] of [['photo','Képek'],['video','Videók · képmontázsok']]){const b=galleryButton(label,'media26-tab btn btn-outline-secondary'+(type===t?' is-active active':''),()=>{type=t;draw();});b.setAttribute('aria-pressed',String(type===t));tabs.append(b);}
  const filtered=matching(photos),matchedVideos=matching(videos);
  grid.hidden=type!=='photo';videoGrid.hidden=type!=='video';grid.replaceChildren();videoGrid.replaceChildren();
  if(type==='photo'){
    filtered.slice(0,limit).forEach((item,index)=>{const tile=galleryButton('','media26-tile',()=>openImage(filtered,index,tile));tile.setAttribute('aria-label',item.title+' – kép megnyitása');
      const photo=el('img');photo.src=sharedAssetPath(item.thumb||item.src);if(item.srcset&&typeof item.srcset==='string'){photo.srcset=sharedSrcset(item.srcset);photo.sizes='(max-width: 600px) 45vw, (max-width: 1024px) 30vw, 24vw';}photo.alt=item.alt;photo.loading=index<3?'eager':'lazy';photo.decoding='async';
      photo.addEventListener('error',()=>{if(!photo.dataset.fullSourceTried){photo.dataset.fullSourceTried='true';photo.removeAttribute('srcset');photo.src=sharedAssetPath(item.src);}else{photo.alt=item.title+' – kép átmenetileg nem érhető el';photo.classList.add('media26-load-error');}});
      add(tile,photo,el('span','media26-tile-overlay'),el('span','media26-tile-label',item.title),el('span','media26-tile-zoom','＋'));grid.append(tile);});
    loadMore.hidden=filtered.length<=limit;info.textContent=`${filtered.length} kép található · ${Math.min(limit,filtered.length)} megjelenítve`;
    if(!filtered.length)grid.append(el('p','media26-empty','Nincs találat. Válassz másik albumot vagy keresőkifejezést.'));if(!compact&&!lightboxOpen)syncLink();directShare.href=shareUrl().href;
  }else{
    loadMore.hidden=true;info.textContent=`${matchedVideos.length} képmontázs található`;
    matchedVideos.forEach((item,position)=>{const card=el('article','media26-video-card'),media=el('video','media26-video');card.dataset.videoId=item.id;card.tabIndex=-1;media.controls=true;media.preload='none';media.playsInline=true;media.poster=sharedAssetPath(item.poster);media.setAttribute('aria-label',item.title+' – képmontázs');
      const source=el('source');source.src=sharedAssetPath(item.src);source.type='video/mp4';media.append(source);
      const time=el('span','media26-video-duration','Lejátszható helyi videó');media.addEventListener('loadedmetadata',()=>{if(Number.isFinite(media.duration)&&media.duration>0){const m=Math.floor(media.duration/60),secs=Math.floor(media.duration%60);time.textContent=`Időtartam: ${m}:${String(secs).padStart(2,'0')}`;}});const actions=el('div','media26-video-actions');const link=el('a','media26-video-link','Videó megnyitása ↗');link.href=sharedAssetPath(item.src);link.target='_blank';link.rel='noopener';actions.append(link);const deepLink=el('a','media26-video-link','Megosztás ↗');deepLink.href=shareUrl(null,item).href;actions.append(deepLink);if(matchedVideos.length>1){const nextAction=galleryButton('Következő összeállítás','media26-next-video',()=>{media.pause();const nextCard=videoGrid.children[(position+1)%matchedVideos.length];nextCard?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});nextCard?.focus({preventScroll:true});});actions.append(nextAction);}add(card,media,el('span','media26-video-badge','KÉPMONTÁZS'),el('h3','',item.title),el('p','',item.description),time,actions);videoGrid.append(card);});if(!compact)syncLink();
    if(!matchedVideos.length)videoGrid.append(el('p','media26-empty','Ehhez a témához egyelőre nincs képmontázs.'));
  }
 }
 search.addEventListener('input',()=>{limit=compact?settingNumber('runtime.display.mediaCompactInitial'):settingNumber('runtime.display.mediaFullInitial');draw();});sorting.addEventListener('change',draw);
 draw();
 Promise.all([getJSON(PHOTO_URL),getJSON(VIDEO_URL)]).then(([p,v])=>{
  if(p?.schemaVersion!=='1.0.0'||!Array.isArray(p.items)||v?.schemaVersion!=='1.0.0'||!Array.isArray(v.items))throw Error('A galéria adatformátuma hibás.');
  photos=p.items.filter(validPhoto);videos=v.items.filter(validVideo).slice(0,settingNumber('runtime.display.mediaVideoMax'));if(requestedVideo){const selected=videos.find(x=>x.id===requestedVideo);if(selected){album=selected.category;type='video';}}
  if(requestedPhoto){const item=photos.find(x=>x.id===requestedPhoto);if(item){album=item.category;discipline=item.category==='sport'?(item.sportDiscipline||'mind'):'mind';type='photo';limit=Math.max(limit,photos.length);}}
  draw();
  if(requestedVideo&&!compact)requestAnimationFrame(()=>{const card=[...videoGrid.querySelectorAll('.media26-video-card')].find(x=>x.dataset.videoId===requestedVideo);if(card&&section.isConnected){card.scrollIntoView({block:'center',behavior:'instant'});card.focus({preventScroll:true});card.classList.add('media26-deep-focus');}});
  if(requestedPhoto&&!openedDeep&&!compact){const filtered=matching(photos),idx=filtered.findIndex(x=>x.id===requestedPhoto);if(idx>=0){openedDeep=true;requestAnimationFrame(()=>{if(section.isConnected){const tile=[...grid.querySelectorAll('.media26-tile')][idx];openImage(filtered,idx,tile||shareButton);}});}}
 }).catch(error=>{info.textContent='A galéria pillanatnyilag nem tölthető be: '+error.message;});
 return section;
}
import {settingNumber} from './site-settings-2026.js?v=1.53';
