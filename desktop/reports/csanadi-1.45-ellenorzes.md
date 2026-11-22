# Csanádi weboldal – 1.45 fejlesztési és ellenőrzési jelentés

**Dátum:** 2026. november 22.  
**Állapot:** helyileg elkészített, további megrendelői jóváhagyásra váró ZIP-kiadás.  
**Kiinduló csomag:** `csanadi-website-1.44.zip` (a felhasználó által átadott 1.44).  
**Közzététel:** FTP-re vagy GitHubra nem történt feltöltés.

## 1. Mit kért a megrendelő?

Az 1.45-ös verzióban egyszerre öt fejlesztési területet: (1) kritikus működési hibák, (2) mobilos és asztali funkciók, (3) reszponzivitás, (4) akadálymentesség, (5) vizuális hibák. A csomagot teljes ZIP formájában kérte, az 1.44-es kiadás megőrzésével. Az öt terület feldolgozása nem jelent minden lehetséges hiba feltétel nélküli kijavítására vagy minden készülékre vonatkozó garanciát; a konkrét elvégzett módosításokat és ellenőrzési határokat alább tételesen rögzítettük.

## 2. Konkrétan elkészült javítások

| Terület | Elkészült módosítás | Érintett működés |
|---|---|---|
| **1. Működés / mobil közösségi linkek** | A publikált, ellenőrzött Facebook és Instagram forrásbejegyzéseket külön validáljuk. Hiányzó, nem publikált, érvénytelen vagy nem HTTPS-es adat esetén **csak az adott platform** esik vissza a korábbi, ellenőrzött tartalékra. | `mobile/reboot-shell-v1-43-29.js` |
| **1. Működés / mobil nyitóképek** | Ha az első és az azt követő képek is hibásak, a helyreállítás egymás után további használható képeket keres. A hiányzó kép-elemet is ideiglenesen kizárja; ha nincs betölthető kép, látható szöveges tájékoztatás marad. | `mobile/reboot-hero-v1-43-29.js` |
| **2. Mobil és desktop funkciók / kereső** | Keresési ugráskor a már fókuszálható hivatkozás vagy gomb nem kap indokolatlan `tabindex=-1` értéket. A szöveges célpont ideiglenes fókusza kilépéskor tisztul. | `js/app.js` |
| **2. Mobil és desktop / saját nézők** | A saját dokumentum- és képnéző tartalék modálja `dialog` szerepet kap; `MutationObserver` nélküli böngészőben sem dob hibát; Bootstrap nélküli esetben a háttér `inert` állapota megnyitáskor és bezáráskor megfelelően változik. | `js/site-viewers-v1-43-3.js` |
| **3. Reszponzivitás** | Mobilon a rögzített fejléc magasságát figyelembe vevő görgetési célpont-eltolás, biztonsági képernyőszélek, szűk dialóguskeret és menü-szélességkorlát. | `css/v145-polish.css` |
| **4. Akadálymentesség** | A `visibility:hidden`, `content-visibility:hidden` és `aria-disabled=true` vezérlőket a mobil billentyűnavigáció kizárja; a kereső és a menü fókuszcsapdája csak ténylegesen látható célpontok között léptet, szükség esetén kívülről is visszafogja a fókuszt. | `mobile/reboot-quality-v1-43-29.js`, `js/app.js` |
| **5. Vizuális következetesség** | Egységesebb, jól látható fókuszkeretek a navigációban, keresőben és nézőkben; csökkentett mozgás és kényszerített kontraszt célzott stílusai. | `css/v145-polish.css` |
| **Közös 1.45-ös kiadáskezelés** | A módosított betöltési lánc cache-azonosítói `1.45`-re álltak; a kiadásjelző, globális JSON-konfiguráció és offline shell frissült. A mentett offline oldalak migrációja a korábbi két- és háromtagú verziókat egyaránt felismeri. A helyi szerkesztési kiadásazonosító a két tagú formátumot is elfogadja. | `index.html`, `script.js`, több JS importhivatkozás, `json/config.json`, `service-worker.js`, `js/app.js` |

Az asztali fájloknál a közös keresési, dokumentumnéző és betöltési logika kapott célzott módosításokat. Az `assets/` média- és dokumentumgyűjteményhez, a `desktop/` navigációhoz és az oldal-JSON tartalmakhoz nem nyúltunk; nem készült általános asztali arculatcsere.

## 3. Tényleges ellenőrzések

- **Kiinduló 1.44 ellenőrzése:** a négy M22 javítási kapu, a verziókezelési teszt, a 1358 fájlra kiterjedő SHA-256 kiadásellenőrzés és a statikus audit sikeres volt még a módosítások előtt.
- **Új 1.45 célzott kapuk:** a hibatűrő közösségi linkek, a rejtett billentyű-célpontok, a két- és háromtagú offline cache migrációja, a verziózott/reszponzív betöltés, valamint a modális/fókusz szabályok automatizált vizsgálata sikeres.
- **Öt meglévő, újrafuttatott DOM-regressziós készlet:** mobil nyitóképek, fejléc, menü, kezelhetőség és saját dokumentum-/képnéző sikeres. A nyitóképpróba már két egymást követő hibás képre is kiterjed, a nézőpróba pedig Bootstrap és `MutationObserver` hiányát is szimulálja.
- **1.45 verzióátmenet:** az 1.43.33 → 1.45 és 1.44 → 1.45 összehasonlítás egyaránt sikeres.
- **Statikus tartalomellenőrzés:** 111 JSON, 78 menüoldal, 79 indexelt oldal, 819 médiaállomány, 107 médiaazonosító-hivatkozás, 253 belső útvonal-előfordulás és 121 JavaScript-forrás szintaktikai ellenőrzése. **0 kötelező hiba**. Az egyetlen figyelmeztetés az indexelt, de szándékosan nem menübe tett kezdőoldal (`pages/home.json`).
- **Kiadási integritás:** a teljes, **1364 fájlos SHA-256 leltár** ellenőrzése sikeres. A ZIP sértetlenségi próbája hibamentes, a külön könyvtárba visszabontott **1365 állomány** (a leltárral együtt) bájtszinten megegyezik az összeállított munkapéldánnyal. A visszabontott csomagból az új teljes kiadásellenőrzés ismét sikeresen lefutott.

A korábbi, konkrétan 1.43.x vagy 1.44 verziószöveget elváró történeti *kiadási* tesztek az 1.45-ös változatban természetesen nem mind teljesülnek. Ezek nem használhatók az új kiadás kizárólagos elfogadási kapujaként; az 1.45-ös verzióteszt, célzott kapuk és új SHA-256 leltár az irányadók. Ettől függetlenül egy történeti teszt hibáját csak a konkrét állításának vizsgálata után szabad verzióinkompatibilitásként kezelni.

## 4. Mi maradt nyitott?

- **Valós iPhone/Safari, Android/Chrome, WebView és telepített PWA teszt** nem történt.
- A helyi automatizált Chromium indítása a környezetben `socket(): Operation not permitted` hibával megszakadt; a külön grafikus böngésző nem érte el a helyi szervert. Ezért az 1.45-ről **nem állítható teljes böngészős, vizuális vagy képernyőolvasós ellenőrzés**.
- Nem történt minden egyes oldal és minden gomb teljes, kézi kombinatorikus kipróbálása; a 253 belső útvonal-előfordulás vizsgálata statikus integritásellenőrzés.
- A teljes WCAG 2.2 AA megfelelés csak további valós eszközös, nagyításos, billentyűzetes és képernyőolvasós méréssel minősíthető.
- A szolgáltatásmunkás frissítését és offline módját több aktív böngészőlappal, tényleges hálózatszakadással külön kell kipróbálni.
- A Bootstrap CSS/JS CDN-források elérhetőségét és a külső szolgáltatások működését az éles környezet befolyásolja; a saját nézőknél van tartalék JavaScript-modál, de a teljes Bootstrap-arculat CDN-kiesése külön kezelendő.

## 5. Visszaállítás, jóváhagyás és kiadási feltételek

Az 1.44-es eredeti ZIP és kibontott forrás érintetlen. Az 1.45 külön könyvtárból készülő, teljes statikus FTP-kompatibilis csomag, amely tartalmazza az összes média-/dokumentumfájlt, az új teszteket, a jelentést és a `release-manifest.json` fájlleltárt. Visszaállításkor az előző 1.44-es ZIP egyben ismét kibontandó, nem elég egy-két fájlt felülírni.

**Az 1.45 átadása nem jelent élesítési engedélyt.** Az FTP-/GitHub-feltöltéshez, valamint a végleges megrendelői jóváhagyáshoz külön döntés szükséges.
