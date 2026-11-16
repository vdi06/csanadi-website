/* Forrásalapú, reprodukálható aloldal-ellenőrzés (nem helyettesíti a vizuális tesztet). */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const structure = JSON.parse(fs.readFileSync(path.join(root,'json/structure.json'),'utf8'));
const mediaIds = new Set(JSON.parse(fs.readFileSync(path.join(root,'json/mediatar.json'),'utf8')).items.map(x=>x.id));
const topics = [
 'Általános elrendezés','Oldalbevezető','Tartalmi szerkezet','Szakasznavigáció','Kártyák és panelek',
 'Képek és videók','Szöveges tartalom','Gombok és linkek','Animációk','Mobilos elrendezés',
 'Kapcsolódó tartalmak','Keresés és szűrés','Oldalak felosztása','Aloldalak közötti navigáció',
 'Oldalváltás','Dokumentumok','Események','Táblázatok','Közlemények','Hosszú listák',
 'Hiányzó tartalom','Frissítések','Részletes tartalmak','Külső tartalmak','Űrlapok',
 'Oldalműveletek','Tanévek és archívumok','Minőségellenőrzés','Rövid áttekintés és teljes dokumentumnézet',
 'Intelligens felső képváltó','Összecsukódó fejléc'
];
const records=[];
function descend(nodes) {
 for(const node of nodes) {
  const file=path.join(root,'json',node.path);
  const page=JSON.parse(fs.readFileSync(file,'utf8'));
  const raw=JSON.stringify(page);
  const blocks=Array.isArray(page.blocks)?page.blocks:[];
  const status=Array(31).fill('V');
  status[0]='K'; // közös SPA- és CSS-rendszer telepítve
  status[1]=typeof page.title==='string'&&page.title.trim()?'F':'H';
  status[2]=blocks.length?'F':'H';
  status[7]=/csanadi-bp\.edu\.hu/i.test(raw)?'H':'F';
  status[13]='K'; status[14]='K';
  status[27]=page.schemaExtensions?.verifiedContent===false?'H':'V'; status[30]='K';
  const bannerId=page.schemaExtensions?.bannerMediaId;
  status[5]=bannerId?(mediaIds.has(bannerId)?'F':'H'):'N';
  if(!/document|pdf|dokument/i.test(raw)) {status[15]='N';status[28]='N';}
  if(!/event|esemény|naptár/i.test(raw))status[16]='N';
  if(!/table|táblázat/i.test(raw))status[17]='N';
  if(!/form|űrlap|submit/i.test(raw))status[24]='N';
  records.push({path:node.path,id:page.id||'',title:page.title||'',route:page.schemaExtensions?.route||'',blocks:blocks.length,verified:page.schemaExtensions?.verifiedContent===true,status});
  if(node.children)descend(node.children);
 }
}
descend(structure.nodes);
const quote=x=>'"'+String(x).replace(/"/g,'""')+'"';
const csv=[['Útvonal','Cím','JSON-fájl','Blokkok','Hitelesített tartalom',...topics.map((t,i)=>(i+1)+'. '+t)].map(quote).join(';')];
for(const r of records)csv.push([r.route,r.title,r.path,r.blocks,r.verified?'igen':'nem',...r.status].map(quote).join(';'));
const out=path.join(root,'dokumentacio','ALOLDALAK_31_SZABALY_ELLENORZES.csv');
fs.writeFileSync(out,'\ufeff'+csv.join('\r\n')+'\r\n');
const counts={F:0,K:0,V:0,N:0,H:0};
for(const r of records)for(const s of r.status)counts[s]++;
const summary=`# Aloldalak és a 31 szabály – első műszaki ellenőrzés\n\n`+
`Ellenőrzött, a structure.json-ban regisztrált oldalak: **${records.length}**. A mellékelt CSV mindegyik oldalhoz mind a 31 szabály külön státuszát tartalmazza.\n\n`+
`## Jelölések\n\n- **F** – forrásadatból igazolható alapfeltétel teljesül (nem vizuális bizonyíték).\n- **K** – közös implementáció megtalálható; böngészőben még ellenőrizni kell.\n- **V** – vizuális, viselkedési vagy tartalmi ellenőrzés szükséges.\n- **N** – a vizsgált oldal forrásában nem azonosítható releváns tartalomtípus; nem végleges mentesség.\n- **H** – forrásból látható hiány vagy hiba.\n\n`+
`Státuszok száma: ${Object.entries(counts).map(([k,v])=>k+'='+v).join(', ')} (összesen ${records.length*31} értékelési mező).\n\n`+
`## Ellenőrzés korlátai\n\n`+
`Ez a kimutatás **nem bizonyítja, hogy mind a 31 szabály mind a ${records.length} oldalon teljesül**. A korábbi 31 C változat részletes, eredeti szövege csak részben visszakereshető; a témák alapján készített ellenőrzési vázlat nem azonos az elfogadott teljes specifikációval. A böngészős vizuális tesztelés a környezetben nem volt végrehajtható. A K és V státuszok nyitott tesztfeladatok.\n\n`+
`A 31. szabályhoz közös, aloldalakon görgetéskor kompakt fejléc készült. A régi domaines JSON-hivatkozások migrációja megtörtént, és a futó DOM-ban külön védelmi ellenőrzés is működik. A külső űrlapok, beágyazások, képgenerálás és az összes oldaltípus teljes vizuális újratervezése nem tekinthető lezártnak.\n`;
fs.writeFileSync(path.join(root,'dokumentacio','ALOLDALAK_31_SZABALY_JELENTES.md'),summary);
console.log(JSON.stringify({pages:records.length,counts,out}));
