/* Szerkesztőileg megfogalmazott, intézményi tényállítás nélküli oldalleírások.
   Csak a már létező, jóváhagyásra szoruló oldalak összefoglalóját és SEO-leírását egészíti ki. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=rel=>path.join(root,rel),read=rel=>JSON.parse(fs.readFileSync(file(rel),'utf8'));
const source=read('dokumentacio/TARTALMI_MINOSEG_V1_39_8.json');
const index=read('json/oldalindex.json');
const notes={
 '000002':'Fedezd fel az intézmény múltját, közösségi értékeit és a sportot a tanulással összekapcsoló szemléletét.',
 '000003':'Az oldal bemutatja a zuglói iskolát, a közös értékeket és a további képzési tájékozódás útvonalait.',
 '000064':'Ismerd meg a pedagógiai együttműködés és a tanárokkal való hivatalos kapcsolattartás lehetőségeit.',
 '000005':'Az iskolatörténeti mérföldkövek, a sportiskolai korszak és a további források egy oldalon követhetők.',
 '000006':'Olvass a mindennapi hagyományokról, valamint a nyilvánosan ellenőrizhető eredmények bemutatásának módjáról.',
 '000007':'A sportolói örökség és a közzétett eredmények segítenek megismerni az iskola büszkeségeit.',
 '000010':'A partnerségek szerepéről, az együttműködési területekről és a kapcsolatfelvételről találsz útmutatót.',
 '000009':'Az alapítvány szerepét és a támogatási lehetőségekről szóló hivatalos tájékozódás módját mutatja be.',
 '000008':'Környezeti nevelés, fenntarthatóság és az iskolai hétköznapok felelős szokásai kerülnek előtérbe.',
 '000011':'Innen érhetők el a képzések, a jelentkezési tájékoztatók, a vizsgák és a tanulási segédanyagok.',
 '000012':'Az általános iskolai és gimnáziumi lehetőségek mellett a tanulmányi követelményekhez is vezet út.',
 '000013':'A családok az iskolakezdésről, az alapozó tanulásról és a beiratkozási forrásokról tájékozódhatnak.',
 '000014':'A középiskolai tanulmányok, a továbbtanulás és a felvételi tájékoztatók kapcsolódnak egymáshoz.',
 '000015':'Az oldal a tanulmányi feladatok és a sportolói felkészülés közös tervezésének szempontjait járja körül.',
 '000025':'A tanév szervezéséhez kapcsolódó fontos időszakok és a kapcsolódó információs oldalak érhetők el.',
 '000026':'A jelenlegi tanév szervezési adatait és az események hivatalos ellenőrzési forrásait gyűjti össze.',
 '000027':'Az archívum a korábbi évek dokumentumainak és eseményeinek visszakeresésében nyújt segítséget.',
 '000021':'A vizsgaidőszakokhoz, követelményekhez és hivatalos tájékoztatókhoz vezető hivatkozások találhatók itt.',
 '000022':'A vizsgaidőszakok, a felkészülési tudnivalók és az eredeti hivatalos források együtt szerepelnek.',
 '000023':'A felkészülés tervezéséről, a követelmények ellenőrzéséről és az érvényesség vizsgálatáról olvashatsz.',
 '000024':'Megtudhatod, mely forrásokból ellenőrizhetők a nem érettségi jellegű tanulmányi vizsgák feltételei.',
 '000030':'Tanulási módszerek, digitális fájlkezelési gyakorlat és önálló felkészülést támogató eszközök érhetők el.',
 '000069':'Tanulási célok, feladatbontás és helyben használható időmérők segítik az önálló munkát.',
 '000028':'A könyvtár szerepét, a tudatos keresést és a forráskritikus olvasás gyakorlati szempontjait mutatja be.',
 '000029':'A kölcsönzés és a könyvtári tájékozódás lehetőségeiről, valamint további forrásokról olvashatsz.',
 '000067':'Gyakorlati tanácsok a jelszavak, a személyes adatok és a felelős digitális kommunikáció kezeléséhez.',
 '000068':'Forráskritika, ellenőrzés, saját gondolkodás és a generatív eszközök tudatos iskolai felhasználása.',
 '000016':'A két beiskolázási út, a hivatalos dokumentumok és a jelentkezés lépései külön is megismerhetők.',
 '000017':'A családok a szükséges tájékoztatókat és az első osztályos beiratkozás hivatalos felületeit találják meg.',
 '000018':'Segítség a középiskolai jelentkezés sorrendjéhez, az igazolt határidőkhöz és a dokumentumokhoz.',
 '000019':'Ismerd meg a tájékozódási alkalmak célját, a részvétel feltételeit és a hivatalos időpontellenőrzést.',
 '000020':'A jelentkezések, értesítések és beiratkozások időrendjét csak megerősített források alapján szabad követni.',
 '000031':'A sportági lehetőségeket, sportolói történeteket és hiteles eredményekre vezető oldalakat fogja össze.',
 '000032':'Csapat- és egyéni sportágak, felkészülési szempontok és a kapcsolódó sportiskolai tartalmak.',
 '000034':'A leendő sportolóprofilok, a hiteles eredmények és a közzétételi feltételek ismertetője.',
 '000035':'A csapatprofilok felépítését és a megerősített sportági adatok közzétételének szabályait ismerteti.',
 '000036':'Az edzői szerepkörök mellett bemutatja, hogyan jelenhetnek meg hiteles szakmai profilok.',
 '000033':'A név szerint ellenőrizhető sporteredmények és a nyilvános eredményjegyzékek eléréséhez vezet.',
 '000037':'Tematikus fotók és a sportiskolai mindennapokat bemutató képes tartalmak gyűjtőhelye.',
 '000038':'Keresd meg az iskolai közleményeket, a sporthíreket, az eseménynaptárt és a korábbi híreket.',
 '000039':'A hírek tematikus csoportjai és a forrásokkal ellenőrizhető iskolai beszámolók jelennek meg.',
 '000040':'A közösségi tájékoztatók és hivatalos iskolai közlemények áttekintése, forrásmegjelöléssel.',
 '000041':'A sportolói teljesítményekről és versenybeszámolókról szóló ellenőrizhető hírek gyűjtőoldala.',
 '000044':'Az ellenőrzött események havi, heti és napi nézete, valamint a programokhoz kapcsolódó részletek.',
 '000045':'A közösségi, tanulmányi és iskolai programok szervezési információi és naptárbejegyzései.',
 '000046':'A versenyek és sportprogramok típusairól, az időpontok és eredmények ellenőrzéséről tájékoztat.',
 '000043':'A lényeges tudnivalók és közzétett intézményi közlemények visszakeresését támogatja.',
 '000042':'Az időrendi archívum segít a korábbi intézményi hírek és történetek újbóli megtalálásában.',
 '000047':'A mindennapi ügyintézéshez kapcsolódó oldalak és a dokumentumok gyors elérési pontja.',
 '000048':'Napirend, étkezési információk és szülői ügyintézés témájában vezet tovább a megfelelő oldalakra.',
 '000049':'A tanórai időrend és az élő visszaszámlálás mellett az eredeti intézményi tájékoztatás is elérhető.',
 '000050':'Az étkezési ügyintézés, a befizetés és a lemondás tudnivalóihoz kínál hivatalos forrásokat.',
 '000051':'Kapcsolattartás, szülői igazolások és a hétköznapi adminisztráció fontos tájékozódási pontjai.',
 '000070':'Cím, közlekedési lehetőségek, útvonaltervezés és az érkezés előkészítésének gyakorlati részletei.',
 '000071':'A helyi térképes nézet és a gyalogos, kerékpáros, tömegközlekedési tájékozódás lehetőségei.',
 '000052':'Keress intézményi szabályzatokat, nyomtatványokat és tanulási segédleteket átlátható gyűjteményben.',
 '000053':'Az alapdokumentumok, változatok és hivatalos szabályzatok ellenőrzéséhez nyújt útmutatót.',
 '000054':'A nyomtatványok használatáról és a jóváhagyott, letölthető űrlapok eléréséről olvashatsz.',
 '000055':'A dokumentumok közzétételének szerepéről és a változatok ellenőrzésének módjáról szól.',
 '000056':'Digitális belépések, elektronikus fájlbeküldés és biztonságos ügyintézési csatornák.',
 '000057':'A közösségi szolgálat tervezési, igazolási és tájékozódási lépéseit gyűjti össze.',
 '000058':'Gyakorlati tudnivalók a feladatok megszervezéséhez, dokumentálásához és igazolásához.',
 '000059':'A szabályozási háttér eredeti, naprakész szövegének ellenőrzéséhez vezető tájékoztatás.',
 '000060':'A szolgálathoz kapcsolódó dokumentumok, nyilvántartások és jóváhagyott űrlapok gyűjteménye.',
 '000063':'Kapcsolattartási adatok, intézményi elérhetőségek és térképes megközelítési információk.',
 '000062':'Az adatkezelési dokumentumok ellenőrzését és a biztonságos digitális használatot segíti.'
};
const limit=(text,max=162)=>{
 if(text.length<=max)return text;
 const cut=text.slice(0,max);const at=Math.max(cut.lastIndexOf('. '),cut.lastIndexOf('; '));
 if(at>95)return cut.slice(0,at+1);
 const space=cut.lastIndexOf(' ');return cut.slice(0,space>100?space:max).replace(/[,:; ]+$/,'')+'.';
};
const changes=[];let summaries=0,descriptions=0;
for(const item of source.pageResults){
 const shortSummary=item.issues.some(i=>i.category==='short-summary');
 const shortSeo=item.issues.some(i=>i.category==='short-seo');
 if(!shortSummary&&!shortSeo)continue;
 const page=read(item.file),id=page.id.split(':').pop();
 const note=notes[id];if(!note)throw Error(`Nincs szerkesztői javaslat: ${page.id} ${item.file}`);
 const originalSummary=page.summary,originalSeo=page.seo.description;
 if(shortSummary){page.summary=`${originalSummary.trim()} ${note}`;summaries++;}
 if(shortSeo){page.seo.description=limit(`${originalSeo.trim()} ${note}`);descriptions++;}
 if(page.summary.length<75||page.seo.description.length<90||page.seo.description.length>165)throw Error('Metaadat továbbra is hibás: '+item.file);
 page.updatedAt='2026-11-17T18:30:00+01:00';page.lifecycle.revision=(page.lifecycle.revision||0)+1;
 const relative=item.file.replace(/^json\//,'');
 index.pages[relative].summary=page.summary;
 index.pages[relative].lifecycle.revision=page.lifecycle.revision;
 fs.writeFileSync(file(item.file),JSON.stringify(page,null,2)+'\n');
 changes.push({file:item.file,id:page.id,route:item.route,summaryBefore:originalSummary,summaryAfter:page.summary,seoBefore:originalSeo,seoAfter:page.seo.description});
}
fs.writeFileSync(file('json/oldalindex.json'),JSON.stringify(index,null,2)+'\n');
fs.writeFileSync(file('dokumentacio/METAADAT_JAVITAS_V1_39_9.json'),JSON.stringify({release:'1.39.9',pagesChanged:changes.length,summaries,descriptions,changes,policy:'Meglévő oldalhoz illő, általános szerkesztői megfogalmazás; nem új hivatalos tény vagy dátum. A kézi intézményi felülvizsgálat külön továbbra is szükséges.'},null,2)+'\n');
console.log(JSON.stringify({pagesChanged:changes.length,summaries,descriptions}));
