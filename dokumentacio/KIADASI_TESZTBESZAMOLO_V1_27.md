# Csanádi Sportiskola – v1.25.0 → v1.26.0 → v1.27.0

**Kiadási, hibakeresési és tesztbeszámoló — 2026. november 16.**

## 1. A megrendelés és a változatok

A feladat a **v1.24.0 teljes meglévő projektjének** továbbjavítása volt, **új önálló funkció nélkül**, az A+B+C+D+E+F+G+H+I+J területeken. A korábbi hibaészrevételeket is figyelembe kellett venni: mobil szakaszmenü, a soha meg nem jeleníthető külön „Lap tetejére” gomb, térképes aloldalak, témaváltási bizonytalanság, duplikált logó, aloldali tartalompozíció és a meglévő kezelőeszközök működése. A javítások minden körben az előző **teljes projektverzióra** épültek, nem különálló javítócsomagokra.

| Teljes forrásverzió | Közvetlen alap | Fő cél | Regresszió | Statikus HTTP |
| --- | --- | --- | --- | --- |
| **v1.25.0** | v1.24.0 | A–J: alapvető stabilizálás és hibák javítása | 15/15 sikeres | 1105/1105 |
| **v1.26.0** | v1.25.0 | A–J: szélső esetek, mobil/iframe/Safari, fókusz és teljesítmény | 15/15 sikeres | 1116/1116 |
| **v1.27.0** | v1.26.0 | A–J: tartós azonosítók, megjelenés, visszatérési állapot, média és diagnosztika | 15/15 sikeres | 1126/1126 |

A végső ZIP a **v1.27.0 teljes állománykészlete**. Tartalmazza a v1.25.0 és v1.26.0 során elkészült minden javítást, de a korábbi verziókat nem csomagolja be szükségtelen, különálló weboldalként.

## 2. Tételesen elvégzett, meglévő A–J funkciójavítások

### A. Mobil szakaszmenü és reszponzivitás

- Figyelembe vesszük a telefon valós vizuális nézetmagasságát, a képernyő elforgatását, a böngésző címsorának mozgását, a fejléc aktuális méretét és a betűk késői betöltését.
- Az alacsony és a fekvő mobilnézetben a szakaszlista mérete nem takarja ki feleslegesen a lapot.
- A bezáruló menü megfelelő helyre adja vissza a billentyűzetes fókuszt.

### B. Szakaszokra ugrás

- A szakaszcél pozícióját a szükséges tartalomkibontás és elrendezésfrissítés **után** számítjuk.
- A ragadós fejléc méretét dinamikusan kompenzáljuk, beleértve a CSS-es szakaszhorgonyokat.
- A cél a helyes szakasz, nem a fejléc mögötti pont.

### C. Részletek nyitása és görgetési ugrás

- Az előző, már nem aktuális szakaszról maradt görgetési rögzítést eldobjuk.
- A rövid időre érvényes rögzítés lejárása megelőzi, hogy egy késői aszinkron frissítés visszarántsa az olvasási pozíciót.

### D. Térképes/megközelítési aloldalak

- Az iframe méretét csak tényleges változáskor írjuk át.
- Betűbetöltés, visszalépés/újramegjelenítés és mobil vizuális nézetváltozás után újramérjük az iframe magasságát.
- Nem vezetünk be új térképkezelőt; a meglévő megközelítési funkciók megmaradnak.

### E. Világos/sötét téma következetessége

- A beágyazott oldal korábbi, párhuzamos témaszinkronizáló eseménykezelőjét megszüntettük az egységes témaállapot javára.
- Régebbi Safari rendszertéma-értesítést is kezelünk.
- A segédoldalakon az alkalmazásba visszatérve újra a kézzel kiválasztott témát alkalmazzuk, hogy a mobilos fény-/sötét mód ne váltson váratlanul.

### F. Ismétlődő szakaszcímek

- Azonos szakaszcímeket normalizált írásmóddal, kontextussal és előfordulással különítünk el.
- A szakaszazonosítók a szöveges jelentéshez kötődnek, így nem kizárólag a változó sorszámból képződnek.

### G. JSON-aloldalak frissítése

- Frissülő JSON-tartalomnál a korábban kiválasztott szakasz és az olvasási pozíció helyreállítását cím/előfordulás alapon végezzük.
- Amikor a szakaszlistát újra kell rajzolni, visszaállítjuk a megmaradt aktív elem fókuszát.

### H. Akadálymentes billentyűzetes navigáció

- A szakaszlistában a nyílbillentyűs fókuszváltás nem indít kéretlen görgetést.
- Ha egy rövid oldalon eltűnik a szakaszmenü, biztonságos célra kerül vissza a fókusz.
- A szakaszgombok felirata a képernyőolvasók számára az aktuális helyet és a teljes elemszámot is jelöli.

### I. Meglévő kép- és videómegjelenítés

- A galériában korlátozott az egyszerre megtartott előtöltés; hibás kép nem marad örökre hibásnak megjelölve.
- Offline vagy nagyon lassú mobilkapcsolaton nincs fölösleges előtöltés.
- Bezáráskor felszabadítjuk az előtöltési állapotot; a nem automatikus videókat nem töltjük előre.

### J. Meglévő betöltési diagnosztika

- A fájlmanifest elemeinél ellenőrizzük a biztonságos útvonalat, a SHA-256 mezőt, a kötelező indítófájlokat és a Bootstrap CDN-verzióbejegyzést.
- Gyorsítótárazott vissza/előre navigációnál a diagnosztika újraolvassa az állapotot.
- Kizárólag **valóban lefutott** élő honlapteszt eredménye vehető át. A jelen kiadás pillanatában ilyen napi automatikus futás eredménye nem volt; **nem került bele kitalált vagy üres teszteredmény**.

## 3. Tesztelés: pontosan mi futott le?

A v1.27.0 teljes tesztnaplója a `dokumentacio/TESZTNAPLO_V1_27.md` fájlban található. Mindhárom verzióhoz külön verziózott tesztnapló készült; az utolsó kör 15 ellenőrző programja:

1. `test-release-v1-27.js` – kiadási állományok, 65 JSON-oldal, hivatkozások, verziók: **46/46**.
2. `test-mobile-sections-v1-27.js` – szakaszmenük, horgonyok, stabil azonosítók: **48/48**.
3. `test-embedded-arrival-v1-27.js` – meglévő térképes iframe és beágyazási helyzetek: **13/13**.
4. `test-theme-sync-v1-27.js` – témakezelés és mobilos visszatérés: **12/12**.
5. `test-existing-features-v1-27.js` – megőrzendő meglévő honlapfunkciók: **22/22**.
6. `test-mobile-tree-v1-27.js` – mobil menühierarchia: **8/8**.
7. `test-current-hardening-v1-27.js` – jelen kör hibáinak célzott regressziója: **29/29**.
8. `test-mobile-navigation-v1-11.js` – korábbi mobilnavigációs hibák regressziója: **sikeres**.
9. `test-regressions-v1-10.js` – korábbi oldalműködés: **sikeres**.
10. `test-subpage-header-v1-9.js` – aloldali fejléc/szakaszkezelés: **sikeres**.
11. `test-review-worklist-v1-9.js` – meglévő ellenőrző munkaeszköz: **sikeres**.
12. `test-media-manager-v1-9.js` – meglévő média- és dokumentumkezelő: **sikeres**.
13. `test-media-export-v1-9.js` – médiaexport, statikus csomag: **sikeres**.
14. `test-static-http-v1-27.js` – **1126/1126** helyi HTTP-lekérés sikeres.
15. `reconcile-assets-catalog.js` – **628/628** fizikai és indexelt médiatétel egyező; nincs hiány vagy árva tétel, 87 QR-állomány.

**További önálló ellenőrzések a végső kiadás előtt:** mind a **124/124 JSON-fájl** feldolgozható (`JSON.parse`); az összes **184 JavaScript-fájl** a Node.js modulmódú szintaxisellenőrzésén hiba nélkül átment.

Az ellenőrzések a teljes projektből indított helyi HTTP-kiszolgálón futottak, és nem csupán a módosított JavaScript-fájlok szintaktikai vizsgálatát jelentették. A tartalmi útvonalakra és fájlokra is kiterjedtek. A 15/15 arány a **tesztprogramok** száma, nem állítja, hogy minden elképzelhető, valódi felhasználói interakció böngészőben bizonyítottan helyes.

## 4. Hibakeresés és újrafuttatás

- Az első körben két örökölt teszt már nem helyes feltételezést tartalmazott: a régi, v1.24-es CSS-útvonalhoz ragaszkodott, illetve a képelőtöltés új, alacsonyabb korlátját nem követte. A várakozásokat frissítettük, majd újrafuttattuk.
- A második kör statikus HTTP-tesztjénél a **tesztprogram** Node/Undici kapcsolatszintű hibája jelent meg. A válaszok testének teljes kiolvasásával és a párhuzamos lekérések kettőre korlátozásával a tesztkliens megakadását megszüntettük, majd **1116/1116** sikeres újrapróbát kaptunk.
- A harmadik körben egy későbbi CSS-szabály felülírta a fekvő mobilnézet számára szánt menümagasságot; a szabályok sorrendjének megfelelő felülbírálást hozzáadtuk. Az utána futtatott teljes regresszió sikeres.
- A `tools/` kezelő- és ellenőrző oldalak, a médiaexport, a mobilfőmenü és a térképes beágyazás regressziós programjai változatlanul sikeresek.

## 5. Megőrzött projekt, kompatibilitás és nem tesztelt területek

- **Megőrizve:** 65 regisztrált JSON-oldal, 628 médiaállomány, meglévő eszköz- és szerkesztőoldalak, a JSON-konfigurált SPA és a teljes statikus állományrendszer.
- **Futtathatóság:** a ZIP tartalma közvetlenül statikus HTTPS/FTP-kiszolgálóra feltölthető. Nem szükséges PHP, Node.js szerver, GitHub Actions, GitHub Pages-specifikus API vagy egyéb szerveroldali futtatóprogram. A Bootstrap CSS és JS kizárólag rögzített verziójú (**5.3.9**) CDN-forrásból töltődik; internet és elérhető CDN kell hozzá.
- **Éles verzió:** ezt a ZIP-et a munka során nem publikáltuk; a v1.27.0 helyi forrásvizsgálata **nem azonos** a jelenleg publikált webhely napi tesztjével.
- **Grafikus böngészős E2E korlát:** a helyi Chromium indítása `socket() failed: Operation not permitted (1)` rendszerengedély-hibával meghiúsult. Emiatt a tényleges érintőképernyős gesztus, minden viewporton végzett vizuális ellenőrzés és az összes felhasználói út böngészős átjárása **nem igazolt**, noha a hozzá készített automatizálási próbafájlokat átadjuk.
- **Ütemezett élő teszt:** a külön automatizmus minden nap budapesti idő szerint **06:00**-kor indul; a **ténylegesen éles** `https://vdi06.github.io/csanadi-website/` címet teszteli, nem a frissebb helyi ZIP-et. Az első ütemezett időpont **2026. november 17. 06:00**. A kiadás lezárásakor az automatizmusnak nem volt rögzített lefutása; a kiadás ezért nem tartalmaz napi élő teszteredményt.
- **Közzététel és visszaállás:** az élesítést a felhasználó végzi; a korábbi működő teljes csomag továbbra is visszaállítási alap marad. A jelen feladat során az éles webhelyen nem változtattunk.

## 6. Állapot és fennmaradó feladat

**Elkészült:** mind a három teljes, egymásra épülő helyi forrásverzió; tíz meglévő fejlesztési terület javítása; regressziós tesztnapló minden szakaszhoz; a végső v1.27.0 forrás és a teljes kiadási csomag összeállítása. **Nyitott:** a letiltott Chromium miatt elmaradt, valódi böngészős kézi/E2E próba, valamint a felhasználó által végzendő későbbi éles közzététel. A napi automatikus élő ellenőrzés az ütemezett jövőbeli futásokon eredményt adhat.

## 7. Következő körre javasolt tíz javítás – kizárólag a meglévőkhöz

Ezek **javaslatok**, a v1.27.0 kiadásban nincsenek külön új feladatként megvalósítva:

- **A:** A mobil szakaszmenü görgetési és elforgatási próbamintáinak bővítése régebbi böngészőméretekre.
- **B:** A szakaszhorgonyok fejléc alatti helyzetének automatikus képernyőképes ellenőrzése.
- **C:** A részletek gyors egymás utáni nyitásának és zárásának terheléses regressziója.
- **D:** A térképes iframe több, egymás utáni mobil billentyűzetnyitásnál mért magasságának ellenőrzése.
- **E:** A manuálisan beállított téma megőrzésének célzott Safari/Android háttérbe helyezési vizsgálata.
- **F:** Duplikált vagy átnevezett JSON-szakaszcímek stabil azonosítójának további összevetése.
- **G:** A JSON-frissítés utáni olvasási pozíció ellenőrzése többféle böngészős vissza/előre előzménnyel.
- **H:** A meglévő mobil/asztali szakaszmenü képernyőolvasós, valós eszközös auditja.
- **I:** A már működő galériák memóriaterhelésének összehasonlítása hosszabb használat és visszatérés után.
- **J:** A betöltési diagnosztika valós HTTP-/cache-hibaesetekkel történő regressziója és a naplóüzenetek pontosságának ellenőrzése.

**Kapcsolódó részletes naplók:** `TESZTNAPLO_V1_25.md`, `TESZTNAPLO_V1_26.md`, `TESZTNAPLO_V1_27.md`, valamint az egyes változatok `VALTOZASOK_ES_TESZTEK_V1_XX.md` összefoglalói.
