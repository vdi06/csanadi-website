# Csanádi Sportiskola – v1.40.5 részletes átadási beszámoló

**Készült:** 2026. november 18.  
**Kiinduló állapot:** a korábban átadott, teljes v1.40.4 ZIP-pel azonos tartalmú projekt.  
**Kért fejlesztés:** I + J + K + L, minden működő funkció megőrzésével.  
**Közzététel:** **NEM történt** GitHubon, FTP-n vagy más tárhelyen.

## 1. Rövid eredmény

A projekt v1.40.5 verziójú, statikus FTP- és GitHub Pages-kompatibilis ZIP-ként átadható. A 71 regisztrált tartalmi oldal, 769 leltározott asset, 174 médiatári rekord és a kezdőlap 30 képváltós forrása megmaradt. A 19 csomagból álló, megújított helyi regresszió hibamentesen futott. Az automatikus tartalom- és keresési audit jelenleg 71/71 oldalon nulla jelzést talált a meghatározott szerkezeti és hivatkozási szabályokra.

Az I és J feladatok külső feltételhez kötött részei **nyitottak**: ténylegesen jóváhagyott új iskolai fotófájl nem volt csatolva, és fizikailag rendelkezésre álló telefon/tablet, illetve NVDA/JAWS/VoiceOver felolvasós kézi QA-jegyzőkönyv sem érkezett. Az előkészítő és helyben használható ellenőrzőeszközök viszont elkészültek. Sem képjóváhagyást, sem eszközös WCAG-tanúsítást nem állítunk bizonyíték nélkül.

## 2. Kért fejlesztések tételesen

### I – Valódi, jóváhagyott iskolai fotók regisztrálása

**Elkészült:**

1. Új, helyben futó `tools/iskolai-fotok-jovahagyasa.html` és `tools/iskolai-fotok-jovahagyasa.js` felület képfájlok kiválasztására.
2. JPG, PNG, WebP és AVIF ellenőrzése; MIME, fájlméret, képméret, egyedi SHA-256 és duplikátumazonosítás. Nem megfelelő képfájl nem jut a jóváhagyási munkalapra.
3. Kötelező forrásgazda/fotós, engedély vagy licenc, dokumentumazonosító, ellenőrző, intézményi döntésazonosító, dátum és személyesadat-védelmi jogalap mezők. Három külön felelősi nyilatkozó jelölő; hiányos adatokkal nem készül ellenőrzött munkajegyzék.
4. JSON- és CSV-munkalap letöltése; a CSV képletindításra alkalmas karaktereit az export semlegesíti.
5. HTTP-alapú statikus FTP-n is működő, helyi SHA-256 tartalékalgoritmus (`tools/sha256-local-v1-40-5.mjs`), külső szolgáltatás nélkül. Négy ismert tesztvektoron a Node hivatalos SHA-256 eredményével egyezett.
6. A tényleges médiaregisztrációhoz a korábban elkészült `tools/eszkoz-mediator.html` teljes fájlkezelője maradt az ajánlott felület, amely helyben állít elő ZIP-et. Nem jelent meg párhuzamos, ütköző médiakatalógus.

**Nem készült el, mert bemeneti adat hiányzik:** nem volt ténylegesen új, intézményileg jóváhagyott fotófájl és hiteles engedély. Ezért nem változott a 174 médiatári rekord, nem cseréltük le a 30 kezdőképet, és nem jelöltünk régi illusztrációt valódi eseményfotónak. Az új felületben kitöltött nyilatkozat sem helyettesíti az engedély eredeti ellenőrzését.

### J – Valós mobil- és akadálymentességi tesztelés

**Elkészült:**

1. `tools/mobil-akadalymentesseg-qa.html` és `.js`: azonos eredetű keretben megnyitja a tényleges projektet, és **320, 390 és 768 CSS-pixeles** szélességre méretezi.
2. Minden szélességen méri a keret tényleges `innerWidth` értékét, az oldal görgethető szélességét és a vízszintes túlcsordulást; figyelmeztet a 24 CSS-pixel alatti, látható interaktív célterületekre.
3. Ellenőrzi a fő navigáció, az oldalváltási ARIA-státusz és a főtartalom meglétét.
4. A regisztrált aloldalak külön kiválaszthatók; az eredmények táblázatban megjelennek, JSON- és CSV-formátumban exportálhatók.
5. Külön, manuálisan teljesítendő ellenőrzési lista készült a mobilmenüre, fókuszsorrendre, Escape-re, képernyőolvasóra, kontraszt- és nagyítási nézetekre.

**Fontos korlát:** a jelen futtatási környezet nem biztosított működő, a v1.40.5 helyi szervert elérő interaktív böngészőt/fizikai eszközt. Emiatt a tényleges 320/390/768 pixeles képernyőteszt **nem került végrehajtásra** az átadás részeként. Az eszköz és a mögöttes DOM-mérési kód statikus ellenőrzése sikeres, de a megjelenítési és képernyőolvasós eredményeket csak a felhasználó saját környezetében végrehajtott próba után lehet jóváhagyni. A QA-panelt HTTP(S) alatt, azonos eredeten kell megnyitni, nem elszigetelt `file://` iframe-ként.

### K – A segédoldalak egységes prémium arculata és adminisztráció

**Elkészült:**

1. Új `css/tools-unified-v1-40-5.css` közös kiegészítő stílus, a meglévő arculat megtartásával: törtfehér–sötétkék–arany színek, egységes navigáció, kártyák és tartalmi sávok.
2. A `tools/tool-ui-2026.js` a közös navigációból közvetlenül elérhetővé teszi az új fotóhitelesítést, mobil QA-t és tartalom-/keresési auditot; a régebbi segédoldalak saját funkciói változatlanok.
3. A közös navigáció billentyűzettel kezelhető, és 780 px alatt vízszintesen görgethető. Látható fókusz, kényszerített színek és csökkentett mozgás szabályai is szerepelnek.
4. A `tools/index.html` munkaközpont új csempékkel bővült. Kikerültek az elavult, merev „69 média”, illetve „55 nyitott tétel” szövegek.
5. A segédoldalak közös stílusának betöltésére használt cache-verzió frissült; a betöltés továbbra is kizárólag helyi fájlokkal működik.

**Változatlan adatkezelés:** a meglévő média- és dokumentum-CRUD továbbra is felhasználó által kezdeményezett, helyi fájl- vagy ZIP-exportot készít; közvetlen távoli írást az új eszközök nem végeznek. A statikus `tools/` URL-ek nem jelszóval védettek, ezért kényes személyes adatot nem szabad nyilvános tárhelyre helyezni.

### L – A 71 oldal tartalmi és keresési minősége

**Elkészült:**

1. Közös, Node-ban és böngészőben azonosan használható `tools/content-quality-core-v1-40-5.mjs` ellenőrzőmodul.
2. `tools/audit-content-search-v1-40-5.mjs` minden regisztrált JSON-oldalt elemző, reprodukálható helyi audit; `tools/tartalom-kereses-audit.html` és `.js` önálló, kereshető, szűrhető, exportálható karbantartói felület.
3. Vizsgált szempontok: regisztráció, közzétételi állapot, azonosítók és útvonalak egyezése, duplikáció, hiányzó cím vagy szövegblokk, keresőindex, összefoglaló, SEO-leírás, kategória, régi domainre mutató hivatkozás és nem regisztrált belső útvonal.
4. Az első audit **10 tényleges hibás linket** talált a kezdőlap képsávjában: a `#/iskolank/kozosseg` útvonal nem létezett. A 10 gomb hivatkozását a létező `#/iskolank` oldalra javítottuk.
5. Az ismételt ellenőrzés **71 oldal / 0 szerkezeti hiba / 0 figyelmeztetés / 0 átnézési javaslat** eredményt adott az eszköz szabályai alapján.
6. A korábban elavult teljes szövegű keresőindexet is újrageneráltuk mind a 71 tényleges oldalblokk alapján. A friss keresési szöveg **91 045 karakter**, és a keresőindex 71 egyezésre, valamint három kulcsszavas próbára kiterjedő tesztje **74/74 sikeres** eredményt adott.
7. A részletes, újra előállítható jelentések a `dokumentacio/TARTALOM_KERESES_AUDIT_V1_40_5.json` és `.csv` fájlokban találhatók.

**Korlát:** a gépi audit nem ellenőrzi a valós intézményi adatok ténybeli helyességét, a képek valódiságát vagy a teljes SEO-láthatóságot. Nem változtattuk meg a tartalmak tényállításait, nem találtunk ki iskolai eseményeket vagy személyes információkat.

## 3. Megőrzés és kompatibilitás

| Rész | Ellenőrzött állapot |
|---|---|
| JSON-oldalak | 71 regisztrált oldal |
| Assetleltár | 769 fájlútvonal, minden fájl megvan |
| Médiatár | 174 médiarekord, nincs automatikus jóváhagyás |
| Kezdőlap | 30 különböző, korábban ellenőrzött nagy kép; képváltó és feliratok megmaradtak |
| Témaváltás | Korábbi automatikus / világos / sötét működés megőrizve |
| Navigáció és tartalom | Mobil- és asztali menü, keresés, aloldalak, hír- és dokumentumtár |
| Adminisztráció | Meglévő eszközök, média-/dokumentumkezelés, ZIP-export, tartalomjóváhagyási munkalap |
| Tárhely | Statikus HTML/CSS/JS/JSON, PHP- és Node-követelmény nélkül |
| Bootstrap | Kizárólag verziózott `bootstrap@5.3.9` CDN |
| Publikálás | **Nincs** GitHub-, FTP- vagy egyéb feltöltés |

## 4. Ellenőrzések és tesztjegyzőkönyv

| Teszt | Eredmény |
|---|---|
| Új v1.40.5 statikus minőségkapu | **12/12 sikeres** |
| Teljes, egyesített visszamenőleges regresszió | **19/19 tesztcsomag sikeres** |
| Korábbi v1.40.4 működési vizsgálatok | **Sikeres** |
| Képkészlet integritás (30 képfájl + SHA-256) | **Sikeres** |
| Fotó-jóváhagyási HTTP SHA-256 tartalékszámítás | **4/4 vektor helyes** |
| Tartalmi, keresési és hivatkozási audit | **71/71 oldal, 0 jelzés** |
| Teljes szövegű keresőindex helyreállítása | **71 oldal, 91 045 karakter, 74/74 teszt** |
| HTML-szemantika | **21/21 HTML-oldal sikeres** |
| Médiatár-/dokumentum-CRUD regresszió | **11/11 sikeres** |
| ZIP-építő regresszió | **5/5 sikeres** |
| JavaScript szintaxis és statikus fájlkapcsolatok | **Sikeres** |
| Teljes release-manifest SHA-256 és fájlméret-egyezés | **Sikeres** |
| ZIP konténer sértetlensége | **Sikeres (`unzip -tq`)** |
| Helyi HTTP(S) céloldal vizsgálata | **Nyitott: a munkakörnyezetben a saját 127.0.0.1 tesztkiszolgálóhoz kapcsolódás sikertelen** |
| Élő, fizikai 320/390/768 px telefon/tablet QA | **Nyitott** |
| Valódi NVDA/VoiceOver/JAWS + billentyűzetes végigjárás | **Nyitott** |
| Engedélyezett valódi új intézményi fotók beemelése | **Nyitott – nincs forrásfájl és igazolás** |

A gépi futás eredménye a `dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_5.json` fájlban található. A teljes kiadási integritás a `release-manifest.json` fájlban, a szerveren is csak olvasó módú ellenőrző pedig a `tools/check-release-target-v1-40-5.mjs` fájlban található. A céloldali ellenőrző nem tölt fel és nem módosít fájlokat.

A kiadási céloldali HTTP-ellenőrzőt elindítottuk, de a futtatókörnyezet a saját helyi, 127.0.0.1-es tesztkiszolgálót nem tudta elérni (`fetch failed`). Ez infrastruktúra-korlát: **nem tekinthető sikeres céloldali tesztnek**. A kliens eszközén vagy egy később engedélyezett tesztkiszolgálón újra kell futtatni.

### Tesztek reprodukálása

```bash
node tools/audit-content-search-v1-40-5.mjs
node tools/build-search-index-v1-39-1.js
node tools/build-release-manifest.js
node tools/run-full-regression-v1-40-5.mjs
```

A tesztfuttató a saját JSON-jegyzőkönyvét módosítja. Ha ezzel vagy más szerkesztéssel bármely fájl megváltozott, a `release-manifest.json` jegyzéket utána ismét elő kell állítani, és újból ellenőrizni kell az egyezést.

## 5. A közzététel előtti külső feltételek

1. Jóváhagyott eredeti iskolai fényképek, jogtulajdonosi/fotósi felhasználási engedély, intézményi felelősi döntés, és felismerhető személyek – különösen kiskorúak – megfelelő adatvédelmi jogalapja.
2. A mellékelt mobil QA panel tényleges lefuttatása 320/390/768 CSS-pixelen böngészőből; a jegyzőkönyv és szükség esetén hibaképek visszaadása.
3. Fizikai telefon/tablet és billentyűzetes, valamint képernyőolvasós ellenőrzés. Ez nem helyettesíthető kizárólag statikus kódelemzéssel.
4. Kézi élesítési döntés és kiadási ellenőrzés a `csanadi-website` GitHub Pages repositoryban vagy az iskola FTP-tárhelyén.
5. A kliensoldali Bootstrap megjelenéséhez a verziózott CDN hálózati elérése szükséges; helyi Bootstrap-tartalék nem megengedett a projektben.

## 6. A következő fejlesztési kör lehetséges elemei

- **M – A jóváhagyott fényképek tényleges integrálása**, amikor rendelkezésre állnak az eredeti képek és a jogi nyilatkozatok.
- **N – A mobil QA-jegyzőkönyv alapján célzott, vizuálisan ellenőrzött javítások**.
- **O – Keresési élmény: relevancia, kiemelt találatok és témakörönkénti finomítás**, kizárólag megerősített adatokkal.
- **P – Kiadási, tartalmi és médiamunkafolyamatok további automatizált, de csak helyi ellenőrzése**, publikálás nélkül.

**Átadási nyilatkozat:** a v1.40.5 ZIP a tesztelt állománykészlet. Az új I/J eszközök megteremtik a kézi hitelesítés és mobil/akadálymentességi ellenőrzés technikai lehetőségét, de nem jelentenek valótlan intézményi jóváhagyást vagy be nem végzett fizikai tesztet.
