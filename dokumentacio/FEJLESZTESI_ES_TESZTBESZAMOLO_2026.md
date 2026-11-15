# Csanádi Sportiskola 2026 · 28. fejlesztési kör – kizárólag karbantartás

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
