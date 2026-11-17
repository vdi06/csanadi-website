# Csanádi Sportiskola – v1.39.10 átadás

Készült: 2026. november 17.  Állapot: helyben módosított, közzététel nélkül.

## Kérés és elkészült javítások

1. A kezdőoldali képváltó fölötti háromsoros bevezető (a „SPORT · TUDÁS · KÖZÖSSÉG” megjelölés, a „Fedezd fel a Csanádi Sportiskolát” cím és a képpárok működését magyarázó szöveg) többé nem jelenik meg és nem jön létre a DOM-ban. A képernyőolvasók számára egy nem látható, megfelelő H1 („Csanádi Árpád Sportiskola”) maradt.
2. A menüsáv és a nagy, kétképes (telefonon egyképes) váltó azonos sötét fejlécfelületen folytatódik, külön függőleges rés és eltérő külső perem nélkül.
3. A nagyméretű képváltó és a kétoldali nyilak érintkeznek, 0 képpontos réssel. A képek, a nyílsávok és a hozzájuk tartozó keretek külső sarka szögletes.
4. Lefelé görgetés után a nagyméretű képváltó összecsukódik; az eredeti nyilakat vezérlő, kisebb előnézet és nyilak immár ténylegesen a `#site-header` elemen belül jelennek meg. A nagy képváltó ekkor rejtett és nem fókuszálható.
5. A 768 és 390 képpontos CSS töréspontokban külön a keskeny, egyképes váltóra méretezett, hézagmentes nyílsávok vannak. A teljes kép továbbra is kattintható.

## Ellenőrzések és eredmények

| Ellenőrzés | Eredmény |
| --- | --- |
| Valódi, helyi böngészős megnyitás, asztali nézet | Sikeres; 1348 px hasznos szélesség, 0 px vízszintes túlcsordulás. |
| Nyíl és kép közötti méretellenőrzés | Sikeres; bal nyíl vége és első kép eleje 68,16 px-nél találkozik, a két kép 674 px-nél illeszkedik, a jobb kép vége és a nyíl kezdete 1279,84 px-nél egyezik. |
| Szögletes élek és a menüsáv érintkezése | Sikeres; mért saroksugár 0 px, a menüsáv alja és a képváltó teteje 88 px-nél illeszkedik. |
| Elhagyott bemutatkozó blokk | Sikeres; a `csn26-visual-heading` elem nem jön létre. |
| Akadálymentes címsor | Sikeres; a rejtett H1 jelen van. |
| Görgetésre zsugorodás | Sikeres; a teljes menü + kép egység kb. 497 px helyett a kompakt menüsáv kb. 123 px, a nagy képsáv 0 px magasságú. |
| Statikus, célzott v1.39.10 ellenőrzések | 7/7 sikeres. |
| A v1.39.9 regressziós tesztek | 18/18 sikeres. |
| Korábbi reszponzív/akadálymentességi statikus tesztek | 8/8 sikeres. |
| A v1.39.2 sablonregresszió | 14/14 sikeres. |
| Modális ablakok akadálymentességi regressziója | 10/10 sikeres. |
| Átmeneti hálózati/offline ellenállóképesség | 22/22 sikeres; a próba során a szándékosan kiváltott hálózati hiba várható figyelmeztetése megjelent. |
| Statikus HTTP-kiszolgálási regresszió | 1424/1424 sikeres; 71 oldal és 748 média. |
| Statikus HTML-szemantikai kapu | 17/17 sikeres. |
| Módosított JavaScript-fájlok szintaxisa | Sikeres. |

## Korlátok, nyitott ellenőrzések

- A külön indított, négy felbontású, valódi Playwright/Chromium mobil- és asztaliteszt (1366, 768, 390, 320 px) **nem tudott elindulni** ebben a végrehajtó környezetben. A `/usr/bin/chromium` processzindítás után `FATAL ... socket() failed: Operation not permitted (1)` hibával leállt. Ez környezeti hozzáférési korlát; emiatt **nincs állítás arról, hogy a 390 és 320 px-es mobilos interakciók itt élő böngészőben sikeresen lefutottak volna**. A reprodukálható tesztkód: `tools/test-home-header-v1-39-10.js`.
- iOS Safari, Firefox, Edge, valamint képernyőolvasós felhasználói próba ebben a körben nem történt. Következő, hozzáférhető környezetben ezek külön ellenőrzendők.
- Az iskola valós, üzemeltetési FTP-tárhelyén futó próbát nem végeztünk. A ZIP statikus tárhelyhez készült, szerveroldali futtatás nélkül. A Bootstrap 5.3.9 CSS CDN-betöltése és a megfelelő hálózati hozzáférés továbbra is külső feltétel.
- A kezdőlap `noindex,nofollow` beállítása és a 23 kézi intézményi tartalom-hitelesítési feladat változatlanul megmaradt. A csomag nincs automatikusan közzétéve.

## Teljes csomag és megőrzés

- A teljes v1.39.9 webhelyből készített új, önálló v1.39.10 verzió készült: az összes 71 oldal, a 748 leltározott médiaállomány, a JSON-alapú rendszer, a szerkesztő és diagnosztikai segédoldalak, valamint a statikus FTP-kompatibilis erőforrások megmaradtak.
- A csomag egyben kicsomagolva, a repository/tárhely gyökerébe helyezhető. Nem került hozzá helyileg tárolt Bootstrap, Node- vagy PHP-függőség.
- A `release-manifest.json` a kiadási fájlok SHA-256 hash-eit tartalmazza. A ZIP-be mentést követően érdemes ellenőrizni a ZIP sértetlenségét és a jegyzékegyezést.

## Következő választható fejlesztési irányok

- **A:** Valódi 320/390/768 px mobilos és érintéses böngészőtesztek lezárása hozzáférhető környezetben.
- **B:** A menüszalag és a képes váltó további finomhangolása az iskola arculatához.
- **C:** A kompakt képváltó további billentyűzetes és képernyőolvasós auditja.
- **D:** Intézményi tartalom- és médiatár-hitelesítés a 23 jelölt oldalra.
