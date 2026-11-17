'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=relative=>JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
const write=(relative,data)=>{const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');};
const source=read('json/oldalak/oktatas/digitalis-kultura.json');
const existingSafety='json/oldalak/oktatas/digitalis-kultura/online-biztonsag.json';
const existingAI='json/oldalak/oktatas/digitalis-kultura/mesterseges-intelligencia.json';
const safety=source.blocks.find(b=>b.id==='block:000065-section-6')||read(existingSafety).blocks[0];
const ai=source.blocks.find(b=>b.id==='block:000065-section-7')||read(existingAI).blocks[0];
source.blocks=source.blocks.filter(b=>!['block:000065-section-6','block:000065-section-7'].includes(b.id));
if(!source.blocks.some(b=>b.id==='block:digitalis-szakteruletek')){
 source.blocks.splice(5,0,{id:'block:digitalis-szakteruletek',type:'section',title:'Önálló digitális útmutatók',children:[{id:'block:digitalis-szakteruletek-linkek',type:'markdown',data:{text:'Két önálló témához részletes útmutató készült. Az [online biztonság és felelős kommunikáció](#/oktatas/digitalis-kultura/online-biztonsag) a személyes adatok és digitális viselkedés kérdéseit tárgyalja. A [mesterséges intelligencia tudatos használata](#/oktatas/digitalis-kultura/mesterseges-intelligencia) a lehetőségekre, az ellenőrzésre és az önálló döntésekre összpontosít.'}}]});
}
source.lifecycle.revision=3;
source.updatedAt='2026-11-17T12:00:00+01:00';
write('json/oldalak/oktatas/digitalis-kultura.json',source);
const base=read('json/oldalak/oktatas/tananyagok-es-jegyzetek.json');
const parentInfo=read('json/oldalak/informaciok/mindennapi-tudnivalok.json');
const newPage=({id,title,label,route,slug,summary,category,media,blocks,tags=[]})=>({
 schemaVersion:'1.0.0',id,pageType:'standard',menuLabel:label||title,title,slug,locale:'hu-HU',
 author:{displayName:'Csanádi Árpád Sportiskola',organization:'Csanádi Árpád Sportiskola'},
 createdAt:'2026-11-17T12:00:00+01:00',updatedAt:'2026-11-17T12:00:00+01:00',
 lifecycle:{status:'published',revision:1},
 seo:{title:title+' – Csanádi Sportiskola',description:summary,robots:'noindex,nofollow'},
 categories:[category],tags,summary,blocks,related:[],schemaExtensions:{preview:false,route,verifiedContent:false,bannerMediaId:media}
});
const section=(id,title,text)=>({id:'block:'+id,type:'section',title,children:[{id:'block:'+id+'-text',type:'markdown',data:{text}}]});
write(existingSafety,newPage({id:'page:000067',title:'Online biztonság és felelős kommunikáció',label:'Online biztonság',route:'#/oktatas/digitalis-kultura/online-biztonsag',slug:'online-biztonsag',category:'oktatas',media:'media:oktatas',summary:'Személyes adatok védelme, biztonságos hozzáférés és felelős online viselkedés.',blocks:[safety,section('digitalis-biztonsag-lepesek','Gyakorlati ellenőrzőlista','Erős, egyedi jelszavakat használj, ahol elérhető, kapcsold be a többfaktoros azonosítást, és a megosztott fájlok jogosultságait ellenőrizd. Gyanús üzeneteknél ne add meg a jelszavadat, hanem kérj segítséget egy megbízható felnőttől vagy az intézménytől.\n\n[Vissza a digitális kultúrához](#/oktatas/digitalis-kultura)')],tags:['adatvédelem','kiberbiztonság']}));
write(existingAI,newPage({id:'page:000068',title:'Mesterséges intelligencia tudatos használata',label:'Mesterséges intelligencia',route:'#/oktatas/digitalis-kultura/mesterseges-intelligencia',slug:'mesterseges-intelligencia',category:'oktatas',media:'media:oktatas',summary:'Az MI mint segédeszköz: forráskritika, önálló gondolkodás és felelős felhasználás.',blocks:[ai,section('mi-ellenorzes','Négy kérdés az MI-válaszokhoz','**Mire használom?** Pontosan nevezd meg, milyen segítséget kérsz.\n\n**Honnan származik?** Ellenőrizd az állításokat megbízható forrásokból.\n\n**Mit osztok meg?** Személyes vagy bizalmas adatot ne adj meg a szolgáltatásnak.\n\n**Mi az én munkám?** A végső döntést, megértést és felelősséget ne add át az alkalmazásnak.\n\n[Vissza a digitális kultúrához](#/oktatas/digitalis-kultura)')],tags:['mesterséges intelligencia','digitális kultúra']}));
write('json/oldalak/oktatas/tananyagok-es-jegyzetek/tanulastamogatas.json',newPage({id:'page:000069',title:'Tanulástámogatás és időgazdálkodás',label:'Tanulástámogatás',route:'#/tanulastamogatas',slug:'tanulastamogatas',category:'oktatas',media:'media:oktatas',summary:'Gyakorlati tanulási módszerek, személyes célok és helyi időmérő eszközök.',blocks:[
 section('tanulas-lepesek','Felkészülés egyszerű lépésekben','Bontsd a tananyagot kisebb részekre, tűzz ki elérhető célokat, és minden gyakorlás után röviden foglald össze, mire emlékszel. A sport és a tanulás összehangolásakor hagyj időt a pihenésre is.'),
 section('tanulas-eszkozok','Tanulási eszközök','Az eddigi honlap helyben futó **tanulási időzítője, tanulókártyája és saját céljaid nyilvántartása** továbbra is működik: [a tanulástámogató eszközök megnyitása](megkozelites-es-tanulas.html#tanulas). Ezek az adatok a saját böngésződben maradnak.'),
 section('tanulas-kapcsolatok','Kapcsolódó oldalak','[Digitális tananyagközpont](#/oktatas/tananyagok-es-jegyzetek) · [Digitális kultúra](#/oktatas/digitalis-kultura) · [Dokumentumtár](#/informaciok/dokumentumtar)')
 ],tags:['tanulás','időgazdálkodás','tanulókártyák']}));
write('json/oldalak/informaciok/mindennapi-tudnivalok/megkozelites.json',newPage({id:'page:000070',title:'Megközelítés és érkezés',label:'Megközelítés',route:'#/megkozelites-es-erkezes',slug:'megkozelites',category:'informaciok',media:'media:kapcsolat',summary:'Az iskola címe, utazási lehetőségek és ellenőrzött érkezési tudnivalók egy helyen.',blocks:[
 section('erkezes-cim','Hol található az iskola?','**Csanádi Árpád Sportiskola, Általános Iskola és Gimnázium**\n\n1143 Budapest, Őrnagy utca 5–7.\n\n[A térkép és az útvonaltervezés megnyitása](#/megkozelites-es-erkezes/terkep)'),
 section('erkezes-kozlekedes','Tömegközlekedés és érkezés','A környéken az Őrnagy utca, a Várna utca és a Puskás Ferenc Stadion M megálló felől tervezhető útvonal. Az aktuális járatokat, átszállásokat és forgalmi változásokat a [BKK hivatalos menetrendjében](https://bkk.hu/menetrendek/) ellenőrizd.\n\nA pontos belépési pontot és a látogatói fogadás rendjét indulás előtt egyeztesd az iskolával.'),
 section('erkezes-akadalymentes','Akadálymentes érkezés','Az akadálymentes bejárat, lépcsőmentes útvonal, lift vagy parkoló részleteiről jelenleg nincs intézményileg igazolt, közzétehető adat. Az útvonal megtervezése előtt kérj közvetlen tájékoztatást az [iskolától](#/kapcsolat).'),
 section('erkezes-szetszedes','Tanulási eszközöket keresel?','A tanulási időzítő, a céltervező és a tanulókártyák külön, a [Tanulástámogatás](#/tanulastamogatas) oldalon érhetők el.')
 ],tags:['megközelítés','érkezés','közlekedés','iskola címe']}));
write('json/oldalak/informaciok/mindennapi-tudnivalok/terkep.json',newPage({id:'page:000071',title:'Térkép és útvonaltervezés',label:'Térkép és útvonalak',route:'#/megkozelites-es-erkezes/terkep',slug:'terkep',category:'informaciok',media:'media:kapcsolat',summary:'Helyi hozzájárulásos térkép, közlekedési kapcsolatok és érkezési segítség.',blocks:[
 section('erkezes-terkep','Interaktív térkép','A térkép csak a „Térkép betöltése” gombra kattintva kapcsolódik a külső OpenStreetMap szolgáltatáshoz. A jelölő az iskola **hozzávetőleges** helyét mutatja; nem igazol pontos bejáratot.'),
 section('erkezes-utvonalak','Útvonaltervezési tudnivalók','**Tömegközlekedés:** [BKK menetrendek](https://bkk.hu/menetrendek/).\n\n**Gyalog és kerékpárral:** indulás előtt tervezz biztonságos útvonalat, és ellenőrizd a helyi közlekedési feltételeket.\n\n**Akadálymentesség:** a konkrét bejárat és útvonal intézményi megerősítést igényel.\n\n[Vissza a Megközelítés és érkezés oldalra](#/megkozelites-es-erkezes)')
 ],tags:['térkép','útvonal','BKK','OpenStreetMap']}));
const index=read('json/oldalindex.json');
const structure=read('json/structure.json');
const paths=['oldalak/oktatas/digitalis-kultura.json','oldalak/oktatas/digitalis-kultura/online-biztonsag.json','oldalak/oktatas/digitalis-kultura/mesterseges-intelligencia.json','oldalak/oktatas/tananyagok-es-jegyzetek/tanulastamogatas.json','oldalak/informaciok/mindennapi-tudnivalok/megkozelites.json','oldalak/informaciok/mindennapi-tudnivalok/terkep.json'];
const textOf=obj=>{if(typeof obj==='string')return obj;if(Array.isArray(obj))return obj.map(textOf).join(' ');if(!obj||typeof obj!=='object')return '';return ['title','text','summary','description','data','children'].map(k=>textOf(obj[k])).join(' ');};
for(const relative of paths){
 const page=read('json/'+relative);
 index.pages[relative]={id:page.id,title:page.title,menuLabel:page.menuLabel,summary:page.summary,tags:page.tags,categories:page.categories,lifecycle:{status:page.lifecycle.status},schemaExtensions:page.schemaExtensions,searchText:textOf(page.blocks).replace(/\s+/g,' ').slice(0,12000),blocks:[]};
}
write('json/oldalindex.json',index);
const all=[];const walk=(nodes,depth=1)=>{for(const node of nodes||[]){all.push({node,depth});walk(node.children,depth+1);}};walk(structure.nodes);
for(const {node,depth} of all){if(depth>3)throw Error('Harmadiknál mélyebb oldalfát találtunk');if(!fs.existsSync(path.join(root,'json',node.path)))throw Error('Hiányzó oldal '+node.path);}
const visible=all.filter(({node,depth})=>depth===1||depth===2&&node.menuVisible!==false);
if(structure.nodes.length!==6||visible.length!==34)throw Error('Módosult a jóváhagyott 6+28 menü.');
console.log('Tartalomszétbontás készen:',Object.keys(index.pages).length,'oldal, 6 főmenü és 28 almenü.');
