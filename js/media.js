/* JSON-ban regisztrált, kizárólag lokális médiaútvonalakat használó képrendszer. */
let mediaMap = new Map();
const safePath = path => typeof path === 'string' && /^assets\/media\/[a-z0-9/_\-.]+$/i.test(path) && !path.includes('..');
export function registerMedia(registry) {
  mediaMap = new Map((registry?.items || [])
    .filter(item => item && /^media:[a-z0-9.-]+$/.test(item.id || '') && safePath(item.original?.path))
    .map(item => [item.id, item]));
}
export function mediaItem(id) { return mediaMap.get(id) || null; }
export function mediaForRoute(route='') {
  if (route.startsWith('#/oktatas/felveteli')) return 'media:felveteli';
  if (route.startsWith('#/sport/sporteredmenyek') || route.includes('buszkese')) return 'media:eredmenyek';
  if (route.startsWith('#/iskolank/kozosseg')) return 'media:kozosseg';
  if (route.startsWith('#/iskolank')) return 'media:iskolank';
  if (route.startsWith('#/oktatas')) return 'media:oktatas';
  if (route.startsWith('#/sport')) return 'media:sport';
  if (route.startsWith('#/hirek-es-esemenyek')) return 'media:esemenyek';
  if (route.startsWith('#/informaciok')) return 'media:kozosseg';
  if (route.startsWith('#/kapcsolat')) return 'media:kapcsolat';
  return 'media:hero';
}
export function createPicture(id,{className='',eager=false,sizes='100vw',decorative=false}={}) {
  const entry = mediaItem(id);
  if (!entry) return null;
  const picture=document.createElement('picture');
  if (className) picture.className=className;
  const variants=(entry.variants||[]).filter(v=>v.mimeType==='image/webp' && safePath(v.path)).sort((a,b)=>a.width-b.width);
  if(variants.length){
    const source=document.createElement('source');source.type='image/webp';
    source.sizes=sizes;
    source.srcset=variants.map(v=>`${v.path} ${v.width}w`).join(', ');
    picture.append(source);
  }
  const img=document.createElement('img');
  img.src=entry.original.path;
  img.alt=decorative?'':(entry.alt||'Illusztráció');
  img.loading=eager?'eager':'lazy';img.decoding='async';
  if(eager)img.setAttribute('fetchpriority','high');
  if(entry.original.width)img.width=entry.original.width;
  if(entry.original.height)img.height=entry.original.height;
  picture.append(img);
  return picture;
}
export function imageDisclaimer(){const b=document.createElement('span');b.className='media-illustration-tag';b.textContent='MI-GENERÁLT ILLUSZTRÁCIÓ';return b;}
