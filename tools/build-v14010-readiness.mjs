/* AG+AH+AI+AJ+AK: alátámasztott, csak helyi kiadási felkészültség. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessOfficialPhotos} from './official-photo-validation-v1-40-10.mjs';
import {planQaRemediation} from './qa-remediation-core-v1-40-10.mjs';
import {planSeoActivation} from './seo-consent-core-v1-40-10.mjs';
import {assessWebVitals} from './vitals-review-core-v1-40-10.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const data=filename=>JSON.parse(fs.readFileSync(path.join(root,filename),'utf8'));
const write=(name,payload)=>fs.writeFileSync(path.join(root,'dokumentacio',name),JSON.stringify(payload,null,2)+'\n');
const pages=fs.readdirSync(path.join(root,'json/oldalak'),{withFileTypes:true,recursive:true})
 .filter(entry=>entry.isFile()&&entry.name.endsWith('.json'))
 .map(entry=>JSON.parse(fs.readFileSync(path.join(entry.parentPath,entry.name),'utf8')))
 .filter(page=>page.lifecycle?.status==='published');
const media=data('json/mediatar.json'),photos=assessOfficialPhotos({photos:[]},[],media.items);
write('FOTO_ELLENORZES_V1_40_10.json',{
 ...photos,newOriginalInstitutionalPhotoFiles:0,priorMediaItems:media.items.length,
 missingEvidence:['eredeti képfájlok','képenkénti SHA-256 és képleírás','intézményi engedély','kiskorúak hozzájárulásának ellenőrzése'],
 uploadAutomatically:false});
const qa=planQaRemediation({release:'1.40.9',results:[],manualScreenReaderCertified:false});
write('MOBIL_HIBAJAVITASI_TERV_V1_40_10.json',{
 ...qa,actualReportsProvided:0,physicalTestingPerformed:false,itemsFixedFromEvidence:0,
 awaiting:['előző telefonos QA export JSON','új telefonos QA export JSON','billentyűzetes és képernyőolvasós kézi jegyzőkönyv'],
 tool:'tools/mobil-akadalymentesseg-qa.html'});
const config=data('json/config.json');
const seo=planSeoActivation(pages,[],{baseUrl:config.site.baseUrl,domainApproved:false});
write('SEO_ENGEDELYEZES_V1_40_10.json',{
 ...seo,baseUrl:config.site.baseUrl,institutionalApprovalsReceived:0,contentVerified:pages.filter(p=>p.schemaExtensions?.verifiedContent===true).length,
 indexableNow:pages.filter(p=>/^index(?:,follow)?$/i.test(p.seo?.robots||'')).length,
 requiredBeforeActivation:['intézményi domain jóváhagyása','oldalankénti tartalmi és jogi jóváhagyás','SEO-cím/leírás ellenőrzése','külön kézi noindex-feloldás és újragenerálás']});
const vital=assessWebVitals({routes:[]});
write('WEB_VITALS_TERV_V1_40_10.json',{
 ...vital,lcpMeasured:false,inpMeasured:false,clsMeasured:false,realDeviceLogsReceived:0,
 requires:['valódi p75 minták útvonalanként','mobil/asztali labor és terepmérés külön','előtte/utána kontroll','CDN, belépőkapu és adatspórolás külön vizsgálata']});
const curated=data('json/adatok/ajanlasi-szabalyok-v1-40-10.json');
write('AJANLASOK_STATUS_V1_40_10.json',{
 release:'1.40.10',types:['page','news','event','document'],curationRules:curated.rules.length,
 verifiedEditorialApprovals:0,searchEngine:'js/search-recommendations-v1-40-9.js',
 editor:'tools/ajanlasok-szerkeszto-v1-40-10.html',doesNotProfileUsers:true,publicationPerformed:false,
 note:'A manuális kiemelési lista jóváhagyott adatok hiányában üres; a több tartalomtípusú automatikus ajánlás változatlanul működik.'});
console.log(JSON.stringify({pages:pages.length,photos:0,realQa:0,seoEligible:seo.eligible,realVitals:0,curationRules:0}));
