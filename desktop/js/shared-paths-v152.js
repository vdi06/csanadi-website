/** 1.53 – Közös, egyszer tárolt helyi képek és dokumentumok URL-je.
 * A JSON továbbra is a kanonikus `assets/…` relatív útvonalat tárolja.
 * A két külön alkalmazás `../shared/assets/…` címen éri el ugyanazt.
 */
const ASSET=/^assets\/(?:media|documents|graphics|qr|fonts|videos|files)\/[a-z0-9/_\-.]+(?:\?[a-z0-9_=&.\-]+)?$/i;
export function sharedAssetPath(value){
 if(typeof value!=='string'||!ASSET.test(value)||value.includes('..'))return value;
 return '../shared/'+value;
}
export function sharedAssetURL(value,base=document.baseURI){
 const path=sharedAssetPath(value);
 return typeof path==='string'?new URL(path,base).href:'';
}
export function sharedSrcset(value){
 return typeof value==='string'?value.split(',').map(candidate=>{
  const parts=candidate.trim().match(/^(\S+)(\s+\d+(?:\.\d+)?[wx])?$/);
  return parts?sharedAssetPath(parts[1])+(parts[2]||''):candidate.trim();
 }).join(', '):'';
}
