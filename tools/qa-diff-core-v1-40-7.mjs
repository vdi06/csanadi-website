/* v1.40.7 R: két valós, helyben importált mobil-QA jegyzőkönyv differenciája.
   Hiányzó mérésből soha nem következtet arra, hogy egy hiba megszűnt. */
const keyOf=result=>`${result?.route||'ismeretlen'}|${result?.width||'?'}`;
const signatures=result=>{
 const items=[];
 if(result.actual!==result.width)items.push('BELSŐ_SZÉLESSÉG');
 if(!Number.isFinite(result.overflow)||result.overflow>1)items.push('VÍZSZINTES_TÚLCSORDULÁS');
 if(!Array.isArray(result.tinyTargets))items.push('CÉLFELÜLETMÉRÉS_HIÁNYZIK');
 else for(const item of result.tinyTargets)items.push('KIS_CÉLFELÜLET:'+String(item));
 if(!Array.isArray(result.headerOverlaps))items.push('FEJLÉCMÉRÉS_HIÁNYZIK');
 else for(const item of result.headerOverlaps)items.push('FEJLÉCÁTFEDÉS:'+String(item));
 if(result.aria!==true)items.push('ARIA_HIÁNYOSSÁG');
 return new Set(items);
};
export function compareMobileQaReports(before,after){
 const previous=Array.isArray(before?.results)?before.results:[],current=Array.isArray(after?.results)?after.results:[];
 const oldMap=new Map(previous.map(entry=>[keyOf(entry),entry])),newMap=new Map(current.map(entry=>[keyOf(entry),entry]));
 const coverageGaps=[],resolved=[],introduced=[],persistent=[];
 for(const routeWidth of new Set([...oldMap.keys(),...newMap.keys()])){
  if(!oldMap.has(routeWidth)||!newMap.has(routeWidth)){
   coverageGaps.push({scope:routeWidth,missing:oldMap.has(routeWidth)?'új mérés':'kiinduló mérés'});continue;
  }
  const oldIssues=signatures(oldMap.get(routeWidth)),newIssues=signatures(newMap.get(routeWidth));
  for(const issue of oldIssues){const item={scope:routeWidth,issue};(newIssues.has(issue)?persistent:resolved).push(item);}
  for(const issue of newIssues)if(!oldIssues.has(issue))introduced.push({scope:routeWidth,issue});
 }
 return {from:String(before?.release||'ismeretlen'),to:String(after?.release||'ismeretlen'),
  compared:oldMap.size&&newMap.size?Math.min(oldMap.size,newMap.size):0,
  resolved,introduced,persistent,coverageGaps,
  manualCertificationMissing:before?.manualScreenReaderCertified!==true||after?.manualScreenReaderCertified!==true,
  comparisonComplete:oldMap.size>0&&newMap.size>0&&!coverageGaps.length,
  note:'A riport összevetése nem igazolja a valódi eszközön történő kézi javítást; csak a mérési állapotok változását jelzi.'};
}
