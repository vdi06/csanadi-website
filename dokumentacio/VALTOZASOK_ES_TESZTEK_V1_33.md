# Csanádi weboldal v1.33.0 – harmadik, teljes javítási kiadás

Kiindulás: **a teljes v1.32.0**, mely a v1.31.0-ra, az pedig a felhasználó v1.30.0 teljes csomagjára épült. A három kiadás külön-külön önállóan feltölthető, összes korábbi tartalmat, médiát, JSON-oldalt és eszközt megőrző statikus weboldal.

## A–J: harmadik ellenőrzés és finomítás

| Pont | Kizárólag meglévő funkcióban végzett munka |
|---|---|
| A | A mobil harmonikamenü képernyőméret-figyelése a régebbi Safari `MediaQueryList.addListener` útvonalát is támogatja. |
| B | Sötét/világos/automatikus téma visszaellenőrzése az előzményekből visszatérő vagy újra aktív böngészőablak fókuszánál; a kézi választás megőrződik. |
| C | A beágyazott térkép magasságát csak tényleges számként fogadja el a szülő SPA; a túlméretes szakaszlistát elutasítja, az előző kiadás sorszámvédelme megmarad. |
| D | Negatív CSS `scroll-margin-top` nem ronthatja el a szakasz célpozícióját. |
| E | A kezdőoldali szakaszmenü bezárásakor a fókusz kizárólag látható és továbbra is létező vezérlőelemre tér vissza. |
| F | A kereső bezárása nem állít vissza fókuszt levált vagy elrejtett indítóelemre; az útvonalanként mentett keresési/szűrési állapot megmarad. |
| G | A dokumentumtár három engedélyezett állománykiterjesztéséhez pontosan megfelelő MIME-típust kötelező megadni, a hamis PDF-előnézet-metaadat elutasításra kerül. |
| H | A galéria a 3G-nek jelzett hálózatot is lassú kapcsolatként kezeli, így az előző körben javított képelőtöltés nem terheli feleslegesen. |
| I | Azonos című szakaszok élő JSON-cseréjénél a görgetési helyzet megtartásához először a korábban meglévő stabil HTML-azonosítót keresi, majd a szövegkörnyezetet/sorrendet használja. |
| J | Hibás kiadási verzióazonosító vagy valószínűtlen összméret nem jelenhet meg hiteles fájlleltárként a diagnosztikában. |

## Teljes ellenőrzési terv és napló

- `tools/run-full-regression-v1-33.js`: az egész projekt regressziós, mobil, témakezelési, térképes, keresési, dokumentum-, galéria-, JSON-, fájl-, HTTP- és médiaellenőrzési programjai.
- `tools/test-corrections-v1-33.js`: **32 célzott ellenőrzés** az A–J három kumulatív fejlesztési körére.
- Az egyes programok futási ideje, státusza, pontos kimenete a géppel írt `dokumentacio/TESZTNAPLO_V1_33.md` állományban van. Hiba esetén külön jelenik meg a pontos diagnózis, nem tekinthető sikernek.
- A tesztek a helyi kiadási csomagot és helyben indított HTTP-kiszolgálást ellenőrzik; nem azonosak a nyilvános GitHub Pages oldal napi 06:00-kor futó külső automatikus tesztjével.
- A külön Playwright/Chromium valós böngészős próba a környezet socket-tiltása miatt már a böngésző indításakor megakadt; a 16 forgatókönyv emiatt **nem tesztelt**, és nem számít bele a 18/18 automatizált programsikerbe. Részletek: `BONGESZOS_PROBA_V1_33.md`.
- Valódi iOS Safari és Android Chrome telefonon, illetve az éles publikált URL-en történő kézi teljes körű vizsgálat külön megerősítést igényel. Ez a ZIP nem állít ilyen tesztet végrehajtottnak.
- A jelen időpontban **nincs** meglevő automatikus, éles webhelyről származó 06:00-s jelentés, így a honlap diagnosztikai paneljébe nem került ilyen eredmény, a felhasználói kérésnek megfelelően.

## Kiadási korlátok és megőrzés

- Nem került bele új szolgáltatás, közzététel, külső automatizálást igénylő működés, médiatár-hatszorozás vagy szerveroldali függőség.
- Az összes meglévő oldalfájl, `json/`, `assets/`, `tools/`, az eredeti Bootstrap CDN és a statikus FTP-kompatibilitás megmarad.
- Kiadásra kész ZIP, önálló `release-manifest.json` SHA-256 fájljegyzékkel és belső tesztnaplóval. Nem automatikus élesítés.
