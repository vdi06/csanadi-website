/* AH: mért hibák priorizálása. Mérési javulás ≠ valós WCAG-megfelelőség. */
import {compareMobileQaReports} from './qa-diff-core-v1-40-7.mjs';
const labels={
 'BELSŐ_SZÉLESSÉG':'Nem egyezik a mérési szélesség; ellenőrizd a viewportot',
 'VÍZSZINTES_TÚLCSORDULÁS':'Azonosítsd a kilógó elemet és javítsd a reszponzív elrendezést',
 'CÉLFELÜLETMÉRÉS_HIÁNYZIK':'Pótold az interaktív célterületek mérését',
 'FEJLÉCMÉRÉS_HIÁNYZIK':'Pótold a fejlécátfedés mérését',
 'ARIA_HIÁNYOSSÁG':'Ellenőrizd az ARIA-neveket, szerepeket és célpontokat'
};
const priority=issue=>issue.startsWith('VÍZSZINTES_')||issue.startsWith('ARIA_')||issue.startsWith('FEJLÉCÁTFEDÉS')?'magas':'közepes';
export function planQaRemediation(before,after=null){
 const rows=Array.isArray(before?.results)?before.results:[];
 const unique=new Set(),open=[];
 for(const row of rows){
  const scope=`${row?.route||'ismeretlen'}|${row?.width||'?'}`;
  const add=(code)=>{const key=scope+'|'+code;if(unique.has(key))return;unique.add(key);open.push({scope,code,priority:priority(code),task:labels[code]||code.replaceAll('_',' '),status:'nyitott',verifiedFixed:false});};
  if(row?.actual!==row?.width)add('BELSŐ_SZÉLESSÉG');
  if(!Number.isFinite(row?.overflow)||row.overflow>1)add('VÍZSZINTES_TÚLCSORDULÁS');
  if(row?.aria!==true)add('ARIA_HIÁNYOSSÁG');
  if(!Array.isArray(row?.tinyTargets))add('CÉLFELÜLETMÉRÉS_HIÁNYZIK');
  else for(const value of row.tinyTargets)add('KIS_CÉLFELÜLET:'+value);
  if(!Array.isArray(row?.headerOverlaps))add('FEJLÉCMÉRÉS_HIÁNYZIK');
  else for(const value of row.headerOverlaps)add('FEJLÉCÁTFEDÉS:'+value);
  for(const issue of row?.a11yIssues||[])add('SZEMANTIKA:'+issue);
 }
 const comparison=after?compareMobileQaReports(before,after):null;
 const improvement=comparison?.resolved||[];
 for(const x of open)if(improvement.some(r=>r.scope===x.scope&&r.issue===x.code))x.measurementImproved=true;
 return {release:'1.40.10',source:before?.release||'ismeretlen',measurementCount:rows.length,
  issues:open.sort((a,b)=>Number(b.priority==='magas')-Number(a.priority==='magas')||a.scope.localeCompare(b.scope)),
  comparison,physicalDeviceEvidenceProvided:before?.manualScreenReaderCertified===true,
  requiresIndependentHumanReview:true,wcagConformanceCertified:false,
  note:'A javítás csak akkor zárható le, ha a valós eszközteszt és a kézi felülvizsgálat bizonyított.'};
}
