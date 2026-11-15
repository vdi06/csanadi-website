# Csanádi Sportiskola 2026 – 21. kiadás részletes fejlesztési és tesztbeszámoló

**Dátum:** 2026. november 15.  \n**Forrás:** `Csanadi_Sportiskola_2026_20_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip` – a megőrzött 20-as munkafa azonos fájljaival.  \n**Eredmény:** `Csanadi_Sportiskola_2026_21_TELJES_WEBOLDAL_FTP_ES_KEZIKONYV.zip`  \n**Közzététel:** nem történt FTP- vagy GitHub-feltöltés.

## 1. A felhasználó tíz kiválasztott új fejlesztése

Minden kiválasztott új képesség a `felfedezo.html` nyilvános felfedezőközpontból érhető el. A kezdőlap kártyái külön a régi SPA-n belül is személyre szabhatók. A meglévő, korábbi funkciók fejlesztését külön fejezet tartalmazza.

### 1. Felvételi összehasonlító

**Elkészült forrásfunkció:** A felfedezőközpontban három, személyes adatot nem kérő képzési irány több oszlopos összevetése: képzési profil, követelmény, határidő és a forrásoldalra mutató kapcsolat. A bizonytalan határidők elkülönítettek.

### 2. Interaktív tanévtervező

**Elkészült forrásfunkció:** Helyi JSON-ból készülő, kategóriák szerint szűrhető idővonal a korábban közzétett tanévnyitóval, két nyílt nappal, az őszi vizsgával és egy országos írásbelivel. Az ellenőrizetlen szünetek és kivételes napok dátum nélkül szerepelnek.

### 3. Sportágválasztó

**Elkészült forrásfunkció:** Hat ismertető sportág egyéni/csapat és érdeklődési kategóriák szerinti keresésével, kapcsolódó sportoldallal. A jelenlegi intézményi edzés- és helyszínkínálat nem minősül igazoltnak.

### 4. Iskolai térképközpont

**Elkészült forrásfunkció:** Négy érinthető, szemléltető tájékozódási zóna mobilos egyoszlopos nézettel és kapcsolódó oldallal. Az intézmény hiteles belső alaprajza nem áll rendelkezésre, ezért nincs kitalált teremszám vagy iránymutatás.

### 5. Vezetett honlapbemutató

**Elkészült forrásfunkció:** Ötlépéses, párbeszédablakos bemutató Előző/Tovább/Bezárás vezérlőkkel; a megtekintettséget a böngésző helyben tárolhatja.

### 6. Személyre szabható kezdőlap

**Elkészült forrásfunkció:** A tényleges kezdőlapon a kártyacsoportok megjelenítése és sorrendje módosítható, visszaállítható; a választás kizárólag localStorage-ban marad.

### 7. Dokumentumcsomag-készítő

**Elkészült forrásfunkció:** A publikált, helyi PDF-ek többes kijelölése; HTTP letöltés, PDF-fejléc ellenőrzés, központi korlátok és helyben előállított ZIP32-fájl.

### 8. Helyi újdonságfigyelő

**Elkészült forrásfunkció:** A megadott témákat követi; a saját korábbi megtekintéshez képest új vagy módosult, ellenőrzött hírek jelennek meg, adatküldés és push-szolgáltatás nélkül.

### 9. Interaktív önellenőrző feladatok

**Elkészült forrásfunkció:** Négy JSON-alapú iskolai kvízkérdés, azonnali magyarázattal és újrakezdéssel. A választ nem tárolja és nem küldi el.

### 10. Digitális faliújság mód

**Elkészült forrásfunkció:** Csak dátummal rendelkező, ellenőrzött hivatalos hírek és események, teljes képernyő kéréssel, automatikus időzített lapozással, szüneteltetéssel és kézi léptetéssel.

## 2. Kötelező alapfeladatként elvégzett hibajavítások (nem új választási pontok)

1. **Sürgős asztali és mobil indulási hiba:** a betöltési diagnosztika a `runtime.diagnostics.slowestResourceCount` és társai kiolvasását a központi `useSiteSettings()` betöltése előtt indította. A közös `js/performance-diagnostics-2026.js` modulban minden diagnosztikai beállítás biztonságos alapértéket kap, ha a beállítás még nem olvasható vagy a böngésző régi konfigurációt használ. A mérőpanel nem állíthatja le emiatt az egész honlapot.
2. **Világos/sötét diagnosztika:** a `css/round21-public.css` megkülönböztetett világos és sötét hátteret, keretet, feliratot, számot, részletező panelt és fókuszjelölést rendel a lábléc mérőfelületéhez.
3. **Magas CLS vizsgálata:** a felhasználó 0,656-os CLS-értéket jelentett (cél 0,1). A megjelenés előtt üresen `display:none` hero már megfelelő helyet tart fenn, ezért a képes főszekció későbbi JSON-betöltése kevesebbet tolhat a tartalmon. **A tényleges javulást ellenőrzött, több eszközön végzett böngészőmérés nélkül nem lehet kijelenteni.**
4. **Verzióváltás és cache:** a központi `performance.cacheVersion` új értéke `csanadi-r21-20261115`; a belépő modul és az érintett CSS/JS-fájlok verziózott hivatkozást használnak; a service worker új kiadási tárolót nyit és a régi helyi cache-t törli az aktiváláskor.
5. **Megőrzés:** az eredeti 66 JSON-oldal és `README.md` változatlan, a `mobile/` és `desktop/` fájljai és a fiktív MINTA sporthírek bitazonosak. A nyilvános lábléc továbbra sem mutat szerkesztőoldalra.

## 3. Dokumentáció, csomagolás és konfiguráció

- Új, közös JSON-forrás: `json/adatok/felfedezo-21.json` (felvételi, tanév, sport, sematikus térkép, kvíz és bemutató).
- Új JS: `js/round21-explorer.js` és `js/round21-personalize.js`; új CSS: `css/round21-explorer.css` és `css/round21-public.css`.
- Teljes webes kézikönyv: `utmutato.html`, PDF-kézikönyv: `assets/documents/csanadi-weboldal-teljes-hasznalati-utmutato-2026.pdf`, 3.7.0 verzióban.
- A központi paraméterek aktuális listája: `dokumentacio/KOZPONTI_JSON_PARAMETEREK.md`. Összesen **239 központi paraméter**.
- Teljes állományleltár SHA-256 és pontos bájtmérettel: `release-manifest.json`; statikus FTP-re közvetlenül kibontandó teljes ZIP.

## 4. Tételes teszteredmények

**Automatizált ellenőrzések:** 55 sikeres, 0 sikertelen, összesen 55. **Valós böngészős vizuális mérés:** nem történt, a futtatókörnyezetben a headless Chromium böngészőhöz szükséges socket működés korlátozott.

| Ellenőrzés | Eredmény |
|---|---|
| Mind a 66 korábbi JSON-oldal változatlan | Sikeres |
| README.md bitazonos | Sikeres |
| A 20-as kiadás minden fájlja megmaradt | Sikeres |
| mobile/ és desktop/ források bitazonosak | Sikeres |
| Háromikones alsó mobilmenü | Sikeres |
| A nyilvános láblécből hiányoznak a karbantartóhivatkozások | Sikeres |
| MINTA hírek és közös adatvédelmi szabályok megmaradtak | Sikeres |
| Központi light/dark színpaletták | Sikeres |
| Kiadás azonosító és verzióváltás | Sikeres |
| Saját felfedezőközpont HTML/JS/CSS működési források | Sikeres |
| Tíz felület címke és célpont egyedi | Sikeres |
| Felfedezőközpont a főoldalról elérhető | Sikeres |
| Felvételi összevetés: legalább három eltérő profil | Sikeres |
| Felvételi: nincs profilban kéretlen személyes adat | Sikeres |
| Tanévtervező: dátumos és dátum nélküli időszakok | Sikeres |
| Sportágválasztó: érdeklődési szűrhető tartalom | Sikeres |
| Iskolai térkép: sematikus, nem állít alaprajzot | Sikeres |
| Bemutató: 5 lépés, dialógusvezérlők | Sikeres |
| Kezdőlap: helyi rendezés, rejtés, visszaállítás | Sikeres |
| Kezdőlap testreszabás a valódi SPA-ban | Sikeres |
| PDF ZIP: helyi összeállítás és PDF-aláírás | Sikeres |
| Újdonságfigyelő: kizárólag ellenőrzött hírek és localStorage | Sikeres |
| Kvíz: az összes helyes válasz tartományon belüli | Sikeres |
| Kvíz: nem ment választ szerverre | Sikeres |
| Faliújság: kizárólag hiteles hírek és események | Sikeres |
| Faliújság: indítás/szünet/lapozás/teljes képernyő | Sikeres |
| Központi R21 paraméterek tárolása | Sikeres |
| Központi R21 adatforrás biztonságos útvonala | Sikeres |
| Diagnosztika: inicializálás előtti hiányzó érték kezelve | Sikeres |
| Diagnosztika: mindkét téma részletes kontrasztja | Sikeres |
| CLS enyhítés: betöltés előtti hero helyfoglalás | Sikeres |
| Ms és automatikus fájlméretegység megmaradt | Sikeres |
| Betöltési alapadatok service worker előtárazása | Sikeres |
| Nincsen lokális Bootstrap-állomány | Sikeres |
| 18 HTML egyedi ID | Sikeres |
| 18 HTML helyi hivatkozások | Sikeres |
| 90 JSON-fájl feldolgozható | Sikeres |
| 55 JavaScript szintaxis | Sikeres |
| JS modulimportok helyi céljai | Sikeres |
| PDF kézikönyv dátum/verzió és SHA | Sikeres |
| Webes kézikönyv mind a 10 fejlesztési témakört tartalmazza | Sikeres |
| A kézikönyv 66 oldalt, 13 karbantartót és 239 paramétert sorol | Sikeres |
| Dokumentum PDF-ek valóban a helyi leltárban találhatók | Sikeres |
| Manifest tételes teljesség | Sikeres |
| Minden manifest SHA-256 és bájtméret pontos | Sikeres |
| Statikus FTP, külső Bootstrap CDN | Sikeres |
| Az iskolai FTP-re nincs automatikus feltöltőkód | Sikeres |
| HTTP 200 / index.html | Sikeres |
| HTTP 200 / felfedezo.html | Sikeres |
| HTTP 200 / js/round21-explorer.js | Sikeres |
| HTTP 200 / json/config.json | Sikeres |
| HTTP 200 / json/adatok/felfedezo-21.json | Sikeres |
| Teljes ZIP CRC vizsgálat | Sikeres |
| ZIP gyökérszerkezet és pontos fájllista | Sikeres |
| ZIP README és felfedezőközpont | Sikeres |

## 5. Pontosan mi nem igazolt vagy maradt nyitott?

- **Vizuális kompatibilitás:** nem történt valódi Android, iOS, Safari, Firefox és Chromium felhasználói interakciós teszt. Emiatt nem állítható, hogy minden képernyőn tökéletes a megjelenés.
- **A 0,656-os CLS újramérése:** a helyfoglalásra kódjavítás készült, a konkrét valós javulás mértéke ismeretlen. Teszteld 320, 375, 768 és 1440 px szélességen, világos/sötét módban.
- **Hivatalos tanévadatok:** a tanítási szünetek, rendkívüli napok, minden intézményi felvételi feltétel és konkrét belső alaprajz jóváhagyott forrás hiányában szándékosan nem lett kitalálva. Az idővonalban ezek dátum nélkül szerepelnek.
- **Dokumentumok:** csak a ZIP-be ténylegesen bekerült, közzétett, helyi PDF-ek választhatók. Az intézményi hitelesítés és szerzői jog külön feladat.
- **Kliensoldali környezet:** a helyi ZIP fájlkészítés, localStorage, full screen és a service worker működése a böngészőtől, tárhely-kvótától és HTTPS-től függ. A Bootstrap továbbra is verziózott külső CDN-ről töltődik.
- **Nem történt közzététel:** az iskola FTP-jére semmit nem töltöttünk fel. A ZIP kibontása és intézményi jóváhagyása külön későbbi lépés.

## 6. Ajánlott kézi átadási ellenőrzési sorrend

1. Teljes ZIP kibontása egy üres tesztkönyvtárba, a mappastruktúra gyökerébe.
2. HTTPS-es tesztoldal vagy helyi HTTP-kiszolgáló megnyitása; asztali és mobil indulás ellenőrzése a korábban jelzett `slowestResourceCount` hiba nélkül.
3. Világos/sötét diagnosztikai panel, háromikones mobilmenü és a kör/hagyományos menü kapcsolójának vizuális tesztje.
4. Kezdőlapi kártyatestreszabás és mind a tíz felfedezőeszköz interaktív kipróbálása.
5. 2–3 PDF kijelölése; ZIP helyi letöltés és a benne lévő PDF-ek megnyithatóságának vizsgálata.
6. Kvíz és újdonságfigyelő adatvédelmi ellenőrzése (nincs kimenő adatküldés), faliújság teljes képernyő kipróbálása.
7. Friss CLS, FCP, LCP mérés több eszközön és hálózati körülménnyel; intézményi adattartalom szakmai jóváhagyása.

## 7. Következő kör választója

A következő tíz választható fejlesztés a beszélgetésben külön, interaktív választóban jelenik meg. A meglévő funkciók folyamatos hibajavítása továbbra is automatikus alapfeladat, nem foglal új választási pontot.
