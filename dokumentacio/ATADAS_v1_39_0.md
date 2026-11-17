# Csanádi Sportiskola – v1.39.0 fejlesztési és tesztjegyzőkönyv

**Kiadási dátum:** 2026. november 17.  
**Kiinduló forrás:** `csanadi_website_v1_38_2(2).zip`  
**Kiadási jelölés:** `csanadi-website-v1.39.0`  
**Célkörnyezet:** statikus FTP-tárhely, HTTPS, Bootstrap 5.3.9 CDN, natív JavaScript, helyi JSON-fájlok.

## 1. Mi készült el?

Az eredeti v1.38.2 webhely továbbfejlesztett, teljes fájlállománya, a **C – Folyékony üveg** egységes arculati rétegével. A meglévő logó, sötétkék–fehér–arany színvilág, 6 főmenü, 28 látható almenü és az eredeti tartalmi oldalak megmaradtak. Harmadik szintű **látható** menüt nem hoztunk létre; a tartalmi oldal-JSON-ok belső hierarchiája ettől függetlenül legfeljebb három szintű lehet.

Az index **71 önálló oldalt** tartalmaz, ebből 70 a `json/structure.json` hierarchiájában, egy külön kezdőlapként szerepel. Az előző 66 oldal nem lett törölve, és öt új, témánként önálló oldal készült:

| Új oldal | URL | Forrás |
|---|---|---|
| Megközelítés és érkezés | `#/megkozelites-es-erkezes` | `json/oldalak/informaciok/mindennapi-tudnivalok/megkozelites.json` |
| Térkép és útvonaltervezés | `#/megkozelites-es-erkezes/terkep` | `json/oldalak/informaciok/mindennapi-tudnivalok/terkep.json` |
| Tanulástámogatás és időgazdálkodás | `#/tanulastamogatas` | `json/oldalak/oktatas/tananyagok-es-jegyzetek/tanulastamogatas.json` |
| Online biztonság és felelős kommunikáció | `#/oktatas/digitalis-kultura/online-biztonsag` | `json/oldalak/oktatas/digitalis-kultura/online-biztonsag.json` |
| Mesterséges intelligencia tudatos használata | `#/oktatas/digitalis-kultura/mesterseges-intelligencia` | `json/oldalak/oktatas/digitalis-kultura/mesterseges-intelligencia.json` |

Az online biztonság és a mesterséges intelligencia önálló szakaszai az eredeti digitáliskultúra-oldalról kerültek át; a szülőoldalon a megfelelő hivatkozások megtalálhatók. A korábbi megközelítési/tanulási funkciók külön oldalakon jelennek meg; a hasznos régi `megkozelites-es-tanulas.html` segédoldal megmaradt.

### Kódszintű változások

- `css/liquid-glass-v1-39-0.css`: globális üvegfelületek, kontrasztos matt tartalmi hátterek, üvegfejléc és -lábléc, új kereső, responsív kártyák, különböző aloldal-sablonok, finom fények, világos/sötét és csökkentett mozgású megjelenés.
- `js/release-v1-39-0.js`: kompakt kezdőlapi vezérlősáv, kiemelt képek előző/következő gombjai és visszaugrás, automatikus hosszúoldali tartalomjegyzék, azonos tartalmak és kapcsolódó linkek összevonása, térkép-hozzájárulás, mobilos fejléc.
- `js/app.js`: új oldaltípus-sablonosztályok, a régi megközelítési hash-címek átvezetése, ismétlődő azonos címszakaszok kezelése.
- `js/subpages-v1.js`: témához kötött sportanimációs fejléc, aktív szakaszcím, a tartalom magasságából számított arany olvasásjelző.
- `mobile/radial-wheel-v1-38.js`: telefonon kétállapotú körmenü, fölösleges almenünyilak nélkül.
- `js/search-j-2026.js`: az új oldalak témakör-illesztése; a kereső továbbra is a nyilvános, publikált oldalindexet és a helyi média-, dokumentum-, hír- és eseményadatokat használja.
- `json/structure.json`, `json/oldalindex.json`, `json/config.json`: öt új oldal, új animációprofilok, új gyorsítótár-verzió.
- `index.html`, `script.js`, `js/round29-home.js`: új réteg beillesztése, modernizált kapcsolatok és megközelítési útvonalak, rövidebb lábléc.
- `tools/mobile-preview-v1-39-0.html`: 320/375/390/768 pixeles helyi ellenőrző nézet.
- `tools/route-smoke-v1-39-0.html`: az összes publikált oldal automatikus SPA-megnyitási próbája két képernyőszélességben.

## 2. A 41 kérés tételes követése

Jelölés: **Kész** = ellenőrizhetően implementálva; **részben** = fennmaradt, dokumentált eltérés vagy a környezetben nem lezárható ellenőrzés.

| Sorszám | Jóváhagyott fejlesztés | Állapot, megjegyzés |
|---:|---|---|
| 1 | Aloldali fejléc átdolgozása | Kész – az új üvegsáv és kompakt szalag működik. |
| 2 | Témához illő humoros sportanimáció | Kész – konfigurált SVG-jelenetek. |
| 3 | Animáció nagyobb rendelkezésre álló szélességgel | Kész – rugalmas szélesség. |
| 4 | Keret nélküli, fejlécbe olvadó animáció | Kész. |
| 5 | Görgetéskor oldal- és szakaszinformáció | Kész – cím, aktív szakasz és százalék. |
| 6 | „Következő események” középre igazítása | Kész – közös cím- és kártyaigazítás. |
| 7 | „Részletes tartalmak” középre rendezése | Kész. |
| 8 | Fölösleges mobilmenünyilak eltüntetése | Kész. |
| 9 | Közvetlen KRÉTA mobilon | Kész – látható fejlécgomb. |
| 10 | Hasznos mobilos felső sor | Kész – logó, név, KRÉTA, keresés, téma, menü. |
| 11 | Telefonra tervezett fejléc | Kész – külön töréspontok és méretezés. |
| 12 | Telefonméretű böngészőpróbák | Kész – 320, 375, 390 és 768 px; **fizikai telefon nem állt rendelkezésre**. |
| 13 | Mobilmenük, gombok, görgetés és elrendezés | Kész – kétállapotú körmenü és kereső kipróbálva; további fizikai eszközteszt ajánlott. |
| 14 | Két hibás régi megközelítési útvonal | Kész – mindkét cím új oldalra vezet. |
| 15 | CLS és betöltési stabilitás javítása | Részben – tiszta betöltésben CLS 0,031–0,07, de egy hideg, 390 px-es mérés FCP-je 2488 ms volt. |
| 16 | Lábléc magasságának csökkentése | Kész. |
| 17 | „Gyorselérés” teljes megszüntetése | Kész – a lényegi hivatkozások másutt megmaradtak. |
| 18 | Görgetésjelző a valódi tartalom végéig | Kész – lábléc előtt 100%, dinamikus magasságfigyeléssel. |
| 19 | Ismétlődés okainak feltárása | Kész – általános sablonok, visszatérő ajánlók és tartalmi átfedések azonosítva. |
| 20 | Ismétlődő címek, kártyák, ajánlók eltávolítása | Részben – pontosan azonos blokkok és linkek kezelve; az összes szerkesztőségi átfedés manuális megszüntetése nyitott. |
| 21 | Aloldaltípusok változatos megjelenése | Kész – hírek, sport, dokumentum, esemény, tájékoztató, útmutató, megközelítés. |
| 22 | Megközelítés/tanulástámogatás újratervezése | Kész – önálló főoldal és kapcsolódó aloldalak. |
| 23 | Hasznos funkciók megőrzése | Kész – régi önálló tanulási segédoldal elérhető maradt. |
| 24 | Túlzsúfolt tartalmak felosztása | Kész – az önálló online biztonság, MI és közlekedési/tanulási témák szétválasztva. |
| 25 | Önálló téma külön JSON-fájljában | Kész – öt új fájl. |
| 26 | Összetartozó tartalmak egy oldalon | Kész az átszervezett tartalmakban; további szerkesztőségi felülvizsgálat megengedett. |
| 27 | Ne legyen harmadik menüszint | Kész – továbbra is 6+28 látható menüpont. |
| 28 | Új oldalak csempékből, keresésből, kapcsolatokból | Kész. |
| 29 | Teljes keresőarculat | Kész – teljes képernyős üvegfelület. |
| 30 | Keresési logika továbbfejlesztése | Kész – helyi súlyozás, javaslatok, típus- és témaszűrő, szövegkiemelés. |
| 31 | Modern, prémium kereső | Kész – telefonon egyoszlopos eredmények. |
| 32 | Főoldali felső rész rögzítése | Részben – a teljes funkciós fejléc sticky; a nagy képes hero a lap tetején látszik, majd kigörgethető. |
| 33 | A teljes kezdőnézet látható felül | Kész. |
| 34 | Görgetéskor finom kompakt átalakulás | Kész a fejlécben; a képes hero nem külön összecsukható egység. |
| 35 | Kompakt módban az eredeti funkciók | Kész – navigáció, kereső, téma, KRÉTA, kapunyitás, kiemelt képek és visszaugrás. |
| 36 | Állandóan látható kompakt fejléc | Kész. |
| 37 | Teljes fejléc visszaáll a lap tetején | Kész. |
| 38 | Külön mobilos kompakt változat | Kész – a telefonos szakaszsávval együttműködve. |
| 39 | Menük és gombok állapotának megőrzése | Kész a vizsgált körmenü- és keresési folyamatokban. |
| 40 | Átfogó tesztelés | Részben – Chrome-böngésző, statikus szerver és programozott tesztek kész; Safari, Firefox és fizikai készülék nem volt elérhető. |
| 41 | Új teljes ZIP, részletes beszámoló | Kész – a ZIP a teljes webhelyet és ezt a jegyzőkönyvet tartalmazza. |

## 3. Teszteredmények

| Teszt | Eredmény | Megjegyzés |
|---|---|---|
| `node tools/test-release-v1-39-0.js` | **947/947 sikeres** | JSON-szintaxis, 71 oldal, 6+28 menü, egyediség, belső SPA-linkek, 628 médiatétel és lényeges bekötések. |
| `node tools/test-static-http-v1-39-0.js` | **1283/1283 sikeres** | Helyi HTTP-kiszolgálás: 71 oldal, 628 médiaelem és 581 egyéb statikus forrás. |
| Az összes `.js` állomány `node --check` ellenőrzése | **323/323 sikeres** | Teljes forrásfa, szintaktikai hibamentesség. |
| `node tools/test-theme-sync-v1-37.js` | **12/12 sikeres** | Meglévő témaszinkron-regresszió. |
| Böngészős teljes útvonalpróba, 390 px | **71/71 sikeres** | Minden indexelt oldal megnyílt; 0 rögzített JavaScript-hiba. |
| Böngészős teljes útvonalpróba, 1200 px | **71/71 sikeres** | Minden indexelt oldal megnyílt; 0 rögzített JavaScript-hiba. |
| Manuális oldaltípus-mintavétel | **8/8 sikeres** | Iskolánk, online biztonság, MI, tanulástámogatás, sportágak, hírek, dokumentumtár, megközelítés. |
| Régi térképes URL átvezetése | **sikeres** | Az új térképes route és hozzájárulásos OpenStreetMap megjelenik. |
| Mobilos körmenü | **sikeres** | A hat főmenü után a második körben a helyes almenük jelennek meg, a választás oldalt nyit. |
| Kereső, új témák és kiemelés | **sikeres** | Például „digitális”, „megközelítés”; szűrők és találati lista. |
| Arany olvasásjelző | **sikeres** | 100% elérhető a `#app` tartalom végén, még a lábléc előtt. |
| Kompakt kezdőlapi képváltó | **sikeres** | Előző/következő kép és visszaugrás a normál fejlécbe. |

**Korábbi tesztek eltérései:** egy v1.36-os regressziós teszt 21/22 eredményt adott, mert változatlanul **65** regisztrált aloldalt várt, miközben az új struktúra 70 aloldalt és külön kezdőlapot tartalmaz. A v1.37-es HTTP-teszt a régi verziójelre és külső portra épült; az új változat saját helyi HTTP-szervert indít. A régi, `/usr/bin/chromium`-ra támaszkodó Playwright-futtató ebben a környezetben `Operation not permitted` rendszerhibával leállt; ezt a két, valódi böngészőben végigfutó, új SPA-útvonalpróba pótolta. Ezek nem a honlap aktuális hibái.

### Böngészős teljesítmény – helyi, eszközfüggő adatok

| Helyzet | FCP | LCP | CLS |
|---|---:|---:|---:|
| Asztali Chrome, helyi előnézet, betöltés után | 196 ms | 196 ms | 0,070 |
| 390 px-es tiszta böngészős betöltés | 2488 ms | 2488 ms | 0,031 |
| 390 px-es ismételt, gyorsítótárazott betöltés | 1524 ms | 1524 ms | 0,040 |
| Célérték | legfeljebb 1800 ms | legfeljebb 2500 ms | legfeljebb 0,100 |

Ezek **nem** hitelesített Lighthouse- vagy fizikaitelefon-mérések. Az asztali mérés és a telefonos iframe-mérés nem teljesen összehasonlítható. Egy hideg FCP-mérés a cél fölött volt; a teljesítmény további ellenőrzése szükséges az iskola tényleges tárhelyén. Többszöri dinamikus nézetátméretezés után a halmozott CLS magasabb is lehetett; a tiszta navigációs mérés az összevethető adat.

## 4. Nyitott, nem kritikus teendők és korlátok

1. **Tartalmi hitelesítés:** a v1.38.2 csomagban több oldal `verifiedContent: false` státusszal szerepelt. Ezeket nem minősítettük intézményileg jóváhagyottnak. A konkrét intézményi határidők, közlekedési/akadálymentes érkezési adatok és médiák publikálás előtti ellenőrzése az iskola feladata.
2. **Tényleges mobilok és böngészők:** fizikai iPhone/Android, Safari és Firefox nem álltak rendelkezésre. A 320–768 px-es Chrome-megjelenést az ellenőrző iframe biztosította; érintéses és akadálymentes segédtechnológiás teljes teszt még szükséges.
3. **Főoldali hero:** a nagyméretű képes szakasz a normál oldal része; a rögzített, kompakt fejléc vezérlőkkel helyettesíti görgetés után. A hero fizikai összecsukódása nincs megvalósítva.
4. **Szerkesztőségi ismétlődések:** az azonos dinamikus blokkok és ajánlók csökkentése nem helyettesíti a teljes 71 oldalas tartalmi kézi korrektúrát.
5. **Teljesítmény:** a hideg, 390 px-es FCP 2488 ms-os mérése miatt a 1800 ms-os cél teljesülése nem garantálható minden eszközön. További célzott Lighthouse-mérés és optimalizálás ajánlott.
6. **Külső feltételek:** a Bootstrap CDN, a KRÉTA és a Facebook külső elérhetőség; az OpenStreetMap csak kifejezett látogatói hozzájárulás után töltődik. Az alapoldalak és a kereső működéséhez nincs adatbázis, szerveroldali API vagy GitHub Actions.

## 5. Kiadás, ellenőrzés, visszaállítás

1. A ZIP tartalmát a statikus FTP webgyökerébe kell kicsomagolni a könyvtárszerkezet megtartásával (`index.html`, `script.js`, `css/`, `js/`, `json/`, `assets/`, `mobile/`, `tools/`, `dokumentacio/`).
2. A JSON-t csak HTTP(S) alól lehet megbízhatóan betölteni; a `file://` megnyitás nem támogatott.
3. Az új verzió `json/config.json` fájlban `csanadi-r-v1.39.0` cache-azonosítót használ. Élesítés után a böngésző gyorsítótárát és a service workert szükség szerint frissíteni kell.
4. A `release-manifest.json` minden kiadott fájl méretét és SHA-256 ellenőrzőösszegét tartalmazza; a manifest saját magát nem listázza.
5. Regresszió: `node tools/test-release-v1-39-0.js`, `node tools/test-static-http-v1-39-0.js`, `node tools/verify-release-manifest-v1-39-0.js`.
6. Böngészőben: `tools/mobile-preview-v1-39-0.html` és `tools/route-smoke-v1-39-0.html` (helyi HTTP/HTTPS-szerverről, nem `file://` alatt).
7. Visszaállítás: a korábban megőrzött v1.38.2 ZIP állománya visszamásolható a teljes v1.39.0 telepítés helyett, az érintett böngészők cache- és service worker-frissítése mellett.

**Éles feltöltést vagy nyilvános publikálást nem végeztünk.** A ZIP tesztelt fejlesztési átadás, nem automatikus intézményi tartalmi jóváhagyás.
