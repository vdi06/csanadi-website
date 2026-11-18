/* Helyi fotójegyzék összevetése a ténylegesen kiválasztott képek SHA-256 értékeivel. */
const hash=/^[a-f0-9]{64}$/i;
const required=['holder','permission','evidenceId','reviewer','decisionId','sourceDate','privacyBasis'];
export function verifyPhotoApproval(manifest,selectedImages){
 const problems=[];
 const rows=Array.isArray(manifest?.images)?manifest.images:[];
 if(!rows.length)problems.push('A jegyzékben nincs kép.');
 if(!selectedImages.length)problems.push('Nincs kiválasztott eredeti képfájl.');
 for(const field of required)if(typeof manifest?.approval?.[field]!=='string'||!manifest.approval[field].trim())problems.push(`Hiányzó jóváhagyási mező: ${field}.`);
 const byHash=new Map(selectedImages.map(item=>[item.sha256,item]));
 const seen=new Set();
 for(const row of rows){
  if(!hash.test(String(row?.sha256||''))){problems.push(`Hibás képhash: ${row?.name||'ismeretlen'}.`);continue;}
  const key=row.sha256.toLowerCase();if(seen.has(key))problems.push(`Duplikált jegyzéksor: ${row.name||key}.`);seen.add(key);
  const found=byHash.get(key);
  if(!found){problems.push(`Hiányzó vagy eltérő eredeti kép: ${row.name||key}.`);continue;}
  if(row.name!==found.name||row.sizeBytes!==found.sizeBytes||row.width!==found.width||row.height!==found.height||row.mimeType!==found.mimeType)
   problems.push(`Eltérő képfájl-metaadat: ${row.name||key}.`);
 }
 for(const image of selectedImages)if(!seen.has(image.sha256))problems.push(`A jegyzékben nem szereplő kép: ${image.name}.`);
 return {matched:rows.length&&problems.length===0,rows:rows.length,files:selectedImages.length,problems,
  disclaimer:'Az egyező fájlok és a kitöltött nyilatkozat technikai ellenőrzése nem igazolja a tényleges intézményi engedély meglétét.'};
}
