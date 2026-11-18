/* Helyben importált mobil-QA jegyzőkönyvek következetes, csak olvasó vizsgálata. */
export function analyzeMobileQa(payload){
 const issues=[];
 const entries=Array.isArray(payload?.results)?payload.results:[];
 if(!entries.length)issues.push('A jegyzőkönyvben nincsenek mérési eredmények.');
 const widths=new Set(entries.map(item=>item?.width));
 for(const width of [320,390,768])if(!widths.has(width))issues.push(`Hiányzik a ${width} px-es mérés.`);
 for(const [index,item] of entries.entries()){
  const label=`${index+1}. mérés (${item?.width??'?'} px)`;
  if(![320,390,768].includes(item?.width))issues.push(`${label}: ismeretlen képernyőszélesség.`);
  if(item?.actual!==item?.width)issues.push(`${label}: a valódi belső szélesség eltér.`);
  if(!Number.isFinite(item?.overflow)||item.overflow>1||item.overflow<0)issues.push(`${label}: vízszintes túlcsordulás vagy érvénytelen mérés.`);
  if(!Array.isArray(item?.tinyTargets))issues.push(`${label}: a célfelületmérés hiányzik.`);
  else if(item.tinyTargets.length)issues.push(`${label}: ${item.tinyTargets.length} túl kicsi interaktív célfelület.`);
  if(item?.aria!==true)issues.push(`${label}: hiányos ARIA/útvonal jelölés.`);
  if(!Array.isArray(item?.headerOverlaps))issues.push(`${label}: a fejlécátfedés mérése hiányzik.`);
  else if(item.headerOverlaps.length)issues.push(`${label}: ${item.headerOverlaps.length} fejlécátfedés.`);
 }
 if(payload?.manualScreenReaderCertified!==true)issues.push('Valódi képernyőolvasós ellenőrzés nincs igazolva.');
 return {sourceRelease:String(payload?.release||'ismeretlen'),measurements:entries.length,passed:issues.length===0,issues};
}
