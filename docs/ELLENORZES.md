# Csanádi Sportiskola – aktuális 2.46 kiadási ellenőrzés

## 2.46 – F + G + I fejlesztések

- **F – Prémium albumborítók:** 14 egyedi 1200×690 WebP, öt JSON-szerint kiemelt album, képszámláló, albumborítós böngészés, fókuszálható megnyitás/visszalépés, megosztási hivatkozás, animáció a `prefers-reduced-motion` tiszteletben tartásával. `desktop/gallery.js`, `mobile/gallery.js` és a két külön CSS-fragmentum továbbra is platformfüggő.
- **G – Tömeges médiabeolvasás:** `tools/import-media-batch.py` helyi, offline CLI-ből maximum 200 kép előkészítése, JPG/PNG/WebP felismerés, adat- és jogosultság-ellenőrzés, az eredeti WebP és a 400/800/1280 méretváltozatok generálása, EXIF-eltávolítás, staging `site.json`/import-jelentés. Új feltöltés alapból `draft`, nem kerül a nyilvános galériába. Lásd: `docs/MEDIAIMPORT_246.md` és `tools/media-import-minta.json`.
- **I – SEO/megosztás:** 49 statikus oldalelőnézet + 14 albumelőnézet + egy kezdőlapi meta = 64 URL/grafika, `sitemap.xml`, `robots.txt`, `WebPage`, `CollectionPage`, `ImageGallery`, `BreadcrumbList` JSON-LD, Open Graph és Twitter-kártyaadatok. A 2.46-os tesztkiadás **`noindex`**, mert jelentős korábbi tartalmak még minták vagy ellenőrzésre várnak. Lásd `docs/SEO_246.md`.

## Automatikus ellenőrzések (helyben)

- Node-regresszió: `node tools/test.mjs`, `node tools/test-245.mjs`, `node tools/test-243.mjs`, `node tools/test-246.mjs`, `node tools/check-documents.mjs` – sikeres.
- Media/SEO-generálás: `python tools/build-gallery-variants.py --check`, `python tools/build-album-covers.py --check`, `python tools/generate-seo.py --check` – sikeres.
- Chromium 2.46 – **160/160**, galéria 2.45 – **198/198**, előző galéria – **156/156**, lábléc/dokumentum – **128/128**, teljes komponensbejárás – **777/777**, célzott akadálymentességi teszt – **160/160**.
- Tömeges import: `python tools/test-246-import.py` – **32/32** sikeres ellenőrzés, 2 valós tesztképpel és tiltott bemenetekkel.
- Teljes UI-minőségellenőrzés: három kombináció (asztali sötét/világos, mobil sötét) **742 sikeres ellenőrzést** teljesített; a futtató a negyedik kombináció előtt időkorlátba ütközött. A külön futtatott mobil világos kombináció **134/134 sikeres, 0 hiba**. A négy teljesített eset összesen **876 ellenőrzés**, de nem egy megszakítás nélküli futtatásban.

## Nyitott, őszintén jelzett korlátok

- A Bootstrap 5.3.8 verzióhoz kötött CDN és az SRI változatlan; közvetlen hálózati CDN-E2E ebben a környezetben nem igazolt.
- Nincs tényleges GitHub Pages/FTP-publikálás, ezért a megosztók képelőnézetét nem teszteltük éles Facebook/LinkedIn/WhatsApp felületen; a **nyilvános URL-en elérhető kép** csak feltöltés után fog működni.
- A statikus médiabeolvasó **helyi parancssoros előkészítő**, nem publikus drag-and-drop backend; nem telepít képet, nem módosít FTP-t, nem ad ki automatikus hozzájárulást.
- A valódi képernyőolvasós, teljes WCAG-audit és fizikai érintőképernyős képnagyítás-kipróbálás nem történt meg.
- A kezdőlapi Carousel külön időzített, virtuális órás próbája nem teljesült ebben a kiadási körben; a 30 másodperces beállítást a Node-regresszió és a komponensvizsgálat őrzi.
- A korábbi **74 MINTA hír/közlemény**, **30 ellenőrzésre váró sportsikerminta**, **22 illusztráció** és **10 hiányzó hivatalos dokumentum** nem vált hiteles tartalommá. Új eredmény- vagy eseményadat nem lett kitalálva.

**Élesítés nem történt**, sem az iskola FTP-jén, sem GitHub Pages-en. A csomag továbbra is statikus HTML + JSON + natív JS + külön asztali/mobilos CSS, a Bootstraphez kizárólag verzióhoz kötött CDN-t használ.

---

# Csanádi Sportiskola – aktuális 2.45 kiadási ellenőrzés

## 2.45 – új médiaközpont, albumok és helyi szerkesztő

- Az eddigi 22 galériaelem sportág, tanév és rendezvény szerint kereshető és csoportosítható. A képek **illusztrációk**; a „2026/2027 – bemutatóalbum” a webes megjelenítés gyűjteménye, **nem** ellenőrzött tanévi eseményfotó.
- Kétujjas pinch-to-zoom, dupla koppintás, nagykép-mozgatás és lapozás mobilon; külön asztali és mobilos JS/CSS.
- A JSON-ban megadott képforrásokhoz 22 × 3, összesen 66 WebP méretváltozat a `shared/assets/media/gallery/{400,800,1280}/` könyvtárakban. A böngésző `srcset`/`sizes` alapján választ; 400 px összméretben ~92%-os megtakarítás a 22 eredeti galériaforráshoz képest.
- Új forrás esetén a `mediaCenter.items` megfelelő elemét ellenőrzötten kell módosítani, és a `python tools/build-gallery-variants.py` paranccsal újraépíteni a méretezett képeket. A generáláshoz fejlesztői gépen Python + Pillow kell; az elkészült statikus honlapnak nem.
- Helyi szerkesztő: `http://localhost:8000/?media-editor=1#/oldal/sports-gallery` (vagy más helyi port). Csak localhost/127.0.0.1 és `?media-editor=1` esetén jelenik meg. Képcím, alt-szöveg, képleírás, kategória, albumok, kapcsolódó oldal szerkesztése, ellenőrzött `site.json` export. **Nem** tölt fel képet, nem publikál automatikusan, és nem írja át a jelenlegi fájlt. Az exportált fájlt szerkesztői ellenőrzés után kézzel kell `shared/data/site.json` helyére tenni, az új képek variánsait legenerálni és a teszteket futtatni.
- Kiadás előtti ellenőrzések: `node tools/test.mjs`, `node tools/test-245.mjs`, `node tools/test-243.mjs`, `node tools/check-documents.mjs`, `python tools/build-gallery-variants.py --check`, `python tools/test-245-browser.py`, `python tools/test-245-a11y.py`, `python tools/test-243-browser.py`, `python tools/test-gallery-browser.py`, `python tools/test-footer-documents-browser.py`.
- Teljes felületi minőségellenőrzés: `CSANADI_SKIP_CAROUSEL=1 python tools/browser-quality.py`. A 30 másodperces Carousel külön élő-időzítési tesztje **nem szerepel ebben**; a korábbi 30 másodperces JSON-konfigurációt a Node-regresszió továbbra is ellenőrzi.
- A CDN-linkek és a Bootstrap 5.3.8 SRI-integritási értékei megmaradtak; az élő CDN tesztjét a jelenlegi környezet DNS-korlátja blokkolta, ezért ezt telepítési vagy böngészőből elérhető tesztkörnyezetben el kell végezni. Képernyőolvasós, teljes WCAG-ellenőrzés szintén nyitott.

---

A 2.44-es korábbi fejlesztés és módosításainak átadója: `Csanadi_2.44_atadas.md` (a ZIP-en kívül).
A négy új JSON-vezérelt központ az `education-programs`, `sports-disciplines`, `sports-facilities`, `education-exams`, `education-years`, `news-events`, `news-community`, `education-community` menüoldalakon található. A felületeket **külön** `desktop/centers.js` és `mobile/centers.js` valósítja meg.

Elvárt ellenőrzőparancsok:

```sh
node tools/stamp-release.mjs
node tools/test.mjs
node tools/test-243.mjs
node tools/check-documents.mjs
python tools/test-243-browser.py
```

A `test-243-browser.py` Python Playwright + Chromium telepítést igényel, hálózati letiltás esetén is a teljes DOM-alapú helyi modulbetöltést teszteli. A nyilvános GitHub Pages CDN-kapcsolata ettől külön ellenőrzendő. A 30 örökölt sportsikerminta, 74 demóhír és 22 illusztrációs kép önmagában **nem** hitelesített intézményi közzétételi tartalom.

---

# Csanádi Sportiskola – 2.41 kiadás és ellenőrzés

A 2.40-es eredeti ellenőrzési jegyzék alább megmarad.

## 2.41 – felvételi központ és dokumentumolvasó hibajavítása

- Külön asztali (`desktop/admissions.js`) és mobilos (`mobile/admissions.js`) felvételi központ.
- Bekötve a `admission-guide`, `admission-deadlines`, `admission-primary` és `admission-secondary` oldalakba; a további négy felvételi aloldal közvetlen belső navigációt kapott.
- A `shared/data/site.json` `admissionCenter` szekciója tíz, a 2026/2027-es tanévről szóló 1/2026. (VII. 31.) OGYM rendeletből ellenőrzött országos határidőt, két eljárást, lépéseket, forrásokat és külön jelölt, megerősítésre váró helyi adatokat tartalmaz. Forrás: https://njt.jog.gov.hu/jogszabaly/2026-1-20-9M
- Határidőállapotok a Budapest szerinti mai naphoz kötődnek; keresés ékezet nélkül, státusz- és eljárásszűrés; a keresőindex is felveszi a határidőket.
- A dokumentumolvasó PDF-betöltése többé nem szakad meg pusztán attól, hogy közben lapoznak vagy nagyítanak. A bezárás után újra megnyitott dokumentumra nem hathat egy korábbi `close` esemény.
- Külön fényes/sötét, mobilos/asztali stílusok, jelentős képernyőméret-eltérés és fókuszjelölések.
- A kezdőlapi Carousel továbbra is csak a három panelt tartalmazza: Sportsikerek, Tanévi naptár, Hírek és közlemények.
- A jogszabályi országos dátum **nem jelenti** a Csanádi helyi felvételi időpontjának, kódjának vagy dokumentumának jóváhagyását.

### Tesztelés és korlátok

- `node tools/test.mjs`: három teljes sikeres futás.
- `python tools/browser-quality.py`: egy teljes helyi Chromium-futás 871/871 sikeres; a végső megismétlés környezeti futásidő-korlát miatt nem ért a végére.
- `python tools/pdf-load-race.py`: célzott, késleltetett PDF-modult szimuláló, valódi Chromium-próba 2/2, asztali és mobilos betöltés/lapozás/nagyítás/dokumentumcsere, a végső PDF-javítás után.
- `node tools/check-documents.mjs` és `python tools/document-previews.py`: sikeres, két valós segédlet és két PDF-oldalelőnézet.
- A Chromium-próbákban a CDN-hálózati elérést letiltottuk, ezért az éles GitHub Pages+CDN együttese és a WCAG 2.2 AA képernyőolvasós teszt külön ellenőrzendő.
- A 30 sportsiker-mintabejegyzést **nem szabad hiteles eredményként publikálni**; 22 galériakép illusztráció; 10 dokumentumtári tétel feltöltésre vár.
- Publikálás: **nem történt** sem GitHub Pages-re, sem az iskolai FTP-tárhelyre.

---

# Csanádi Sportiskola – 2.39 ellenőrzési és kiadási útmutató

A honlap változatlanul statikus HTML/CSS/JavaScript/JSON SPA; nincs PHP, Node.js szerverfolyamat vagy build-kötelezettség. Helyi megnyitáshoz HTTP-szervert használj, mert a `file://` nem szolgálja ki a JSON-lekéréseket. A GitHub Pages-re és az iskola FTP-tárhelyére ez a csomag nem került automatikusan feltöltésre. Az iskola FTP-jéhez külön jóváhagyás szükséges.

## Új: bővíthető, JSON-konfigurálható főoldali Carousel

A `shared/data/site.json` fájl `home.carousel` részében találhatók az alapbeállítások:

- `autoplayMs: 30000`: **30 másodperces** automatikus panelváltás; a kézi kattintás nem törli az időzítőt
- `interactionHoldMs: 18000`: az interakciók után legalább ennyi ideig nem vált automatikusan
- `ariaLabel`: a lapozó képernyőolvasó számára felolvasott megnevezése
- `panels[]`: a panelek JSON-listája; **a lista sorrendje a fülek sorrendje**
- `id`: tartós, egyedi azonosító; `type`: támogatott megjelenítő; `label`: fülcím; `enabled`: megjelenjen-e
- a támogatható paneltípusok jelenleg `successes`, `calendar`, `news`; a hírtípus ismételhető, `tags` tömbbel külön témákra szűrhető

A 2.36 alapbeállításai **változatlanul két látható fület** adnak: Sportsikerek és Tanévi naptár. A harmadik, „Kiemelt hírek” előkészített panel `enabled: false`, tehát jóváhagyás nélkül nem került új főoldali tartalom a felületre. Az engedélyezéséhez csak ezt a mezőt kell `true` értékre módosítani, majd a közzétételhez a `release` verziószámát frissíteni és `node tools/stamp-release.mjs` parancsot futtatni.

A `news` panel a meglévő `publicNews` intézményi híreiből dolgozik, legfeljebb 4, az elmúlt 180 napban még releváns rekordot jelenít meg (`home.newsSpotlight`). A hír részletei natív `details/summary` elemmel olvashatók. HTML-kódként nem értelmeznek JSON-szöveget, a megjelenítés csak `textContent` útján történik. A hozzáférhető hírek száma a hitelesen feltöltött adatoktól függ.

A Sportsikerek és Tanévi naptár típus kötelező és egy-egy aktív példányban szerepel. 2–8 konfigurált panel támogatott, típusok szerinti korlátozással. A szűrt hírekből több önálló panel is létrehozható; **új megjelenítő típushoz** (például felvételi folyamatábra vagy dokumentumtár) később új JavaScript-renderelő kell.

A nyilak és a megállítógomb továbbra sincsenek a felületen. Az időzítést az aktív billentyűzetes fókusz, a megnyitott naptár-/hírrészletek, az oldal láthatósága, valamint a rendszer `prefers-reduced-motion` beállítása korlátozza. A manuális fülváltás, a nyílbillentyűk, Home/End, a megnyitott esemény közvetlen linkje és a Bootstrap 5 Carousel támogatás megmaradt. CDN-hiba esetén a saját osztályváltásos tartalék tovább működik. A vízszintesen görgethető mobil fülválasztó nem nyújthatja túl az oldalt.

## A naptár és a meglévő funkciók

A 2.35-ös naptár heti/havi/éves asztali nézete, heti/havi mobilnézete, azonos magasságú 12 hónapja, 88 dátumos tétele, lebegő eseményrészlete, sötét/világos témája változatlanul megmaradt. A 49 aloldal, kereső, dinamikus fejléc/lábléc és sportarchívum forrása továbbra is a közös JSON. A Bootstrap 5.3.8 CSS/JS kizárólag verzióhoz kötött CDN-ről töltődik; nem csomagolunk helyi másolatot.

**Tartalmi publikációs figyelmeztetés:** a sportsikerekhez örökölt 30 mintabejegyzés tanulói nevet és nem igazolt eredményeket tartalmazhat. Ezeket tényleges intézményi közzététel előtt ellenőrizni, szükség szerint anonimizálni vagy hiteles adatokkal helyettesíteni kell; a 2.36 funkcionális javítása nem hitelesíti őket.

## Futtatható ellenőrzések

1. `node tools/stamp-release.mjs` – kiadási cache-kulcsok összehangolása.
2. `node tools/test.mjs` – statikus fájllista, JSON-ellenőrzés, billentyűzet, 30 mp időzítés, menük, kereső, naptár, 49×2 aloldal-render, három-/négypaneles sorrendváltás, Bootstrap API és CDN-fallback.
3. `node --check <fajl.js>` – minden JS-fájl szintaktikai ellenőrzése.
4. Chromium-komponenspróba történt: kétpaneles kattintás és 30 mp váltás, hárompaneles JSON-sorrend, hírtartalom és esemény-mélylink. A valódi GitHub Pages-hálózati végpont tesztelését a helyi Chromium hozzáférési szabályai tiltották, a komponenspróba ezért nem minősül éles end-to-end tesztnek.
5. A ZIP gyökere `csanadi-website-2.36/`; ennek **tartalma** a repository gyökerébe másolható, külön jóváhagyott kiadási folyamatban.

## 2.37 – 2026. november 23. – Hírek + önálló naptároldal

- A kezdőlapon alapértelmezés szerint **három aktív JSON-vezérelt Carousel-panel** van: Sportsikerek, Tanévi naptár, Hírek és közlemények. Nincs megállítás és nyílnavigáció, a kétféle váltás (füllel és 30 másodpercenként) megmaradt.
- A `publicNews` hat ellenőrzöttnek kezelt, meglévő JSON-bejegyzéséből a frissességi szűrés válogatja a főoldali négy kiemelt hírt; a menüből elérhető friss hírek, közlemények és archívum ugyanebből az adatból készül. A `news-calendar` aloldal a főoldallal azonos 88 eseményes naptáradatot, heti/havi/éves illetve mobil heti/havi nézetet kapja.
- A hírek közvetlenül megnyithatók `#/oldal/news-latest/hir/:id`, `#/oldal/news-announcements/hir/:id` vagy `#/oldal/news-archive/hir/:id` útvonalon; az események `#/oldal/news-calendar/esemeny/:id` címen is elérhetők. A két irány közötti kapcsolódó linkeket felhasználói interakciókkal ellenőriztük.
- Külön javítás: az asztali naptári popoverből az eseményhez kapcsolódó hír linkje az egérrel is elérhető; a popover elhagyáskor bezáródik. Nem módosítja a naptárrács méretét.
- Teljes `node tools/test.mjs` regresszió: három sikeres futás, mind a 49 oldal mobilos és asztali renderelésével. Python Playwright + helyi Chromium, biztonságos data-URL-es modulbetöltéssel: 320/390 px mobil és 1440 px asztali hírek/naptár/lebegő link, 1440 px-en a teljes hárompaneles Carousel és 30 mp-es időzítő, JavaScript-hiba nélkül. Az automatikus JS-teszt belső Playwright-érzékelője továbbra sem látja a **Python**-Playwright telepítést; ez a tesztfuttató képességdetektálási korlátja, nem a böngészőpróba hiánya.
- **Korlát:** helyi HTTP és a publikált GitHub Pages URL böngészős elérését a futtatókörnyezet szabályzata blokkolta, ezért az élő oldal teljes, Bootstrap CDN-nel együtt vizsgált E2E próbája még szükséges. Sem a GitHub Pages-re, sem az intézményi FTP-re nem történt automatikus feltöltés.
- **Közzétételi figyelmeztetés:** az örökölt 30 sportsiker-mintabejegyzés hitelessége továbbra sem ellenőrzött; intézményi élesítés előtt cserélendők vagy biztonságosan anonimizálandók.

## 2.38 – 2026. november 23. – Akadálymentesség és teljesítményoptimalizálás

### Javítások

- **Carousel:** az automatikus, JSON-beállítású 30 másodperces váltás megmaradt, de asztali mutatóval ráállva és billentyűzetes aktív fókusznál szünetel. A mutató elmozdítása után folytatódik; érintőképernyős „ragadós hover” nem állítja meg. A `prefers-reduced-motion` beállítást folyamatosan figyeli, nem csak a betöltéskor. Nincs megállítógomb és nincs jobbra/balra nyíl. A felolvasó számára rejtett használati súgó a Bootstrap CSS betöltése nélkül sem takarja ki a füleket.
- **Lebegő naptárablak:** billentyűzetes nyitáskor a fókusz a bezárógombra kerül, az Escape visszaadja a fókuszt a megnyitó napnak; a JSON-események továbbra is biztonságosan, szövegként jelennek meg. A felugró szélessége és magassága szűk viewport/erős böngészőnagyítás esetén is korlátozott. A dátumrács nem változtatja meg a magasságát.
- **Naptár-teljesítmény:** a napi események egyszeri dátumindexből érhetők el, nem minden napcella esetén 88 rekord újbóli bejárásával. A már létrehozott heti/havi és éves hónapkártyák a nézetváltások között újrahasznosulnak. A közös JSON továbbra is a főoldalon és a külön menübeli naptárban használatos.
- **Kereső:** a betöltött és már validált statikus JSON-nál nem történik minden leütéskor teljes JSON-szerializálás. Az elütéstűrés sávos Damerau–Levenshtein számítást használ a korábbi nagy mátrix helyett. A külön, még szerkesztett/tesztelt konfigurációk továbbra is automatikusan újraindexelődnek.
- **Hírek és aloldalak:** a kártyák, hivatkozások és dinamikus részletek a korábbi közös JSON-adatforrást használják; a fókuszkeretek, hosszú szavak tördelése, a magas kontrasztú környezetben megjelenő aktív állapotok és az oldalak saját főtartalom-ugrólinkjei ellenőrizve. A világos mód arany színét `#815b24`-re mélyítettük (a világos alapháttérrel kb. **5,35:1** kontraszt a korábbi kb. **4,2:1** helyett). A kapus belépőanimáció megszűnt: az oldal közvetlenül a kezdőlapra érkezik, az animáció képkockáit eltávolítottuk.
- **Kiadás:** `release=2.38`, minden modul-import és saját CSS/JS cache-kulcsa egységes. A Bootstrap 5.3.8 továbbra is verzióhoz kötött CDN-ről töltődik, helyi másolat nélkül.

### Ellenőrzések

1. `node tools/test.mjs`: teljes korábbi regressziós tesztsor a 49 különböző oldal mindkét renderelőjével, a híreket, mélylinkeket, naptárat, billentyűzetet, témát, JSON-érvényességet és verziózást is beleértve.
2. `python tools/browser-quality.py`: a Python Playwright/Chromium opcionális tesztje, helyileg elfogott HTTPS-szerű fájlhivatkozásokkal. **565 sikeres ellenőrzés, 0 hiba**: 49-49 aloldal teljes asztali/mobil bejárás, további világos nézetes minták, navigáció, kereső, lebegő naptárablak, 320/390/1024/1440 px képernyők, fókusz, 30 másodperces időzítés, kurzor fölötti szünet, mozgáscsökkentés. A teszteredmények és képernyőképek a futtatóprojekt melletti `csanadi-238-qa/` könyvtárba kerülnek, nem növelik a weboldal letöltési csomagját. A Python Playwright és Chromium telepítése szükséges; a Node-teszt saját opcionális Node-Playwright felismerése ettől független.
3. Chromium `forced-colors: active`: aktív fül kerete megjelenik, naptár megjelenik, vízszintes túlcsordulás nem jelentkezett.
4. Az eredeti, változatlan 2.37 ZIP és az új 2.38 összehasonlítása 18 keresőkifejezésre **azonos találatokat**, 365 naptári napra **azonos eseményeket** adott. Mikromérésben (180 lekérdezés) a kereső kb. 1,5–1,6 mp-ről 0,3–0,4 mp-re csökkent, a naptár 365 napjának 20 körös ismételt lekérdezése kb. 383 ms helyett kb. 1,6 ms volt. Ezek helyi, meleg gyorsítótáras **mikromérések, nem oldalletöltési idők**, gépfüggők.
5. Minden JS-fájl `node --check`, JSON-parszolás és teljes ZIP sértetlenségi próba szükséges minden kiadásnál.

### Korlátok és teendők

- A publikus GitHub Pages + valós CDN teljes end-to-end tesztje a futtatókörnyezet hálózati tiltása miatt nem igazolható. A virtuális útvonalas Chromium nem egyenértékű élő internetes teszttel.
- **WCAG 2.2 AA tanúsítás vagy teljes megfelelőség nem állítható.** Valós képernyőolvasós (NVDA/VoiceOver/TalkBack), dokumentumtartalmi, PDF-, teljes kontraszt-, 200–400%-os nagyítási és eszközmátrixos audit külön szükséges.
- A 30 örökölt sportsiker-mintaállítás és név hitelesítése/adatvédelmi felülvizsgálata továbbra is nyitott közzétételi kockázat.
- A 2.38 nincs automatikusan feltöltve sem a GitHub Pages-re, sem a hivatalos iskolai FTP-re.

## 2.39 – 2026. november 23. – Iskolai információs központ + médiaközpont

### Megvalósítás

- A **Napi iskolai tudnivalók** meglévő `information-daily` oldalából **Iskolai információs központ** lett. A változás nem hozott létre új menüpontot, az összesen 49 oldal megmaradt. A közös `informationCenter` JSON-alapú: nyolc, létező aloldalra mutató gyorselérés; az `information-timetable` oldal JSON-jából újraolvasott nyolcsoros általános csengetési rend; a központi tanévnaptár soron következő négy időpontja; a központi hírek legfeljebb három eleme. A kijelzett dátum Europe/Budapest időzónára épül. A csengetési rend egy általános, meglévő adatforrás, **nem valós idejű órarend**; a tényleges intézményi adatot közzététel előtt ellenőrizni kell.
- A meglévő `sports-gallery` oldal neve **Képgaléria és médiaközpont**. Az új `mediaCenter` JSON-ban 22 már a csomagban található WebP-kép, öt kategória, kereső és kategóriaszűrő, kezdeti 9 asztali illetve 6 mobilbélyegkép, további képek gomb található. A képek **illusztrációs jellegűek**, nem ellenőrzött iskolai rendezvényfelvételek. A fájlutak a meglévő médiamappákra korlátozottak, a céloldalak hivatkozásai ellenőrzöttek.
- **Külön asztali és külön mobilos megvalósítás:** `desktop/information.js`, `mobile/information.js`, `desktop/gallery.js`, `mobile/gallery.js`, saját platformonkénti stílusok. Nem csupán ugyanannak az oldalnak összezsugorítása: asztalon oszlopos információs műszerfal és mozaikos galéria, mobilon kétoszlopos gyorslinkek, harmonikás csengetés és egyoszlopos, nagy érintési felületű fotók.
- Az új közös modulok: `shared/js/information-data.js`, `shared/js/media-data.js`, `shared/js/gallery-dialog.js`. A natív `<dialog>` billentyűzeti nyilakkal, Escape-pel, fókuszvisszaadással; mobilon érintéses balra/jobbra lapozással működik. Megmaradt a világos/sötét téma és a meglévő, háromfüles, 30 másodperces Carousel.
- **Külön vizuális javítás:** a főtartalomra ugró link fókusz nélkül optikailag rejtve marad transzformált mobilos szülő esetén is; billentyűzettel továbbra is elérhető (`shared/css/base.css`).
- A verzióhoz kötött saját modul- és CSS-cache-kulcs mindenhol **2.39**. A Bootstrap 5.3.8 továbbra is a verziózott külső CDN-ről érkezik. Az új felületek a szerveroldali futtatást nem igénylő, FTP-kompatibilis SPA részei.

### Tesztelés és bizonyítható korlátok

1. `node tools/stamp-release.mjs`: sikeres; minden modulhivatkozás összehangolva.
2. `node tools/test.mjs`: **három egymástól független, sikeres regressziós futás**, a 49 oldal mindkét renderelőjével, a 22 médiakép forrásellenőrzésével, az információs adatokkal, a hírekkel, a naptárral, a menükkel, a keresővel és a Carouselrel.
3. `CSANADI_QA_OUTPUT=... python tools/browser-quality.py`: **685 ellenőrzés, 0 hiba** valódi, headless Chromium alatt, Python Playwrighttal. A helyileg elfogott HTTPS-szerű statikus fájlbetöltést használó próba kiterjed 1440 és 1024 px-es asztali, 390 és 320 px-es mobilos nézetre, világos és sötét témára, 49-49 teljes aloldalbejárásra, információs gyorslinkekre, csengetésre, hír- és eseménylinkekre, galériasávokra, szűrésre, keresésre, üres találatra, képnagyításra, fókuszvisszaadásra, mobilos lapozógesztusra, képek tényleges méretére, ugrólink állapotára, vízszintes túlcsordulásra, hárompaneles 30 mp-es váltásra és mozgáscsökkentésre. A teszt helyi JSON-t használ, nem állítja, hogy a publikus GitHub Pages honlap valós CDN-nel együtt is tesztelve lett.
4. JS-szintaxis `node --check` minden JS-modulon, Python-tesztszintaxis és JSON-parse sikeres. A Node tesztfuttató opcionális **Node.js Playwright** ellenőrzése telepítés hiányában kihagyást jelez; ettől függetlenül a külön **Python Playwright/Chromium** próba sikeres.
5. Az illusztrációs képek megjelenése galériába görgetve és külön bélyegkép-képernyőképen is ellenőrzött; az egész, görgethető elem képernyőképén a headless Chromium némely, kezdetben látómezőn kívüli abszolút pozicionált képet üresen rögzítheti, ezért ez nem önmagában érvényes képbetöltési mérce.

**Nem változott / nyitott:** a 49 oldal, régi menüágak, sportsikerarchívum, 88 dátumos naptári esemény, hárompaneles kezdőlap és a külön asztali/mobilos navigáció megmaradt. A sportsikerek 30 örökölt, nem hitelesített mintabejegyzését továbbra is valóság- és adatvédelmi ellenőrzés után szabad intézményi tartalomként közzétenni. A képek illusztrációs jellege kötelező megkülönböztetés. Teljes WCAG 2.2 AA audit, valós képernyőolvasós teszt, teljes GitHub Pages/Bootstrap-CDN E2E és az intézményi adatok jóváhagyása még szükséges. **Nem történt publikálás** sem az iskola FTP-tárhelyére, sem a GitHub Pages-re.

## 2.40 – Interaktív dokumentumközpont, saját beépített PDF/TXT-olvasó

- **Kiindulás:** a jóváhagyott 2.39-es csomag. A `#/oldal/information-documents` menüoldal helyén külön `desktop/documents.js` és `mobile/documents.js` kezeli ugyanazt a közös `shared/data/site.json` dokumentumjegyzéket.
- **Dokumentumjegyzék:** 7 kategória, élő ékezetérzéketlen keresés, állapot- és sorrendszűrés, lapozott/fokozatos lista. Az elérhető és a még nem feltöltött dokumentumok elkülönülnek. A vissza nem igazolt szabályzatokhoz nincs kitalált fájl, letöltés vagy dokumentumcímke.
- **Saját dokumentumnézegető:** a `shared/js/document-reader.js` egy natív `<dialog>` ablakot hoz létre a jelenlegi oldalon. PDF: egyedi lapozógombok, zoom, oldalszám, szöveges nézet, letöltés. TXT: `fetch` és `textContent`-tel megjelenített, másolható szöveg. Képfájl: saját képes nézet. A böngésző nem nyit új fület. Escape, fókuszvisszaadás, képernyőolvasói feliratok és natív modal fókuszvédelem.
- **PDF-renderelés:** csak igény esetén betöltött, verzióhoz kötött PDF.js 4.10.38 CDN-modul. A `pdf.worker.mjs` ugyanezen a verzión van. Külső CDN-hiba esetén a feltöltés előtt létrehozott helyi WebP-oldalképek és az ellenőrzött szövegadatok szolgálnak az oldalon belüli tartalék nézetként. Ez nem a böngésző beépített PDF-olvasója, és nem iframe új böngészőlappal.
- **Valóban megtekinthető mellékletek:** `dokumentumkozpont_utmutato.pdf` (2 oldal, helyi képek és szövegkivonat), `dokumentumkozzetetel_ellenorzo.txt`. Mindkettő kifejezetten **technikai segédlet**, nem hivatalos intézményi szabályzat. További 10 szabályzat/felvételi/dokumentumhely **feltöltésre váróként** szerepel. Valódi intézményi jóváhagyás nélkül nem tekinthető közzétett dokumentumnak.
- **Kiadás előtti eszközök:** `node tools/check-documents.mjs` ellenőrzi az útvonalakat, fájlokat, PDF-fejlécet és előnézeteket; `python tools/document-previews.py` ellenőrzi a PDF-előnézeteket és a JSON-listát; `python tools/document-previews.py --write` újragenerálja az előnézeteket és szövegkivonatokat. A Python-segédhez PyMuPDF és Pillow szükséges; **az élő honlapnak nincs Python-függősége**.
- **Adatbiztonság:** a dokumentumfájl útvonala kizárólag `./shared/assets/documents/...` lehet; külső link, feljebb lépő útvonal, fájl nélküli közzétett állapot és duplikált azonosító hibát vált ki. A kinyert szöveg `textContent`-tel kerül a DOM-ba, nem HTML-ként. A hivatalos PDF-ek/tanulói adatok feltöltéséhez külön jóváhagyás szükséges.
- **Teszt:** `node tools/test.mjs` sikeres, teljes régi regresszióval és új dokumentumellenőrzésekkel; a Python Playwright/Chromium `tools/browser-quality.py` futása 781/781 sikeres ellenőrzést adott a 49 aloldalra, négy képernyő-/témaváltozatra, saját PDF/TXT-olvasóra, keresésre, kategóriára, szűrésre, fókuszra és az új böngészőfülek kizárására. A 30 mp Carousel működése is külön ellenőrzött. A PDF.js **valódi távoli CDN-futása nem volt elérhető** a tesztkörnyezetből; ezért kizárólag a helyi tartalékoldalak működése ellenőrzött Chromiumban.
- **Korlátok:** nincs valós publikált hivatalos házirend/SZMSZ/pedagógiai program még a csomagban, DOCX natív előnézetet nem készítettünk (a közzétenni kívánt Word-dokumentumokat PDF-ként célszerű exportálni). A teljes WCAG-audit és tényleges képernyőolvasós vizsgálat nyitott. A korábbi, ellenőrizetlen sportsikeradatok publikációs kockázata változatlan.
- **Közzététel:** sem a GitHub Pages, sem az iskolai FTP nem változott; a csomag kizárólag átadásra készült.

**Utolsó QA-megismétlés:** három teljes Node-futás sikeres; egy korábbi teljes Chromium-futás 781/781 sikeres, de az utolsó újrafuttatás a hosszan tartó mobilos automatikus váltási próba közben a környezet időkorlátján megszakadt. A megszakított ismétlést nem tekintjük teljes tesztsikernek.
