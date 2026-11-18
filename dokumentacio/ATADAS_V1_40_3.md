# Csanádi Sportiskola – v1.40.3 átadási beszámoló

**Dátum:** 2026. november 17.  
**Kiinduló csomag:** `csanadi-website-v1.40.2(2).zip`  
**Új csomag:** `csanadi-website-v1.40.3.zip`  
**Állapot:** helyben összeállított ZIP, **nem publikált** kiadás.

## A – Mobilos és táblagépes fejléc / menü

- A meglévő reszponzív és a kompakt görgetős fejléc szerkezetét megtartottuk.
- Új, célzott CSS-szabályok 420 és 350 CSS-pixel alatt: kisebb logó és feliratok, kisebb térközök; az opcionális nyitóanimáció-újrajátszó gomb helyet ad a mindennapi funkcióknak. A legszűkebb nézetben a közösségi szöveges fejlécblokk rejtett, de az alapvető navigáció megmarad.
- Böngészős reszponzív ellenőrzés a nagyítással elérhető **272, 340 és 779 CSS-pixeles** szélességeken: vízszintes kilógás nélkül. A 272 pixeles nézetben a KRÉTA, kereső, témaváltó és főmenü a képernyőn belül maradt; a főmenü és kereső nyitása-zárása sikeres. A 340 pixeles aloldal betöltődött. A 779 pixeles aloldal központi címeres menüje megnyitható és bezárható.
- A grafikus terminálból indított külön Playwright/Chromium eszközteszt `HTTP 403` jogosultsági korlátba ütközött a böngésző helyi HTTP-elérésekor. Ez **nem** éles oldalkiszolgálói hiba, de emiatt a natív érintéses készülék-szimulációt és a konkrét 320/390/768 pixeles automatikus tesztet **nem állítjuk sikeresnek**. A reprodukálható próba forrása: `tools/test-v1403-browser.mjs`.

## B – A 30 kezdőlapi fotó / illusztráció

- A korábbi v1.40.2 diák között **19 kis felbontású, jellemzően 460 × 400 pixeles** állományt azonosítottunk, amelyek médiatári méretadatai tévesen 1600 × 900-at is jelezhettek.
- Ezeket a kezdőlap 12–30. pozíciójában már meglévő, valóban nagyobb, szélesvásznú képekre cseréltük, a képcímeket és a kapcsolódó szövegeket hozzáigazítva.
- A kezdőlapi 30 eredeti kép tényleges fájlméretét és SHA-256 azonosítóját ellenőriztük: **30 különböző SHA-256**, legalább **1200 × 675 pixel**, legfeljebb 5 tárolt DOM-képpel működő képtárral. Egy meglévő `belepes-nyitott.webp` képet új, szabályos médiaazonosítóval vettünk fel a médiatárba; új képfájlt nem generáltunk.
- A helyi böngészőben **mind a 30 diát egyenként végiglapoztuk**: valamennyi kép betöltődött, mind a 30 megjelenített forrás különböző volt.
- A képek egy része **illusztráció / látványterv**, nem igazolt intézményi eseményfotó. A médiatári jogtisztázásra váró státusz és az iskolai felhasználás előtti intézményi jóváhagyási igény változatlanul fennáll.

## C – Világos és sötét megjelenés, 71 oldal

- A **71 különböző regisztrált oldalútvonalat** külön-külön betöltöttük mindkét témában: **142 oldalnézet**, mindkét körben 71 különböző oldalcímmel.
- A vizsgálat számított előtér-/háttérszínek alapján a normál szövegnél **4,5:1**, nagyméretűnél **3:1** küszöböt használta, és a vízszintes túlcsordulást is mérte. Az egyszerű háttérszínnel rendelkező elemeknél feltárt kontrasztproblémákat célzott CSS-sel javítottuk.
- Kijavított területek: tanulói mintaadat-jelölés, dokumentumtári segédszövegek és verziótörténet, kiemelt aranyszínű címkék, témakártya-szövegek, sport- és eredményjelölések, egyes szűrők, közösségi ikonok, lábléc és sötét diagnosztikai fül.
- Az ellenőrzés után a nyugalmi állapotú kezdőlapon mindkét színtémában, valamint a dokumentumtár sötét nézetében **nem maradt a mérőprogram által jelzett hiba**. A teljes 71 oldalas körben az utolsó célzott módosítás előtti néhány ismert problémát külön javítottuk. A gradiens- és fotóhátterek, valamint az átmeneti témaváltási animációk emberi vizuális ellenőrzést is igényelhetnek; ezt nem tekintjük teljes WCAG-tanúsításnak.

## D – A központi konfigurációs figyelmeztetés

- A `js/language-20.js` korábban query-paraméterrel importálta a beállításmodult, miközben a főalkalmazás query nélkül használta. A böngésző ezeket külön modulpéldányként kezelte, ezért az egyik beállításállapot inicializálatlan maradhatott.
- Az importazonosságot helyreállítottuk. A kétnyelvű kiemelt tájékoztató panel betöltődik; a **Magyar → English → Magyar** váltás böngészőben ellenőrizve működik.
- A konzolban a böngésző saját bővítményének metaadattovábbítási hibái előfordultak, ezek nem a weboldal JS-fájljaihoz köthetők. Más, éles szerveren futtatott diagnosztikát nem végeztünk.

## Megőrzött funkciók és kompatibilitás

- A 71 oldalas dinamikus JSON-alapú SPA, a legfeljebb háromszintű menürendszer, a hírek, sporttartalmak, kereső, médiatár, dokumentumtár és szerkesztő segédoldalak változatlan forrásállományokkal tovább élnek.
- A 30 diás képsorozat automatikus váltási, adatforgalom-kímélő előtöltési, mobilképes és csökkentett animációs megoldása megmaradt.
- A korábbi v1.40.2 fejléc, tartós jelmondat, címeres kompakt menü és kétoldali képfelirat megmaradt.
- A csomag **statikus HTML/CSS/JavaScript/JSON-fájlokkal** működik; nem építettünk be szerveroldali PHP-t, Node.js-szolgáltatást vagy GitHub Actions-függőséget. A Bootstrap **kizárólag a verziózott 5.3.9-es CDN-ről** töltődik be, amelynek online elérhetősége szükséges.
- A `release-manifest.json` SHA-256 fájljegyzéke és a `json/config.json` gyorsítótár-azonosítója v1.40.3-ra frissült.

## Tesztek és nyitott tételek

| Ellenőrzés | Eredmény |
| --- | --- |
| 71 útvonal × 2 téma, oldalcímek és asztali túlcsordulás | **142 megjelenítés rendben** |
| 30 hero-kép tényleges fájlméret, SHA-256 és böngészős betöltés | **30/30 rendben** |
| Szűk mobil és tablet CSS-szélességek, menü/kereső | **272/340/779 px próbák rendben** |
| Kétnyelvű panel kézi váltása | **Rendben** |
| `tools/test-v1403-audit.mjs` | **Sikeres** |
| v1.40.2/v1.40.1 célzott fejléces, képes és tartalmi ellenőrzések | **Sikeresek** |
| Témaállapot, modális akadálymentesség, tartalmi JSON-audit | **Sikeresek; 0 súlyos tartalmi hiba** |
| Régebbi v1.37/v1.39 tesztek egy része | **Nem teljesen zöld**: elavult verzió-/darabszám- és implementációs elvárások (65 oldal / 628 vagy 748 média, korábbi JS-részletek) |
| Natív Playwright eszközszimuláció ebből a környezetből | **Nem végrehajtható**: helyi böngészős HTTP 403 jogosultsági akadály |

Az aktuális tartalmi audit **10 manuálisan felülvizsgálandó** bejegyzést jelöl; ezek nem automatikusan bizonyított hibák. Az egyes képek és hivatalos dokumentumok iskolai tartalmi/jogi jóváhagyását nem végeztük el.

## Átadás és telepítés

1. A `csanadi-website-v1.40.3.zip` teljes statikus weboldalt tartalmaz, a gyökérben `index.html`, `script.js`, a `css/`, `js/`, `json/`, `assets/`, `tools/` és `dokumentacio/` állományokkal.
2. A csomag **nem lett automatikusan publikálva**: sem GitHub Pages-re, sem az iskola FTP-tárhelyére nem töltöttünk fel semmit.
3. Élesítés előtt ajánlott a csomagot saját próbatárhelyen ellenőrizni, valódi iOS/Android eszközön is kipróbálni a 320–390 pixeles fejlécet, majd a látványtervként jelölt képekre intézményi engedélyt kérni.
4. Későbbi kézi feltöltéskor a ZIP **tartalmát** kell a webgyökérbe tenni, a mappaszerkezetet változatlanul megtartva; a `release-manifest.json` és az `index.html` azonos kiadásból származzon. A böngésző gyorsítótára szükség esetén frissítendő.

**Összegzés:** A+B+C+D fejlesztései elkészültek, a meglévő statikus rendszer megőrzésével. A böngészős mobilpróbák a CSS-szélességek nagyítással történő vizsgálatára korlátozódtak; a további natív eszköz- és teljes öröklött regressziós tesztelés nyitott. Automatikus publikálás nem történt.
