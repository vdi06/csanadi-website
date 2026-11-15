# Csanádi Sportiskola 2026 – 22. kiadás: tételes fejlesztési és tesztbeszámoló

**Dátum:** 2026. november 15.  
**Kiinduló teljes csomag:** `Csanadi_Sportiskola_2026_21_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`.  
**Átadandó teljes csomag:** `Csanadi_Sportiskola_2026_22_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`.  
**Éles feltöltés:** NEM történt; az iskolai FTP-tárhely és a GitHub nem módosult.

## 1. A felhasználó tíz új, kiválasztott fejlesztése

Mindegyik új funkció az `iranytu.html` oldalon van, az adatok a `json/adatok/iranytu-22.json` fájlból kerülnek a felületre. Az eredeti SPA-oldalak és a 21-es `felfedezo.html` változatlanul elérhetők.

### 1. Digitális nyílt nap

**Elkészült:** Hét sorrendben bejárható bemutatóállomás az Iskolai iránytűben; Előző/Következő/Újrakezdés gombok és tényleges belső információs hivatkozások. Személyes adatot nem kér.

### 2. Tanulmányi útvonalválasztó

**Elkészült:** Képzési szakasz és érdeklődési kör szerint szűrhető nyilvános tanulási utak, kapcsolat a meglévő felvételi/oktatási/sportági oldalakon közzétett adatokkal. Nem felvételi alkalmassági értékelés.

### 3. Fenntarthatósági központ

**Elkészült:** Ökoiskolai témakörök, szemléletformáló bemutatók és eredeti tájékoztató oldalak. Valóban hitelesített számszerű eredmény hiányában nem állít elő kitalált adatot.

### 4. Sportesemény-követő

**Elkészült:** Csak az esemény-JSON igazolt, publikált sporteseményeit listázó témaszűrő; helyben tárolt megtekintettségi jelzés. A jelenlegi forrásban nincs jóváhagyott sportverseny, ezért valós, magyarázott üres állapotot ad.

### 5. Magyar–angol iskolai fogalomtár

**Elkészült:** Tizenhat kétnyelvű, magyarázatos oktatási és sportkifejezés, magyar–angol keresés és kategóriaszűrés. Nem állítja, hogy intézményi hiteles fordítás.

### 6. Akadálymentes médiatár

**Elkészült:** A meglévő 138 képrekordból kereshető, szűrhető és lapozható megjelenítés; nagyító dialógus, alt, forrásjelzés, Escape, bal/jobb nyíl. Illusztráció nem válik igazolt rendezvényfotóvá.

### 7. Iskolai ügyintézési útmutató

**Elkészült:** Öt, lépésről lépésre olvasható tájékoztató hivatalos belső hivatkozásokkal. Az oldal nem gyűjt ügyintézési személyes adatot és nem helyettesíti a titkárságot.

### 8. Szülői információs központ

**Elkészült:** Hat, közérthető témakártya és kizárólag ellenőrzött, jövőbeli események megjelenítése, közvetlen tájékoztató hivatkozásokkal.

### 9. QR-kódos oldalmegosztás

**Elkészült:** 88 nyilvános célhoz 174 előre elkészített, helyi SVG-QR. GitHub Pages-előnézet és tervezett intézményi URL külön választható; a tényleges iskolai címet publikáláskor jóvá kell hagyni. Külső QR-szolgáltató nincs.

### 10. Nyomtatási központ

**Elkészült:** Több nyilvános tájékoztató kijelölése, egységes nyomtatási előnézet, majd natív böngészős nyomtatás vagy Mentés PDF-ként. Nincs adatküldés.

## 2. Kötelező alapjavítások – külön, NEM a tíz fejlesztési pont részei

1. **Kezdőlap személyre szabása:** A „Kezdőlap beállítása” sorai rugalmas rácsot, áttekinthető gombméretet és mobilon külön soros vezérlést kaptak, így a Feljebb/Lejjebb nem torlódhat a címekre.
2. **„Melyik téma érdekel?” választó:** A választás pillanatában külön ajánlás és közvetlen kattintható hivatkozások jelennek meg, illetve a vonatkozó szakasz előtérbe kerül. Nem marad látható visszajelzés nélkül.
3. **Sporthírek:** A korábban üres adat-JSON-ba három ellenőrzött, 2026. november 14-i Nemzeti Sport-hivatkozás került; a nem friss (72 órán túli) híreket a meglévő rendszer továbbra is kizárja. Üres állapotban a sporthírkártya középre rendezett.
4. **Diagnosztikai verzió:** A láblécben a kiadási manifest verziója és az aktuális oldal külön revíziója is megjelenik. A millisecond és automatikus bájt/KiB/MiB/GiB formázás megmaradt.
5. **Világos/sötét diagnosztika és állapotellenőrző:** Külön témás, kontrasztos feliratok, kártyák és fókuszkeretek a betöltési és honlapállapot-panelen.
6. **Mobilmenü:** Az alsó háromikones mobil navigáció Kezdőlap és Menü vezérlőjéről eltűnt a zöld–sárga hátterezés; világosban és sötétben semleges, olvasható kártyahátteret használ.
7. **Témaváltási visszajelzés:** A háromállapotú megjelenésváltó rövid üzenete az oldal felső részén jelenik meg. A Világos üzenet világos, a Sötét sötét; az Automatikus zöld–sárga átmenetes, a tényleges világos/sötét színmódhoz illő szöveggel. Más típusú figyelmeztetés saját semleges témaszínt használ.
8. **Indulás és gyorsítótár:** A korábbi hiányzó runtime.diagnostics.slowestResourceCount miatti összeomlás javítása megmaradt; a frissítő ellenőrzések és a csomag hivatkozásai 22-es verziót használnak.

## 3. Megőrzés és pontos fájlösszetétel

- A teljes 21-es kiadás minden fájlja megmaradt; az eredeti **66 JSON-tartalmi oldal bájtról bájtra változatlan**.
- A `README.md` változatlan; mind a **13 `tools/` segédoldal** megmaradt.
- `mobile/` és `desktop/` külön tartalmazza a csak az adott képernyőre vonatkozó új stílusokat; a közös fájlok továbbra is közösek.
- A fiktív diákhírek „MINTA” adatvédelmi szabályai és a korábbi hivatalosadat-korlátok változatlanok.
- A központi `json/config.json` konfiguráció **247** levelezhető paramétert tartalmaz; forrásalapú, teljes leltára: `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md`.
- A fő új fájlok: `iranytu.html`, `js/round22-center.js`, `css/round22-center.css`, `css/round22-public.css`, `mobile/round22-center-mobile.css`, `mobile/round22-nav.css`, `desktop/round22-center-desktop.css`, `json/adatok/iranytu-22.json`, `json/adatok/qr-index-22.json`, `assets/qr/*.svg`.
- Teljes, frissített webes kézikönyv: `utmutato.html`; frissített **3.8.0 PDF**: `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`.
- Az állományok méretét és SHA-256 lenyomatát a teljes `release-manifest.json` tárolja. A manifest saját magát nem számolja.

## 4. Tételes automatizált ellenőrzési jegyzék

**Ellenőrzések: 56 sikeres, 0 hibás, összesen 56.** A tesztek statikus forrás-, érvényesség-, fájl-, HTTP- és ZIP-ellenőrzések. Ez nem tényleges interaktív mobil vagy Safari-böngészős teszt.

| Vizsgálat | Eredmény |
|---|---|
| R21 minden eredeti fájlja megőrizve | Sikeres |
| 66 korábbi JSON-oldal tartalma változatlan | Sikeres |
| README.md pontosan megőrizve | Sikeres |
| Fiktív diákhírek JSON és adatvédelmi szabály változatlan | Sikeres |
| 13 karbantartó eszköz megőrizve | Sikeres |
| Háromikones mobil navigáció továbbra is megvan | Sikeres |
| Külön mobil/ és desktop/ R22 stílusok | Sikeres |
| Mobilmenü zöld/sárga gombháttér eltávolítása | Sikeres |
| Témaváltás értesítése: felül, világos/sötét és automatikus átmenettel | Sikeres |
| Szerkesztőhivatkozások nem kerültek a nyilvános láblécbe | Sikeres |
| Világos/sötét sportos paletta érintetlen | Sikeres |
| Cache-busting: új verzió | Sikeres |
| Központi R22 paraméterek teljesek | Sikeres |
| Tíz új modul HTML-azonosítója | Sikeres |
| Az iránytű be van kötve a kezdőoldalba és a felfedezőbe | Sikeres |
| 1. Digitális nyílt nap: hét állomás és vezérlők | Sikeres |
| 2. Tanulmányi útvonalak szakasz+téma szűrőkkel | Sikeres |
| 3. Fenntarthatóság: ellenőrizetlen mérőszámok nem kitaláltak | Sikeres |
| 4. Sportesemény-követő csak ellenőrzött publikált adatot mutat | Sikeres |
| 5. Magyar-angol fogalomtár 16 kereshető fogalommal | Sikeres |
| 6. Akadálymentes médiatár és billentyűzetes navigáció | Sikeres |
| 7. Ügyintézési útmutató legalább öt lépéssorral | Sikeres |
| 8. Szülői központ és ellenőrzött időpontok | Sikeres |
| 9. QR-kódos megosztás: 88 nyilvános cél és két domain | Sikeres |
| 10. Nyomtatási előnézet és PDF-be mentés | Sikeres |
| 174 helyi SVG QR-kód mindegyike helyes XML és létezik | Sikeres |
| Sporthír JSON kitöltve ellenőrzött publikációkkal | Sikeres |
| Az üres sporthírkártya középre igazított | Sikeres |
| Kezdőlap-beállítás rugalmas sor és mobil-gomb elrendezés | Sikeres |
| Melyik téma érdekel? azonnali ajánlásokat mutat | Sikeres |
| Honlapállapot-ellenőrző mindkét téma színei | Sikeres |
| Betöltési diagnosztika honlap- és oldalverzióval | Sikeres |
| Diagnosztika meglévő kritikus fallback-javítása megmaradt | Sikeres |
| Kiadási méretek automatikus KiB/MiB és idők ms | Sikeres |
| 19 HTML nem tartalmaz ismétlődő ID-t | Sikeres |
| 19 HTML helyi hivatkozás hibamentes | Sikeres |
| 92 JSON-fájl feldolgozható | Sikeres |
| 56 JavaScript-szintaxis helyes | Sikeres |
| JavaScript-modulimportok helyi fájlra mutatnak | Sikeres |
| Kézikönyv 3.8 PDF és SHA-256 metaadat | Sikeres |
| Webes kézikönyv 22-es kiadáshoz frissítve | Sikeres |
| Teljes PDF-dokumentumtár állománya elérhető | Sikeres |
| Manifest minden fájlt lefed | Sikeres |
| Manifest: minden SHA-256 és bájtméret pontos | Sikeres |
| Statikus FTP-kompatibilitás, kizárólag CDN Bootstrap | Sikeres |
| HTTP 200 / index.html | Sikeres |
| HTTP 200 / iranytu.html | Sikeres |
| HTTP 200 / felfedezo.html | Sikeres |
| HTTP 200 / js/round22-center.js | Sikeres |
| HTTP 200 / json/config.json | Sikeres |
| HTTP 200 / json/adatok/iranytu-22.json | Sikeres |
| HTTP 200 / json/adatok/qr-index-22.json | Sikeres |
| HTTP 200 / assets/qr/csanadi-qr-e725b3c893965c6e.svg | Sikeres |
| ZIP CRC hibátlan | Sikeres |
| ZIP gyökérben minden fájl teljes | Sikeres |
| ZIP README és R22 új modulok benne | Sikeres |

## 5. Korlátok, nyitott kérdések és külső feltételek

1. **Valódi készülékes próba:** Android, iOS, Safari, Firefox és Chromium böngészőben a 320/375/768/1440 px szélességű megjelenés és minden interakció külön ellenőrzendő. A jelen munkakörnyezetben a valós headless Chromium-futtatás rendszerengedély miatt nem volt lehetséges. Ez különösen a témaváltási üzenet vizuális elhelyezésére, a kezdőlapi kártyarendezőre és a mobilmenüre vonatkozik.
2. **FCP/LCP/CLS:** a korábbi CLS=0,656 felhasználói mérésből nem következik, hogy a 22-es kiadás minden eszközön 0,1 alá került. Új helyszíni mérés szükséges.
3. **Sporthírek aktualitása:** a három most ellenőrzött link **2026. november 14-i**. A 72 órás időablak miatt a hírek később eltűnhetnek, ha az intézményi szerkesztő nem frissíti a helyi JSON-t. Külső automatizált hírgyűjtő nincs.
4. **Sportesemények és fenntarthatósági mérőszámok:** nem lett kitalálva intézményi verseny vagy számszerű eredmény. A szakterületi jóváhagyás és ellenőrzött JSON-feltöltés szükséges.
5. **QR-célok:** a két publikálási környezethez előre generált QR-kódok célcímét közzétételkor ellenőrizni kell. Nincs külön QR-kód-szkennelő eszközön futtatott optikai ellenőrzés.
6. **Kliensoldali funkciók:** a nyomtatás, localStorage, Cache API, letöltés és service worker működése böngésző-/HTTPS-függő. A Bootstrap verzióhoz kötött CDN-t igényel, helyi Bootstrap-másolat nincs.
7. **Hivatalos adatok:** intézményi felvételi, időpont, ügyintézés, médiaszerzői és adatvédelmi tényeit a felelős személynek élesítés előtt jóvá kell hagynia. E kiadás nem éles, és a korábbi tesztcélú „noindex” is megmaradt.

## 6. Javasolt kézi átadási ellenőrzési sorrend

1. A teljes ZIP gyökérből kicsomagolva, helyi HTTP(S) tesztkiszolgálón nyíljon meg; ellenőrizd a kezdőoldal és az `iranytu.html` indulását.
2. Válts többször a Világos, Sötét és Automatikus mód között: a rövid üzenet **felül** látszódjon; a három kártya a kért stílust kapja.
3. Próbáld ki mobilon a Kezdőlap/Menü gombokat, a kör- és hamburgernézetet, valamint a teljes kezdőlap-beállító listát.
4. Ellenőrizd a „Melyik téma érdekel?” választás azonnali ajánlását és a három hír meglétét, majd a sporthírek üres állapotának középre igazítását.
5. Nyisd meg az iránytű mind a tíz modulját, teszteld a szűrőket, léptetést, médiadialógust, QR-megosztást és nyomtatható előnézetet.
6. Próbáld ki az URL-alapútér különböző telepítési gyökérútvonalakon, és ellenőrizd a QR-kódot tényleges telefonos beolvasással.
7. Ellenőrizd a lábléc betöltési diagnosztikájának verzióját, aktuális oldal-revízióját és a honlapállapot-ellenőrző mindkét témáját.
8. Végezzen az intézmény tartalmi/adatvédelmi jóváhagyást, és **csak ezután** szülessen külön döntés az FTP-feltöltésről.

## 7. Következő tízpontos fejlesztési választó

A következő, valóban választható tíz új funkció a beszélgetés végén külön interaktív választóban szerepel. A meglévő oldalak folyamatos hibajavítása továbbra is kötelező alapfeladat, és **nem** foglal helyet a tíz új pont között.
