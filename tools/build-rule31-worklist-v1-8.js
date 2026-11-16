/* A 65×31 korábbi követelménymátrix bizonyítékalapú ellenőrző munkalapja.
   Nem minősít tartalmat hitelesítettnek intézményi jóváhagyás nélkül. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const target=path.join(root,'dokumentacio');
const source=fs.readFileSync(path.join(target,'ALOLDALAK_31_SZABALY_ELLENORZES.csv'),'utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
function parse(row){return [...row.matchAll(/"((?:[^"]|"")*)"(?:;|$)/g)].map(m=>m[1].replace(/""/g,'"'));}
function q(x){return '"'+String(x??'').replace(/"/g,'""')+'"';}
const cols=parse(source[0]);
if(cols.length!==36)throw Error('A 31 szabályt tartalmazó CSV oszlopszáma megváltozott: '+cols.length);
const counts={F:0,K:0,V:0,N:0,H:0},items=[],open=[];
for(const line of source.slice(1)){
  const row=parse(line);
  if(row.length!==36)throw Error('Hibás aloldali oszlopszám: '+row[0]);
  const [route,title,relative,blocks,verified]=row;
  const file=path.join(root,'json',relative);
  if(!fs.existsSync(file))throw Error('Hiányzó aloldal: '+file);
  const page=JSON.parse(fs.readFileSync(file,'utf8'));
  if(page.schemaExtensions?.route!==route)throw Error('Eltérő útvonal: '+route);
  const actualVerified=page.schemaExtensions?.verifiedContent===true;
  const rules=cols.slice(5).map((name,i)=>{
    const status=row[i+5];if(!(status in counts))throw Error('Ismeretlen státusz: '+status);
    counts[status]++;
    if(status==='H')open.push({route,title,json:'json/'+relative,ruleNumber:i+1,rule:name,reason:i===27&&!actualVerified?'Az oldal verifiedContent jelzője false; intézményi tartalmi hitelesítés szükséges.':'Ellenőrzött forráshiány: kézi vizsgálat szükséges.',reviewer:'',evidence:'',decision:''});
    return {number:i+1,name,status};
  });
  items.push({route,title,json:'json/'+relative,blocks:Number(blocks),previousVerified:verified==='igen',actualVerified,rules});
}
if(items.length!==65||open.length!==55||Object.values(counts).reduce((s,n)=>s+n,0)!==65*31)throw Error('Eltérő mátrixméret vagy hiányszám');
const document={release:'v1.8.0',pages:items.length,criteria:31,counts,openItems:open.length,openByRule:Object.fromEntries([...new Set(open.map(x=>x.rule))].map(x=>[x,open.filter(r=>r.rule===x).length])),items,open,method:'Korábbi 31 szabály státuszai + jelenlegi JSON-tartalmak. Az F/K/N nem jelent teljes vizuális igazolást; az 55 H mind intézményi hitelesítési feladat.'};
fs.writeFileSync(path.join(target,'SZABALYOK_31_ALOLDAL_V1_8.json'),JSON.stringify(document,null,2)+'\n');
const header=['Útvonal','Oldalcím','JSON-forrás','Szabály sorszáma','Szabály','Hiány pontos oka','Ellenőrző személy – kitöltendő','Igazoló forrás – kitöltendő','Intézményi döntés – kitöltendő'];
fs.writeFileSync(path.join(target,'SZABALYOK_31_HIANYOK_V1_8.csv'),'\uFEFF'+[header,...open.map(x=>[x.route,x.title,x.json,x.ruleNumber,x.rule,x.reason,x.reviewer,x.evidence,x.decision])].map(row=>row.map(q).join(';')).join('\r\n'),'utf8');
console.log(JSON.stringify({pages:items.length,criteria:31,checks:items.length*31,open:open.length,counts,openByRule:document.openByRule}));
