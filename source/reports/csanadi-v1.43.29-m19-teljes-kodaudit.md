# Csanádi weboldal – v1.43.29 (M19) teljes kódellenőrzés és javítás

**Kiadási jelleg:** ellenőrzési előnézet, külön végső jóváhagyási ponttal.  
**Alap:** v1.43.28 M18.3, külön, változatlanul megőrzött könyvtárban és ZIP-ben.  
**Közzététel:** nem történt, FTP-re és GitHubra sem került fájl.

## 1. Elvégzett javítások

1. **Asztali képképváltó – újrapróbálás sikertelen kép után (`js/hero-2026.js`).** A hibás képet a böngésző teljesnek is tekintheti (`complete=true`, `naturalWidth=0`). A korábbi verzió ezt gyorsítótárazta, ezért az adott diára visszalépve nem kísérelte meg újra a letöltést. A sérült bejegyzés most kikerül a képgyorsítótárból mind a már hibás kép felismerésekor, mind az `error` eseménynél. A korábbi dia a képernyőn marad, a következő kattintás új képet kér. Az aszinkron régi kérés hibaüzenete csak az aktuális váltáshoz tartozhat.
2. **Mobilos képváltó – félbeszakított dekódolás (`mobile/reboot-hero-v1-43-29.js`).** Ha a felhasználó a `decode()` közben más oldalra lépett, a komponens lecsatolódhatott, miközben az előző/következő gomb letiltva maradt. Minden korai kilépési ágon ugyanaz a visszaengedés fut le, és a telefonos töréspontot is újra ellenőrizzük. Újracsatolás után a lapozó ismét használható.
3. **Mobilos képbetöltés – eseményversenyhelyzet.** A képelem az `img.complete` ellenőrzése és a `load`/`error` eseményfigyelők felhelyezése között is befejezheti a kérést. A listener felhelyezése utáni újabb ellenőrzés kizárja az indokolatlan 5,5 másodperces várakozást.
4. **Új forrás- és regressziós ellenőrzés.** Készült teljes JavaScript-szintaxis-, relatívimport-, CSS-erőforrás-, HTML-ID- és kép-/dokumentumfejléc-vizsgálat. Külön asztali DOM-próba igazolja a képbetöltési hiba utáni újrakérést; a mobilos DOM-próba új esete igazolja a lecsatolás utáni lapozást.

## 2. Változatlanul megőrzött funkciók

- M18.3 filmes mobilos kezdőlap és kilenc képes, csak a nyitórészben megjelenő képváltó.
- Egysoros mobilfejléc: Facebook, Instagram, ikon-KRÉTA, középen a címeres menü, keresés és témaváltó.
- Mobilos háromszintű menü, akadálymentes fókuszkezelés, görgetési viselkedés, PWA-frissítési munkafolyamat.
- 78 aloldal, 254 fő tartalmi blokk, közös téma- és Bootstrap-komponensek, PDF- és képközpont.
- Az összes korábbi asztali CSS, képi média, dokumentum és tartalmi JSON bájtazonos maradt. A közös belépési pontok közül **csak a dokumentált `js/hero-2026.js` változott** a fent leírt hiba miatt; ennek új normalizált SHA-256 lenyomatát külön ellenőrizzük.

## 3. Többkörös ellenőrzés

| Kör | Vizsgálat | Eredmény |
| --- | --- | --- |
| 1. állapotfelmérés | 27 meglévő automatikus teszt a v1.43.28 alapmásolaton | Sikeres |
| 2. forrásaudit | 105 nem gyártói JS-fájl `node --check`; 153 helyi JS-import; 73 CSS; 597 kép/PDF fejléc; statikus HTML-erőforrások és azonosítók | Sikeres |
| 2. médiavizsgálat | 578 WebP/JPEG/PNG állomány teljes pixeldekódolása Pillow-val | 578 sikeres, 0 hibás |
| 2. tartalmi audit | 78 aloldal, 254 tartalmi blokk, 220 belső útvonalhivatkozás, reszponzív 768/769 px határ a meglévő ellenőrzőkben | Sikeres |
| 2. mobil regresszió | Kézi gomb, automatikus lapozás, hibás és megszakított képváltás, DOM le-/visszacsatolás, csökkentett mozgás | Sikeres DOM-próba |
| 2. asztali regresszió | Sikertelen képkérés → korábbi dia megőrzése → ismételt kérés → sikeres dia és ARIA-frissítés | Sikeres DOM-próba |
| 3. kiadási regresszió | 27 régi + 2 új tesztkapu újbóli futtatása, teljes fájllista és SHA-256 | **29/29 sikeres** |
| 3. helyreállítás | Teljes ZIP kibontása külön munkakönyvtárba, leltár- és működési tesztek az onnan futó forráson | **29/29 sikeres** |

## 4. Nyitott ellenőrzések és korlátok

**Valódi böngészős/pixelteszt:** megkíséreltem a helyi `/usr/bin/chromium` futtatását Playwrighttal 390 px-es és 1280 px-es viewporthoz. A Chromium nem indult: `socket() failed: Operation not permitted (1)` a futtatási környezet korlátozása miatt. Ez **nem számít sikeres vizuális ellenőrzésnek**. Valós iPhone Safari, Android Chrome, valamint asztali böngészős kattintás-, scroll-, kép- és PWA-frissítéspróba külön szükséges. A meglévő tesztek DOM-utánzással és statikus vizsgálattal védenek, de nem helyettesítik a kijelzős tesztet.

**Különösen figyelendő:** 320 px széles telefonon az egyetlen sorba sűrített öt kis ikon és középre tett címer érintési szélessége korlátozott; a pontos használhatósági megfelelést valódi készüléken kell mérni. További, bizonyíték nélküli látványváltoztatást nem végeztem.

## 5. Átadás és visszaállítás

- Teljes, statikus tárhelyen használható ZIP, `release-manifest.json` fájlonkénti bájtmérettel és SHA-256 lenyomattal.
- A `tools/verify-reboot-release.mjs` védi az eredeti asztali CSS-, média- és JSON-állományokat, valamint a nem módosított közös modulokat.
- A v1.43.28 kiadás megmaradt, bármikor külön visszaállítható.
- A v1.43.29 **még nem közzétett** javítás. Csak a felhasználó külön jóváhagyása után válhat kiadott verzióvá.
