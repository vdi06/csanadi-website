const routePattern=/^#\/[a-z0-9/-]+$/;
const idPattern=/^[a-z0-9:-]+$/;
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
const isPlain=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function inspectNewsRecord(item,config){
 const findings=[];
 if(!isPlain(item)){return {ok:false,findings:['A hír nem JSON-objektum.'],kind:'blocked'};}
 const policy=config?.runtime?.news||{};
 const prefix=policy.sampleTitlePrefix;
 const host=policy.officialSourceHost;
 if(typeof item.id!=='string'||!idPattern.test(item.id))findings.push('Érvénytelen hír-azonosító.');
 if(typeof item.title!=='string'||item.title.length<8||typeof item.summary!=='string'||item.summary.length<12)findings.push('Hiányzó cím vagy összefoglaló.');
 if(typeof item.route!=='string'||!routePattern.test(item.route))findings.push('Érvénytelen helyi céloldal.');
 if(!['sample','verified'].includes(item.status))findings.push('A hír kizárólag sample vagy verified állapotú lehet.');
 if(item.status==='sample'){
  if(!config?.privacy?.allowFictionalStudentSamples)findings.push('A fiktív minták megjelenítése le van tiltva.');
  if(typeof prefix!=='string'||!item.title?.startsWith(prefix)||!item.id?.startsWith('minta:'))findings.push('A mintahírt látható MINTA címkével és minta: azonosítóval kell ellátni.');
  if(item.url!==null||item.date!==null)findings.push('A minta nem tartalmazhat hivatalos forráslinket vagy dátumot.');
  if(item.studentName||item.studentClass||item.actualResult||item.verified===true||item.approval)findings.push('A mintahír nem hordozhat tanulói személyadatot, valós eredményt vagy igazolási állítást.');
 }
 if(item.status==='verified'){
  try{const source=new URL(item.url);if(source.protocol!=='https:'||source.hostname!==host)throw Error();}catch{findings.push('A hiteles hírhez engedélyezett intézményi HTTPS-forrás szükséges.');}
  if(item.date!==null&&(!datePattern.test(item.date)||!Number.isFinite(Date.parse(item.date))))findings.push('A hivatalos hírdátum hibás.');
  if(config?.privacy?.requireExplicitApprovalForStudentNews&&(item.subjectType==='student'||item.category==='Sport')){
   const approval=item.approval;
   if(!isPlain(approval)||typeof approval.approvedBy!=='string'||!approval.approvedBy.trim()||typeof approval.approvedAt!=='string'||!Number.isFinite(Date.parse(approval.approvedAt))||approval.personalDataReviewed!==true||approval.imageRightsReviewed!==true)findings.push('Tanulóról szóló hiteles sporthírhez névvel, dátummal, adat- és képjogi ellenőrzéssel dokumentált jóváhagyás szükséges.');
  }
 }
 return {ok:findings.length===0,findings,kind:item.status==='sample'?'sample':item.status==='verified'?'verified':'blocked'};
}
export function inspectNewsCollection(root,config){
 if(!isPlain(root)||root.collectionId!=='collection:hirek-hivatalos'||!Array.isArray(root.items))return [{id:'collection',findings:['Érvénytelen hírgyűjtemény.']}];
 const used=new Set(),failures=[];
 for(const entry of root.items){
  const result=inspectNewsRecord(entry,config),findings=[...result.findings];
  if(used.has(entry?.id))findings.push('Ismétlődő hír-azonosító.');
  used.add(entry?.id);
  if(findings.length)failures.push({id:entry?.id||'ismeretlen',findings});
 }
 return failures;
}
