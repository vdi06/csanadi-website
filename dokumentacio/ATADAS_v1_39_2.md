# Csanádi Sportiskola – v1.39.2 javítási és tesztjegyzőkönyv

**Kiadás:** `csanadi_website_v1_39_2.zip`  
**Dátum:** 2026. november 17.  
**Alap:** az önállóan megőrzött v1.39.1, a v1.39.0 részletes hibajegyzéke és a jóváhagyott 41 fejlesztési kérés / 18 tervezési döntés.  
**Állapot:** második célzott javítóalverzió, nem a teljes projekt zárókiadása.

## Mit kért a felhasználó?

1. A v1.39.2-ben elsőként **valóban eltérő, témaspecifikus oldalsablonok** készüljenek, ne csak azonos elrendezés eltérő színnel.
2. A mobilos változatban a **menü látható és felismerhető** legyen.
3. A telefonos körnavigátor alatti **alsó sáv ne maradjon üres**.
4. Minden eredeti funkció maradjon meg; teljes, **statikus FTP-kompatibilis ZIP** és tételes tesztbeszámoló készüljön. FTP-feltöltés nem történt.

## Elvégzett fejlesztések

### 1. Valóban eltérő oldaltípusok

Az új `js/page-templates-v1-39-2.js` a tényleges útvonal alapján választ sablont, és **a cikkek DOM-szerkezetét** is eltérően alakítja. Nem pusztán színosztályt cserél. Az eredeti JSON-szövegek és blokk-renderelők megmaradnak, az intézményi tényadatok változatlanok.

| Oldaltípus | Oldalak száma a 71-ből | Tényleges szerkezet |
|---|---:|---|
| Hírek | 6 | hangsúlyos vezető cikk + kétoszlopos szerkesztőségi anyagfolyam |
| Események | 3 | függőleges esemény-témasor számozott pontokkal; kitalált eseménydátum nélkül |
| Sport | 7 | széles sportos kiemelés + különálló sportági kártyarács |
| Dokumentumok | 5 | oldalsó, fókuszálható témamutató + külön dokumentumszakasz-oszlop |
| Megközelítés | 2 | nagy bevezető és több külön megközelítési tájékoztató panel |
| Tanulási útmutatók | 24 | önálló témaválasztó és függőleges, számozott tanulási lépések |
| Iskolai információk | 12 | kiemelt első tudnivaló + strukturált információs kártyák |
| Iskolai bemutatkozás és egyebek | 12 | széles történeti/bemutatkozó tartalom + tematikus csemperendszer |

A dokumentumtári és útmutatóoldalak saját témamutatóján gombokkal lehet fejezethez ugrani. A korábbi automatikus tartalomjegyzék felismeri a mélyebbre áthelyezett `h2` címsorokat, és nem állít elő második, párhuzamos listát ott, ahol már van saját mutató.

**Korábbi konkrét hiba javítva:** a `#/hirek-es-esemenyek/esemenynaptar` már ténylegesen **esemény** sablon, nem a teljes `hirek-es-esemenyek` útvonalnév miatt tévesen „hír” sablon. A további hír-, sport-, dokumentum-, megközelítési és tanulási útvonalak célzott besorolása is ellenőrzött.

Az új CSS szerkezeti különbségeket jelenít meg, asztalon több hasábbal, telefonon egyhasábos összeomlással. Megmaradt a sötétkék–fehér–arany prémium arculat és a középre igazított, áttekinthető címszerkezet.

### 2. Mobilmenü láthatósága

- A felső sáv körmenüikonja most **látható „MENÜ” feliratot** és erősebb, kontrasztosabb gombkeretet kapott.
- A gomb a 320 és 390 px-es tesztben is látható, a körmenüt megnyitja.
- Az első körben hat főmenüpont, a másodikban a kiválasztott témához tartozó almenüpontok jelennek meg. Az eredeti közvetlen megnyitási viselkedés megmaradt.
- A 320 px-es próbán nem keletkezett vízszintes túlcsordulás.

### 3. A körmenü alatti üres sáv

A korábban nagy üres alsó területre működő, jól látható **„Gyors elérések”** navigáció került három hivatkozással: **Kezdőlap, Hírek, Kapcsolat**. A kör és az alsó hivatkozássor a rendelkezésre álló kijelzőmagasságon elosztva jelenik meg. A 320 px-es képernyőn a három gyorselérés elérhető és egy sorba rendeződik; a második körmenüszinten is megmarad.

### 4. Megőrzött funkciók és FTP-függetlenség

- A 71 oldal, a 6 főmenü, a 28 látható almenü, a 628 regisztrált médiaelem, a dokumentum-/hír-/sport-/naptármodulok és a meglévő SPA-útvonalak megmaradtak.
- A v1.39.1 teljes szövegű keresője, ragadó/kompakt főoldali fejléce és mobilos sportanimációja továbbra is része a csomagnak.
- A v1.39.2 futtatásához továbbra sem szükséges PHP, adatbázis, szerveroldali kereső vagy GitHub Actions; a fájlok FTP-n statikusan szolgálhatók ki.

## Változtatott vagy új forrásfájlok

| Fájl | Jelentőség |
|---|---|
| `js/page-templates-v1-39-2.js` | útvonalalapú besorolás és 8 külön DOM-szerkezet |
| `css/page-templates-v1-39-2.css` | eltérő tartalmi rács, timeline, dokumentumoldalsáv, tanulási lépések, reszponzív beállítások |
| `js/app.js` | új sablonmodul meghívása, régi sablon-besorolás kiváltása |
| `js/release-v1-39-0.js` | többszintű cikkstruktúrával kompatibilis tartalomjegyzék; feliratos mobilmenü |
| `index.html` | mobil gyorselérési sáv; két új CSS-réteg; v1.39.2-es betöltés |
| `css/mobile-navigation-v1-39-2.css` | feliratos mobilmenü és a körnavigátor magassághoz igazított alsó sávja |
| `script.js`, `json/config.json` | friss verzió/betöltési és gyorsítótár-jelölés |
| `tools/test-release-v1-39-2.mjs` | célzott, 14 szempontos új ellenőrzés |
| `tools/route-smoke-v1-39-2.html` | 71 útvonalat és tényleges új cikkstruktúrát ellenőrző böngészős teszt |
| `tools/build-release-manifest.js`, `tools/verify-release-manifest-v1-39-0.js`, `release-manifest.json` | SHA-256 alapú kiadásellenőrzés |

## Tesztelés

| Ellenőrzés | Eredmény | Mire terjed ki? |
|---|---|---|
| Visszamenőleges struktúrateszt | **947/947** | menü, 71 oldal, JSON-ok, 628 média, belső hivatkozások |
| v1.39.1 regresszió | **7/7** | korábbi fejléc/kereső/kibocsátási alapok |
| Teljes oldal-szövegindex | **74/74** | 71 teljes oldalindex + három konkrét szó |
| Új v1.39.2 regresszió | **14/14** | 8 sablontípus, útvonalbesorolás, mobilmenü és verziózás |
| Statikus HTTP | **1292/1292** | 71 oldal, 628 média és 590 statikus kiegészítő |
| Téma-regresszió | **12/12** | korábbi témaszinkron-próba |
| Böngészős SPA-útvonalak, mobil 390 px | **71/71** | minden regisztrált útvonal és új cikkstruktúra |
| Böngészős SPA-útvonalak, asztal 1200 px | **71/71** | minden regisztrált útvonal és új cikkstruktúra |
| Mobilmenü, 320 px | **sikeres** | látható MENÜ-gomb, két körmenüszint, 3 gyorselérés, 0 px vízszintes kilógás |
| Mobil híroldal, 320 px | **sikeres** | vezető cikk + anyagfolyam, egyhasábos rács, 0 px vízszintes kilógás |
| Kiadási manifest | **1287/1287** | SHA-256 alapú fájllista és manifest-ellenőrzés |
| ZIP-integritás | **a csomagolás végén kerül hitelesítésre** | teljes ZIP CRC |

**Átmeneti tesztjelenség:** az első v1.39.2-es 390 px-es 71 oldalas futásban a `#/sport/edzok` egyszer túllépte a 7 másodperces várakozást, miközben „A kiválasztott oldal betöltése…” állapotban maradt. Közvetlen megnyitásra azonnal betöltődött, majd az ismételt teljes 390 px-es teszt **71/71 sikeres, 0 JavaScript-hiba** eredménnyel zárult. A teszteszköz alapértelmezett várakozása 12 másodpercre nőtt. A pillanatnyi betöltési késedelem oka nincs bizonyítva; külön regressziós megfigyelést érdemel.

## Még nyitott feladatok és korlátok

1. **A 66 eredeti oldal szerkesztői audítja, tartalmi duplikációinak tényleges megszüntetése és indokolt JSON-fájlokra bontása** még nem történt meg. A v1.39.2 a megjelenítés szerkezetét dolgozza át, nem az összes oldal szövegét.
2. A régi, összevont **megközelítési és tanulási segédoldal** minden funkciójának új helyre történő áthelyezése nyitott.
3. A témánként teljesen egyedi, humoros sportanimációkészlet és a teljes tartalmi/rendszerszintű deduplikáció nincs kész.
4. Az automatikus útvonal- és statikus tesztek **nem helyettesítik** a fizikai telefonos tapintásos próbát, Safari/Firefox teljes regresszióját, WCAG 2.2 AA szakértői auditját és a reprodukált FCP/LCP/CLS teljesítménymérést.
5. A belső teljes szövegű oldalindexet oldal-JSON módosításkor kiadás előtt helyben újra kell generálni a mellékelt Node-eszközzel; a szerveren ehhez nincs Node-követelmény. A Bootstrap CDN, a KRÉTA és a hozzájárulás után megnyíló térképszolgáltatás továbbra is külső hálózatot igényelhet.
6. A megközelítésnél továbbra sem közölhető ellenőrizetlen akadálymentes bejárat vagy pontos bejárati térképpont tényként.

**Összegzés:** a v1.39.2 önálló, visszaállítható, célzott javítóalverzió. Nem állítható róla a teljes 41/41 kérés végleges teljesítése.

## Telepítés és visszaállítás

1. A ZIP teljes tartalmát a statikus FTP-tárhely megfelelő dokumentumgyökerébe kell feltölteni, a könyvtárstruktúrát megtartva. **Az átadás során nem történt FTP-feltöltés.**
2. Az új cache-verzió: `csanadi-r-v1.39.2`; a korábbi gyorsítótár és service worker frissítésére szükség lehet.
3. Új tartalmak kiadása előtt a keresőindexet és a release-manifestet újra kell építeni a `tools/` eszközeivel.
4. Visszaállításhoz a megőrzött teljes v1.39.1 ZIP használható.

**Javasolt következő v1.39.3:** a 66 korábbi oldal tételes szerkesztői/duplikáció- és szétbontási vizsgálatának első lezárt egysége, illetve az összevont segédoldal funkcióinak témánkénti áthelyezése.
