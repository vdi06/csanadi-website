# Csanádi Sportiskola – v1.40.8 részletes átadási beszámoló

**Készítés dátuma:** 2026. november 18.  
**Kiindulópont:** `csanadi-website-v1.40.7.zip` – megőrzött, SHA-256-tal ellenőrzött eredeti.  
**Új kiadás:** `csanadi-website-v1.40.8.zip`.  
**Feladat:** az U, V, W, X, Y és Z fejlesztések együttes elvégzése, a működő funkciók megőrzése, teljes tesztelt ZIP, tételes átadás, **automatikus publikálás nélkül**.

## 1. A hat fejlesztési terület tételes elszámolása

| Tétel | Kérés | Ténylegesen elkészült | Állapot |
|---|---|---|---|
| **U** | Jóváhagyott, valódi intézményi fotók integrálása | Az előző fotóazonosítás és SHA-256 előkészítés mellé új, célhelyenkénti ellenőrző algoritmus (`tools/photo-placement-core-v1-40-8.mjs`) készült. Csak azonosítható eredeti képet, igazolt jogi/adatvédelmi feloldást, intézményi jóváhagyást és megfelelő ALT-leírást fogad el a tervező. Megmaradt a fotóhitelesítő segédoldal. | **Részben teljesült.** Új eredeti fotó és engedély nem érkezett; tényleges képbeépítés **0**. Nem neveztünk illusztrációt valódi intézményi fényképnek. |
| **V** | Valós mobil- és WCAG-hibák javítása | A mobilteszt bekeretezett, 320/390/768 CSS px nézete kiegészült az `alt` nélküli képek, név nélküli űrlapmezők, duplikált DOM-azonosítók és dokumentumnyelv ellenőrzésével. Az új hibák JSON/CSV-exportba is bekerülnek. A korábbi állapotösszevetés és kézi ellenőrzőlista megmaradt. | **Részben teljesült.** Nem volt felhasználói eszközön készült hibajegyzőkönyv; fizikai telefonos, NVDA/VoiceOver/JAWS megfelelőséget nem állítunk. |
| **W** | Intelligensebb kereső és kapcsolódó tartalmak | Új, determinisztikus, csak helyben dolgozó `js/search-recommendations-v1-40-8.js`; a keresett találathoz tematika, kulcsszó és cím alapján legfeljebb négy kapcsolódó, publikált intézményi oldalt ajánl. Kizárja a keresett oldal duplikációját és a fiktív mintahíreket. Külön, fókuszálható keresőkártyák, reszponzív CSS; keresési előzményeket továbbra sem továbbít és nem ment tartósan. | **Elkészült; statikus regressziós teszttel ellenőrizve.** |
| **X** | Biztonságos kiadás, összehasonlítás, visszaállítás | A v1.40.7 eredeti teljes manifestje külön baseline-fájlban; új, pontos v1.40.7→v1.40.8 fájl-SHA eltérésjelentés; `tools/build-rollback-plan-v1-40-8.mjs` ellenőrzi a korábbi ZIP előre rögzített SHA-256 összegét és belső manifestjét. Kézi visszaállítási lépések, feltöltendő és csak felülvizsgálat után eltávolítható állományok listája. Új, kizárólag olvasó HTTP(S) célhely-ellenőrző. | **A helyi terv és ellenőrzés elkészült.** Éles visszaállítás vagy közzététel **nem történt**. |
| **Y** | SEO: metaadatok, sitemap, Open Graph, strukturált adatok, olvasható aloldalak | 71 külön, statikus HTML-változat a `seo/` könyvtárban, egyedi title/description/OG/canonical, JSON-LD `WebPage`, látható szövegtartalom és visszalépési hivatkozás. `robots.txt`, `sitemap.xml` és SEO-lefedettségi jelentés. A SPA kanonikus útvonala a megfelelő statikus HTML-változatra mutat. | **Technikai alap elkészült, indexelés tudatosan tiltva.** A 71 eredeti JSON-oldal mind `noindex,nofollow`, ezért az új oldalak is azok; a sitemap jelenleg nulla indexelhető URL-t tartalmaz. Az indexeléshez külön szerkesztői döntés és újragenerálás szükséges. |
| **Z** | LCP/INP/CLS, CSS/JS és képbetöltési teljesítmény | A HTML-ben szereplő **95 helyi CSS-kérésből 1** lett, az eredeti forrássorrend és médiafeltételek megőrzésével. A 95 egyedi CSS-forrás továbbra is benne van a ZIP-ben. Az összevont CSS 590 340 bájt; offline, 9-es szintű gzip-becslése **110 103 bájt**. A beépített helyi teljesítménypanel kiegészült az elérhető interakciós események maximális idejével, azt szándékosan nem nevezi hiteles INP-nek. Külön méret- és erőforrásaudit. | **A CSS-kéréscsökkentés és diagnosztika elkészült.** Valós, reprodukálható LCP/INP/CLS vagy PageSpeed értéket eszközös böngészőmérés hiányában nem közlünk. |

## 2. Működő funkciók megőrzése

- **71 regisztrált, közzétett JSON-oldal**, minden oldalfájl a helyén.
- **769 eredeti asset** (képek, dokumentumok és egyéb állományok), változatlan készlet.
- **174 médiatári bejegyzés**, megőrzött eredeti hivatkozások és képaláírások.
- **30 külön kezdőképes dia**; a már jelen lévő, nem igazolt illusztrációk megjelölése változatlan.
- Megmaradt a reszponzív navigáció, világos/sötét téma, dinamikus JSON-oldalmegjelenítés, hír-/dokumentum-/média-kezelés, galériák, keresés, tartalmi blokkok, visszajelző diagnosztika, offline megoldás és a `tools/` karbantartó munkaközpont.
- A Bootstrap CSS és JavaScript továbbra is a **verzióhoz rögzített `bootstrap@5.3.9` CDN** segítségével érkezik, nincs mellékelt helyi Bootstrap-példány.
- Nincs PHP-, Node.js- vagy GitHub Actions-függő **futásidejű** funkció. A generátorok kizárólag a ZIP előállításakor futnak, a webhely statikus FTP-n kiszolgálható.

## 3. Ellenőrzések és eredmények

| Ellenőrzés | Tényleges eredmény |
|---|---|
| Teljes, régi és új funkciókat lefedő regresszió | **22/22 tesztcsomag sikeres**, hibás csomag: 0 |
| Kifejezetten v1.40.8 teszt | **13/13 részellenőrzés sikeres** |
| JavaScript és ES-module szintaxis | **416 fájl hibátlan** (`node --check`) |
| JSON-szintaxis | **160 érvényes JSON-fájl** |
| Helyi CSS háttérerőforrás-hivatkozások | **14/14 létező célfájl** |
| Teljes SHA-256 fájlintegritási kapu | **1658/1658 manifestbejegyzés egyezik**; hiányzó vagy módosult: 0 |
| v1.40.7 és v1.40.8 manifest eltérése | **92 új**, **43 módosult**, **0 eltávolított**, **1523 változatlan** állomány; a megújított dokumentációk egy része ciklusmentesség miatt nem része a manifestnek |
| Visszaállító v1.40.7 ZIP | **SHA-256 egyezés, ZIP teszt és belső manifest egyezés: sikeres** |
| Kiadási jogosultsági kapu | **Technikai integritás: sikeres**; **nyilvános közzétételre nincs automatikus jóváhagyás** |
| Fizikai mobilos/screen-reader QA | **Nem futott**, a felhasználó nem mellékelt hozzá eszközös mérési bizonyítékot |
| Teljes böngészős vizuális QA | **Nem futott**: a helyi Chromium `socket() failed: Operation not permitted` hibával nem indult; ezt külön nem minősítjük sikeres tesztnek |
| GitHub Pages/FTP publikálás | **Nem történt** |

## 4. Fájlok és ellenőrzési eszközök

- Belépő: `index.html`, `script.js`; generált CSS: `css/site-bundle-v1-40-8.css`.
- Tartalmi SEO-útvonalak: `seo/**/index.html` (71), `sitemap.xml`, `robots.txt`, generátor: `tools/build-seo-snapshots-v1-40-8.mjs`.
- Új keresési kapcsolatok: `js/search-recommendations-v1-40-8.js`, `js/search-j-2026.js`.
- Fotó-elhelyezési kapu: `tools/photo-placement-core-v1-40-8.mjs` és korábbi fényképes munkalap.
- Mobilos és szemantikus QA: `tools/mobil-akadalymentesseg-qa.js` és `.html`.
- Offline, visszavonható CSS-építő: `tools/build-css-bundle-v1-40-8.mjs`, forrástérkép: `dokumentacio/CSS_FORRASJEGYZEK_V1_40_8.json`.
- Kiadási eltérés, visszaállítás, kapu és célhely ellenőrzés: `tools/build-release-diff-v1-40-8.mjs`, `tools/build-rollback-plan-v1-40-8.mjs`, `tools/build-readiness-report-v1-40-8.mjs`, `tools/check-release-target-v1-40-8.mjs`.
- Tesztindító: `node tools/run-full-regression-v1-40-8.mjs`.
- Közös áttekintő felület: `tools/v1408-kiadasi-munkalap.html`, a `tools/index.html` munkaközpontból is megnyitható.

## 5. Függőségek, nyitott elemek és helyes működtetés

1. **U / fotók:** az iskolától származó eredeti képek, bizonyítható felhasználási jog, személyiségi/adatvédelmi hozzájárulás és képenként ellenőrzött ALT-szöveg szükséges. Jelenleg új kép nincs a ZIP-ben; a következő körben ezekből dolgozhatunk.
2. **V / WCAG:** konkrét hibaképernyők, eszköz- és operációsrendszer-adatok, valódi 320/390/768 px teszt, billentyűzetes és képernyőolvasós próbák szükségesek a végleges, mért hibajavítás és megfelelőségi ítélet kimondásához.
3. **Y / SEO:** a jelenlegi `noindex,nofollow` a projekt előzetes, nem publikált állapotához tartozik. A további valós keresőoptimalizálási aktiválás **külön jóváhagyást**, publikálható hiteles tartalmakat és a `json/config.json` megfelelő nyilvános `site.baseUrl` értékét igényli. A generátor csak ezután készíthet érdemben indexelhető sitemap URL-eket. A jelenlegi baseUrl `https://vdi06.github.io/csanadi-website/`; FTP-re áthelyezéskor ezt előbb frissíteni kell, majd az összes SEO-előnézetet újra létre kell hozni.
4. **Z / teljesítmény:** a CSS-összevonás statikusan ellenőrzött; éles felbontáson, világos/sötét témában és valós eszközön vizuálisan is tesztelendő. A helyben mért CSS-gzip becslés nem egyenlő valós hálózati terhelési/INP/LCP/CLS értékkel. A service worker online frissességre kialakított működése változatlan.
5. **X / publikálás és rollback:** a v1.40.7 ZIP külön megőrzendő. A rollback új fájlokat sem töröl automatán. Minden éles FTP/GitHub aktiváláshoz külön emberi döntés kell. Az `assets/` és `json/` állományok statikus HTTP alatt elérhetők; a `tools/` oldalai sem titkosak, ezért személyes adatot nem szabad bepakolni.
6. **CDN-feltétel:** a Bootstrap csak élő CDN-kapcsolattal töltődik be; az iskola statikus tárhelyén sem mellékelünk helyi Bootstrapet.

## 6. Újragenerálási és kiadási sorrend (kézi)

1. `node tools/build-css-bundle-v1-40-8.mjs`
2. `node tools/build-seo-snapshots-v1-40-8.mjs`
3. `node tools/audit-performance-v1-40-8.mjs`
4. `node tools/build-release-manifest.js`
5. `node tools/build-release-diff-v1-40-8.mjs`
6. `node tools/build-rollback-plan-v1-40-8.mjs /a/megőrzött/csanadi-website-v1.40.7.zip`
7. `node tools/build-readiness-report-v1-40-8.mjs`
8. `node tools/run-full-regression-v1-40-8.mjs`
9. Emberi mobil, vizuális, jogi és tartalmi ellenőrzés után külön jóváhagyással és kézi feltöltéssel lehet kiadni. Kiadás után az **olvasó** ellenőrző: `node tools/check-release-target-v1-40-8.mjs https://a-pontos-kotelezo-eleresi-ut/`.

**Átadási összegzés:** a v1.40.8 mind a hat feladathoz tartalmaz tényleges fejlesztést vagy ellenőrzött előkészítést. A W/X/Y/Z implementációk helyben készültek, az U és V külső bizonyítékhoz kötött részei továbbra is nyitottak. A működő kiinduló állományokat megőriztük, az új teljes statikus ZIP helyben gépileg tesztelt. **Nincs automatikus publikálás.**
