# Csanádi Sportiskola – 2.50 teljes javítási és tesztátadó

**Kiadás:** 2.50  
**Alap:** a felhasználó által átadott `csanadi-website-2.49.zip` teljes tartalma  
**Dátum:** 2026. november 23.  
**Állapot:** a helyi logikai, vizuális, funkcionális és fájlintegritási ellenőrzések után összecsomagolva.  
**Publikálás:** nem történt sem GitHub Pages-, sem iskolai FTP-feltöltés.

## 1. A kért feladat

Átfogó **javítási és tesztelési kör** a meglévő teljes honlapon: működési logika, navigáció, valós funkciók, adatkonzisztencia, megjelenés, reszponzivitás és használhatóság vizsgálata, a talált hibák javítása, mindezt a korábbi megoldások megőrzésével. A 6 főmenü, 49 aloldal, külön asztali/mobilos JavaScript és CSS, natív JSON-alapú SPA, eredeti 30+30 képkockás kapu és a kihagyó gomb hiánya továbbra is változatlan követelmény.

## 2. Ténylegesen feltárt és javított hibák

### J1 – Nem hitelesített sporteredmények félreérthető megjelenítése – fontos tartalmi/logikai hiba

**Kiinduló hiba:** a korábbi 30 ellenőrizetlen sportsiker-mintabejegyzés valódi tanulói eredménynek tűnt a „Legfrissebb sportsikereink” címsor, a név + helyezés kártyák és a keresőtalálatok alapján. Az átadó már figyelmeztetett arra, hogy ezek nem hitelesítettek, de maga a látogatói nézet nem volt elég egyértelmű.

**Javítás:**
- A kezdőlapi szakaszcím **„Sportsikerek – bemutatóadatok”**, magyarázó figyelmeztetéssel.
- A 30 bejegyzés külön `verified: false` adatmezőt kapott, amelynek jelenlétét és típusát a JSON-validátor ellenőrzi. Egy később hitelesített tétel önállóan állítható át ellenőrzés után; az alapértelmezett hiány nem minősül hitelesítésnek.
- Mindkét felületen **MINTA** jelölés látható az összes jelenleg megjelenített sportsikerkártyán.
- A részletes felugró ablakban külön mintatartalmi figyelmeztetés szerepel.
- A globális kereső eredményei a nem hitelesített neveket **MINTA** előtaggal és „nem hitelesített mintabejegyzés” magyarázattal mutatják.
- Az archívum saját, menüből ismert **„Diákjaink sporteredményei”** oldalcíme változatlan maradt; a bevezetője és az archívum jelölése a mintastátuszt közli.

**Érintett fájlok:** `shared/data/site.json`, `shared/js/successes-data.js`, `shared/js/search-index.js`, `desktop/successes.js`, `mobile/successes.js`, `desktop/styles.css`, `mobile/styles.css`, `shared/css/base.css`.

**Fontos:** a személynevek és eredményadatok továbbra is a korábbi tesztadatokból származnak. A MINTA jelölés **nem** hitelesítés. Élesítés előtt hiteles valós tartalomra kell őket cserélni, vagy teljesen el kell távolítani.

### J2 – Az oldal-/albumelőnézetek elavult verziója – kiadási/logikai hiba

**Kiinduló hiba:** a 2.49-es ZIP-ben lévő statikus SEO-/megosztási oldalak visszamutató linkjei és láblécei még 2.48-as verziót tartalmaztak.

**Javítás:** a központi `2.50` kiadásból az összes előnézetet újrageneráltam: **49 oldal, 14 album, 64 megosztási kép, 64 sitemap-bejegyzés**. A visszamutató hivatkozások kiadási paramétere, a láblécverzió és a statikus SEO-képek a megfelelő új állapotból készültek. Az eredmény független `--check` módban ismét ellenőrzött, a fájlok egyeznek a generátor elvárt kimenetével.

**Indexelés:** a tesztkiadás szándékosan továbbra is `noindex`; a generálás nem engedélyezett éles keresőindexelést.

### J3 – Túlságosan erős fókuszkeret a mobilos/asztali oldalcím körül – vizuális probléma

**Kiinduló hiba:** hash-útvonalváltáskor a program fókuszba helyezett `<h1>` címsor körül egy vastag, teljes szélességű téglalap alakú keret jelent meg, amely dekoratív elemnek tűnt és zavarta a tipográfiai hierarchiát.

**Javítás:** a programozott fókuszt megtartottam a navigáció és képernyőolvasók miatt, de a címsornál a nagy keret helyett **vékony arany aláhúzás** jelenik meg. A ténylegesen kattintható gombok és linkek erős, látható fókuszkerete változatlanul megmaradt.

**Érintett fájlok:** `desktop/styles.css`, `mobile/styles.css`.

### J4 – Túl kicsi kattintható e-mail-terület a kompakt láblécben – használhatóság

**Kiinduló hiba:** a lábléc e-mail-hivatkozásának tényleges magassága a vizsgált állapotban kb. 15–16 pixel volt, noha a láblécnek a korábbi kérés szerint alacsonynak kell maradnia.

**Javítás:** a link megnyomható területe legalább **28 px** magas, külön billentyűzetes fókuszjelzéssel. Negatív külső térközt alkalmaztam, ezért a lábléc nem lett érdemben magasabb. A Csanádi–Kapcsolat középre igazítás, a keret nélküli lezárás és az állapotadatok megmaradtak.

**Érintett fájl:** `shared/css/base.css`.

## 3. Logikai és funkcionális vizsgálatok

- **Útvonalak:** a kezdőlap + mind a 49 aloldal ellenőrzött. További célzott vizsgálat során **184 különböző belső hash-hivatkozásból 0 hibás** volt.
- **Kapu:** a 30+30 eredeti képkocka megmaradt; a tényleges (nem csökkentett mozgású) kapunyitást kattintással kipróbáltam, majd a kezdőlapra jutást ellenőriztem. Kihagyó gomb nincs.
- **Carousel:** az eredeti 30 másodperces váltást és a **Szünet/Folytatás** vezérlés állapotát mindkét platformon **gyorsított Chromium-böngészőórával** ellenőriztem. Szünetben nem történt automatikus váltás.
- **Kereső:** kategóriák, pontos találatszámok, további találatok, fókuszvisszaállítás, mintatartalom-figyelmeztetések.
- **Galéria:** képszűrés, képnéző, albumváltás, mobil zoom, szövegkontraszt és egyedüli találat igazítása.
- **Dokumentumtár:** dokumentumlista, előnézetek, 1 találat középre rendezése; a 10 hiányzó hivatalos fájl továbbra is feltöltésre vár.
- **Tanév, események, felvételi:** a korábbi adatstruktúrák, hivatkozások és oldalak regressziós tesztjei sikeresek.
- **Reszponzivitás:** 320, 390, 767, 768, 1024 és 1440 pixel szélességen célzott működési és elrendezési ellenőrzés; 49 oldal négy alap megjelenési kombinációban külön teljes körű bejárással.
- **Képek:** minden ZIP-be kerülő **251 képállomány** dekódolhatóságát külön megvizsgáltam.

## 4. Tényleges teszteredmények

| Teszt | Eredmény |
|---|---:|
| `node tools/test.mjs` – teljes alaprendszer | sikeres |
| `node tools/test-250.mjs` – új javítási szabályok | **183/183** |
| `node tools/test-249.mjs` – kereső és kiadási alapok | **143/143** |
| `python tools/test-248-content.py` – tartalom és statikus állományok | **208/208** |
| `python tools/test-248-browser.py` – 49 oldal × 4 megjelenés | **1048/1048** |
| `python tools/test-243-browser.py` – korábbi funkciók | **782/782** |
| `python tools/test-249-browser.py` – kezdőlap, keresés és fókusz | **142/142** |
| `python tools/test-250-browser.py` – új javítások, 6 képernyőszélesség, valódi kapunyitás | **129/129** |
| `python tools/test-250-carousel.py` – 30 mp időzítés, Szünet/Folytatás | **10/10** |
| `python tools/test-250-links.py` – belső útvonalak | **50 nézet, 184 link, 0 hibás** |
| `python tools/test-gallery-browser.py` – galéria/képnéző | **156/156** |
| `python tools/test-245-browser.py` – album, zoom, médiakezelő | **198/198** |
| `python tools/test-246-browser.py` – albumborítók és SEO | **168/168** |
| `python tools/test-245-a11y.py` – akadálymentességi alapellenőrzések | **160/160** |
| `python tools/test-footer-documents-browser.py` – lábléc és dokumentumok | **128/128** |
| `python tools/test-246-import.py` – tömeges médiabeolvasás | **32/32** |
| `node tools/test-245.mjs`, `node tools/test-246.mjs`, `node tools/check-documents.mjs` | sikeres |
| `python tools/generate-seo.py --check` | **49 oldal + 14 album + 64 grafika** egyező |
| Képfájlok külön dekódolási ellenőrzése | **251/251** |

A felsorolt böngészős tesztek ténylegesen lefutottak. A lokális HTTP-végpont a Python kiszolgáló felől elérhető, de a Chromiumot ebben a környezetben a helyi HTTP-navigációnál `ERR_BLOCKED_BY_ADMINISTRATOR` korlátozás blokkolja. A böngészős vizsgálatok emiatt valódi Chromium DOM-on, helyi fájlokat egy izolált teszt-HTTPS-eredeten kiszolgálva futottak. Ez nem ugyanaz, mint egy publikus, élő CDN-es teljes E2E-teszt.

## 5. Megőrzött követelmények és korlátozások

- **6 főmenü, 49 aloldal**, az oldalak URL-azonosítói és a hierarchikus JSON-működés változatlan.
- Asztali és mobilos felület külön JavaScript- és CSS-fájlokban, natív JavaScript, statikus FTP- és GitHub Pages-kompatibilitás.
- Bootstrap **5.3.8**, kizárólag rögzített CDN-hivatkozásból. **Nem** került helyi Bootstrap-másolat a csomagba.
- A kapu, a prémium kezdőlap, a galéria, a képnéző, a dokumentumtár, az események, a kereső, a helyi médiakezelő és az új albumrendszer megmaradt.
- A korábbi intézményi honlapra vezető, felhasználóknak megjelenített linkek hiányát a tesztek ellenőrizték.
- A közösségi megosztási előnézetek nem kaptak új látogatói menüpontot vagy technikai hivatkozást a normál felületen.
- **Nyitott tartalmi kockázatok:** 30 ellenőrizetlen mintasportsiker (most már láthatóan jelölve), 74 mintahír/közlemény, 22 illusztráció, 10 hiányzó hivatalos dokumentum. A naptári adatok mindegyike nem került ebben a körben újra, intézményi forrásból hitelesítésre.
- **Nyitott tesztek:** élő Bootstrap CDN/GitHub Pages teljes hálózati próba, fizikai telefonos ellenőrzés, valódi képernyőolvasós teljes WCAG-audit. Ezeket nem jelölöm sikeresnek.

## 6. Kiadási állományok és telepítés

A teljes gyökércsomag tartalmazza az `index.html`, `desktop/`, `mobile/`, `shared/`, `share/`, `tools/`, `docs/`, `robots.txt` és `sitemap.xml` elemeket. A `tools/` mappába négy új, reprodukálható 2.50-es teszt és egy statikus minőségi auditor került. A régi 2.49-es ZIP minden fájlja megmaradt; egyik korábbi fájl sem hiányzik.

**Helyi megnyitás:** a teljes ZIP kicsomagolása után a gyökérben `python -m http.server 8000`, majd böngészőben `http://localhost:8000/`. A Bootstrap CDN erőforrásaihoz működő internetkapcsolat kell.

**Publikálás:** sem a GitHub Pages tesztoldalára, sem az iskolai FTP-re nem került feltöltés. További külön engedély szükséges.
