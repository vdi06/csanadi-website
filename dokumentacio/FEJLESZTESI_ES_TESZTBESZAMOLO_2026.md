# Csanádi Sportiskola 2026 · 29. fejlesztési kör – jóváhagyott kezdőoldal

## Állandó, középre rendezett és személyre szabható gyorselérések

- A kezdőlapi gyorselérések **mindig mind láthatók**: a „További gyorselérések” kibontógomb megszűnt. A gyári hivatkozások továbbra is megmaradtak.
- Asztalon a csempék középre rendezett, több sorba törő flex-elrendezést kapnak; mobilon a jóváhagyott kétoszlopos grid marad, az esetleges utolsó páratlan csempe középre kerül.
- Új „Saját gyorselérés létrehozása” felület: legfeljebb 24 felirat és biztonságos hivatkozás helyben tárolható, az új csempék azonnal megjelennek és külön törölhetők. A tárolás böngészőnkénti `localStorage`, nem a közös honlap JSON-állományának módosítása. Az önálló gyorselérési blokk a kezdőlap-kártyák rendezőfelületében sem rejthető el.
- A felső képváltó két peremsávjának pozícióját asztalon és mobilon külön, szigorúan a képes tartalmon kívül rögzítettük (`css/round30-hero-rails.css`).
- A JavaScript-, CSS-, JSON- és ZIP-statikus ellenőrzés mellett az érintéses/valódi böngészős működés manuális ellenőrzése továbbra is szükséges.

## Gyorselérési csempék középre igazítása

Az összes kezdőlapi gyorselérési csempénél egységes középre igazítást alkalmazunk: a csempék rácsának középre helyezése, az ikonok és feliratok vízszintes középre rendezése, valamint a további csempéket nyitó gomb középre igazítása. A mobilos kétoszlopos grid és az ikon+felirat megjelenés, továbbá a további elemek inline kibontása megmarad. A módosítás a `css/round29-home.css` végén van, a régebbi stílusokat felülírva.

## Megközelítés és tanulástámogatás: a közös felső képváltó megőrzése

A `#/megkozelites-es-tanulas` és `#/megkozelites-es-tanulas/terkep` útvonalak közös honlapkerete eddig megtartotta ugyan a `#global-hero` HTML-elemet, de a `css/round29-integration.css` szabálya `.cs-embedded-arrival #global-hero{display:none!important}` elrejtette. Ezt a hibás rejtést eltávolítottuk. A felső képes váltakozó, bal/jobb léptetők, középső főmenüikon és a fejléc a térképes aloldalon is megmarad; csak az iframe belső, ismétlődő navigációs elemeit korlátozzuk. A statikus regressziós teszt ellenőrzi, hogy a tiltó szabály nem szerepel. Valódi böngészős útvonalteszt még szükséges.

## Diagnosztikai panel háttere és egységes lenyílójelzések

- A becsukott diagnosztika külső keretének világos témában látható téglalapját megszüntettük: a teljes külső `<details>` háttér, keret és árnyék nélkül jelenik meg; a megnyitott diagnosztika saját modális panelje változatlanul olvasható marad.
- Eltűnt a diagnosztika melletti `⌄` és a kezdőoldali kibontók dekoratív lenyíló nyila. A natív `<summary>` markerjelöléseket mindkét témában egységesen elrejtettük. A képek tényleges bal/jobb léptetőgombjait, a kezdőlap-rendező fel/le gombjait és a letöltési műveletek iránynyilait nem módosítottuk, mert ezek szükséges funkcionális jelzések.
- Statikus ellenőrzés sikeres; valódi világos/sötét böngészős képernyővizsgálat még hátravan.

## Kezdőlap személyre szabása és térképhivatkozás – utólagos javítás

- A „⚙ Kezdőlap beállítása · kedvenc kártyák és sorrend” kezelője teljesen új, **egyoszlopos** elrendezést kapott: a kártyák asztali és mobilos nézetben is egymás alatt szerepelnek. Külön húzófogantyúval egérrel (HTML5 drag-and-drop) és érintőképernyőn (pointer-mozgatás) átrendezhetők. Láthatósági jelölőnégyzet, „Látható/Rejtett” állapot, összes kártya megjelenítése, eredeti elrendezés visszaállítása és akadálymentes fel/le tartalékgombok is vannak. A korábbi `csanadi-r21-home-preferences` tárolási kulcs megmaradt; a felhasználó régi sorrendje és láthatósági döntései nem törlődnek.
- A pontosan megnevezett **„Térkép és megközelítés →”** hivatkozás nem a korábban javított `.cs29-map-button`, hanem a régi `.r26-home-map-link a` szabályt használta, amely világos témában fix sötétkék színt adott. Mindkét téma, valamint a hover/fókusz állapot külön CSS-felülírást kapott.
- Az összes korábbi oldal és JSON-fájl megmaradt. Az új interakciók valódi mobilos és asztali próbája kiadás előtt továbbra is szükséges.

## Hibás honlapverzió-értesítés javítása

A korábbi értesítés a service worker minden `controllerchange` eseményére megjelent, ezért akár az első látogatáskor is tévesen új honlapverziót jelzett. Az új megoldás a betöltött HTML `v` kiadásazonosítóját veti össze a hálózatról frissen lekért `json/config.json` `performance.cacheVersion` értékével. Azonos verziónál nincs üzenet; eltérő, tényleges kiadásnál jelenik meg a témához illeszkedő „Később” és „Frissítés” művelettel. A vizsgálat induláskor, visszatéréskor és a konfigurált (jelenleg 300 másodperces) időközönként működik; HTTP-s FTP-környezetben service worker nélkül is elérhető. Írásban végzett teszt mellett a frissítéses élő helyzetet valódi böngészőben még ellenőrizni kell.

## Mobilos képváltó és kapunyitás utólagos javítása

- A mobilos képváltó két teljes magasságú, áttetsző léptetősávja már a képek **külső oldalán**, külön oldalsó helyen fut; nem takarhatja a kártyák felületét. Az asztali képelrendezés érintetlen.
- A kapunyitás utáni várakozáshoz külön **900 × 1600 képpontos álló mobilkép** készült (`assets/media/web/belepes-nyitott-mobil.webp`), amelyen a kapu mindkét oldala és az iskola látható. A képsor mobilon ezzel a külön eszközre komponált képpel, teljes magasságú `cover` megjelenítéssel fut; asztalon az eredeti széles képet tartja meg.
- Az asztali eredeti széles kapukép is `cover` megjelenítést kapott: a teljes képernyőszélességet és -magasságot kitölti. Eltérő képernyőarány mellett a szélekből/függőleges részből kis mértékű vágás szükséges lehet.
- A kulcs továbbra is keret nélküli, saját alakját követő kétlépcsős fekete árnyékkal.
- A kép újratervezett, képgenerálással kiegészített változat, tehát **látványgrafika**, nem az iskola tényleges épületéről készült hiteles fénykép. A mobilos megjelenés manuális, valódi készülékes tesztje továbbra is szükséges.

## Témakorrekció és a korábbi egyeztetések teljes átvizsgálása

A világos téma térképes főgombja az előző R29-ben **tévesen fix sötétkék** `#15334b` hátteret kapott. A javítás a `css/round29-theme-unified.css` állományban felülírja ezt a gombot, a megközelítési kártyákat és az oldalsó szakasznavigátor műveleti gombjait: világos témában világos krémszín/sötét szöveg, sötét témában sötétkék/világos szöveg szerepel. Ugyanezt a stíluslapot a `megkozelites-es-tanulas.html` is betölti az R26 térképindító, útvonal-, űrlap- és vezérlőgombjaira.

A jóváhagyott kezdőoldali egyeztetés **23 követelményét** tételesen összevetettük a forráskóddal. Az összesített állapot és a pontos hiánylista: `dokumentacio/KEZDOLAP_JOVAHAGYAS_ES_ELTERESEK_2026.md`. Nem igazolt vagy hiányzó elemek közé tartozik a harmadik szintű, B típusú csempés menüpanel, az egygyermekes menücsoportok összevonása, a sportsportlight kártyák swipe/expand viselkedése, az iskolai/sporthírek 3 és 4 kártyás végleges kompozíciója, a sportági szűrés és a mobilos lábléc összecsukható csoportjai. A laphoz szükséges JSON-ok metaadat-első, igény szerinti betöltése részben létezik az oldalindex alapján, de nem minden tartalmi hívás lusta.

**Fontos:** a témajavítás forrásban és CSS-ben készült el, valós képernyőn a korábbi böngészőindítási korlátozás miatt nem igazolt. A javítatlan funkciókat továbbra sem tekintjük befejezettnek. Iskolai FTP-feltöltés nem történt.

---

## A 29. kiadás utólagos javításai (a legújabb ZIP-ben)

- **Kapunyitás:** a belépést valódi kulcsformájú SVG indítja, kerek gombháttér nélkül. A fejléc jobb felső sarkában külön, nyitott kaput ábrázoló ikon indítja újra a kapunyitást.
- **Képváltó:** az eredeti kétképes kompozíció és a középső főmenüikon változatlan; a váltónyilak a képek két külső szélén teljes magasságú, áttetsző sávokként láthatók, mindkét témában és mobilon is.
- **Lap tetejére:** a kezdőoldalon eltűnik a külön lebegő vissza-a-tetejére gomb. Az oldalsó szakasznavigátor paneljébe került egy külön „Ugrás a lap tetejére” gomb. Az aloldalakon a korábbi gomb változatlan.
- **Ellenőrzés:** az új CSS- és JS-feltételeket is vizsgálja a `TESZTEREDMENY_2026_29.json`. Az újabb webes és PDF-kézikönyv ugyanezt rögzíti. A vizuális és érintéses viselkedés valós böngészőben továbbra is tesztelendő.

---

**Kiadás:** `csanadi-sportiskola-2026-r29` · **Dátum:** 2026. november 15. · **Alap:** a 28. teljes változat, az utóbb előkészített megközelítési és témakezelési javításokkal.

## Mit kértél a 29. körre?

A teljes kezdőoldali látványterv megvalósítását a meglévő tartalmak, összes oldal, főmenü, körmenü, mobilos menüváltás, képváltó, helyi kezdőlap-testreszabó, színtémák, JSON-adatok, adatvédelmi beállítások, dokumentáció és FTP-kompatibilitás megőrzésével. Külön kérted, hogy a régebben jelzett hibajavítások se maradjanak el.

## Mi került ténylegesen a csomagba?

1. **Kapunyitó ikon:** a korábbi kulcsalak és felirat helyett kizárólag nyitott kaput ábrázoló SVG-ikon; a hozzáférhető gombnév megmarad. A nyitott kapu képe három közelítési fázisban látható; mobilra külön megjelenítés készült.
2. **Kezdőoldali szakasznavigátor:** jobb oldali ikonból nyíló, csak kezdőoldali panel. Szakaszválasztáskor a panel bezárul, és a kijelölt szakaszhoz görget. A nyitott/becsukott állapotot nem írja át, a személyre szabott sorrendet DOM-sorrend alapján követi, Esc és billentyűzetes fókuszkör támogatott.
3. **Gyorselérések:** ikon+felirat, mobilon két oszlop, a negyedik után a további hivatkozások külön gombbal helyben kibontva. Az eredeti gyorselérési célokat megtartja.
4. **Becsukható tartalmi csoportok:** a Napi központ, Sporteredmények, Képekben és Fedezd fel blokkok megőrzése, lépcsőzetes megjelenési animációval. Az elérhető diagramokhoz külön kibontó keret került.
5. **Megközelítés a kezdőlapon:** önálló térkép-előnézeti felület három teljes magasságot kitöltő kapcsolódó kártyával; mobilon egymás alá kerülnek. Az interaktív tartalom csak kattintás után nyílik.
6. **Megközelítési oldal javítása:** az önálló `megkozelites-es-tanulas.html#terkep` közös SPA-útvonalra vezeti a látogatót, és a tartalom beágyazva tartja a honlap fejlécét, menüjét és láblécét.
7. **Témák:** célzott R29 világos/sötét stílusok a kiegészítő felületeken; a korábbi automatikus és kézi témaváltó érintetlen.
8. **Honlapdiagnosztika:** szerelőikon a lábléc fölött; a korábbi diagnosztikai tartalom modális felületen nyílik meg, kezdetben becsukva, bezárógombbal és Esc-kezeléssel.
9. **Főmenü/képváltó megőrzése:** a középső főmenüindító, a két szélső képváltó és az asztali/mobilos menürendszer eredeti forrását nem cseréltük le. Az R28 mobilos duplikált felső menü- és keresőgomb javítása maradt.
10. **Dokumentáció és csomag:** a teljes webes útmutató új R29 fejezettel bővült, a PDF 3.15-ös kiegészítést kapott; a teljes ZIP és SHA-256 fájlmanifest frissült.

## Ellenőrzési eredmény és nyitott pontok

- **Sikeres statikus próbák:** a korábbi fájlok megléte; minden JSON értelmezhetősége; minden JavaScript szintaxisa; a szükséges fájlok és hivatkozások megléte; a PDF megnyithatósága; a ZIP CRC-ellenőrzése. A tételes gépi eredmény: `dokumentacio/TESZTEREDMENY_2026_29.json`.
- **Nem igazolt:** valódi böngészős animációk, telefonos méretek, képernyőolvasó, valós CLS/LCP, offline és gyorsítótár-frissítés. A helyi Chromium indítását környezeti socket-engedélyhiba megakadályozta. A forrásellenőrzés önmagában **nem bizonyítja** a fenti felhasználói élményt.
- **További kidolgozásra vár:** a jóváhagyott egyedi sporthír-/iskolai hírkártya-kompozíciók minden részlete, a harmadik szintű Tetris-almenü teljes működése és a tartalmi JSON-ok szigorú igény szerinti betöltése. A meglévő rendszerek megmaradtak, de ezeket nem állítjuk teljesen késznek.
- Az iskolai FTP-re **semmit nem töltöttünk fel**. A teljes csomag helyben ellenőrzött, de élesítés előtt böngészős teszt és biztonsági másolat indokolt.

---

# Előző kiadás – 28. fejlesztési kör (megőrzött beszámoló)

**Kiadás:** `csanadi-sportiskola-2026-r28` · **Dátum:** 2026. november 15. · **Alapcsomag:** `Csanadi_Sportiskola_2026_27_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`.

## 1. A kérésed

A 28. fejlesztési körben **mind a tíz karbantartási lehetőséget (1–10)** kiválasztottad, új tematikus modul és új tartalmi központ nélkül. A teljes 27. kiadás valamennyi oldalát, korábban működő funkcióját, a `README.md` állományt, a külön `mobile/` és `desktop/` rendszert, a központi JSON-paramétereket, színtémákat és adatvédelmi szabályokat meg kell őrizni. Kérted a teljes statikus FTP-kompatibilis ZIP-et, a frissített webes és PDF-kézikönyvet, a tételes tesztbeszámolót és a következő működő, tízpontos karbantartási választót. Az iskolai FTP-re nem szabad feltölteni semmit.

## 2. Elvégzett javítások és jobbítások – külön, új funkciók nélkül

| # | Kiválasztott terület | Tényleges R28 módosítás és eredmény | Fájl | Korlát / nyitott teszt |
|---|---|---|---|---|
| 1 | Mobilos körmenü | Külön stílus a nagyon keskeny (≤300 px), illetve fekvő, alacsony telefonokhoz; a körméret, gombok és scrollozható almenü igazítása, meglévő egysoros menüfeliratok megőrzésével. **A felhasználó utólagos pontosítása alapján a felső mobilos hamburger- és keresőgomb rejtett; csak az alsó három ikon (Kezdőlap, Menü, Keresés) látható.** Az alsó gombok továbbra is a körmenüt és keresőközpontot nyitják, asztalon a fejléc nem változik. | `mobile/round28-maintenance-mobile.css`, megőrzött `mobile/quick-nav.js` | Eszközön meg kell nézni a tényleges gombtávolságokat és a megnyitást. |
| 2 | Mobil/asztali megjelenés | Rugalmasabb kártya-, lábléc-, kép- és dokumentumméret, külön desktop/tablet finomhangolás. | `css/round28-maintenance.css`, `desktop/round28-maintenance-desktop.css` | Valós kijelzős képernyő- és átfedésvizsgálat még szükséges. |
| 3 | Betöltési sebesség és CLS | A diagnosztika nagy kiadási manifestje csak a szerelőkulcsos panel kinyitásakor kérődik le, és a zárt panel nem rajzol újra erőforráslistát; az R27 fejléc-helyfoglalása megmarad. | `js/performance-diagnostics-2026.js` | **Nem készült új CLS-, FCP- vagy LCP-mérés.** Nincs igazolt CLS-célérték. |
| 4 | Három téma | Világos/sötét/automatikus mód közötti választás változatlan; egy másik böngészőlapon átállított, tárolt megjelenési mód most már szinkronizálható. | `js/app.js` | Két valódi böngészőlapon ellenőrizendő. |
| 5 | Kereső és navigáció | Ismételt keresőmegnyitáskor megmarad az eredeti visszalépési fókusz; bezárás után a késleltetett fókusz nem ugrik vissza a rejtett mezőre. A korábbi megamenü és mobil almenük megmaradnak. | `js/app.js` | Manuális billentyűzetes és mobilnavigációs teszt szükséges. |
| 6 | Hírek és kártyák | A sporthírek hálózati hiba utáni sikeres lekérésénél visszaáll az eredeti bevezető; a dátumok szabványos, géppel olvasható `datetime` értéket kapnak. A korábbi üresállapot-kezelés megmarad. | `js/daily-sport-news.js` | A külső híradatok változékonyságát külön kell vizsgálni. |
| 7 | Képek, videók, dokumentumok | A dokumentumok előnézete csak PDF-re használ PDF-beágyazást; más fájltípusnál megnyitási/letöltési útmutatás jelenik meg. Képek és videók maximális szélessége alkalmazkodik az elrendezéshez. | `js/documents.js`, `css/round28-maintenance.css` | **Nincs új képtömörítés vagy videókódolás**; médiatartalmak jogosultsága nem változott. |
| 8 | Offline és cache | A helyi mentési kvóta a már mentett oldalakat is beleszámolja az új mentésbe; az eltávolítás nem akad el betelt kvóta miatt. Új cache-token: `csanadi-r28-20261115`. | `js/offline-reader-20.js`, `json/config.json`, verziózott URL-ek | Service Worker és Cache API valódi böngészőben még tesztelendő. |
| 9 | Akadálymentesség | Erősebb fókuszkörvonal a navigáción és láblécben, csökkentett mozgás kérésének figyelembevétele; időelem gépi dátuma. Korábbi felolvasó mód megmarad. | R28 CSS, `js/daily-sport-news.js` | **WCAG 2.2 AA megfelelőség nincs tanúsítva**; képernyőolvasós próba nyitott. |
| 10 | Regresszió és adatvédelem | Minden korábbi útvonal megőrzése, a 66 eredeti JSON-oldal változatlanságának, 290 központi paraméternek, témáknak, adatvédelmi JSON-nak, PDF-metaadatnak, statikus HTTP-nak, manifestnek és ZIP CRC-nek gépi ellenőrzése. | `test28.py`, `release-manifest.json`, `dokumentacio/TESZTEREDMENY_2026_28.json` | A program által végzett statikus ellenőrzés **nem** teljes böngészős integrációs teszt. |

**Új tematikus funkciók száma: 0.** Az R28 az eddigi karbantartást egészíti ki; az R21–R27 funkciók és a korábbi térképes bejárási tájékoztató megmaradnak.

## 3. Mit tartalmaz a teljes csomag?

- A 27. kiadás minden fájlútvonalát és változatlan `README.md` fájlját, mind a **66 eredeti JSON tartalmi oldalt**.
- A 13 korábbi `tools/` segédoldalt, külön `mobile/` és `desktop/` mappákat, minden korábbi médiát, dokumentumot és adatot.
- A meglévő **290 központi JSON-beállítást**, amelyekből csak a `performance.cacheVersion` értéke változott.
- Három új, célzott R28 stíluslapot; a meglévő R27 stíluslapokat is.
- A **3.14-es webes kézikönyvet** (`utmutato.html`), a **3.14-es PDF-et** (`assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`), a központi JSON-leltárt, valamint a tesztadatokat.
- A teljes fájlméretet és SHA-256 ellenőrzőösszeget tartalmazó `release-manifest.json` fájlt, amely önmagát nem számolja bele.

## 4. Ellenőrzések és tesztek

A teljes örökölt gépi regressziós csomag az R26 korábbi tartalmi központjainak szerkezeti vizsgálatát, helyi JSON-olvasást, a statikus FTP-szerkezet és HTML-hivatkozások ellenőrzését, Node.js szintaxisvizsgálatot, helyi HTTP-kéréseket, PDF- és manifest-metaadatokat, ZIP-fájlok meglétét és CRC-értékeit ellenőrzi. Ezt kiegészítik az R27 megőrzési/karbantartási és az R28 új módosításait célzó feltételvizsgálatok.

**A pontos gépi sikeres/összes tesztszámot és egyenkénti eredményeket a `dokumentacio/TESZTEREDMENY_2026_28.json` tartalmazza.** A közvetlenül a ZIP mellett átadott tesztbeszámoló jelen dokumentum másolata.

**Fontos vizsgálati határ:** a Chromium grafikus indítását ebben a környezetben `socket() failed: Operation not permitted` hiba akadályozta meg. Emiatt valós telefonos vagy asztali képernyőteszt, interaktív böngészős teszt, új Web Vitals/CLS-mérés, iOS/Android-, Firefox/Safari- és képernyőolvasós hitelesítés **nem történt**. A CSS és statikus JavaScript ellenőrzése nem bizonyítja automatikusan a vizuális hibák megszűnését. E tesztek továbbra is nyitott teendők.

## 5. Nyitott feltételek, adatvédelem és élesítés

- A korábbi CLS 0,427-es értékének csökkenését a betöltési diagnosztika megnyitásával valódi böngészőben újra kell mérni; a 0,1 alatti célérték **nem igazolt**.
- A mobil körmenüt legalább 280/320/360/375/390/430 px telefonokon, 768–1024 px tableten, fekvő telefonon és asztali képernyőn ellenőrizni kell; a fő- és almenü ne fedje egymást és ne vágja le a feliratokat.
- A kereső, visszalépés, Ctrl+K, menü billentyűzet, képernyőolvasó, felolvasás, fókusz, témák közti váltás, offline tárolás és frissítés külön végponttól végpontig kipróbálandó.
- Az eredeti jóváhagyási szabályok szerint személyes és intézményi tartalom csak engedéllyel, valós dokumentummal és ellenőrzött forrással jelenhet meg. Nem töltöttünk fel új, ellenőrizetlen fényképet, kontaktot, panorámát vagy bejáratot.
- A Bootstrap korábban elfogadott, rögzített CDN-verziót igényel; az OpenStreetMap és útvonaltervező külső kapcsolatok hozzájárulás/aktiválás után internetet használhatnak. A statikus FTP-csomaghoz nincs PHP, Node szerver vagy GitHub Actions-kényszer.
- **Az iskolai FTP-re, GitHub Pages-re és más nyilvános tárhelyre ebben a körben nem töltöttünk fel semmit.** Az új ZIP-et a felhasználó kapja meg.

## 6. Átadandó fájlok

1. `Csanadi_Sportiskola_2026_28_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip` – teljes statikus honlap.
2. `Csanadi_Sportiskola_2026_28_RESZLETES_TESZTBESZAMOLO.md` – ez a tételes beszámoló külön is.
3. `Csanadi_Sportiskola_2026_TELJES_HASZNALATI_UTMUTATO_3_14.pdf` – önálló PDF-kézikönyv.
4. `Csanadi_Sportiskola_2026_28_KOZPONTI_JSON_PARAMETEREK.md` – mind a 290 mező leltára.

**FTP-feltöltés: nem történt.**
# Új témaválasztó központ (2026. november 15.)

- A kezdőoldali „Melyik téma érdekel?” szűrősor teljesen új, három nagyméretű témakártyás felületet kapott: Sport, Tanulás, Iskolai élet.
- A kártyák címmel, rövid leírással, jelképpel és külön felfedezési felhívással működnek; mobilon egymás alatt jelennek meg.
- A kiválasztott téma a kapcsolódó kezdőoldali részeket változatlan logikával előre rendezi és kinyitja. A „Minden témakör megjelenítése” visszaállítja az alapnézetet. A korábbi témaspecifikus hivatkozások megmaradtak.
- A felület a világos és sötét témához igazodó színeket használ, és figyelembe veszi a csökkentett mozgás beállítását.

# Aktuális oldalra mutató fölösleges fejléc-hivatkozások (2026. november 15.)

- A Napi sporthírek teljes aloldali nézetében nem jelenik meg az ugyanoda vezető „Sporthírközpont” fejlécgomb; a kezdőoldali előnézetből továbbra is elérhető.
- Általános szabály: a tartalmi szekciók fejléceiben az aktuálisan megnyitott SPA-útvonalra mutató gomb elrejtődik. Más útvonalakat megnyitó gombok változatlanul láthatók, a főmenü és az egyéb navigáció érintetlen.
- A később betöltött szekciókra is érvényesül a szabály. Az ellenőrzés strukturális, a tényleges böngészős és mobileszközös megjelenítés még külön ellenőrzendő.

