/* Csanádi 2026 / H – külön multimédiás galériaközpont.
 * A képek és rövid videók helyi, illusztratív médiák. Külső beágyazás nincs.
 * A JSON-szöveg kizárólag textContent formában kerül a DOM-ba.
 */
const PHOTO_URL = new URL('../json/adatok/kepgaleria.json', import.meta.url);
const VIDEO_URL = new URL('../json/adatok/galeriavideok.json', import.meta.url);
const albums = [
  ['mind','Összes album','✦'],
  ['sport','Sportpillanatok','🏅'],
  ['oktatas','Tanulás és tudás','✎'],
  ['kozosseg','Közösségi élet','♡']
];
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
const add=(parent,...children)=>{children.filter(Boolean).forEach(c=>parent.append(c));return parent;};
const normal=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const validPhoto=x=>x&&typeof x.title==='string'&&typeof x.alt==='string'&&['sport','oktatas','kozosseg'].includes(x.category)&&x.verifiedSchoolPhoto===false&&/^assets\/media\/web\/[a-z0-9-]+\.webp$/.test(x.src);
const validVideo=x=>x&&typeof x.title==='string'&&typeof x.description==='string'&&['sport','oktatas','kozosseg'].includes(x.category)&&x.type==='illustrative-montage'&&/^assets\/media\/video\/[a-z0-9-]+\.mp4$/.test(x.src)&&/^assets\/media\/web\/[a-z0-9-]+\.webp$/.test(x.poster);
async function getJSON(url){const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);return res.json();}
function galleryButton(label,cls,handler){const b=el('button',cls,label);b.type='button';b.addEventListener('click',handler);return b;}
export function renderMediaGallery({compact=false}={}){
 const section=el('section','media26-section section-wrap');section.id=compact?'media26-home':'media26-library';
 const inner=el('div','container-xxl media26-container');
 const header=el('header','media26-heading');add(header,el('span','media26-eyebrow','MULTIMÉDIÁS GALÉRIA'),el('h2','media26-title',compact?'Sport és iskolai élet – képekben':'Sport, tudás, közösség – galériaközpont'),el('p','media26-lead','Tematikus képalbumok, nagyítható képek és rövid, helyben lejátszható képmontázsok.'));
 inner.append(header);
 const albumsBar=el('div','media26-albums');albumsBar.setAttribute('role','group');albumsBar.setAttribute('aria-label','Galéria témakörének kiválasztása');
 const toolbar=el('div','media26-toolbar');
 const tabs=el('div','media26-tabs');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Médiatípus kiválasztása');
 const searchWrap=el('label','media26-search-label');add(searchWrap,el('span','visually-hidden','Keresés a galériában'));
 const search=el('input','media26-search');search.type='search';search.placeholder='Keresés képek és videók között…';search.autocomplete='off';search.setAttribute('aria-label','Keresés a galériában');searchWrap.append(search);
 const info=el('p','media26-counter','Galéria betöltése…');info.setAttribute('role','status');info.setAttribute('aria-live','polite');
 const grid=el('div','media26-grid'),videoGrid=el('div','media26-video-grid');
 const loadMore=galleryButton('További képek megjelenítése','media26-more',()=>{limit+=12;draw();});
 const visual=el('div','media26-content');add(visual,grid,videoGrid,loadMore);
 const foot=el('p','media26-disclaimer','Fontos: minden kép tematikus illusztráció, a videók ezekből készített képmontázsok. Nem valódi iskolai személyeket vagy eseményeket dokumentálnak.');
 const direct=compact?el('a','media26-full-link','A teljes galériaközpont megnyitása ↗'):null;if(direct)direct.href='#/sport/sportgaleriak';
 add(toolbar,tabs,searchWrap);add(inner,albumsBar,toolbar,info,visual,foot,direct);section.append(inner);
 const modal=el('dialog','media26-lightbox');modal.setAttribute('aria-label','Képnézegető');
 const modalFrame=el('div','media26-lightbox-frame');
 const close=galleryButton('×','media26-lightbox-close',()=>modal.close());close.setAttribute('aria-label','Kép bezárása');
 const previous=galleryButton('‹','media26-lightbox-prev',()=>move(-1));previous.setAttribute('aria-label','Előző kép');
 const next=galleryButton('›','media26-lightbox-next',()=>move(1));next.setAttribute('aria-label','Következő kép');
 const image=el('img','media26-lightbox-image');image.decoding='async';
 const count=el('span','media26-lightbox-count');const caption=el('p','media26-lightbox-caption');
 add(modalFrame,close,previous,image,next,count,caption);modal.append(modalFrame);section.append(modal);
 modal.addEventListener('click',evt=>{if(evt.target===modal)modal.close();});
 let photos=[],videos=[],album='mind',type='photo',limit=compact?9:18,activeImages=[],at=0,oldFocus=null;
 function showImage(){const p=activeImages[at];if(!p)return;image.src=p.src;image.alt=p.alt;count.textContent=`${at+1} / ${activeImages.length}`;caption.textContent=p.title+' · tematikus illusztráció';previous.disabled=activeImages.length<=1;next.disabled=activeImages.length<=1;}
 function openImage(filtered,index,source){activeImages=filtered;at=index;oldFocus=source;showImage();modal.showModal();close.focus();}
 function move(step){if(!activeImages.length)return;at=(at+step+activeImages.length)%activeImages.length;showImage();}
 modal.addEventListener('keydown',evt=>{if(evt.key==='ArrowRight'){evt.preventDefault();move(1);}else if(evt.key==='ArrowLeft'){evt.preventDefault();move(-1);}});
 let swipeStart=null;
 modal.addEventListener('touchstart',evt=>{swipeStart=evt.touches.length===1?evt.touches[0].clientX:null;},{passive:true});
 modal.addEventListener('touchend',evt=>{if(swipeStart===null||!evt.changedTouches.length)return;const diff=evt.changedTouches[0].clientX-swipeStart;if(Math.abs(diff)>45)move(diff<0?1:-1);swipeStart=null;},{passive:true});
 modal.addEventListener('close',()=>{image.removeAttribute('src');if(oldFocus?.isConnected)oldFocus.focus();});
 function matching(rows){const q=normal(search.value.trim());return rows.filter(item=>(album==='mind'||item.category===album)&&(!q||normal([item.title,item.alt||'',item.description||''].join(' ')).includes(q)));}
 function draw(){
  albumsBar.replaceChildren();for(const [id,label,mark] of albums){const b=galleryButton('','media26-album'+(album===id?' is-active':''),()=>{album=id;limit=compact?9:18;draw();});
   b.setAttribute('aria-pressed',String(album===id));add(b,el('span','media26-album-icon',mark),el('strong','media26-album-label',label),el('span','media26-album-count',`${id==='mind'?photos.length:photos.filter(x=>x.category===id).length} kép`));albumsBar.append(b);}
  tabs.replaceChildren();for(const [t,label] of [['photo','Képek'],['video','Videók · képmontázsok']]){const b=galleryButton(label,'media26-tab'+(type===t?' is-active':''),()=>{type=t;draw();});b.setAttribute('aria-pressed',String(type===t));tabs.append(b);}
  const filtered=matching(photos),matchedVideos=matching(videos);
  grid.hidden=type!=='photo';videoGrid.hidden=type!=='video';grid.replaceChildren();videoGrid.replaceChildren();
  if(type==='photo'){
    filtered.slice(0,limit).forEach((item,index)=>{const tile=galleryButton('','media26-tile',()=>openImage(filtered,index,tile));tile.setAttribute('aria-label',item.title+' – kép megnyitása');
      const photo=el('img');photo.src=item.src;photo.alt=item.alt;photo.loading=index<3?'eager':'lazy';photo.decoding='async';
      add(tile,photo,el('span','media26-tile-overlay'),el('span','media26-tile-label',item.title),el('span','media26-tile-zoom','＋'));grid.append(tile);});
    loadMore.hidden=filtered.length<=limit;info.textContent=`${filtered.length} kép található · ${Math.min(limit,filtered.length)} megjelenítve`;
    if(!filtered.length)grid.append(el('p','media26-empty','Nincs találat. Válassz másik albumot vagy keresőkifejezést.'));
  }else{
    loadMore.hidden=true;info.textContent=`${matchedVideos.length} képmontázs található`;
    matchedVideos.forEach(item=>{const card=el('article','media26-video-card'),media=el('video','media26-video');media.controls=true;media.preload='none';media.playsInline=true;media.poster=item.poster;media.setAttribute('aria-label',item.title+' – illusztrációs képmontázs');
      const source=el('source');source.src=item.src;source.type='video/mp4';media.append(source);
      add(card,media,el('span','media26-video-badge','KÉPMONTÁZS · ILLUSZTRÁCIÓ'),el('h3','',item.title),el('p','',item.description));videoGrid.append(card);});
    if(!matchedVideos.length)videoGrid.append(el('p','media26-empty','Ehhez a témához egyelőre nincs képmontázs.'));
  }
 }
 search.addEventListener('input',()=>{limit=compact?9:18;draw();});
 draw();
 Promise.all([getJSON(PHOTO_URL),getJSON(VIDEO_URL)]).then(([p,v])=>{
  if(p?.schemaVersion!=='1.0.0'||!Array.isArray(p.items)||v?.schemaVersion!=='1.0.0'||!Array.isArray(v.items))throw Error('A galéria adatformátuma hibás.');
  photos=p.items.filter(validPhoto).slice(0,100);videos=v.items.filter(validVideo).slice(0,15);draw();
 }).catch(error=>{info.textContent='A galéria pillanatnyilag nem tölthető be: '+error.message;});
 return section;
}
