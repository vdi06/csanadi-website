# Csanádi Sportiskola – 2.49 fejlesztési és tesztátadó

**Kiadás:** 2.49  
**Alap:** a felhasználó által elfogadott, teljes `csanadi-website-2.48.zip` (414 fájl)  
**Dátum:** 2026. november 23.  
**Közzététel:** nem történt sem GitHub Pages-, sem iskolai FTP-feltöltés.  
**Állapot:** a három megrendelt fejlesztési terület elkészült és helyi Node-/Chromium-tesztekkel ellenőrzött; az élő CDN-, fizikai készülékes és képernyőolvasós teszt továbbra is nyitott.

## 1. Pontosan mi volt a kérés?

A korábbi 2.48-as kiadás **F+G+H** fejlesztése, a külön asztali és mobilos JavaScript-/CSS-megvalósítás, az eredeti kapu, a 6 főmenü és a 49 aloldal megtartásával:

- **F – Kezdőlap prémium finomhangolása:** hero, sportkártyák, hírek, címsorok és vizuális hierarchia.
- **G – Kereső és találati oldalak:** pontosabb relevancia, kategóriák, találatszám és következetes üres állapot.
- **H – Akadálymentesség:** billentyűzet, fókusz, címkék, kontraszt, képernyőolvasós felkészítés.

A teljes, telepíthető ZIP és a tételes átadás is a kérés része volt; **FTP-feltöltés nem volt engedélyezett**.

## 2. F – A kezdőlap fejlesztése

### Az asztali változat

- A korábbi nagy, sportos **képes hero**, a címer, a fejléc, a manuális képléptető és a képváltás megmaradt.
- A hero és a meglévő sporteredmények–naptár–hírek Carousel közé új, **JSON-ból szerkeszthető, prémium témakártya-szakasz** került: **Tanulás és képzés**, **Sport és eredmények**, **Hírek és programok**.
- A szakasz vizuális hierarchiája: felső jelölő, hangsúlyos cím, rövid magyarázat, három egyenlő kártya; legfeljebb 1180 px belső tartalomszélességgel, árnyékkal és arany hangsúlyokkal.
- A kártyák kizárólag működő belső oldalra vezetnek (`education-programs`, `sports-disciplines`, `news-latest`); a hivatkozásokat az adatvalidálás ellenőrzi.
- A Carousel maximális szélessége korlátozott, középre igazított, a teljes hero-képszakasz ettől független.

### A mobilos változat

- A korábbi, görgetésre reagáló, felül maradó mobilos képsáv és a Carousel három ikonfüle megmaradt.
- A három témakártya **önálló mobil JavaScript-modullal** és külön CSS-szabályokkal, egymás alatt, legalább 87 px-es érintésbarát kártyákként jelenik meg.
- A feliratok és a térközök keskeny, 320 és 390 px-es kijelzőre is igazodnak; az ikonok csak dekoratívak (`aria-hidden`), a kártyák tényleges szöveges hivatkozások.

### A Carousel hozzáférhetőségi javítása

- A három meglévő panel és a **30 másodperces** automatikus váltás megmaradt.
- Új, jól látható **Szünet / Folytatás** gomb készült mindkét felületen, hozzáférhető névvel és `aria-pressed` állapottal.
- A korábbi csökkentett mozgás-, fókusz-, mutató- és olvasási szünetelési szabályok továbbra is érvényesek.
- A mobilos, kizárólag ikonnal megjelenő fülek akadálymentes szöveges neve nem szűnt meg.

## 3. G – A kereső és találati felület fejlesztése

- A kereső továbbra is a validált JSON-adatokból épít teljes szöveges indexet, ékezetfüggetlen és kisebb elgépeléseket is kezel.
- Megszűnt a hírek **dupla indexelése**, továbbá az azonos **cím+útvonal** párosok indexelésének további, általános védelme is bekerült.
- A **globális kereső új felülete** az első 12 találatot mutatja, majd **További találatok** gombbal 12-es adagokban folytatható. Az összes találat pontos száma **nem** az első 50 elemre korlátozódik.
- Kategóriák: **Oldalak**, **Hírek és közlemények**, **Események**, **Sport**, **Képzés és felvételi**, **Elérhetőségek**, szükség esetén **További tartalmak**. Az üres kategóriák nem jelennek meg.
- A kategóriagombok megmutatják az adott kategória teljes darabszámát; kategóriaválasztáskor a találatok és az aktuális találatszám együtt frissülnek.
- Az „Iskolai oldal” típusú bejegyzések a megfelelő **Oldalak** kategóriába kerülnek.
- Gépelés közben a nyitó **Gyors választás** gombok eltűnnek, így a valódi találatok több helyet kapnak. Üres keresőkifejezésnél ezek megmaradnak.
- Nulla találat esetén konzisztens, szöveges üres állapot, **0 találat** és szükség szerint a kategóriaszűrés visszaállítási lehetősége jelenik meg.
- Az asztali és mobilos kereső DOM-ja, stílusa és vezérlése továbbra is **két külön fájlpárban** működik. A sporteredmény-archívum korábbi keresési útvonala megmaradt.

## 4. H – Akadálymentességi javítások

- A keresőmező `aria-controls` értéke a tényleges, azonosítóval ellátott találati régióra mutat, a találatszám `aria-live="polite"` révén felolvasható.
- Kategóriaszűrők `aria-pressed` állapottal és szöveges, darabszámot tartalmazó címkékkel; mindegyik billentyűzettel használható.
- A keresőmodál **Escape** billentyűvel bezárható; a fókusz a keresőt megnyitó gombra kerül vissza.
- A fókuszcsapda többé nem veszi be a rejtett szülőben, illetve `inert` területben lévő vezérlőket sem.
- A „További találatok” és „Összes kategória megjelenítése” gombok billentyűzettel is működnek.
- Az új kezdőlapi kártyák valódi `<a>` elemek; fókuszkiemeléssel és a mobilos érintési célméret figyelembevételével.
- Finomított keresőkontraszt, látható aktív szűrőállapot, sötét és világos téma, `forced-colors` és `prefers-reduced-motion` támogatás.
- **Fontos korlát:** ez automatizált és manuális böngészős felkészítés; **teljes WCAG-megfelelőségi tanúsítás és valódi képernyőolvasós audit nem történt**.

## 5. Fájlok és integráció

**Új felületmodulok:**

- `desktop/home-highlights.js` – külön asztali prémium kártyaszakasz.
- `mobile/home-highlights.js` – külön mobilos, függőleges érintésbarát kártyalista.

**Jelentősen módosított meglévő fájlok:**

- `shared/data/site.json` – `release: "2.49"`, `home.homeHighlights` (teljesen JSON-vezérelt szövegek és céloldalak).
- `shared/js/menu-data.js` – új tartalomblokk formális adat- és hivatkozásvalidálása.
- `shared/js/search-index.js` – duplikációmentes kereső, relevancia, teljes találatszám és kategóriastatisztika.
- `desktop/search.js` és `mobile/search.js` – külön kategóriaszűrők, eredménylapozás és üres állapot.
- `shared/js/focus.js` – rejtett/inert elemek kizárása a fókuszcsapdából.
- `shared/js/home-carousel.js` – hozzáférhető Szünet/Folytatás vezérlés.
- `desktop/app.js` és `mobile/app.js` – a külön kezdőlapi modulok bekötése.
- `desktop/styles.css` és `mobile/styles.css` – arculati, fókusz-, kontraszt-, reszponzív és csökkentett mozgásstílusok.
- `index.html` és valamennyi modulimport: kiadáshoz kötött **2.49** cache-kulcs.

**Új automatizált ellenőrzők:** `tools/test-249.mjs`, `tools/test-249-browser.py`.

## 6. Ellenőrzések – ténylegesen lezárult eredmények

| Ellenőrzés | Eredmény | Mit vizsgált? |
|---|---:|---|
| `node tools/test.mjs` | sikeres | JS-szintaxis, gate 30+30 kép, 6 főmenü, 49 oldal, naptár, média, hírek, dokumentumok, verzió, tiltott domain |
| `node tools/test-249.mjs` | **141/141** | keresőindex, egyezési sorrend, duplikációk, kategóriák, teljes és szűrt számlálás, új JSON-linkek |
| `python tools/test-249-browser.py` | **142/142** | 1440/1024/390/320 px, világos/sötét, új kezdőlap, hero, szüneteltetés, keresés, kategóriák, Escape/fókusz, túlcsordulás |
| `python tools/test-248-browser.py` | **1048/1048** | mind a 49 aloldal, négy megjelenési kombináció, hiányzó megosztáslinkek és vízszintes túlcsordulás |
| `python tools/test-243-browser.py` | **782/782** | meglévő központok, Carousel, a kézi szünetvezérlés új követelményével |
| `python tools/test-gallery-browser.py` | **156/156** | képgaléria, kereső, képnéző |
| `python tools/test-245-browser.py` | **198/198** | album, mobilos képzoom, médiakezelő |
| `python tools/test-footer-documents-browser.py` | **128/128** | középre igazított, kompakt lábléc és egytalálatos dokumentumrács |
| `python tools/test-245-a11y.py` | **160/160** | célzott kontraszt, billentyűzet, fókusz, képmód és mozgáscsökkentés |
| `python tools/test-248-content.py` | **208/208** | oldalbevezetők, SEO-előnézetek, tartalomblokkok és statikus fájlellenőrzés |
| `node tools/test-245.mjs`, `node tools/test-246.mjs` | sikeres | médiakategóriák, optimalizált fájlok, albumok és SEO-adatok |

**Nem lezárt teszt:** a régebbi `tools/test-246-browser.py` teljes futása időkorlátba ütközött; ezt nem állítom sikeresnek. A helyi Chromium-vizsgálatok izolált, programozottan kiszolgált webes fájlokkal történtek. Az eredeti Bootstrap 5.3.8 kizárólag verzióhoz kötött CDN-hivatkozás maradt; a valódi internetes CDN-választ ebben a környezetben nem lehetett megbízhatóan ellenőrizni. Valódi képernyőolvasó és fizikai telefon tesztje szintén külön feladat.

## 7. Megmaradt követelmények és nyitott kockázatok

- **Hat főmenü, 49 oldal**, hierarchikus JSON, kizárólag statikus HTML/CSS/natív JavaScript; Bootstrap CDN 5.3.8, helyi Bootstrap-másolat nélkül.
- **Eredeti kapuanimáció mindkét felületen**, 30 asztali + 30 mobilos képkockával. A kapura kattintás/koppintás indítja, **„Kihagyás” gomb nincs**.
- A korábbi intézményi webhelyre mutató hivatkozás a nyilvános fájlokban továbbra sincs; a belső saját SPA-útvonalak megmaradtak.
- A látogatói megosztási előnézeti linkek eltávolítva; a 49 oldal- és 14 albumelőnézet, a 64 SEO-grafika és a **noindex** tesztkiadási beállítás megmaradt.
- A korábbi **74 mintahír/közlemény**, **30 nem hitelesített sportsiker-bejegyzés** és **22 illusztráció** továbbra sem minősül ellenőrzött intézményi ténynek. A 16 dokumentumtári tételből 10 hivatalos tartalom feltöltésre vár.
- Nem állítottam valótlant a tanulókról, sporteredményekről, felvételiről vagy intézményi aktualitásokról.

## 8. Telepítés és publikáció

A ZIP-ben a webhely közvetlen gyökerében található az `index.html`, a `desktop/`, `mobile/`, `shared/`, `share/`, `tools/`, `docs/`, `robots.txt` és a `sitemap.xml`.

Helyi indítás: kicsomagolás után a gyökérben `python -m http.server 8000`, majd a böngészőben `http://localhost:8000/`. A CDN-stílusokhoz helyi teszt során is internetelérés szükséges.

**Sem a GitHub Pages tesztoldalra, sem az iskola FTP-jére nem történt feltöltés vagy élesítés.** A tesztkiadást csak külön engedéllyel, hitelesített adatokkal és publikáció utáni ellenőrzéssel szabad közzétenni.
