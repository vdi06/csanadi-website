import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Egyszeri, megismételhető szerkesztői átvezetés. A korábbi ZIP-eket nem módosítja.
// A források megtekintése NEM egyenértékű az intézmény közzétételi jóváhagyásával.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file=p=>path.join(root,p);
const read=p=>JSON.parse(fs.readFileSync(file(p),'utf8'));
const write=(p,value)=>fs.writeFileSync(file(p),JSON.stringify(value,null,2)+'\n');
const stamp='2026-11-17T15:00:00+01:00';

const sources={
  home:['Az intézmény hivatalos nyitóoldala','https://csanadi-bp.edu.hu/'],
  contact:['Hivatalos kapcsolati és adatvédelmi elérhetőségek','https://csanadi-bp.edu.hu/kapcsolat.html'],
  history:['Intézményi történet és névadó','https://csanadi-bp.edu.hu/tortenet.html'],
  foundation:['Az iskolai alapítvány tájékoztatója','https://csanadi-bp.edu.hu/alapitvany.html'],
  awards:['Iskolai elismerések','https://csanadi-bp.edu.hu/awards.html'],
  pride:['Az iskola közzétett büszkeséglistája','https://csanadi-bp.edu.hu/buszkeseg.html'],
  eco:['Ökoiskolai program','https://csanadi-bp.edu.hu/oko.html'],
  documents:['Intézményi dokumentumok','https://csanadi-bp.edu.hu/docs.html'],
  disclosure:['Közzétételi lista','https://csanadi-bp.edu.hu/kozzetetel.html'],
  parents:['Szülői nyomtatványok','https://csanadi-bp.edu.hu/szulok.html'],
  meals:['Ebédbefizetés és étkezés','https://csanadi-bp.edu.hu/ebed.html'],
  bells:['Hivatalos csengetési rend','https://csanadi-bp.edu.hu/csengetes.html'],
  jobs:['Iskolai álláspályázatok','https://csanadi-bp.edu.hu/allas.html'],
  schoolAdmission:['Első évfolyamos beiratkozás','https://csanadi-bp.edu.hu/altisk.html'],
  highAdmission:['Gimnáziumi felvételi dokumentumok','https://csanadi-bp.edu.hu/felveteli.html'],
  finalExam:['Érettségi – intézményi tájékoztató','https://csanadi-bp.edu.hu/erettsegi.html'],
  placementExam:['Osztályozó vizsgák (a közzétett 2025-ös beosztással)','https://csanadi-bp.edu.hu/osztalyozo.html'],
  notes:['Intézményi jegyzetek','https://csanadi-bp.edu.hu/sportjegyzet.html'],
  service:['Közösségi szolgálat – koordinátor','https://csanadi-bp.edu.hu/kozszol.html'],
  serviceRules:['Közösségi szolgálat – eljárás és korábban közzétett szabályok','https://csanadi-bp.edu.hu/kozszolinfo.html'],
  serviceForms:['Közösségi szolgálati nyomtatványok','https://csanadi-bp.edu.hu/kozszoldokuk.html']
};
const sourceFor=route=>{
  if(route==='#/kapcsolat'||route.startsWith('#/megkozelites-es-erkezes'))return 'contact';
  if(route==='#/iskolank/tortenet')return 'history';
  if(route==='#/iskolank/alapitvany')return 'foundation';
  if(route==='#/iskolank/hagyomanyok-es-elismeresek')return 'awards';
  if(route==='#/iskolank/buszkesegeink'||route==='#/sport/sporteredmenyek'||route==='#/sport/sportagak')return 'pride';
  if(route==='#/iskolank/oko-iskola')return 'eco';
  if(route==='#/informaciok/adatvedelem'||route.includes('/dokumentumtar/szabalyzatok')||route==='#/informaciok/dokumentumtar')return 'documents';
  if(route.includes('/dokumentumtar/kozzeteteli-lista')||route.startsWith('#/oktatas/tanevek'))return 'disclosure';
  if(route.includes('/dokumentumtar/nyomtatvanyok')||route.endsWith('/szuloi-informaciok'))return 'parents';
  if(route.endsWith('/etkezes'))return 'meals';
  if(route.endsWith('/csengetesi-rend')||route==='#/informaciok/mindennapi-tudnivalok')return 'bells';
  if(route.endsWith('/allaspalyazatok'))return 'jobs';
  if(route.includes('/kozossegi-szolgalat/kozossegi-dokumentumok'))return 'serviceForms';
  if(route.includes('/kozossegi-szolgalat/kozossegi-jogszabalyok')||route.includes('/kozossegi-szolgalat/kozossegi-tudnivalok'))return 'serviceRules';
  if(route.startsWith('#/informaciok/kozossegi-szolgalat'))return 'service';
  if(route.includes('/felveteli/elso-evfolyam')||route.includes('/kepzeseink/altalanos-iskola'))return 'schoolAdmission';
  if(route.includes('/felveteli')||route.includes('/kepzeseink/gimnazium'))return 'highAdmission';
  if(route.includes('/vizsgak/osztalyozo-vizsgak'))return 'placementExam';
  if(route.includes('/vizsgak/erettsegi')||route==='#/oktatas/vizsgak')return 'finalExam';
  if(route.includes('/tananyagok-es-jegyzetek'))return 'notes';
  if(route.startsWith('#/iskolank')||route==='#/iskolank'||route==='#/oktatas'||route==='#/informaciok'||route==='#/sport'||route.startsWith('#/hirek-es-esemenyek'))return 'home';
  return null;
};
const internalLinkNames={
  '#/hirek-es-esemenyek':'Hírek és események',
  '#/hirek-es-esemenyek/hirek':'Hírközpont',
  '#/informaciok/dokumentumtar':'Dokumentumtár',
  '#/informaciok/dokumentumtar/kozzeteteli-lista':'Közzétételi lista',
  '#/informaciok/kozossegi-szolgalat':'Közösségi szolgálat',
  '#/oktatas/felveteli':'Felvételi központ',
  '#/iskolank/buszkesegeink':'Büszkeségeink',
  '#/kapcsolat':'Kapcsolati adatok',
  '#/oktatas/vizsgak/erettsegi':'Érettségi',
  '#/informaciok/mindennapi-tudnivalok/csengetesi-rend':'Csengetési rend',
  '#/oktatas/kepzeseink/altalanos-iskola':'Általános iskola',
  '#/informaciok/mindennapi-tudnivalok/szuloi-informaciok':'Szülői információk',
  '#/oktatas/vizsgak/osztalyozo-vizsgak':'Osztályozó vizsgák'
};
const exactUpdates={
  '#/iskolank/alapitvany':{
    remove:['Tanulásért és Sportért Iskolai Alapítvány'],
    change:{
      'Hivatalos ismertető':'Az alapítvány támogatásának feltételeiről, kérelmeiről és közzétett adatairól az intézményi oldalon lehet tájékozódni. Adományozás vagy az adó 1%-ának felajánlása előtt mindig ellenőrizd az ott megadott bankszámlaszámot és adószámot.'
    }
  },
  '#/informaciok/allaspalyazatok':{
    change:{
      'Jelenlegi állapot':'Az iskola hivatalos állásoldalán karbantartói és digitális kultúra szakos pedagógusi lehetőség is szerepel a 2026. november 17-i ellenőrzéskor. Ez nem valós idejű álláslista: a betöltöttség, a jelentkezési határidő és a munkavégzés feltételei változhatnak. Jelentkezés előtt az eredeti kiírást és az intézményi elérhetőséget ellenőrizd.',
      'Az iskola álláshirdetései':'A hivatalosan közzétett digitális kultúra (informatika) szakos feladat a megtekintett leírás szerint határozott idejű, 2027. június 18-ig tartó jogviszony, heti 4 órás megbízás keretében. Az oldal karbantartói feladatkört is megnevez. Ez 2026. november 17-i állapotfelvétel, nem álláshirdetési garancia.'
    }
  },
  '#/informaciok/dokumentumtar':{
    remove:['Hivatalos dokumentumok','Hivatalos dokumentumok megnyitása'],
    change:{
      'Hivatalos intézményi dokumentumok':'A pedagógiai program, a házirend, az SZMSZ, a helyi tantervek, a munkaterv és az adatkezelési tájékoztatók az iskola eredeti dokumentumoldalán érhetők el. A beépített PDF-kereső ezzel szemben külön, fejlesztői tanulási segédleteket is tartalmaz. **A két dokumentumtípust ne kezeld azonos jóváhagyásúként.**'
    }
  },
  '#/oktatas/konyvtar':{
    remove:['Miben segíthet a könyvtár?','Kölcsönzés és tájékozódás'],
    change:{
      'Könyvtári és tanulási tájékozódás':'A könyvtárhasználat gyakorlati tudnivalóit a [Könyvtári szolgáltatások](#/oktatas/konyvtar/konyvtari-szolgaltatasok) aloldalon találod. Nyitvatartást és kölcsönzési határidőt nem állítunk intézményi igazolás nélkül; ilyen kérdésben az [iskolai kapcsolati oldal](#/kapcsolat) segít.'
    }
  },
  '#/informaciok/mindennapi-tudnivalok/csengetesi-rend':{
    change:{
      'Eredeti időbeosztás':'A nyolc tanítási óra kezdő és befejező időpontjának egyetlen karbantartott adatsora a `json/adatok/csengetesi-rend.json` állományban szerepel. A mai napot mutató óra és a visszaszámláló ezt a központi adatkészletet használja. Kivételes tanítási nap esetén külön intézményi közlés az irányadó.',
      'Hivatalos csengetési rend':'Az első óra 8:00-kor kezdődik, a nyolcadik 15:00-kor ér véget. A 5–8. óra nem mind 45 perces; az időpontokat a megjelenő központi csengetési táblázatból olvasd le. Az általános iskolai ügyelet az iskola tájékoztatása szerint tanítási napokon 7:00–18:00 között működik.'
    }
  },
  '#/informaciok/mindennapi-tudnivalok/etkezes':{
    change:{
      'Étkezés és ebédbefizetés':'A hivatalos tájékoztató szerint a következő havi ebéd internetes befizetése a hónap ötödik napjától válik elérhetővé. A következő naptól érvényes rendelést 9:00-ig lehet lemondani. A belépési adatokhoz az iskola gazdasági irodája nyújt segítséget; az aktuális étlapokat az étkeztető teszi közzé. A részletes, esetleg módosult szabályokat fizetés vagy lemondás előtt az eredeti oldalon ellenőrizd.'
    }
  },
  '#/informaciok/kozossegi-szolgalat':{
    change:{
      'Közösségi szolgálat az érettségi előtt':'A jogszabályi alap szerinti 50 órás iskolai közösségi szolgálatot az intézmény által megadott rendben kell dokumentálni. A Csanádi hivatalos koordinátori elérhetősége a 2026. november 17-i közlésben Horváth-Szabó Erika (horvath-szabo.erika@csanadiiskola.hu). A konkrét helyszínt és feladatot indulás előtt egyeztesd a koordinátorral.'
    }
  },
  '#/informaciok/kozossegi-szolgalat/kozossegi-dokumentumok':{
    change:{
      'Szolgálati dokumentumok':'Az intézményi nyomtatványoldalon kötelező jelentkezési lapot, kétpéldányos együttműködési megállapodást, adott helyzetben befogadó nyilatkozatot, beszámolót és szolgálati naplót sorolnak fel. Ezeket csak a hivatalos eredeti állományból töltsd le; az iskola helyi elszámolási szabályait egyeztesd a koordinátorral.'
    }
  },
  '#/informaciok/kozossegi-szolgalat/kozossegi-jogszabalyok':{
    change:{
      'Jogszabályi háttér és ellenőrzés':'Az intézmény közösségi szolgálati tájékoztatója a 2011. évi CXC. törvényt és a 20/2012. (VIII. 31.) EMMI rendeletet ismerteti, de a közölt szöveg korábbi állapotot is tükrözhet. Jogi ügyintézéskor a hatályos jogszabályt ellenőrizd; az iskola oldalát eljárási segédletként kezeld.'
    }
  },
  '#/iskolank/tortenet':{
    change:{
      'A kezdetektől a saját épületig':'Törökőr iskolájának kezdeteit az intézmény történeti összefoglalója mutatja be. Az eredeti szöveg elején **1887**, ugyanott később **1897** szerepel a Várna utcai kezdeteknél, ezért a kezdőév pontos feloldása intézményi egyeztetést igényel. Az Őrnagy utcai épület átadásának dátuma egyértelműen 1904. október 18.; ott a tanítás másnap indult.',
      'Iskolatörténeti mérföldkövek':'A megbízhatóan elkülöníthető későbbi állomások: az Őrnagy utcai épület megnyitása (1904), a Központi Sportiskola bázisiskolai szerepe (1987), gimnáziumi osztályok indulása (1988/1989), a Csanádi Árpád név felvétele (1989. május 25.) és az 1998-as olimpiai érdemérem. A Várna utcai kezdetek 1887/1897-es eltérését a hivatalos szöveg tisztázásáig nem tesszük az idővonal ellenőrzött eseményei közé.'
    }
  },
  '#/informaciok/adatvedelem':{
    change:{
      'Adatkezelés és adatbiztonság':'Az intézmény hivatalos dokumentumoldala külön adatkezelési szabályzatot, általános tájékoztatót és kamerás megfigyeléshez kapcsolódó tájékoztatót tesz elérhetővé. Az adatvédelmi tisztviselő elérhetősége a hivatalos kapcsolati oldalon szerepel. Képmás, tanulói névsor vagy személyes ügyintézési adat közzététele előtt az alkalmazandó tájékoztatót és hozzájárulási feltételeket kell ellenőrizni.'
    }
  },
  '#/iskolank/bemutatkozas':{
    remove:['Közös iskolai és sportolói út'],
    change:{
      'Iskola Zugló szívében':'A **{{site.name}}** címe **{{site.address}}**, OM-azonosítója **{{site.omIdentifier}}**. Általános iskolai és gimnáziumi közismereti oktatása sportiskolai felkészüléssel kapcsolódik össze. A képzési részletekért a [Képzéseink](#/oktatas/kepzeseink), a jelentkezésért a [Felvételi](#/oktatas/felveteli) oldalt keresd.'
    }
  },
  '#/megkozelites-es-erkezes':{
    change:{
      'Hol található az iskola?':'**{{site.name}}**\n\n**{{site.address}}**\n\n[A térkép és az útvonaltervezés megnyitása](#/megkozelites-es-erkezes/terkep)'
    }
  },
  '#/sport/csapatok':{
    change:{
      'Hiteles adatok nélkül nincs névsor':'A csapatnév, a sportág, a korosztály, a következő nyilvános mérkőzés és a sporteredmény **külön adat**. A csapatok oldala jelenleg nem tartalmaz jóváhagyott névsort vagy edzésidőpontot, ezért itt nem szerepelnek kitalált játékosnevek. [Sporteredmények](#/sport/sporteredmenyek) · [Sportágak](#/sport/sportagak)',
      'Csapatsportok eredményei':'A vízilabdához és kézilabdához kapcsolódó eredményeket az iskola közzétett sporthírei között lehet keresni. Egy versenyeredmény nem jelenti azt, hogy az adott névsor ma is érvényes. Csapatprofilt csak jóváhagyott korosztály-, edző- és időadatokkal lehet megjelentetni.'
    }
  },
  '#/sport/edzok':{
    change:{
      'Név szerinti edzői adatok':'Az edzői bemutatkozásnál a sportágat, a szakmai feladatot, a korosztályt és – csak intézményi engedéllyel – a nyilvános kapcsolattartási módot érdemes feltüntetni. **Név szerinti edzőlista, portré és edzésbeosztás még nincs jóváhagyva ezen a felületen.** [Sportiskolai nevelés](#/oktatas/kepzeseink/sportiskolai-neveles) · [Kapcsolat](#/kapcsolat)',
      'Edzői munka':'A sportági felkészítés és a közismereti tanulmányok összehangolása közös feladat. A szülői vagy egyesületi megkereséshez az iskola hivatalos kapcsolattartását használd; tanulók személyes edzésadatait és közvetlen edzői elérhetőségeit nem gyűjtjük ellenőrzés nélkül.'
    }
  },
  '#/sport/sportolok':{
    change:{
      'Jelenlegi állapot':'Ez nem élő tanulói névsor: az iskola jelenlegi sportolóiról név, korosztály, csapat vagy fotó csak előzetes intézményi adatkezelési és közzétételi ellenőrzés után jelenhet meg. A nyilvános, történeti sikereket a [Sporteredmények](#/sport/sporteredmenyek) és a [Büszkeségeink](#/iskolank/buszkesegeink) tartalmazzák.',
      'Sportolói bemutatkozások':'A sportolóprofil szigorúan különbözik a korábbi tanítványok nyilvános eredményjegyzékétől. Az itt megjelenő általános sportági példák nem valós, azonosítható diákok adatlapjai. A jelenlegi tanulókról az intézmény jóváhagyása nélkül nem közlünk sem teljesítményadatot, sem képet.'
    }
  },
  '#/sport/sportagak':{
    change:{
      'Sportágak és felkészülés':'A hivatalos büszkeséglista kajak-kenu, vízilabda, birkózás, torna, gyorskorcsolya, vívás és más sportágak eredményeit is felvonultatja. **Ez történeti eredményjegyzék, nem az aktuálisan választható iskolai sportági képzések listája.** A jelentkezés előtt a képzési kínálatot a [Felvételi](#/oktatas/felveteli) oldalon és az intézménynél kell megerősíteni.'
    }
  },
  '#/sport/sportgaleriak':{
    change:{
      'Képek és sportélet':'A jelenlegi gyűjtemény tematikus sportképeket és bemutató montázsokat is tartalmaz. **Egy illusztráció nem egyenértékű hiteles iskolai eseményfotóval.** Eseményhez rendelhető személyes képeket, neveket és eredményeket csak jogszerű, intézményi jóváhagyással lehet publikálni. A közzétett versenyadatokat a [Sporteredmények](#/sport/sporteredmenyek) oldalon keresd.'
    }
  },
  '#/informaciok/mindennapi-tudnivalok/szuloi-informaciok':{
    change:{
      'Szülői dokumentumok és igazolások':'A hivatalos szülői oldalon külön nyomtatvány szerepel a 14 év alatti gyermek jogszerű távollétéhez, az egyesületi sportolói igazoláshoz, a napközis és tanulószobai igénybevételhez, az egyéni tanrendhez és a személyes adatok felhasználásához. A dokumentumokat mindig az **eredeti intézményi oldalon** nyisd meg, mert a fájlverzió és a benyújtási rend változhat.'
    }
  },
  '#/informaciok/dokumentumtar/szabalyzatok':{
    change:{
      'Alapdokumentumok':'A pedagógiai program a nevelési kereteket, a helyi tantervek a tantárgyi tartalmakat, a házirend a mindennapi működés szabályait, az SZMSZ az intézményi szervezetet írja le. Adatvédelmi ügyben az adatkezelési tájékoztató és a kamerarendszerre vonatkozó külön dokumentum is fontos. Mindegyiket közvetlenül az iskola dokumentumtárából érdemes megnyitni.'
    }
  },
  '#/informaciok/dokumentumtar/nyomtatvanyok':{
    change:{
      'Letölthető nyomtatványok':'A szülői igazolás, a sportegyesületi igazolás, a napközis és tanulószobai nyilatkozat, a felvételi lapok és a közösségi szolgálati iratok **más-más eljáráshoz tartoznak**. Kezdd a [Szülői információknál](#/informaciok/mindennapi-tudnivalok/szuloi-informaciok), a [Felvételinél](#/oktatas/felveteli) vagy a [Közösségi szolgálati dokumentumoknál](#/informaciok/kozossegi-szolgalat/kozossegi-dokumentumok), és ott az eredeti fájl aktuális változatát használd.'
    }
  },
  '#/oktatas/felveteli/elso-evfolyam':{
    change:{
      'Első osztály: szükséges tájékoztatók':'Az iskola első évfolyamos beiratkozási oldalán a beiskolázási kiadvány, a tankerületi felhívás, a KRÉTA BÁI használati útmutatója, a szülői nyilatkozat és az erkölcstan/hit- és erkölcstan választásáról szóló nyilatkozat található. **A beiratkozás időpontját és eljárását minden tanévben a friss tankerületi felhívással kell ellenőrizni.**'
    }
  },
  '#/oktatas/felveteli/kilencedik-evfolyam':{
    change:{
      'Kilencedik évfolyam: felvételi lépések':'A 9. évfolyamra jelentkezéshez külön intézményi tájékoztató, központi írásbeli jelentkezési dokumentum, helyi jelentkezési lap és KRÉTA BKI-útmutató található a Csanádi felvételi oldalán. Az írásbelire való jelentkezés és a középfokú felvételi lapok leadása két eltérő lépés. A 2027-es eljárás országos dátumait a [Felvételi határidők](#/oktatas/felveteli/felveteli-hataridok) oldalon követheted, a helyi követelményeket pedig az eredeti intézményi kiírásban.'
    }
  },
  '#/oktatas/vizsgak/osztalyozo-vizsgak':{
    change:{
      'Osztályozó vizsga: évszámellenőrzés':'A Csanádi nyilvános osztályozóvizsga-oldalán a megtekintéskor **2025. április 1–15.** közötti beosztások szerepelnek. Ezek archív adatok, 2026/2027-es vizsgaidőpontnak nem vehetők át. Az érintett tantárgy, vizsgakövetelmény, jogosultság és helyszín ellenőrzéséhez az iskola aktuális egyéni tájékoztatása szükséges.'
    }
  },
  '#/oktatas/vizsgak/erettsegi':{
    change:{
      '2026 őszi érettségi – közzétett időpontok':'Az iskola 2026. őszi középszintű írásbeli időpontjai között az október 12-i magyar és földrajz, a 13-i matematika, a 14-i történelem és a 15-i angol szerepel. A dolgozatmegtekintés november 3-án volt. A november 18-i szóbelihez a közzétett **legkésőbbi érkezés 7:30**. Ez a 2026. őszi vizsgaidőszak tájékoztatója, nem az összes jövőbeli érettségi naptára.'
    }
  },
  '#/oktatas/tanevek/korabbi-tanevek':{
    change:{
      'Archív tanévi anyagok':'A korábbi tanévek eseményei és dokumentumai csak az **eredeti évszámmal** használhatók. Például a 2025-ös osztályozóvizsga-beosztás a történeti tájékozódást szolgálja, nem alkalmazható a 2026/2027-es tanévben. Ha egy archív irat nem érhető el hiteles, letölthető változatban, az adatát nem tüntetjük fel aktuális követelményként.'
    }
  },
  '#/hirek-es-esemenyek/hirek/sporthirek':{
    change:{
      'Sporthírek és versenyeredmények':'Az ezen a felületen megjelenő, **MINTA** jelzésű sportági bejegyzések bemutatócélúak: nem hivatalos versenyeredmények. A Csanádi korábbi sportolóinak nyilvánosan közzétett teljesítményeit külön, a [Büszkeségeink](#/iskolank/buszkesegeink) oldalon lehet böngészni. Új, jelenlegi tanulót névvel vagy eredménnyel csak igazolt intézményi forrás alapján adunk a gyűjteményhez.'
    }
  },
  '#/hirek-es-esemenyek/hirek/hirarchivum':{
    change:{
      'Hírarchívum és időrend':'Az archívum a már lezárult iskolai programok és korábbi időszakok híreinek visszakeresésére való. A 2026. szeptemberi tanévnyitó és az októberi írásbeli érettségi az archív időrendbe tartozik; nem soroljuk őket a közelgő események közé. A szűrésnél a hír megjelenésének idejét különítsd el az esemény tényleges dátumától.'
    }
  },
  '#/iskolank/partnerek':{
    change:{
      'Intézményi és sportkapcsolatok':'A Csanádi fenntartója a Közép-Pesti Tankerületi Központ, amelynek elérhetősége a hivatalos kapcsolati oldalon szerepel. Az egyesületi együttműködés vagy sportolói igazolás nem jelent automatikusan nyilvános partneri névsort. A teljes, aktuális partnerlista közlése intézményi jóváhagyást igényel; ezért itt nem szerepel ellenőrizetlen szervezetnév.'
    }
  },
  '#/iskolank/tantestulet':{
    change:{
      'Kapcsolat a pedagógusokkal':'A tantestület közismereti, testnevelési és sportpedagógiai feladatokat lát el. Az aktuális tanári és osztályfőnöki névsor az intézmény jóváhagyása nélkül nem tehető közzé; személyes telefonszámot vagy e-mail-címet nem találunk ki. A megfelelő kapcsolattartót az [iskolai titkárságon](#/kapcsolat) lehet megkeresni.'
    }
  }
};

const paths=Object.keys(read('json/oldalindex.json').pages);
if(paths.length!==71)throw Error('Váratlan útvonalszám: '+paths.length);
const report={schemaVersion:'1.0.0',release:'1.39.3',reviewedAt:'2026-11-17',scope:'Mind a 71 publikált oldal; a forrásellenőrzés nem intézményi jóváhagyás.',sources:Object.fromEntries(Object.entries(sources).map(([id,[title,url]])=>[id,{title,url,checkedAt:'2026-11-17'}])),pages:[]};
const staged=[];
let changed=0,links=0,sectionsRemoved=0;
for(const relative of paths){
 const sourcePath='json/'+relative;
 const page=read(sourcePath),route=page.schemaExtensions?.route;
 if(!route||page.id!==read('json/oldalindex.json').pages[relative].id)throw Error('Oldal-index eltérés: '+relative);
 const before=JSON.stringify(page.blocks);
 const edit=exactUpdates[route]||{};
 const removed=new Set(edit.remove||[]);
 const oldLength=page.blocks.length;
 page.blocks=page.blocks.filter(b=>!removed.has(b.title));
 sectionsRemoved+=oldLength-page.blocks.length;
 const sourceId=sourceFor(route);
 for(const block of page.blocks){
  const update=edit.change?.[block.title];
  if(update!==undefined){
   const target=block.children?.find(c=>c.type==='markdown'&&typeof c.data?.text==='string');
   if(!target)throw Error('Nem szöveges blokk: '+route+' / '+block.title);
   target.data.text=update;
  }
  for(const item of block.children||[]){
   if(item.type!=='markdown'||typeof item.data?.text!=='string')continue;
   let value=item.data.text;
   for(const [href,label] of Object.entries(internalLinkNames)){
    value=value.replaceAll('[Kapcsolódó hivatalos iskolai tájékoztatás]('+href+')','['+label+']('+href+')');
   }
   value=value.replace(/(?:\n\n|^)Kapcsolódó hivatalos iskolai tájékoztatás(?=\n\n|$)/g,'');
   value=value.replace(/\n{3,}/g,'\n\n').trim();
   item.data.text=value;
  }
 }
 if(sourceId){
  const [,url]=sources[sourceId];
  const allTexts=page.blocks.flatMap(b=>b.children||[]).map(c=>c.data?.text||'').join(' ');
  if(!allTexts.includes(url)){
   const last=[...page.blocks].reverse().find(b=>b.children?.some(c=>c.type==='markdown'));
   const item=last?.children.find(c=>c.type==='markdown');
   if(!item)throw Error('Nincs szöveges blokk: '+route);
   item.data.text+='\n\n['+sources[sourceId][0]+' – eredeti intézményi forrás]('+url+')';
   links++;
  }
 }
 if(JSON.stringify(page.blocks)!==before){
  page.lifecycle.revision=(page.lifecycle.revision||1)+1;
  page.updatedAt=stamp;
  changed++;
 }
 // Kizárólag a felülvizsgálat tényét rögzítjük, nem igazolunk automatikusan minden adatot.
 const kind=/^#\/(sport\/(csapatok|edzok|sportolok)|iskolank\/(tantestulet|partnerek)|oktatas\/tanevek\/korabbi-tanevek)/.test(route)?'institutional-approval-needed'
  :/^#\/(hirek-es-esemenyek|oktatas\/felveteli|informaciok\/allaspalyazatok)/.test(route)?'time-sensitive'
  :sourceId?'primary-source-checked':'editorial-guidance';
 page.schemaExtensions.contentReview={reviewedAt:'2026-11-17',status:kind,sourceId:sourceId||null};
 if(route==='#/iskolank/tortenet')page.schemaExtensions.verifiedContent=false;
 report.pages.push({id:page.id,route,file:relative,title:page.title,contentChanged:JSON.stringify(page.blocks)!==before,reviewStatus:kind,sourceId:sourceId||null,notes:route==='#/iskolank/tortenet'?'Hivatalos forráson belüli 1887/1897 évszámütközés; intézményi egyeztetés szükséges.':null});
 staged.push([sourcePath,page]);
}
if(report.pages.length!==71||!report.pages.some(p=>p.contentChanged))throw Error('Hiányos szerkesztői vizsgálat');
for(const [p,page] of staged)write(p,page);
write('json/adatok/tartalmi-audit-v1-39-3.json',report);
console.log(JSON.stringify({pages:report.pages.length,changed,officialLinksAdded:links,duplicateSectionsRemoved:sectionsRemoved,statuses:report.pages.reduce((o,p)=>(o[p.reviewStatus]=(o[p.reviewStatus]||0)+1,o),{})},null,2));
