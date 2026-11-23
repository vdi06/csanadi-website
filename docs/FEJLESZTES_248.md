# Csanádi Sportiskola – 2.48 fejlesztési és tesztátadó

**Kiadás:** 2.48  
**Dátum:** 2026. november 23.  
**Forrás:** `csanadi-website-2.47.zip`  
**Állapot:** elkészült statikus munkacsomag; helyi kód-, adat- és Chromium-ellenőrzéssel tesztelve; **GitHub Pages- és FTP-feltöltés nem történt**.

## 1. Pontosan mi volt a kérés?

**A.** Ismétlődő címek, bevezetők, tájékoztatók és párhuzamos tartalmak egységesítése a teljes 49 aloldalon.  
**B.** Minden, látogatóknak mutatott technikai SEO-megosztási előnézeti link eltávolítása a statikus előnézetek megtartásával.  
**C.** Hiányos és túl általános oldalak részletesebb, lehetőség szerint hiteles információra épülő kidolgozása.  
**D.** Az asztali és mobilos megjelenés egységesítése a címsorok, kártyák, térközök, szűrők és reszponzív megjelenés terén.

Az eredeti hat főmenü, a 49 oldalas információs architektúra, a sötétkék–fehér–arany vizuális karakter, az eredeti animált kapu **„Kihagyás” gomb nélkül**, a kompakt és középre rendezett lábléc, a 22 illusztrációs kép, a 14 albumborító, a 66 méretezett képfájl, a 3 paneles kezdőlapi Carousel, a dokumentumtár, a felvételi/sport/tanév/naptár központok és a helyi médiabeolvasó megmaradtak.

## 2. Megvalósult feladatok

### A – Ismétlések megszüntetése

- Mind a **49 aloldal egyedi, a témához tartozó `intro` szöveget** kapott a `shared/data/site.json` állományban. A bevezetők a korábbi verzióhoz képest mind megváltoztak.
- Az általános oldalcím és a saját modullal megjelenített bevezető közül a redundáns másodikat eltávolítottam: az önálló nyolc funkcióközpont és a dokumentumtár nem kap párhuzamos bevezetőt.
- A galéria tisztított 2.47-es sorrendje megmaradt: egyszeri illusztrációs figyelmeztetés, albumválasztó és külön képszűrő. A két szűrő eltérő célt szolgál, ezért **nem** egyesítettem őket működésromlást okozva.
- A sporteredmény-archívum címét a menüben használt megnevezéshez igazítottam. A menü szerkezetét és az oldalazonosítókat nem változtattam.

### B – Technikai megosztási hivatkozások a látogatói nézetből

- `desktop/page.js`, `mobile/page.js`: nincs több „Oldal megosztási előnézete” hivatkozás az aloldalak normál tartalmában.
- `shared/js/gallery-ui.js`: eltűntek az albumborítók és a megnyitott albumok alatt megjelenő „Megosztási előnézet” linkek.
- **Megmaradt** az összes **49 aloldalhoz és 14 albumhoz** készített külön, statikus, közösségi megosztáshoz használható előnézeti HTML, valamint a **64 SEO-grafika**, a `sitemap.xml`, a `robots.txt`, az Open Graph/Twitter/JSON-LD metaadatok. A gyökér- és SEO-oldalak indexelése egyelőre `noindex`.
- A tiltott régi intézményi honlap címére mutató látogatói link továbbra sincs; az oldal belső SPA-navigációja működik. A saját projektcímet tartalmazó SEO-technikai metaadatokat megtartottam a megosztási rendszerhez; ezek **nem** látogatói navigációs linkek.

### C – Használhatóbb, körültekintően ellenőrzött tartalom

- **25 korábbi alapoldal új, oldalanként eltérő tartalmi kártyát** kapott (ellenőrzött történeti háttér, helyes ügyintézési lépések, dokumentumok ellenőrzési szempontjai, tájékozódási kérdések). A további 24 aloldal a saját működő adatkijelzőjét vagy meglévő egyedi tartalmát tartja meg a felülvizsgált bevezetővel.
- Ellenőrizhető történeti adatok: az 1897-es iskolakezdet, az 1904-es épületátadás, a KSI-vel 1987 óta fennálló együttműködés, a gimnáziumi oktatás 1988-as indulása; az alapvető intézményi cím és az intézmény történeti névadója. A KSI nyilvános együttműködési és iskolatörténeti forrása, továbbá hivatalos oktatási/sporttörténeti források szolgálnak háttérül.
- A nem igazolt tényeket **nem** pótoltam kitalált tanári névsorral, heti edzéstervvel, intézményi foglaltsággal, 2027-es férőhelyszámmal vagy helyi határidővel. Ezeknél ellenőrzési útmutató vagy látható intézményi megerősítési igény szerepel.
- A teljes, **49 oldalas útvonal- és változásjegyzék**: `docs/TARTALMI_AUDIT_248.md` és külön átadott `Csanadi_2.48_oldalak.md`.

### D – Következetes asztali és mobilos megjelenés

- A közös oldalszélességek, margók, belső térközök, kártyatávolságok és címsorritmus egyaránt finomodott a `desktop/styles.css` és `mobile/styles.css` állományokban.
- Egykártyás nézetnél középre igazítás, keskeny mobilokon sortörés és túlcsordulás elleni szabályok; jól látható fókuszkeretek, csökkentett mozgás támogatása.
- A funkcióközpontok, dokumentumtár, galéria, felvételi- és órarendoldalak egységes maximális tartalomszélességet követnek. A mobil és asztali JavaScript/CSS állományok továbbra is külön maradnak.
- Bootstrap CSS/JS **5.3.8 csak verzióhoz kötött CDN-ről**; a ZIP nem tartalmaz helyi Bootstrap-másolatot.

## 3. Tesztek – ténylegesen teljesített eredmények

| Ellenőrzés | Eredmény |
|---|---|
| `node tools/test.mjs`, `test-243.mjs`, `test-245.mjs`, `test-246.mjs` | mind sikeres; 6 főmenü, 49 oldal, kapu, hírek, naptár, dokumentum, galéria, média, SEO, adatkapcsolatok |
| `node tools/check-documents.mjs` | sikeres; 16 tétel, köztük 6 fájllal rendelkezik, 10 hiányzik |
| `python tools/test-248-browser.py` | **1048/1048 sikeres**, 0 hiba; mind a 49 oldal négy megjelenési kombinációban |
| `python tools/test-243-browser.py` | **777/777 sikeres**, 0 hiba |
| `python tools/test-gallery-browser.py` | **156/156 sikeres**, 0 hiba |
| `python tools/test-245-browser.py` | **198/198 sikeres**, 0 hiba |
| `python tools/test-246-browser.py` | **168/168 sikeres**, 0 hiba; új linkmentességi elvárások szerint |
| `python tools/test-245-a11y.py` | **160/160 sikeres**, 0 hiba; célzott automatikus kontraszt, fókusz, érintési célméret és csökkentett mozgás teszt |
| `python tools/generate-seo.py --check` | sikeres; 49 oldal- + 14 albumelőnézet, összesen 64 SEO-grafika, `noindex` |
| `python tools/test-248-content.py` | tartalmi, útvonal- és linkmentességi ellenőrzés, eredménye az átadott ZIP-be csomagoláskor rögzítve |

**A teljes oldalbejárás négy kombinációja:** asztali 1440 px / sötét, asztali 1024 px / világos, mobil 390 px / sötét, mobil 320 px / világos. A vizsgálat a 49 oldalon ellenőrizte a megfelelő címet, a technikai megosztási és régi honlapra mutató linkek hiányát, a vízszintes túlcsordulás hiányát, a kiválasztott tartalmi blokkokat és a JavaScript-futási hibák hiányát. A galéria és albumok külön képernyőképei is készültek. Ez helyi, izolált Chromium-próba; a CDN-hez való internetes hozzáférést nem teszteli.

### Amit nem állítunk sikeresnek

- **Nem** történt valódi hálózati Bootstrap-CDN/nyilvános GitHub Pages E2E. A lokális böngészőpróba a helyi fájlokat HTTP-válaszokként szolgálta ki a tesztfuttatóban.
- **Nem** történt teljes, valós képernyőolvasós WCAG 2.2 AA audit vagy minden eszközön fizikai érintéses próba.
- A 30 másodperces Carousel valósidejű, külön időzítési próbája nem tartozott az új kör sikeres tesztjei közé; az alapkonfiguráció és a komponensteszt ellenőrzi a hárompaneles működést.
- A 2026/2027-es **88 esemény** nem kapott egyenkénti, friss külső hitelesítést ebben a körben; nem tekinthető minden dátum intézményileg véglegesnek.
- A ZIP nem vált az iskola hivatalos tartalomközlési rendszerévé: a statikus JSON szerkesztése és a publikálás továbbra is ellenőrzött, helyi/külső folyamat.

## 4. Élesítés előtti nyitott intézményi kockázatok

1. **74 MINTA hír és közlemény** a 40+40-es állományból; csak látvány- és működési teszthez. Ezeket az iskola valódi közleményeként megjeleníteni nem szabad.
2. **30 örökölt sportsiker-mintabejegyzés**, amelyekben nem ellenőrzött személynevek/eredmények lehetnek – hitelesítés vagy anonimizálás szükséges.
3. **22 illusztrációs galériakép**, köztük a 14 albumborítóhoz kapcsolódó illusztrációk; nem bizonyított eseményfotók.
4. **10 feltöltésre váró hivatalos dokumentumtári tétel**; a 6 elérhető dokumentum használati/technikai segédlet, nem hivatalos szabályzat.
5. Tanári névsorok, helyi sporthelyszínek, osztályórarendek, étkezési rend és helyi felvételi adatok csak intézményi megerősítéssel tehetők közzé.
6. Az SEO-`noindex` feloldása **csak** a nyilvános tartalmak intézményi jóváhagyása és a tényleges publikálási ellenőrzés után javasolható.

## 5. Technikai struktúra és használat

A ZIP közvetlen gyökerében: `index.html`, `desktop/`, `mobile/`, `shared/`, `share/`, `tools/`, `docs/`, `sitemap.xml`, `robots.txt`. Az oldal statikus HTML + CSS + natív JS + JSON architektúra maradt. **Nem** kell alkalmazásszerver, de JSON-betöltéshez helyi HTTP-kiszolgáló szükséges.

Helyi indítás a ZIP kicsomagolt gyökerében:

```sh
python -m http.server 8000
```

A saját böngészőben: `http://localhost:8000/`. A médiatár helyi szerkesztői nézete (korábbi funkció): `http://localhost:8000/?media-editor=1#/oldal/sports-gallery`.

Alapvető ellenőrzés a projektgyökérből:

```sh
node tools/test.mjs
node tools/test-246.mjs
python tools/generate-seo.py --check
python tools/test-248-content.py
python tools/test-248-browser.py
```

A Chromium-ellenőrzésekhez Playwright és telepített Chromium szükséges; a produkciós honlap futásához nem. A médiakép-generáláshoz Pillow szükséges fejlesztői gépen, a kész képfájlok megtekintéséhez nem.

**Publikálás:** sem az iskola FTP-tárhelyére, sem a GitHub Pages-re nem került fel új fájl. Az élesítéshez a felhasználó későbbi, külön kifejezett engedélye szükséges.
