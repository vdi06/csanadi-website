/* AJ: mért p75 labor/terep adatok felülvizsgálata, adat nélküli sikerállítás nélkül. */
const bounds={LCP:2500,INP:200,CLS:0.1};
export function assessWebVitals(payload){
 const input=Array.isArray(payload?.routes)?payload.routes:[],issues=[],rows=[];
 if(!input.length)issues.push('Nincs importált útvonalankénti mérés');
 for(const entry of input){
  const problems=[];
  if(typeof entry?.route!=='string'||!/^#\/[a-z0-9/-]*$/.test(entry.route))problems.push('Érvénytelen útvonal');
  if(!['field','lab'].includes(entry?.source))problems.push('Hiányzó labor vagy terep mérésforrás');
  if(!Number.isInteger(entry?.sampleCount)||entry.sampleCount<1)problems.push('Hiányzó mérési mintaszám');
  const metrics={};for(const [key,threshold] of Object.entries(bounds)){
   const value=entry?.p75?.[key];
   if(typeof value!=='number'||!Number.isFinite(value)||value<0){problems.push('Hiányzó vagy hibás p75 '+key);continue;}
   metrics[key]={p75:value,target:threshold,passed:value<=threshold};
  }
  rows.push({route:entry.route,source:entry.source,sampleCount:entry.sampleCount,metrics,issues:problems,
   pass:problems.length===0&&Object.values(metrics).every(x=>x.passed)});
 }
 return {release:'1.40.10',rows,issues,measurementCount:rows.length,
  verifiedFieldMeasurementCount:rows.filter(x=>x.source==='field'&&x.issues.length===0).length,
  requiresEvidenceReview:true,automaticallyCertified:false,
  note:'A megadott méréseket a rendszer nem képes függetlenül igazolni. A laboreredmény nem helyettesíti a terepmérést.'};
}
