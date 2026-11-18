/* AI: intézményi jóváhagyási jegyzék és SEO-indexelés kiadási kapuja.
 * Nem módosít page JSON-t, robots.txt-t, sitemapet vagy éles oldalt. */
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value));
const validRoute=value=>typeof value==='string'&&/^#\/[a-z0-9/-]*$/.test(value);
export function planSeoActivation(pages,approvals=[],{baseUrl='',domainApproved=false}={}){
 const issues=[],items=[],approved=new Map();
 try{const url=new URL(baseUrl);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!url.pathname.endsWith('/'))issues.push('Jóváhagyott, tiszta HTTPS gyökér-URL szükséges');}
 catch{issues.push('Hiányzó vagy érvénytelen HTTPS alap-URL');}
 if(!domainApproved)issues.push('Az intézményi nyilvános domain még nincs jóváhagyva');
 for(const a of approvals){
  if(!validRoute(a?.route)){issues.push('Érvénytelen jóváhagyási útvonal');continue;}
  if(approved.has(a.route))issues.push('Ismételt jóváhagyási útvonal: '+a.route);
  else approved.set(a.route,a);
 }
 for(const page of pages||[]){
  const route=page?.schemaExtensions?.route,record=approved.get(route),blockers=[];
  if(!validRoute(route)){issues.push('Érvénytelen oldalútvonal');continue;}
  if(page.lifecycle?.status!=='published')blockers.push('Oldal nem publikált');
  if(page.schemaExtensions?.verifiedContent!==true)blockers.push('Tartalom nincs intézményileg hitelesítve');
  if(!String(page.seo?.title||'').trim()||!String(page.seo?.description||'').trim())blockers.push('Hiányzó SEO metaadat');
  if(!record?.contentReviewer||!record?.privacyReviewer||!record?.seoApprover||!record?.approvalId||!isDate(record?.reviewedAt)||record?.explicitIndexingConsent!==true)blockers.push('Nincs teljes, önálló oldalszintű jóváhagyás');
  if(!domainApproved||issues.length)blockers.push('Domain vagy jegyzék nem ellenőrzött');
  items.push({route,title:page.title,eligibleForManualChange:blockers.length===0,currentlyNoindex:!/^index(?:,follow)?$/i.test(page.seo?.robots||''),blockers});
 }
 for(const route of approved.keys())if(!items.some(x=>x.route===route))issues.push('Árva jóváhagyás: '+route);
 return {release:'1.40.10',pages:items.length,eligible:items.filter(x=>x.eligibleForManualChange).length,
  issues,items,robotsFilesChanged:false,sitemapChanged:false,publicIndexingActivated:false,publicationPerformed:false,
  requiresExplicitManualAuthorization:true, note:'A jogosultsági jegyzék csak előnézet: noindex feloldásához új, kézzel jóváhagyott, teljes SEO-újragenerálás kell.'};
}
