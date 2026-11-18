/* U: eredeti, hitelesített képek végleges elhelyezésének ellenőrizhető terve.
 * Csak tervet állít elő; sem médiatárat, sem kezdőoldalt, sem FTP-t nem ír. */
const safeMediaId=value=>typeof value==='string'&&/^media:[a-z0-9.:-]+$/i.test(value);
export function planApprovedPhotoPlacement({media=[],heroSlides=[],placements=[]}={}){
 const problems=[],actions=[];const mediaMap=new Map(media.filter(x=>safeMediaId(x?.id)).map(x=>[x.id,x]));
 const slideIds=new Set(heroSlides.map(x=>x?.id).filter(Boolean)),used=new Set();
 for(const [idx,item] of placements.entries()){
  if(!item||typeof item!=='object'){problems.push(`${idx+1}. elhelyezés: hiányzó adat`);continue;}
  const entry=mediaMap.get(item.mediaId),label=`${idx+1}. elhelyezés`;
  if(!entry){problems.push(`${label}: hiányzik a médiatárban a ${item.mediaId} kép`);continue;}
  if(entry.kind!=='image'||!entry.original?.path||!/^[a-f0-9]{64}$/i.test(entry.original.sha256||'')){problems.push(`${label}: nincs ellenőrizhető eredeti kép és SHA-256`);continue;}
  if(entry.rights?.clearance!=='approved'||entry.staging?.independentInstitutionalVerification!==true||entry.staging?.publicDisplayAllowed!==true){problems.push(`${label}: nincs igazolt intézményi engedély és adatvédelmi feloldás`);continue;}
  if(typeof item.alt!=='string'||item.alt.trim().length<18){problems.push(`${label}: a képleírás legalább 18 karakter legyen`);continue;}
  if(item.destination==='hero'&&!slideIds.has(item.slideId)){problems.push(`${label}: ismeretlen kezdőlapi diakód`);continue;}
  if(!['hero','gallery'].includes(item.destination)){problems.push(`${label}: csak hero és gallery cél engedélyezett`);continue;}
  const place=item.destination==='hero'?`hero:${item.slideId}`:`gallery:${item.mediaId}`;
  if(used.has(place)){problems.push(`${label}: ismételt célhely`);continue;}used.add(place);
  actions.push({mediaId:item.mediaId,destination:item.destination,slideId:item.destination==='hero'?item.slideId:null,alt:item.alt.trim(),caption:String(item.caption||'').trim(),approvalRequiredBeforeMerge:true});
 }
 return {ready:placements.length>0&&!problems.length,problems,actions,publicationPerformed:false,mergedToWebsite:false,
  note:'A tervezet nem bizonyítja az engedélyt: az intézménynek a képet, a licencet, a személyiségi jogot és a képleírást külön jóvá kell hagynia.'};
}
