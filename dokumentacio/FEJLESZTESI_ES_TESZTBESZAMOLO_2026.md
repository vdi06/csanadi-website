# Csanádi Sportiskola 2026 – 15. fejlesztési kör, teljes fejlesztési és tesztbeszámoló

**Kiadás dátuma:** 2026. november 15.  
**Kiinduló csomag:** a felhasználó által legutóbb átadott `csanadi-website(4).zip` (a belső, `.git/` nélküli 715 honlapállomány bájtra pontosan egyezik a korábbi 13. kiadással; az átadott új `README.md` szintén része a mostani ZIP-nek).  
**Cél:** teljes, statikus FTP-kompatibilis, kommentmentes új kódú weboldal a korábbi funkciók megtartásával.  
**Iskolai FTP-feltöltés:** **nem történt**.

## 1. Pontosan mit kért a felhasználó?

1. A korábbi körmenü továbbfejlesztését úgy, hogy a két oldalsó kép kör alakúan kivágva illeszkedjen az egyetlen, középen található Csanádi-logós gombhoz. A menü megnyílásakor is ugyanaz a gomb maradjon középen.
2. A képes oldaltérkép önállóan léptethető bal és jobb paneljeit, a számozott tartalomválasztás megtartásával, felesleges második mozgó felső tartalom nélkül.
3. A mobilos elrendezés továbbfejlesztését a 320–768 px tartományra, a korábbi oldalakat és funkciókat megőrizve.
4. Médiakezelés, duplikátumok és hivatkozásbiztonság, a média- és dokumentum-CRUD megtartásával, szerzői és felhasználási jogi kontrollal.
5. Dokumentumtár, közvetlenül megnyitható PDF, előnézet, letöltés, szűrők és verziótörténet továbbfejlesztését.
6. Teljes oldalas keresés, pontosabb találati célpontok, kiemelések, javaslatok és a konfigurálható keresési limitek megtartását.
7. A 66 tartalmi oldal és a média-/dokumentumtartalmak tételes, bizonyítékalapú felülvizsgálatát.
8. WCAG-célú fókusz, billentyűzet, mobil és böngészőkompatibilitási ellenőrzést.
9. Teljesítmény, média- és offline gyorsítótár, valamint a honlap alján teljes fájlméretet és mérési adatokat mutató diagnosztikát.
10. Statikus FTP-re kiadható teljes, sérülésellenőrzött ZIP-et, hozzá biztonságos visszaállítási és kiadási leltárral.

**Kiegészítő, kiemelten fontos igény:** az egész kód áttekintése abból a szempontból, hogy a változtatható mennyiségek, darabszámok, dátumablakok, időzítések, méretek és globális kapcsolati adatok egyetlen központi `json/config.json` állományból származzanak. Minden beállítás szerkeszthető legyen egy külön `tools/` felületen; ne keletkezzen duplikált globális adat. Pontos, tételes beállításjegyzék is készüljön. A teljes webes és PDF-használati útmutató minden oldalra, funkcióra és eszközre terjedjen ki, a dokumentumtárban is legyen elérhető. Az átadáskor készüljön „kért–elkészült–tesztelt–nyitott” beszámoló és új, működő, több lehetőséget kiválasztó fejlesztési választó.

**A fejlesztés közben érkezett további kérés:** 768 képpontos vagy keskenyebb mobilnézetben a két váltakozó képfelület a címeres körmenügomb fölött és alatt helyezkedjen el. A széles lapozósáv helyére a képen bal/jobb két nyíl, egy keskeny sorszámválasztó és egy kicsi szünetvezérlő került. Az egyes események kártyáján ne legyen külön Részletek/Naptárba gombsor: a teljes eseménykártya kattintással vagy Enterrel nyissa meg a kapcsolódó oldalt. A központi naptárexport változatlanul elérhető.

**Legújabb arculati kérés:** a világos megjelenés ne legyen vakító; a korábbi fehéres hátteret melegebb, sötétebb kőszín és bézs kártyák váltsák fel. A világos és a sötét témához külön, egy helyről szerkeszthető színpaletta kell, kontrasztos kezelőelemekkel és látható fókuszjelöléssel.

**Végső színkiegészítés:** mindkét témához két további sportos hangsúlyréteg kell, zöld és sárga színnel. Ezek ténylegesen jelenjenek meg az eseménykártyákon és a képlapozó vezérlőin. A korábbi lila diagram- és hibaszíneket is meg kell szüntetni, és a sportdiagram palettáját a központi JSON-ból kell betölteni.

## 2. Mi készült el a 10 területen?

A korábbi 14. fejlesztési kör eredményeit a jelen, 15. kiadás tartalmazza. A 15. kör konkrét új munkája a központi konfiguráció kibővítése és az egyetlen adatforráshoz való kapcsolás, az újonnan feltöltött README megőrzése, a mobilos képfelületek átrendezése, az eseménykártyák kattinthatósága, a két téma központi színpalettája, valamint a webes/PDF-kézikönyv újragenerálása. A körmenü és médiakezelő korábbi funkciói megmaradtak; ezek teljes új böngészőtesztje nem került elvégzésre ebben a körben.

| # | Terület | Eredmény | Korlát / további teendő |
|---|---|---|---|
| 1 | Címeres körmenü | **Elkészült és Chromiumban próbálva:** a gomb a nyitás/zárás során ugyanaz a DOM-elem; a címer megmarad, a megnyitott körmenü több szintű. | Teljes eszköz- és képernyőolvasó-mátrix nyitott. |
| 2 | Képes oldaltérkép | **Elkészült és lapozással próbálva:** a két kép körívesen illeszkedik a közös gombhoz, számozott bal és jobb lapozóval, szüneteltetéssel. | A pixelpontos illeszkedés minden valós telefonon még átvételt igényel. |
| 3 | Mobilos nézet | **Új 15. körös elrendezés:** 768 px alatt felső/alsó képpanel és középen egyetlen címeres körmenügomb; nagy lapozósáv nélkül két oldalsó képlapozó, kis sorszámválasztó és szünetgomb. | A 320/360/390/430/768 px automata Chromium-alkalmazásindítást a környezet megakadályozta; ezek a tényleges vizuális tesztek nem igazoltak. |
| 3a | Eseménykártyák | **Elkészült:** a kezdőoldali események és a naptár kártyái kattintható hivatkozássá alakultak; külön részlet- és egyedi exportgomb nincs. | Az esemény a saját `route` útvonalára navigál; a kártyán belüli külön .ics-export megszűnt, a naptár fő exportfunkciója megmaradt. |
| 3b | Világos és sötét arculat | **Elkészült kódszinten:** a világos mód egységes, sötétebb kőszínű hátteret és bézs kártyákat kapott, a sötét módban sötétkék felületek és kontrasztos feliratok maradtak. A két paletta 24 szín- és felületértéke egyedül a központi JSON-ban szerkeszthető. | A valós eszközös vizuális és teljes színhűség-/kontraszt-audit külön elfogadási teszt. |
| 3c | Két sportos színszint mindkét témában | **Elkészült:** `sportGreen` és `sportYellow` világos és sötét változatban; az eseménykártyák, sportos címkék és a képlapozó nyilak kiemelései ezeket használják. A sportdiagram 2×6 további színének egyetlen forrása szintén a központi JSON. A CSS/JS/JSON/HTML/SVG forrásokban talált két lila árnyalatot lecseréltük. | Az összes képi állomány pixeleinek színellenőrzése külön kreatív felülvizsgálatot igényel. |
| 4 | Médiakezelés | **A meglévő szerkesztő, tömeges műveletek, duplikátum- és hivatkozásellenőrzés megmaradt.** A felülvizsgálati munkalap ellenőrt, bizonyítékot és médiaengedélyt kér a jóváhagyási adat rögzítéséhez. | A tényleges felhasználási engedélyeket nem lehet automatikusan kiállítani. |
| 5 | Dokumentumtár és PDF | **Elkészült:** előnézet és közvetlen PDF-megnyitás/letöltés, verziómetaadatok; az új 3.1-es kézikönyv a dokumentumtárban önálló tétel, pontos hash-sel és mérettel. | A böngészőbe épített PDF-nézegető egyes készülékeken tiltott lehet; közvetlen megnyitás/letöltés biztosított. |
| 6 | Kereső | **Megőrizve és paraméterezve:** találati limit, oldalankénti találatszám, javaslatok, kiemelési idő és célpontra ugrási ismétlések a közös JSON-ból kérhetők le. | A keresési relevancia teljes szakmai próbája nincs lezárva. |
| 7 | Tartalmi hitelesítés | **Tételes munkalap továbbfejlesztve:** a 66 oldal, dokumentumok és médiák státusza ellenőrrel, forrással, engedéllyel és CSV/JSON-exporttal követhető. | 56/66 oldalnak nincs `verifiedContent=true` jelzése; ez nem azonos a hivatalos jóváhagyással. |
| 8 | Akadálymentesség | **Javítva:** központi fókuszjelölés, billentyűzetes menükezelés, címkézett képlapozók, csökkentett mozgás figyelembevétele. | Teljes WCAG 2.2 AA megfelelőség, NVDA/VoiceOver és Safari/Firefox teszt nincs igazolva. |
| 9 | Teljesítmény és diagnosztika | **Elkészült és böngészőben próbálva:** fájlszám, fájlok összmérete, indulási és oldalmegjelenési idő, fájltípusonkénti és erőforrás-alapú mérések. Verziózott, korlátos offline gyorsítótár. | Ez nem PageSpeed/Lighthouse-pontszám; a Bootstrap CDN, külső források és nem mentett PDF-ek nem garantáltan offline elérhetők. |
| 10 | FTP-kiadás | **Elkészült:** teljes gyökérstruktúra, minden fájlnak pontos méret- és SHA-256-adata a manifestben, helyi ellenőrző és visszaállítási útmutató. | Nincs éles FTP-telepítés vagy valódi szerveroldali visszaállítási próba. |

## 3. Központi JSON: hogyan szűnt meg a globális értékek szétszórása?

A **`json/config.json` 183 mezőt** tartalmaz. A `js/site-settings-2026.js` a betöltött konfigurációt központilag olvassa, és olyan függvényeket ad a moduloknak, mint a típusellenőrzött számlekérés, a központi intézményi adatok szövegbe behelyettesítése és a kezdő–záró időablak ellenőrzése. A korábban több modulban szereplő listahosszakat, keresési késleltetéseket, gombméreteket, gyűrűs navigációs arányokat és időzítéseket a kapcsolódó modulok a központi értékekből kapják. A 66 oldal ismételt, önálló `schoolYear` metaadatát korábban eltávolítottuk; a globális tanév forrása a `currentSchoolYear`.

**Újonnan egyetlen helyre került:** két titkársági telefonszám, OM-azonosító, intézményvezető, fenntartó és fenntartói cím; keresőjavaslatok és elgépelés-tűrés; dokumentumtár alapnézete, alapértelmezett rendezése és frissítési gyakorisága; esemény-, sport- és tanulói sikerek frissítése; animációk, belépőkapu, körhinták, órák és időzített visszajelzések milliszekundumos időértékei; sporthír-élettartam és szerkesztői listahossz; a média-, oldal-JSON- és hír-JSON-importok maximális mérete. Az adatgyűjteményekből 11 ismételt globális metaadatmezőt eltávolítottunk; a tényleges dokumentumok és események egyedi rekordadatai továbbra is a saját forrásukban maradnak.

**Ahol az adatot felhasználják:** `js/documents.js`, `js/search-j-2026.js`, `js/blocks.js`, `js/student-achievements.js`, `js/home-live.js`, `js/sports-successes.js`, `js/daily-sport-news.js`, `js/experience-2026.js`, `js/advanced-2026.js`, `js/tenway-2026.js`, `js/extended-hubs-2026.js` és `js/app.js`; a `tools/tool-settings-2026.js` a segédoldalak számára ad központi forrást, a médiakezelő közvetlenül olvassa a konfigurációt.

**Fő adatcsoportok:** intézménynév, cím, e-mail és KRÉTA-cím; tanév és navigáció; automatikus JSON-frissítési időszakok és kérésszám; megjelenés; tartalomútvonalak és adatvédelem; keresési lapméret, találati/javaslati korlát és kiemelés; gyorsítótár verziója és méretkorlátja; képsávok száma, váltási sebessége és kezdő/befejező dátumablaka; a menü gyűrűinek sugarai és töréspontjai; dokumentumkeresés és szűrőkorlát; kártyaszámok, galérialapok, hír- és sportos blokkok; akadálymentes érintési méretek, diagnosztikai korlátok és további iskolai modulparaméterek.

**Szerkesztő:** `tools/parameterek-szerkeszto.html` minden mezőt a JSON valós szerkezetéből rajzol ki, kereshető, ellenőrzi az adattípusokat és több összefüggést, támogat importot, az eredeti állapot visszaállítását és a fájl exportját. Mivel a tárhely csak statikus, a szerkesztő **letölti** az új `config.json`-t; semmilyen szerveres JSON-t és FTP-t nem írhat automatikusan.

A teljes, **mezőnkénti 183 soros jegyzék** a `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md` állományban és a webes/PDF-kézikönyv 12. fejezetében szerepel. A kód működéséhez szükséges matematikai, DOM- és CSS-algoritmus-állandók nem üzleti beállítások. Az egyedi esemény kezdő és záró dátuma az esemény saját `json/adatok/esemenyek.json` rekordjában, a dokumentum érvényessége a saját dokumentumrekordjában marad: ezek *nem* duplikált globális beállítások. Egyes történeti és szerkesztői szövegek még tartalmaznak konkrét évszámokat; további teljes tartalmi normalizálás külön átvizsgálást igényel.

**Új témaszín-beállítások:** a `theme.lightColors` és `theme.darkColors` egyenként 13-13, tehát összesen 26 paramétert tartalmaz. Ebből 24 egyedi szín/felületérték és kettő önálló, hat-hat további sportdiagram-színt felsoroló paletta. A két plusz sportos színszint a `sportGreen` és `sportYellow`, mindkét témában aktív. A `js/site-settings-2026.js` állítja be a CSS-változókat, a sportdiagram pedig a közös konfigurációból olvassa színeit. A témaváltás továbbra is az egyetlen `data-theme` logikát használja.

## 4. Teljes kézikönyv – PDF és webes változat

- `utmutato.html`: **kereshető, minden funkciót és mind a 66 tartalmi oldalt egyenként felsoroló** használati kézikönyv, 13 részletes fejezettel; mind a 8 segédeszköz és a 183 JSON-paraméter tételes leírásával.
- `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`: új, **18 oldalas**, ténylegesen megnyitható, szöveges 3.1-es PDF-kézikönyv.
- `json/adatok/dokumentumok.json` és `json/assets-inventory.json`: a PDF új `3.1.0` verziója, pontos bájtmérete és SHA-256 lenyomata összhangban van a fizikai fájllal.
- A dokumentumtárból PDF-ként megnyitható vagy letölthető, továbbá a webes használati útmutató linkje is elérhető.

## 5. Elvégzett mérések és tesztek

### Statikus és fájlszintű tesztek – sikeres

1. **88 JSON-fájl:** mindegyik értelmezhető, **0 JSON-szintaktikai hiba**.
2. **40 JavaScript-fájl:** mindegyik átment a `node --check` ellenőrzésen; az inline HTML-scriptek külön ellenőrzés tárgyai.
3. **66 regisztrált oldal:** mindegyikhez létezik oldalfájl; a 66 SPA-útvonal egyedi.
4. **65 menücsomópont és kezdőoldal:** a menü kapcsolatai az oldalindexben feloldhatók.
5. **183 beállítás:** egyetlen központi `json/config.json` fájlban; hozzá szerkesztőfelület létezik. A korábban az adatgyűjteményekben is tárolt 11 globális mező már nem szerepel két helyen.
6. **8 HTML-segédoldal:** mind megvan; összesen 11 HTML-fájl helyi `href`/`src` hivatkozásait ellenőriztük, hibás cél nem maradt.
7. **Teljes fájlleltár:** minden manifestbe felvett fájl tényleges méretét és SHA-256 értékét újraszámoltuk; az eltérések száma **0**.
8. **PDF:** `pdfinfo` megnyitotta, 18 oldalt jelzett; szövege kinyerhető, a 66 oldal és 183 paraméter jegyzéke benne van.
9. **Dokumentummetaadatok:** a PDF mérete, hash-e és verziója egyezik a fizikai állománnyal.
10. **Új kódfájlok:** a célzottan ellenőrzött új JS/CSS-fájlokban nem szerepelnek forráskód-kommentek.
11. **FTP-kompatibilitás:** a kiadási állományok statikus fájltípusok; Bootstrap a rögzített `5.3.9` verziójú CDN-ről érkezik, helyi Bootstrap-másolat nélkül.
12. **ZIP:** a teljes csomagot sérülésmentességre és állományszámra ellenőriztük az előállítás után.
13. **HTML-be ágyazott programok:** az összes 11 HTML-ben található inline JavaScript `node --check` szintaktikai ellenőrzése hibamentes.
14. **Globális kontaktadatok:** 6 önálló kapcsolat- és intézményi azonosítóérték már csak a központi JSON-ban található, az oldalak változóhivatkozásokat használnak.
15. **Közös konfigurációs mezők:** öt gyűjteményből a dokumentum-alapnézetet, dátumzónát, frissítést és tanévet érintő 11 ismételt metaadatmező eltávolítását ellenőriztük.
16. **A ténylegesen feltöltött README:** a felhasználó új ZIP-jében szereplő állomány tartalma bájtra pontosan megmaradt az új kiadásban.
17. **Mobilos elrendezés:** a 768 px alatti felső/alsó panel, köríves kivágás, kisméretű oldalnyilak és a választható sorszám a CSS- és JS-forrásban automatikusan ellenőrzött.
18. **Eseménynavigáció:** a kezdőoldali és a naptárhoz tartozó eseménykártya teljes felületét hivatkozás vezérli; az egyedi részletgombsor hiányát a forrásellenőrzés vizsgálja.
19. **Központi témaszínek:** a 24 szín-/felületérték a `json/config.json` két palettájából kerül a CSS-változókba, a külön témastíluslap a két üzemmódot támogatja. A diagramok 2×6 további színe szintén innen származik.
20. **Palettaszín-kontraszt:** a szöveg és másodlagos szöveg oldal-/kártyaháttérhez mért matematikai kontrasztja mindkét palettában eléri a 4,5:1 küszöböt. Ez csak a négy központi színpárra vonatkozik, nem teljes WCAG-tanúsítás.
21. **Sportos hangsúlyrétegek:** a világos és sötét téma zöld/sárga mezői a megfelelő kártyához és képlapozóhoz ténylegesen be vannak kötve.
22. **Diagram-színforrások:** a hat-hat kiegészítő sportdiagram-szín a központi JSON-ban található, nem a JavaScriptbe beégetett tömbben.
23. **Lila tiltása:** a CSS-, JS-, JSON-, HTML- és SVG-forrásokban a színtelített lila hexakódokat színárnyalat-ellenőrző szkript keresi; a végső eredmény nulla.

**A 15. kiadás eredménye: 28/28 automatikus fájl- és forrásellenőrzés sikeres, 0 hiba.** A korábbi teszteket a mobilos függőleges elrendezés, az eseménykártyák, a két központi színpaletta, a sportos zöld/sárga kiemelések, a diagramok központi színlistája, a lila színkódok tiltása és a szövegkontraszt számítása egészíti ki. A ZIP 725 fájljából 724 állományhoz tartozik külön méret és SHA-256 a manifestben, amely saját magát nem sorolja fel. A pontos ZIP-méret és a teljes mért állományméret az átadáskor külső fájlellenőrzéssel állapítható meg.

### A korábbi 14. körben végzett böngészős megfigyelések – a 15. körben nem újramértek

- Chromium alapú, helyi tesztelő böngészőben a kezdőoldal, a körmenü, a képes lapozó, a dokumentumtár, a paraméterszerkesztő és a webes kézikönyv megnyílt.
- A körmenü megnyitása után ugyanaz az `#orbit-open` gomb maradt, a nyitási állapot megváltozott; a bezárás után `aria-expanded=false` állapot látszott.
- A bal képsáv 4. sorszámozott gombjára kattintva a számláló **4 / 10** értékre váltott.
- A korábbi kiadás paraméterszerkesztője a **120/120** korábbi mezőt kirajzolta. A keresési lapméret 12-ről 15-re módosítása, az ellenőrzés és a 12-re visszaállítás akkor sikeres volt. A mostani 183 mezős felület külön új böngészős ellenőrzése még szükséges.
- A webes kézikönyv valamennyi fejezetét és a tényleges PDF-hez vezető közvetlen hivatkozást megjelenítette.
- A dokumentumtár betöltötte a 3.1-es útmutatót és a többi PDF-et.
- Az oldal alján a diagnosztikai kártyák egy korábbi próbamérésben **19,87 MiB / 719 fájl** összméretet, továbbá **985 ms** indulási és aktívoldal-megjelenési időt mutattak. Ez a 14. kiadáson mért történeti adat, a 15. kiadás tényleges teljes fájlméretét a friss `release-manifest.json` tartalmazza.

### Nem elvégzett vagy nem igazolt tesztek

- A helyi különálló Chromium indítását a futtatókörnyezet `Operation not permitted` hibával blokkolta, ezért a 320/360/390/430/768/1024/1440 px automatizált vizuális mátrix **nem tekinthető sikeresnek**.
- Firefox, Safari, Android és iOS natív megjelenítés, valódi érintőmozdulatok, képernyőolvasók, a teljes megjelenítés minden színpárjára kiterjedő kontrasztmérés és teljes WCAG 2.2 AA audit külön vizsgálatot igényel.
- Lighthouse/PageSpeed pontszám, tartalomigazság, fotó- és videóengedélyek, tényleges offline működés megszakított internet mellett és éles szerveres rollback nem lett igazolva.

## 6. A jóváhagyási kapuk és a nyitott kockázatok

- **Tartalom:** 66 oldalból 10 kapott `verifiedContent=true` gépi jelzést, 56 nem; még a 10 jelzés sem helyettesíti a felelős intézményi jóváhagyást.
- **Média:** a 114 regisztrált média rekord jogállása: 1 felhasználótól kapott, 29 felülvizsgálandó, 4 csak előnézetre jogosított és 80 generált. A generált képek önmagukban nem dokumentálják az intézményi publikálási jogosultságot.
- **SEO:** a `noindex,nofollow` jelzés szándékosan megmaradt, amíg a tények, adatok és jogok intézményi jóváhagyása hiányzik. A hash-alapú SPA teljes szerveroldali indexelést nem garantál.
- **Offline:** a CDN-ről betöltött Bootstraphez élő internetkapcsolat kell; a service worker a saját eredetű állományok egy részét tárolja, nem a teljes honlap minden PDF-jét és videóját.
- **FTP:** a szerkesztő és a böngésző nem írhat szerveres JSON-t. A közzététel előtt a teljes csomag manifestjét újra kell számítani; a visszaállítás csak megtartott kiadási mentésből végezhető.
- **Adatcentralizálás:** a 183 központi mező kezeli a globális változtatható értékek jelentős részét, de nem állítható, hogy *minden* konkrét szöveges évszám vagy összes CSS-algoritmusérték automatikusan fel lett derítve és átvezetve. A tételhez tartozó egyedi időpontok saját rekordjukban egyetlen helyen maradnak.

## 7. Átadás és használat

1. A ZIP gyökerében közvetlenül az `index.html` és az eredeti `README.md` található, mellettük `css/`, `js/`, `json/`, `assets/`, `tools/` és `dokumentacio/`.
2. A helyi HTTP(S)-tesztkörnyezetben ellenőrizd a kezdőoldalt, a körmenüt, a dokumentumtárat, és a `tools/parameterek-szerkeszto.html` szerkesztőt.
3. Az `utmutato.html` a teljes webes útmutató. A `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf` ennek letölthető, dokumentumtárba bekötött 3.1-es PDF-je.
4. Paramétermódosítás után cseréld a `json/config.json` fájlt helyben, frissítsd a manifestet, és újra teszteld a teljes csomagot.
5. A szerkesztett ZIP-et a fejlesztés során **nem** töltöttük fel az iskolai FTP-re. Intézményi jóváhagyás nélkül nem tekinthető élesíthető hivatalos tartalomnak.

**Következő fejlesztési kör:** az átadó beszélgetés végén 10 lehetőségből álló, működő többválasztós választó található; egyszerre több opció is kiválasztható.
