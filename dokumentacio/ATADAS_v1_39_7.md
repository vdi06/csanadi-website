# Csanádi Árpád Sportiskola – v1.39.7 teljes kiadási és tesztjegyzőkönyv

**Dátum:** 2026. november 17.  
**Alap:** a teljes v1.39.6 munkapéldány  
**Kért feladat:** a nyilvános teszt-URL hiányában a korábban javasolt **mind a hat** önállóan vizsgálható fejlesztés elkészítése, tesztelése és teljes ZIP-csomagos átadása. **Közzététel nem történt.**

## 1. Elkészült fejlesztések

| Téma | Megvalósítás | Lényeges fájlok |
|---|---|---|
| **A – JSON-hibakezelés** | HTTP 404 és sérült JSON azonnali hibának számít; átmeneti hálózati, időtúllépési és 408/429/5xx hibáknál legfeljebb két, késleltetett újrapróbálkozás történik. A központi JSON-kéréskezelő ugyanazon URL párhuzamos kéréseit összevonja, 8 másodperces jóadat-gyorsítótárat alkalmaz; kizárólag átmeneti hiba esetén, legfeljebb 120 másodperces korábbi jó példányra eshet vissza, és csak akkor, ha a hívó nem kért friss tartalmat. | `js/fetch-resilience-v1-39-7.js`, `js/content.js` |
| **B – Magyar keresés** | Ékezet- és kis/nagybetű-független, ismétléseket kiszűrő, kétirányú szinonimatérkép; az eredménykártyák egyetlen dokumentumtöredékben készülnek a többszöri DOM-módosítás csökkentése érdekében. | `js/search-j-2026.js` |
| **C – Média-/dokumentumkezelő** | Új vagy lecserélt fájlnál név, MIME-típus, méret és formátumazonosító bájtok ellenőrzése; PDF-, kép-, hang-, videó- és dokumentumtípusok alapvető fejlécvizsgálata, SVG aktív, stílus- és külső tartalmainak tiltása; azonos hash/méret mellett duplikált fájl elutasítása. Az intézményi jogi jóváhagyási kapu megmaradt. A tartalomaláírás vizsgálata **nem teljes víruskeresés, dokumentumstruktúra-validálás vagy biztonsági garancia**. | `tools/media-validation-v1-39-7.mjs`, `tools/media-manager-2026.js`, `tools/eszkoz-mediator.html` |
| **D – SEO és közösségi metaadatok** | Útvonalonkénti oldal-, SEO- és közösségi cím/leírás, Open Graph és Twitter-kártya metaadatok helyesbítése; a korábbi általános cím felülírásának javítása, a 404 és érkezési útvonalak kezelése. A fejlesztői `noindex,nofollow` maradt; a hash-alapú SPA indexelhetőségét ez a változtatás nem oldja meg. | `js/next10-2026.js`, `js/app.js`, `index.html` |
| **E – Tartalmi audit** | A **71** önálló oldal-JSON, **71** egyedi útvonal, belső útvonal-hivatkozások, azonosítók, megadott leírások és blokkok, valamint a **628** regisztrált eszköz automatikus felülvizsgálata. **0 szerkezeti hiba, 0 automatikus felülvizsgálati jelzés.** Ez **nem igazolja** a hivatalos iskolai információk naprakészségét, és nem jelent teljes körű emberi lektorálást. | `tools/audit-content-v1-39-7.mjs`, `dokumentacio/TARTALMI_AUDIT_v1_39_7.json` |
| **F – Kliensoldali takarékosság** | Azonos idejű JSON-kérések összevonása, időben korlátozott gyorsítótár és újrapróbálkozás, keresési eredménykártyák kötegelt DOM-beszúrása. Az eredeti késleltetett médiabetöltés megmaradt. **Valódi böngészős időmérés, Lighthouse-futás és mobilhálózati mérés nem történt.** | `js/content.js`, `js/fetch-resilience-v1-39-7.js`, `js/search-j-2026.js` |

Az alkalmazás és a kapcsolódó tesztek v1.39.7 verzióhivatkozásokat kaptak, külön új célellenőrzéssel: `tools/test-offline-six-v1-39-7.mjs`. Az előző kiadás főmenüjének akadálymentes működését érintő javítások megmaradtak.

## 2. Ténylegesen lefuttatott tesztek

| Ellenőrzés | Eredmény | Típus |
|---|---:|---|
| Új v1.39.7 tesztek: HTTP 404/503, hibás JSON, hálózat, időtúllépés, utolsó jó példány, ékezetes keresés, médiafejlécek, aktív SVG/CSS, duplikátumkapu, SEO/noindex, tartalmi audit, DOM-kötegelés | **22/22** | Node.js és helyettesített hálózati/DOM állapot |
| Főmenü/kereső fókusz, modális háttér | **10/10** | Node.js alkalmazásfüggvény-szimuláció |
| Mobilos/asztali és akadálymentességi forrásellenőrzés | **8/8** | Statikus/DOM-állapot |
| HTML-szemantika és elérhető vezérlőnevek | **17/17** | Python ellenőrző |
| Média- és dokumentumkezelő regresszió | **11/11** | Node.js |
| ZIP-kezelő | **5/5** | Node.js |
| Tartalmi oldalak és kapcsolatok | **16/16** | Node.js |
| Alapkiadási JSON-/fájlintegritás | **948/948** | Node.js |
| v1.39.1 funkcionális ellenőrzés | **7/7** | Node.js |
| Nyolc eltérő témasablon és navigáció | **14/14** | Node.js |
| Keresőindex-ellenőrzés | **74/74** | Node.js |
| Világos/sötét témaszinkron | **12/12** | Node.js |
| Statikus HTTP-kiszolgáló: 71 oldal, 628 média és egyéb fájlelérhetőség | **1298/1298** | Helyi HTTP + Node.js |
| Tartalmi audit | **71 oldal; 0 hiba; 0 jelzés** | JSON/séma/hivatkozások |

A v1.39.4 és v1.39.2 regressziós tesztek két régi verziószöveget vártak; a v1.39.7-es hivatkozásnak megfelelően frissültek, majd hibamentesen lefutottak. A kiadás végső SHA-256 manifest-ellenőrzését az összes fájl véglegesítése után kell újrafuttatni; az eredményt a csomagolási jegyzőkönyv és a `release-manifest.json` rögzíti.

**Fontos:** a statikus teszt, szimuláció és HTTP-fájlelérhetőség nem egyenértékű a böngészővel végzett mobilos, vizuális vagy képernyőolvasós ellenőrzéssel.

## 3. Nyitott feladatok, valós korlátok

- **Valódi böngészős tesztek: 0 sikeresen futtatott teljes kör.** A honlap még nincs feltöltve, így nincs engedélyezett nyilvános teszt-URL. A v1.39.6-os jegyzőkönyvben rögzített helyi böngészős hozzáférés biztonsági szabályzattal elutasított; a tiltást nem kerültük meg. A Playwright/Chromium korábbi helyi indítását az operációs rendszer szintén megtagadta (`socket() failed: Operation not permitted (1)`).
- **Nem zárt:** tényleges Chrome/Edge/Firefox/Safari mobilos és asztali vizsgálat; érintés és billentyűzet valódi fókusz-ellenőrzése; NVDA/VoiceOver/TalkBack; 200–400%-os nagyítás; vizuális regresszió; Lighthouse és Web Vitals-mérés; WCAG 2.2 AA megfelelőségi értékelés.
- **Kézi tartalmi hitelesítés:** iskolai nevek, címek, felvételi határidők, dokumentumok és az aktuális eljárásrend hivatalos ellenőrzése az intézmény feladata. A 0 automatikus hiba nem helyettesíti ezt.
- **SEO:** a fejlesztői `noindex` tudatos, nem eltávolított beállítás. A hash-URL-ek miatt szerveroldali URL/előnézeti SEO-korlátok maradnak; éles indexelési stratégia külön döntést igényel.
- **Médiabiztonság:** az új fájlaláírás-vizsgálat megnehezíti a félrenévezett állományok bejutását, de az ügyféloldali ellenőrzés nem helyettesít intézményi jogosultságkezelést, vírusvédelmet, jogtisztasági felülvizsgálatot és biztonságos közzétételt.
- **Böngészős teljesítmény:** a kérelmek és DOM-műveletek száma forrás alapján mérséklődik, de sebességnövekedés nem számszerűsíthető valós eszköz- és hálózati mérés nélkül.
- **Médiabővítés:** a meglévő 628 állomány változatlan. A médiakészlet hatodik többszörözése sem történt meg ebben a kiadásban.

## 4. Telepítés és külső feltételek

1. A teljes ZIP kicsomagolt **tartalmát** kell a `csanadi-website` teszt-repository gyökerébe vagy később az iskola statikus FTP-tárhelyére feltölteni; nem szükséges szerveroldali PHP, Node.js, adatbázis, GitHub Actions vagy GitHub Pages-specifikus háttérfunkció.
2. A Bootstrap 5.3.9 **verzióhoz kötött CDN-ről** töltődik be; a szükséges hálózati hozzáférésnek a látogatói oldalon rendelkezésre kell állnia. Helyi Bootstrap-másolatot a csomag nem tartalmaz.
3. A kliensoldali médiakezelő csak helyi állományokat állít elő/ment; **nem ír közvetlenül az FTP-tárhelyre**. Az új tartalmakat intézményi jóváhagyás és ellenőrzött kiadás után külön kell feltölteni.
4. Közzététel előtt készüljön tárhelymentés; a v1.39.6 ZIP visszaállítási példányát őrizzék meg. A feltöltés után külön teszteljék a `#/` kezdőoldalt, mobil főmenüt, alsó navigációt, 71 oldalt, dokumentumokat, keresőt és mind a nyolc sablont.
5. Az indexelést tiltó meta beállítás éles, keresőkben megjelenő honlap előtt külön jóváhagyással módosítandó.

## 5. Státusz

**Elkészült:** a kiválasztott hat offline fejlesztés, 71 oldalas automatikus audit, új céltesztek, régi regressziók javítása, helyi HTTP-ellenőrzés, teljes ZIP-csomag előkészítése.

**Nem elkészült és nem állítottuk késznek:** nyilvános feltöltés, valódi böngészős és képernyőolvasós teszt, intézményi tényellenőrzés, mérhető teljesítménybenchmark és a médiák mennyiségi bővítése.
