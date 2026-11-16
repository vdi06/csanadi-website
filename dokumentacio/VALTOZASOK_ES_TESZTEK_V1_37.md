# Csanádi weboldal v1.37.0 – működéstartó kódoptimalizálás

Kiindulás: a v1.36.0 teljes csomagja, a korábbi A–J javítások megtartásával. Ez egy önállóan teljes, statikus FTP-kompatibilis kiadás. Nem készült új felhasználói funkció és nem történt az iskola éles tárhelyén publikálás.

## Tényleges kódoptimalizálások

1. **Élő JSON-tartalom újrarajzolása (`js/app.js`):** a címszakasz-előfordulások számlálása a korábbi, minden elemnél ismételt részlistaszűrés helyett egyetlen `Map`-alapú bejárással történik. Ez a feldolgozási szakasz a szakaszok számához lineárisan arányos.
2. **Csak szükséges adatlekérdezés:** a régi címszakaszok DOM-keresését csak a `keepScroll` jelzésű, meglévő oldalt frissítő útvonalon végezzük; közönséges oldalváltáskor kimarad.
3. **Összecsukható tartalmak mentése (`js/app.js`):** a korábbi ismételt teljes `details`-bejárások helyett egyszeri számlálóval őrizzük meg az azonos feliratú elemek előfordulását.
4. **Összecsukható tartalmak visszaállítása (`js/app.js`):** az újonnan renderelt elemek stabil azonosítóját és összefoglaló címét egyszer indexeljük `Map`-ekben. Az ismételt teljes keresések kikerültek, a duplikált azonosítók előző kiadásban rögzített kezelése megmaradt.
5. **Szinonima-keresés (`js/search-j-2026.js`):** a szinonimák kétirányú indexe a kereső beállításakor egyszer épül fel. A keresés minden egyes találatértékeléskor elmarad a teljes szinonimaszótár ismételt fordított keresése.
6. **Elgépeléstűrő keresés:** a cím és címkék tokenizálása az index felépítésekor történik; gépelés közben nincs szükség a szavak ismételt szétbontására minden rekordnál.
7. **Találatszűrés:** a korábbi, köztes tömböket létrehozó `filter → map → filter` lánc egyetlen bejárásra változott, megtartva a sorrendezés és a pontozás működését.
8. **Keresési javaslatok:** a találati korlátnál a bejárás megáll, a normalizált kifejezést és a fuzzy paramétereket nem számoljuk újra minden jelöltnél.

## Ellenőrzések

- Az előző teljes tesztprogramok változatlan logikai követelményei megmaradtak, ahol a forráskód új, egyenértékű algoritmusa ezt indokolta, a forrásmintára épülő tesztet pontosítottuk.
- Új önálló optimalizációs ellenőrzés: `tools/test-optimization-v1-37.js` (9 eset). Ebben a keresési pontozást az eredeti, oda-vissza szinonimakereső algoritmussal több ezer kombináción összevetjük. Eltérő pontszám esetén a teszt megbukik.
- Reprodukálható mikromérés: a korábbi és az optimalizált pontozás azonos bemeneten és azonos környezetben kerül összevetésre; a napló a tényleges időket tartalmazza. **Ez nem weboldalbetöltési vagy valós mobilhálózati sebességmérés.**
- Teljes regressziós futtatás: `node tools/run-full-regression-v1-37.js`.
- A tényleges kimeneteket, futási időket és hibákat a `dokumentacio/TESZTNAPLO_V1_37.md` tartalmazza.
- A ZIP épségét `unzip -tq` ellenőrzi.

## Megmaradt korlátok

Az elkülönített Linux futtatókörnyezetben a Chromium Playwright-böngésző korábban rendszerszintű `socket() failed: Operation not permitted` hibával nem tudott elindulni. A fizikai iOS Safari és Android Chrome viselkedését, valamint az élesoldali 06:00-s külső automatizmus eredményét ezért ez a kiadás sem tekinti hitelesen végigteszteltnek. Publikálás nem történt. Bootstrap továbbra is kizárólag verzióhoz kötött CDN-ről; nincs saját Node/PHP kiszolgáló, nincs médiabővítés.
