/* Olvasásos, megismételhető, statikus FTP-kompatibilis tartalom- és média-audit. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const assets=read('json/assets-inventory.json').items;
const media=read('json/mediatar.json').items;
const links=read('json/assets-project-index.json').assetReferences;
const pages=read('json/oldalindex.json').pages;
const issues=[];
function row(kind,severity,file,issue,action){
 const refs=(links[file]||[]).filter(p=>!['json/assets-inventory.json','json/assets-project-index.json'].includes(p));
 issues.push({kind,severity,path:file,issue,references:refs.join(' | '),action});
}
let unregistered=0;
const indexed=new Set(assets.map(a=>a.path));
const knownRights=new Map(media.filter(x=>x.original?.path).map(x=>[x.original.path,x.rights?.clearance||'unknown']));
for(const a of assets){
 if(!fs.existsSync(path.join(root,a.path)))row('assets','critical',a.path,'A katalógusban szerepel, de nincs fájl.','Azonosítani és visszaállítani vagy eltávolítani a hivatkozásokat.');
 if(!/^[a-f0-9]{64}$/i.test(String(a.sha256||'')))row('assets','review',a.path,'SHA-256 hiányzik vagy hibás.','Állomány-ujjlenyomat helyi újraszámítása.');
 if(['image','graphic'].includes(a.type)&&!String(a.alt||'').trim())row('accessibility','review',a.path,'Nincs külön alternatív szöveg.','Ellenőrizni, hogy dekoratív-e; ha nem, rövid leírást készíteni.');
 if(a.published&&!knownRights.has(a.path)){unregistered++;row('rights','review',a.path,'Publikáltként jelölt, de nincs közvetlen médiatár-jogállás.','Intézményi felhasználási jog és tartalmi hely ellenőrzése.');}
}
for(const m of media){
 const clearance=m.rights?.clearance||'unknown';
 if(['pending','preview-only','unknown'].includes(clearance))row('rights',clearance==='pending'?'high':'review',m.original?.path||m.id,`Jogállás: ${clearance}.`,'Jogosult, licenc, felhasználási engedély és szükség esetén érintetti hozzájárulás tételes ellenőrzése.');
 if(clearance==='editor-confirmed'&&m.rights?.institutionallyApproved!==true)row('rights','review',m.original?.path||m.id,'Csak szerkesztői nyilatkozat; nincs intézményi jóváhagyás.','Intézményi döntés és bizonyíték külön felülvizsgálata. A státusz automatikus átállítása tilos.');
 if(m.original?.path&&!indexed.has(m.original.path))row('registry','review',m.original.path,'Médiatárban szerepel, de az assets-katalógusban nincs.','Nyilvántartások egyeztetése.');
}
const pageRows=Object.entries(pages).map(([file,p])=>({file,title:p.title||'',status:p.lifecycle?.status||'unknown',route:p.schemaExtensions?.route||''}));
const countBySeverity={};for(const i of issues)countBySeverity[i.severity]=(countBySeverity[i.severity]||0)+1;
const findings={release:'v1.9.0',generatedAt:'2026-11-16',assets:assets.length,media:media.length,pages:pageRows.length,publishedWithoutDirectRightsRegistry:unregistered,rightsPending:media.filter(m=>m.rights?.clearance==='pending').length,rightsPreviewOnly:media.filter(m=>m.rights?.clearance==='preview-only').length,rightsEditorConfirmedUnapproved:media.filter(m=>m.rights?.clearance==='editor-confirmed'&&m.rights?.institutionallyApproved!==true).length,missingAlternativeText:issues.filter(i=>i.kind==='accessibility').length,missingQrAlternativeText:issues.filter(i=>i.kind==='accessibility'&&i.path.startsWith('assets/qr/')).length,countsBySeverity:countBySeverity,issues,pageRows,notes:['A puszta státusz nem bizonyítja a szerzői jogi vagy adatvédelmi megfelelést.','Az állományjogok és az iskolai tények intézményi döntés nélkül nem hitelesíthetők.','A korábban elfogadott 65×31 részletes követelménymátrix külön CSV-ben továbbra is megtalálható.','A 87 QR-kód önálló fotóként nem számolható; az alternatív szöveg szükségességét funkciójuk alapján kell mérlegelni.']};
const out='dokumentacio';
fs.writeFileSync(path.join(root,out,'TARTALMI_MEDIA_AUDIT_V1_9.json'),JSON.stringify(findings,null,2)+'\n');
const header=['Terület','Súlyosság','Fájl','Megállapítás','Hivatkozások','Szükséges intézkedés'];
const csv=[header,...issues.map(i=>[i.kind,i.severity,i.path,i.issue,i.references,i.action])]
 .map(cols=>cols.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
fs.writeFileSync(path.join(root,out,'TARTALMI_MEDIA_AUDIT_V1_9.csv'),'\ufeff'+csv,'utf8');
console.log(JSON.stringify({assets:findings.assets,media:findings.media,pages:findings.pages,rightsPending:findings.rightsPending,rightsPreviewOnly:findings.rightsPreviewOnly,missingAlternativeText:findings.missingAlternativeText,publishedWithoutDirectRightsRegistry:unregistered,countBySeverity,issueRows:issues.length}));
