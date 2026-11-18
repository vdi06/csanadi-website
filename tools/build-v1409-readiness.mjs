/* AA+AB+AC+AD: kizárólag helyi, bizonyítékalapú előkészítési jegyzőkönyv. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const load=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const save=(name,data)=>fs.writeFileSync(path.join(root,'dokumentacio',name),JSON.stringify(data,null,2)+'\n');
const entries=fs.readdirSync(path.join(root,'json/oldalak'),{recursive:true,withFileTypes:true})
 .filter(x=>x.isFile()&&x.name.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync(path.join(x.parentPath,x.name),'utf8')))
 .filter(x=>x.lifecycle?.status==='published');
const inventory=load('json/assets-inventory.json'),registry=load('json/mediatar.json');
const prevPhoto=load('dokumentacio/FOTO_STATUS_V1_40_8.json');

const photo={release:'1.40.9',sourcePhotoFilesReceived:0,institutionalPermissionsReceived:0,newApprovedPhotosIntegrated:0,
 unchangedMediaItems:registry.items.length,unchangedHeroSlides:30,sourceEvidence:'A v1.40.9 fejlesztési kérelemhez nem érkezett új eredeti fotó vagy jogi jóváhagyás.',
 previous:prevPhoto.release,requiresBeforeImport:['eredeti JPG/PNG/WebP és SHA-256','képenkénti képmás- és licencjog-igazolás','intézményi felülvizsgáló és döntésazonosító','képleírás (alt) ellenőrzése','kézi elhelyezési és közzétételi döntés'],
 stagingTool:'tools/iskolai-fotok-jovahagyasa.html',placementValidator:'tools/photo-placement-core-v1-40-8.mjs',
 changesToHeroOrMedia:false,publicationPerformed:false};
save('FOTO_STATUS_V1_40_9.json',photo);

const mobile={release:'1.40.9',automatedTool:'tools/mobil-akadalymentesseg-qa.html',
 automatedWidths:[320,390,768],newChecks:['látható H1','címsorszint-ugrás','aria-expanded/aria-controls célpontja','target=_blank noopener'],
 previousChecksPreserved:['vízszintes túlcsordulás','24 CSS px alatti célterületek','fejlécütközések','képek alt attribútuma','űrlapnevek','duplikált ID','alapvető ARIA'],
 actualDeviceReportsSupplied:0,realPhoneTested:false,realTabletTested:false,keyboardTestedOnDevice:false,screenReaderTested:false,
 wcagConformanceCertified:false,requiresManualReview:['valódi Android/iOS és asztali billentyűzetes végigjárás','NVDA/VoiceOver ellenőrzés','320/390/768 px JSON mérések exportja és előzővel összevetése','valós hibák célzott javítása és újramérése'],
 status:'expanded-tooling-not-physical-certification',publicationPerformed:false};
save('MOBIL_AKADALYMENTESSEG_STATUS_V1_40_9.json',mobile);

const config=load('json/config.json');
const seo=entries.map(page=>{
 const indexable=/^index(?:,follow)?$/i.test(String(page.seo?.robots||''));
 const verified=page.schemaExtensions?.verifiedContent===true;
 const route=page.schemaExtensions?.route;
 const title=String(page.seo?.title||'').trim();
 const description=String(page.seo?.description||'').trim();
 const issues=[];
 if(!verified)issues.push('intézményi szöveg nincs hitelesítve');
 if(!title||!description)issues.push('SEO cím vagy leírás hiányzik');
 if(!indexable)issues.push('noindex – kizárólag kézi jóváhagyással módosítható');
 return {route,title:page.title,verifiedContent:verified,robots:page.seo?.robots||'noindex',indexable,
  metadataComplete:Boolean(title&&description),manualApproval:false,issues};
}).sort((a,b)=>a.route.localeCompare(b.route,'hu-HU'));
const seoReport={release:'1.40.9',baseUrl:config.site.baseUrl,total:seo.length,verifiedContent:seo.filter(x=>x.verifiedContent).length,
 metadataComplete:seo.filter(x=>x.metadataComplete).length,indexable:seo.filter(x=>x.indexable).length,
 publicationAuthorized:false,indexingActivated:false,sitemapPublicUrls:0,
 preconditions:['tényleges iskolai tartalomellenőrzés oldalszinten','az intézményi nyilvános domain és canonical URL jóváhagyása','közvetlen kézi jóváhagyás index/follow feloldására','statikus SEO-kimenet és sitemap újragenerálása FTP-bázis URL-lel'],pages:seo};
save('SEO_AKTIVALASI_TERV_V1_40_9.json',seoReport);

const files=['assets/media/web/v1-40/responsive/sport-mobile-320.webp','assets/media/web/v1-40/responsive/sport-mobile-480.webp',
 'assets/media/web/v1-40/sport-mobile-800.webp','assets/media/web/v1-40/responsive/sport-320.webp',
 'assets/media/web/v1-40/responsive/sport-640.webp','assets/media/web/v1-40/responsive/sport-960.webp',
 'assets/media/web/v1-40/sport-1600.webp'];
const images=files.map(file=>{const data=fs.readFileSync(path.join(root,file));return {file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')};});
const css=load('dokumentacio/TELJESITMENY_AUDIT_V1_40_8.json');
const performance={release:'1.40.9',kind:'static-readiness-audit',baseRelease:'1.40.8',
 existingCssBundle:{sourceRequests:css.css.originalLocalRequests,activeLocalStylesheetRequests:css.css.currentLocalRequests},
 homeHero:{conditionalPreload:true,onlyHomeRoute:true,skipWhenEntranceGateVisible:true,skipOnSaveData:true,
 responsiveMobileAndDesktop:true,preloadTargets:images},
 sourceInventoryAssets:inventory.items.length,
 realMetricsMeasured:false,metricsNotMeasured:['LCP','INP','CLS','FCP','Lighthouse'],
 fieldMeasurementPlan:['Chromium/Firefox/Safari kontrollmérés mobil és asztali profillal','LCP p75 ≤ 2,5 s','INP p75 ≤ 200 ms','CLS p75 ≤ 0,1','első kapu-látogatás és visszatérő látogató külön mérés','CDN/FTP hálózati és cache változatok összevetése'],
 publicationPerformed:false};
save('TELJESITMENY_TERV_V1_40_9.json',performance);
console.log(JSON.stringify({photos:0,mobileAutomatedWidths:3,seoPages:seo.length,verified:seoReport.verifiedContent,indexable:0,preloadAssets:images.length,realMeasurements:false}));
