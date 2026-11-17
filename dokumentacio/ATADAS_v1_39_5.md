# Csanádi Árpád Sportiskola – v1.39.5 átadási és ellenőrzési jegyzőkönyv

**Kiadás:** v1.39.5  
**Dátum:** 2026. november 17.  
**Kiindulópont:** teljes v1.39.4 weboldal és karbantartó eszközkészlet  
**Cél:** mobilos, böngészős és akadálymentességi hibák felkutatása és javítása, teljes FTP-kompatibilis ZIP-csomaggal.

## Mi került a kiadásba?

| Téma | Konkrét javítás | Érintett fájl |
|---|---|---|
| Főmenü-állapot | A fejléci és a kezdőlapi menüindító együtt, helyesen jelzi az `aria-expanded` nyitott/zárt állapotot. A nyitás többé nem függ a telefonos körmenü töréspontjától. | `js/app.js`, `index.html` |
| Menüdialógus | Mindkét indító `aria-haspopup="dialog"` attribútumot és a menü bezárásakor visszaállított feliratot kapott. | `index.html`, `js/app.js` |
| Mobil alsó sáv | A három gomb tényleges darabszámát közli a segédtechnológiával. A menü/kereső dialógust nyitó gombok szemantikája következetes. | `mobile/quick-nav.js`, `js/round10-enhancements.js` |
| Aktuális oldal jelzése | A mobil Kezdőlap gomb `aria-current="page"` jelölése csak a kezdőlapon szerepel; más útvonalon az attribútum teljesen eltűnik. | `mobile/quick-nav.js` |
| Keresőmodál | Megnyitáskor az összes háttérben lévő, korábban nem inaktív felső szintű elem `inert` lesz, így a háttér nem kerülhet a fókuszsorrendbe. Bezáráskor csak a saját módosításokat állítja vissza. | `js/app.js` |
| Kereső fókusz és görgetés | Az input azonnal fókuszt kap; Escape/bezárás után a korábbi látható indító visszakapja a fókuszt, a görgetéskorlátozás előző értéke visszaáll. A szakaszválasztó mobilpanel bezáródik, ha a kereső nyílik. | `js/app.js` |
| Segédoldali ugrópont | A három iframe-es tesztoldal is használható „Ugrás a tartalomra” hivatkozást kap; a célpont akkor is fókuszálható, ha nincs hagyományos `main` elem. | `tools/tool-ui-2026.js` |
| Böngészőgyorsítótár | A megváltozott mobilnavigációs modulok új verziózott importot kapnak. Mind a 16 segédoldal az új `tool-ui-2026.js?v=1.39.5` címet hívja, hogy a korábbi gyorsítótári példány ne tartsa fenn a kijavított hibát. | `js/app.js`, `tools/*.html` |
| Tesztfolyamat | Új, önállóan futtatható állapot- és akadálymentességi ellenőrzés, valamint valódi böngészőre készült mobil/asztali teszt. A korábbi Playwright teszt már nem lép ki sikeres kóddal, ha a Chromium el sem indul. | `tools/test-responsive-a11y-v1-39-5.mjs`, `tools/test-browser-responsive-v1-39-5.js`, `tools/test-tools-browser-v1-39-4.js` |

Az alverzió kizárólag célzott működési és akadálymentességi javításokat tartalmaz. A **71 JSON-oldal**, **nyolc témaspecifikus oldalsablon** és **628 meglévő média-/dokumentumállomány** változatlan tartalommal megmaradt; tömeges médiabővítés nem történt.

## Automatizált ellenőrzési eredmények

Az alábbi tesztek valóban lefutottak az elkészített munkapéldányon:

| Ellenőrzés | Eredmény |
|---|---:|
| v1.39.5 mobilos DOM-állapotok, HTML-szemantika, modalitás, kontrasztminták, segédoldali ugrópontok és responsive CSS-szabályok | **8/8 sikeres** |
| 17 HTML-belépőoldal szemantikai ellenőrzése: nyelv, viewport, egyedi DOM-azonosítók, képalternatívák, üres ARIA-feliratok | **17/17 sikeres** |
| Médiakezelő és tartalmi jogosultságok regressziója | **11/11 sikeres** |
| ZIP-műveletek | **5/5 sikeres** |
| 71 oldal tartalmi és hivatkozási tesztje | **16/16 sikeres** |
| Alapvető kiadási, oldal-, média- és JSON-integritási ellenőrzés | **948/948 sikeres** |
| v1.39.1 javítások regressziója | **7/7 sikeres** |
| Nyolc oldalsablon és mobilnavigációs szerkezet regressziója | **14/14 sikeres** |
| Keresőindex | **74/74 sikeres** |
| Témaszinkronizáció | **12/12 sikeres** |
| Teljes statikus HTTP-kiszolgálás, fájlok és útvonalak | **1295/1295 sikeres** |

**Fontos korlátozás:** az élő Chromium/Playwright teszteknek ebben a végrehajtási környezetben **0 ellenőrzésig sikerült eljutniuk**. A Chromium indítását az operációs rendszer `socket() failed: Operation not permitted (1)` hibával megszakította. A külön felületi böngészőből a helyi HTTP-szerver `ERR_CONNECTION_REFUSED` hibával nem volt elérhető. Ezért mobilos pixelképes, tényleges billentyűzetes/fókusztesztet vagy Firefox/Safari keresztböngészős vizsgálatot **nem állítunk sikeresnek**. A `test-browser-responsive-v1-39-5.js` a csomagban maradt, és valódi böngészővel rendelkező környezetben lefuttatható. A statikus és állapotszimulációs tesztek eredménye nem helyettesíti az élő böngészős vizsgálatot.

## Kézi ellenőrzési terv az intézményi kiadás előtt

1. **Telefon – 320, 360, 390 és 430 CSS pixel:** ellenőrizd a fejléci menügomb és a háromikonos alsó navigáció láthatóságát; nyisd meg a körmenüt, a Hírek/Kezdőlap/Kapcsolat gyorseléréseket, és görgess a menü aljáig 568 px magas képernyőn is.
2. **Tablet – 768 és 820 CSS pixel:** ellenőrizd a menütöréspontot, az aloldalak főcímét és a cikkek/sportágak rácsát, továbbá hogy nincs oldalirányú gördülés.
3. **Asztal – 1280 és 1920 CSS pixel:** ellenőrizd a menü összes szintjét, a keresőt, a sablonok eltérő felépítését, a fejléc rögzítését és a látható fókuszjelzőt.
4. **Billentyűzet:** Tab és Shift+Tab, Enter/Space, Escape, Ctrl+K; nyitott keresőnél és főmenünél a háttérbe ne lehessen tabolni, bezárás után az indítógomb kapjon fókuszt. A főmenü nyitott/zárt állapotát a segédtechnológia jelezze.
5. **Akadálymentesség:** 200% és 400% nagyítás, megnövelt betűméret, csökkentett mozgás, világos/sötét és emelt kontraszt, képernyőolvasóval címsor-/navigációs tájékozódás és űrlapcímkék ellenőrzése.
6. **Böngészők:** aktuális Chrome/Chromium, Firefox, Safari (iOS/macOS) és Edge; próbáld a főoldalt, a keresőt, a mobil körmenüt, legalább egy-egy témasablont és a médiakezelőt.
7. **FTP:** ugyanazokat az útvonalakat közvetlen `#/` hash-linkről is nyisd meg. Ellenőrizd, hogy a CDN-hez van-e hálózat, és a `json/structure.json`, `json/config.json` és oldal-JSON-ok elérhetőek.

Az ellenőrzés **nem jelent WCAG 2.2 AA tanúsítást**; a kézi képernyőolvasós és eszközspecifikus vizsgálat továbbra is szükséges.

## Kiadási és üzemeltetési feltételek

- Statikus HTTP/FTP-tárhely elegendő: a honlap nem igényel PHP-t, Node.js-t vagy GitHub Actions-t.
- A Bootstrap CSS és JavaScript verzióhoz kötött, külső CDN-ről érkezik; internetkapcsolat és elérhető CDN szükséges a teljes Bootstrap-megjelenéshez.
- A helyi szerkesztőeszközök nem írnak automatikusan az FTP-tárhelyre. A módosított adatok jóváhagyása, biztonsági mentése és feltöltése intézményi feladat.
- A ZIP teljes kiadás, nem különbözeti csomag: `index.html`, JavaScript, CSS, `json/`, `assets/`, `mobile/`, `tools/`, dokumentáció és ellenőrző eszközök együtt kerülnek bele.
- A v1.39.4-es csomag változatlanul megmarad visszaállítási lehetőségként. A v1.39.5 telepítése előtt külön szerveroldali mentést kell készíteni.

## Nyitott feladatok

- Valódi mobilos és asztali böngészőfuttatás, köztük Firefox/Safari és képernyőolvasó: a végrehajtási környezet jogosultsági és elérési korlátai miatt nem teljesült.
- Teljes, manuális WCAG 2.2 AA megfelelőségi audit és intézményi elfogadás: külön eljárás.
- A médiaállományok körülbelül hatszoros bővítése **nem része** ennek az alverziónak.
