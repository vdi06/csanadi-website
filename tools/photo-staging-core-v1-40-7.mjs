/* v1.40.7 Q: be nem épített iskolai képek helyi, előzetes regisztrációs terve.
   Az intézményi engedély tényét soha nem tudja önállóan igazolni. */
import {verifyPhotoApproval} from './photo-approval-core-v1-40-6.mjs';
const extensions={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'};
export function buildPhotoStagingPlan(manifest,selectedImages,existingMedia=[]){
 const check=verifyPhotoApproval(manifest,selectedImages);
 if(!check.matched)return {ready:false,issues:check.problems,items:[],publicationApproved:false};
 const knownHashes=new Set(existingMedia.map(item=>item?.original?.sha256).filter(Boolean));
 const knownIds=new Set(existingMedia.map(item=>item?.id).filter(Boolean));
 const knownPaths=new Set(existingMedia.flatMap(item=>[item?.original?.path,...(item?.variants||[]).map(v=>v?.path)]).filter(Boolean));
 const items=[],issues=[];
 for(const image of selectedImages){
  if(knownHashes.has(image.sha256)){issues.push(`A fájl már szerepel a médiatárban: ${image.name}`);continue;}
  const stem=image.sha256.slice(0,20),ext=extensions[image.mimeType];
  if(!ext){issues.push(`Nem támogatott képtípus: ${image.name}`);continue;}
  const path=`assets/media/intezmenyi-ellenorzesre/csanadi-${stem}.${ext}`;
  const id=`media:ellenorzesre-${stem}`;
  if(knownIds.has(id)||knownPaths.has(path)){issues.push(`Ütköző médiaazonosító vagy fájlnév: ${image.name}`);continue;}
  items.push({id,kind:'image',original:{path,mimeType:image.mimeType,width:image.width,height:image.height,sizeBytes:image.sizeBytes,sha256:image.sha256},
   variants:[],alt:'',caption:'',decorative:false,
   rights:{clearance:'pending',holder:manifest.approval.holder,license:'Intézményi bizonyíték ellenőrzésre vár.'},
   staging:{sourceName:image.name,evidenceId:manifest.approval.evidenceId,decisionId:manifest.approval.decisionId,
    independentInstitutionalVerification:false,requiresHumanAltText:true,requiresManualMediaImport:true,
    requiresPrivacyCheck:true,publicDisplayAllowed:false}});
 }
 return {ready:issues.length===0,issues,items,publicationApproved:false,
  disclaimer:'Ez importálási előkészítő TERV. Sem képfájlt, sem médiatárat nem módosít; a jogi és adatvédelmi engedélyt nem igazolja.'};
}
