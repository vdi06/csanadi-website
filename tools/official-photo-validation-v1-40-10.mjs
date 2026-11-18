/* AG: kép-bytes, fájljegyzék és képenkénti intézményi jogalap offline ellenőrzése.
 * Az adatok helyi vizsgálata önmagában soha nem jelent nyilvános engedélyt. */
import {createHash} from 'node:crypto';

const hex=/^[a-f0-9]{64}$/i;
const pathSafe=p=>typeof p==='string'&&/^[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(p);
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T00:00:00Z'));
function sniff(bytes){
 if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(bytes.length>=12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'image/webp';
 if(bytes.length>=12&&bytes.toString('ascii',4,8)==='ftyp'&&/avif|avis/.test(bytes.toString('ascii',8,12)))return 'image/avif';
 return null;
}
export function assessOfficialPhotos(manifest,originals=[],previousRegistry=[]){
 const problems=[],rows=Array.isArray(manifest?.photos)?manifest.photos:[],files=new Map();
 for(const original of originals){
  if(!pathSafe(original?.name)||!Buffer.isBuffer(original?.bytes)){problems.push('Érvénytelen eredeti fájlnév vagy bájttartalom');continue;}
  if(files.has(original.name))problems.push('Ismételt eredeti név: '+original.name);
  else files.set(original.name,original.bytes);
 }
 if(rows.length===0)problems.push('Nincs benyújtott intézményi fotó');
 if(rows.length>50)problems.push('Egyszerre legfeljebb 50 kép vizsgálható');
 const knownHashes=new Set(previousRegistry.map(x=>String(x?.original?.sha256||'').toLowerCase()));
 const used=new Set();
 for(const [i,photo] of rows.entries()){
  const prefix=`${i+1}. fotó`;
  if(!pathSafe(photo?.fileName)){problems.push(prefix+': nem biztonságos fájlnév');continue;}
  const bytes=files.get(photo.fileName);
  if(!bytes){problems.push(prefix+': hiányzik az eredeti képfájl');continue;}
  if(bytes.length<12||bytes.length>25*1024*1024){problems.push(prefix+': nem megfelelő fájlméret');continue;}
  const detected=sniff(bytes),digest=createHash('sha256').update(bytes).digest('hex');
  if(!detected||detected!==photo.mimeType)problems.push(prefix+': valótlan képformátum vagy fájltípus');
  if(!hex.test(String(photo.sha256||''))||digest!==String(photo.sha256).toLowerCase())problems.push(prefix+': SHA-256 eltérés');
  if(knownHashes.has(digest)||used.has(digest))problems.push(prefix+': ismételt vagy már regisztrált fotó');used.add(digest);
  if(!Number.isInteger(photo.width)||photo.width<600||!Number.isInteger(photo.height)||photo.height<360)problems.push(prefix+': kis vagy ismeretlen felbontás');
  if(typeof photo.alt!=='string'||photo.alt.trim().length<18)problems.push(prefix+': nincs elégséges hozzáférhető képleírás');
  const consent=photo.approval||{};
  for(const name of ['holder','licenseEvidenceId','privacyEvidenceId','reviewedBy','decisionId'])
   if(typeof consent[name]!=='string'||!consent[name].trim())problems.push(prefix+': hiányzó intézményi bizonyítékmező: '+name);
  if(!isDate(consent.reviewedAt))problems.push(prefix+': hiányzó vagy hibás jóváhagyási dátum');
  if(consent.publicDisplayAllowed!==true||consent.independentInstitutionalVerification!==true)problems.push(prefix+': nincs kifejezett kettős jóváhagyási nyilatkozat');
  if(photo.containsIdentifiableMinors===true&&consent.minorConsentEvidenceVerified!==true)problems.push(prefix+': az azonosítható kiskorúak hozzájárulása nincs igazolva');
 }
 for(const name of files.keys())if(!rows.some(x=>x?.fileName===name))problems.push('Jegyzékben nem szereplő eredeti fájl: '+name);
 return {release:'1.40.10',originals:files.size,manifestRows:rows.length,issues:[...new Set(problems)],
  readyForIndependentReview:rows.length>0&&!problems.length,
  institutionallyVerifiedBySystem:false,mediaRegistryModified:false,publicationApproved:false,publicationPerformed:false,
  warning:'A kitöltött nyilatkozat és a SHA-egyezés nem igazolja önmagában a jogszerű nyilvános közzétételt.'};
}
