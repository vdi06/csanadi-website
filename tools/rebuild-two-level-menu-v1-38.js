/* Egyszer futtatható, ellenőrzött menüstruktúra-migráció a v1.37.0 alapból. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const target=path.resolve(__dirname,'../json/structure.json');
const original=JSON.parse(fs.readFileSync(target,'utf8'));
const known=new Set();
const collect=nodes=>{for(const node of nodes||[]){known.add(node.path);collect(node.children);}};
collect(original.nodes);
const p=(branch,name)=>`oldalak/${branch}/${name}.json`;
const leaf=(path,order,visible=true,children=[])=>({path,order,...(!visible?{menuVisible:false}:{}),...(children.length?{children}:{} )});
const hidden=(paths)=>paths.map((name,index)=>leaf(name,index+1,false));
const school='iskolank',edu='oktatas',sport='sport',news='hirek-es-esemenyek',info='informaciok';
const roots=[
 leaf('oldalak/iskolank.json',1,true,[
  leaf(p(school,'bemutatkozas'),1),
  leaf(p(school,'kuldetes-es-ertekek'),2),
  leaf(p(school,'tantestulet'),3),
  leaf(p(school,'tortenet'),4,true,hidden(['tortenet','hagyomanyok-es-elismeresek','buszkesegeink','a-honlap-szuletese'].slice(1).map(x=>p(school,x)))),
  leaf(p(school,'partnerek'),5,true,hidden([p(school,'alapitvany')])),
  leaf(p(school,'oko-iskola'),6)
 ]),
 leaf('oldalak/oktatas.json',2,true,[
  leaf(p(edu,'kepzeseink'),1,true,hidden(['altalanos-iskola','gimnazium','sportiskolai-neveles'].map(x=>p('oktatas/kepzeseink',x)))),
  leaf(p(edu,'tanevek'),2,true,hidden(['aktualis-tanev','korabbi-tanevek'].map(x=>p('oktatas/tanevek',x)))),
  leaf(p(edu,'vizsgak'),3,true,hidden(['erettsegi','osztalyozo-vizsgak','egyeb-vizsgak'].map(x=>p('oktatas/vizsgak',x)))),
  leaf(p(edu,'tananyagok-es-jegyzetek'),4),
  leaf(p(edu,'konyvtar'),5,true,hidden([p('oktatas/konyvtar','konyvtari-szolgaltatasok')])),
  leaf(p(edu,'digitalis-kultura'),6)
 ]),
 leaf(p(edu,'felveteli'),3,true,[
  leaf(p('oktatas/felveteli','elso-evfolyam'),1),
  leaf(p('oktatas/felveteli','kilencedik-evfolyam'),2),
  leaf(p('oktatas/felveteli','nyilt-napok'),3),
  leaf(p('oktatas/felveteli','felveteli-hataridok'),4)
 ]),
 leaf('oldalak/sport.json',4,true,[
  leaf(p(sport,'sportagak'),1,true,hidden(['sportolok','csapatok','edzok'].map(x=>p(sport,x)))),
  leaf(p(sport,'sporteredmenyek'),2),
  leaf(p(sport,'sportgaleriak'),3)
 ]),
 leaf('oldalak/hirek-es-esemenyek.json',5,true,[
  leaf(p(news,'hirek'),1,true,hidden(['iskolai-hirek','sporthirek'].map(x=>p('hirek-es-esemenyek/hirek',x)))),
  leaf(p(news,'esemenynaptar'),2,true,hidden(['iskolai-esemenyek','sportesemenyek'].map(x=>p('hirek-es-esemenyek/esemenynaptar',x)))),
  leaf(p(news,'kozlemenyek'),3),
  leaf(p('hirek-es-esemenyek/hirek','hirarchivum'),4)
 ]),
 leaf('oldalak/informaciok.json',6,true,[
  leaf(p(info,'mindennapi-tudnivalok'),1,true,hidden(['csengetesi-rend','etkezes','szuloi-informaciok'].map(x=>p('informaciok/mindennapi-tudnivalok',x)))),
  leaf(p(info,'dokumentumtar'),2,true,hidden(['szabalyzatok','nyomtatvanyok','kozzeteteli-lista'].map(x=>p('informaciok/dokumentumtar',x)))),
  leaf(p(info,'digitalis-ugyintezes'),3),
  leaf(p(info,'kozossegi-szolgalat'),4,true,hidden(['kozossegi-tudnivalok','kozossegi-jogszabalyok','kozossegi-dokumentumok'].map(x=>p('informaciok/kozossegi-szolgalat',x)))),
  leaf('oldalak/kapcsolat.json',5),
  leaf(p(info,'allaspalyazatok'),6,false),
  leaf(p(info,'adatvedelem'),7,false)
 ])
];
const used=[];collect(roots);
const seen=new Set();
const inspect=nodes=>{for(const node of nodes||[]){if(seen.has(node.path))throw Error(`Duplikált JSON-oldal: ${node.path}`);seen.add(node.path);inspect(node.children);}};
inspect(roots);
const missing=[...known].filter(x=>!seen.has(x));
if(missing.length)throw Error('A migráció tartalmat veszítene: '+missing.join(', '));
const count=roots.map(root=>(root.children||[]).filter(x=>x.menuVisible!==false).length);
if(roots.length!==6||count.join(',')!=='6,6,4,3,4,5')throw Error('Nem megfelelő a jóváhagyott 6+28 menü: '+count);
fs.writeFileSync(target,JSON.stringify({schemaVersion:'1.0.0',nodes:roots},null,2)+'\n');
const labels=new Map([
 ['oldalak/oktatas.json','Oktatás'],
 ['oldalak/hirek-es-esemenyek.json','Hírek és események'],
 ['oldalak/informaciok.json','Információk'],
 [p(school,'kuldetes-es-ertekek'),'Céljaink és értékeink'],
 [p(school,'tortenet'),'Történetünk és büszkeségeink'],
 [p(school,'partnerek'),'Partnereink és alapítványunk'],
 [p(edu,'tananyagok-es-jegyzetek'),'Tananyagok és segédletek'],
 [p('oktatas/felveteli','kilencedik-evfolyam'),'9. évfolyamos felvételi'],
 [p(info,'mindennapi-tudnivalok'),'Mindennapi tudnivalók']
]);
const indexPath=path.resolve(__dirname,'../json/oldalindex.json');
const index=JSON.parse(fs.readFileSync(indexPath,'utf8'));
for(const [entry,label] of labels){
 const full=path.resolve(__dirname,'../json',entry);
 const page=JSON.parse(fs.readFileSync(full,'utf8'));
 page.menuLabel=label;
 fs.writeFileSync(full,JSON.stringify(page,null,2)+'\n');
 if(index.pages?.[entry])index.pages[entry].menuLabel=label;
}
// A könyvtár egykori egyetlen al-aloldalának tartalma a Könyvtár oldalon is olvasható.
const libraryPath=path.resolve(__dirname,'../json/oldalak/oktatas/konyvtar.json');
const servicesPath=path.resolve(__dirname,'../json/oldalak/oktatas/konyvtar/konyvtari-szolgaltatasok.json');
const library=JSON.parse(fs.readFileSync(libraryPath,'utf8'));
const services=JSON.parse(fs.readFileSync(servicesPath,'utf8'));
const ids=new Set(library.blocks.map(block=>block.id));
const additional=services.blocks.filter(block=>!ids.has(block.id));
if(additional.length){library.blocks.push(...additional);fs.writeFileSync(libraryPath,JSON.stringify(library,null,2)+'\n');}
fs.writeFileSync(indexPath,JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify({roots:roots.length,submenuCount:count.reduce((a,b)=>a+b,0),allPages:seen.size,hiddenPages:seen.size-6-count.reduce((a,b)=>a+b,0)}));
