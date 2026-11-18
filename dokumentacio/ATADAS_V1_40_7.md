# Csanádi Sportiskola – v1.40.7 részletes átadási jegyzőkönyv

**Dátum:** 2026. november 18.  
**Kiinduló teljes kiadás:** `csanadi-website-v1.40.6`  
**Új teljes kiadás:** `csanadi-website-v1.40.7`  
**Megrendelt tételek:** **Q + R + S + T – mind a négy**. A meglévő funkciók megőrzése, ellenőrizhető ZIP, részletes beszámoló és **automatikus publikálás tilalma**.

## 1. A négy feladat tételes teljesítése

| Betű | Vállalás | Tényleges műszaki teljesítés | Lezárhatóság |
|---|---|---|---|
| **Q** | Jóváhagyott, valódi iskolai fotók beépítése | Bővített fényképes munkafolyamat: tényleges JPG/PNG/WebP/AVIF fájlok helyi ellenőrzése; korábbi jóváhagyási munkalap fájllenyomat- és méretegyezésének vizsgálata; biztonságos, duplikációt és már regisztrált SHA-256 lenyomatot kiszűrő **médiatári importterv** exportja. A tervben az állományok kizárólag `pending` állapotúak, nincs megadva találgatott ALT-szöveg, és minden sort külön jogi/adatvédelmi, valamint szerkesztői jóváhagyásra jelölünk. | **Részleges:** a felhasználó e körben nem adott át új, eredeti, intézményileg engedélyezett fényképeket és engedélyigazolást. Tényleges új médiát, kezdőképet nem állítottunk be. |
| **R** | Valós mobilos hibajegyzőkönyvek alapján javítás | A meglévő 320/390/768 CSS px mérési keretet kiegészítettük a **mérés előtt–után** összevetéssel. A két helyi JSON-riportból külön jelzi a megszűnt, új, fennmaradt hibákat és a hiányzó nézetméréseket. A jelentés saját JSON-ként exportálható. Hiányzó mérés nem számíthat javításnak; a képernyőolvasós jóváhagyás külön marad. | **Részleges:** nem érkezett valódi eszközön készült hibajegyzék és újramérési bizonyíték; konkrét fizikai mobilos hibát nem jelöltünk igazoltan kijavítottnak. |
| **S** | Kereső: billentyűzet, találatmegjelenítés, felhasználói élmény | Billentyűzetes súgószöveg és `aria-describedby` kapcsolat; a találatok közt **↑/↓, Home, End** navigáció; a rendezési állapot alaphelyzetbe állítása; a szűrők mellett tényleges indexelt elemszámok; nagyobb, legalább 44 px-es választómezők; fókuszkeret és kiskijelzős, kényszerített színű, csökkentett mozgású állapotok; érthetőbb üres találati állapot. A v1.40.6 relevancia, kiemelt találatok, témakör- és típusválasztó megmaradt. | **Elkészült**, automatizált regresszióval vizsgálva. Böngészőben végigkattintott, valódi segédtechnológiás teszt továbbra sincs igazolva. |
| **T** | Részletesebb helyi előzetes kiadásvizsgálat és verzió-összehasonlítás | Teljes v1.40.6 SHA-256 alapjegyzék mellé helyi, tiszta összevető modul; új/módosult/eltávolított/azonos fájlok, bájtkülönbségek, belépőfájlok és kritikus eltávolítások kockázatjelzése; külön HTML-es összehasonlító felület, JSON-export, parancssori jelentés; kibővített helyi kiadási kapu és **csak olvasó HTTP(S)** célhely-ellenőrző. | **Elkészült**, a nyilvános közzététel továbbra is tiltott, amíg a külön jóváhagyási feltételek nem teljesülnek. |

## 2. Új kód, eszközök és jelentések

### Q – fotó-regisztrációs előkészítés

- `tools/photo-staging-core-v1-40-7.mjs`: ellenőrzi az eredeti képfájlok és nyilatkozat egyezését, felismeri a már regisztrált SHA-256 fájlokat, ütközésmentes, determinisztikus médiatári célazonosítót és útvonalat javasol.
- `tools/iskolai-fotok-jovahagyasa.html`, `.js`: új, kizárólag érvényes egyezés után engedélyezett **helyi médiatári előkészítő terv** gomb. Nem módosítja a `json/mediatar.json` fájlt; minden új rekord függő státuszú.

### R – két mobilos jegyzőkönyv összevetése

- `tools/qa-diff-core-v1-40-7.mjs`: összehasonlítható útvonal/szélesség szerinti, stabil hibajegyekkel dolgozik; a hiányos tesztet külön figyelmezteti.
- `tools/mobil-akadalymentesseg-qa.html`, `.js`: második JSON-import, eltérési lista és helyi export. Az előző, valós böngészőben futtatható tesztkeret változatlan.

### S – nyilvános kereső finomítása

- `js/search-j-2026.js`: keresési elemszámok, billentyűzetes útmutató, Home/End működés, megtartott relevanciakeresés és szűrés.
- `css/search-ux-v1-40-7.css`: fókusz, érinthetőség, akadálymentességi és reszponzív finomítás.
- `index.html`: az új stílusverzió betöltése.

### T – statikus kiadási folyamat

- `tools/release-diff-core-v1-40-7.mjs`: fájlmanifest összevetése és útvonal-adatvalidáció.
- `tools/build-release-diff-v1-40-7.mjs`: reprodukálható helyi különbségjelentés.
- `tools/kiadas-osszehasonlitas-v1-40-7.html`, `.js`: két kiadás megtekintése és JSON-exportja böngészőben.
- `tools/build-readiness-report-v1-40-7.mjs`: helyi bájt- és útvonalintegritás, kiadáskülönbség és közzétételi kapuk.
- `tools/kiadasi-kapu-v1-40-7.html`, `.js`: v1.40.7-es, továbbra is blokkoló kiadási állapot kijelzése.
- `tools/check-release-target-v1-40-7.mjs`: későbbi, külön manuálisan publikált HTTP(S) célhely integritásvizsgálata, írás nélkül.
- `dokumentacio/BAZIS_MANIFEST_V1_40_6.json`: megőrzött összehasonlítási alap.
- `dokumentacio/KIADASI_ELTERESEK_V1_40_7.json` és `dokumentacio/KIADASI_KAPU_V1_40_7.json`: gépi jegyzőkönyvek.
- `tools/test-v1407-static.mjs`, `tools/run-full-regression-v1-40-7.mjs`, `dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_7.json`: visszafuttatható tesztek.

## 3. Megőrzött tartalom és működés

Az alapverzióval azonos maradt:

- **71** oldal-JSON;
- **769** leltározott média- és dokumentumállomány;
- **174** médiatári rekord;
- **30** kezdőoldali kép;
- a reszponzív SPA-menürendszer, a korábbi központi kereső, a JSON-oldalmegjelenítés, a tartalmi kártyák és a `tools/` karbantartó rendszer;
- a teljes statikus **FTP-kompatibilitás**, PHP-/Node.js-futtatás nélkül;
- a Bootstrap **kizárólag verzióhoz kötött `bootstrap@5.3.9` CDN-ről** történő betöltése, helyi Bootstrap-csomag nélkül.

## 4. Pontos tesztelési mérleg

1. Az új Q+R+S+T funkciók önálló állományalapú és tiszta függvényes ellenőrzése: **15 új eset** (sikeres).
2. A teljes, korábbi és új automatikus regressziós csomag: **21/21 csomag** (sikeres).
3. JavaScript- és ESM-szintaxis: minden csomagolt `.js` és `.mjs` állomány külön `node --check` vizsgálata (sikeres).
4. Kiadási SHA-256-jegyzék: minden nyilvántartott fájl újraolvasása és bájtlenyomat-egyezése; a részletes darabszám a `KIADASI_KAPU_V1_40_7.json` fájlban található.
5. Előző kiadással való összevetés: teljes fájl- és bájtdelta; az eredmény a `KIADASI_ELTERESEK_V1_40_7.json` fájlban található, **0 törölt alapfájl**.
6. A végső ZIP archívum `unzip -tq` ellenőrzése: **hibamentes**.
7. **Nem teljesült böngészős/valódi eszközteszt:** a korábbi körben az elérhető Chromium indítását a futtatókörnyezet operációsrendszer-szintű `socket() Operation not permitted` korlátja blokkolta. Ennél a kiadásnál ezért nem állítunk teljes Chrome-, iOS-, Android-, NVDA- vagy VoiceOver-végigtesztelést. Ehhez külső valós futtatás szükséges.
8. **Nem történt éles célhelyvizsgálat:** nincs publikált v1.40.7, így az új HTTP célhely-ellenőrző e kiadásra még nem használható éles szerveren.

## 5. Nyitott feltételek és további szükséges bemenetek

**Q:** az intézményileg felhasználható eredeti képfájlok, jogtulajdonos/engedély, belső bizonyítékazonosító, adatvédelmi jogalap, képhez illő emberileg ellenőrzött ALT-szöveg és a médiatárba történő kézi, tesztelt regisztráció. Az elkészült JSON-terv önmagában nem jóváhagyás.

**R:** korábbi és új, tényleges 320/390/768 px mérési JSON, a kézi billentyűzetes és képernyőolvasós ellenőrzés, eszköz/operációs rendszer és a képernyőképpel igazolt konkrét hibák. A szoftver mért állapotot összevetni tud, de valódi vizsgálatot nem találhat ki.

**S:** a kód és stílus elkészült; kézi látássérült felhasználói vagy képernyőolvasós próba javasolt a végső hozzáférhetőségi minősítés előtt.

**T:** a diff működik; a kritikus belépőfájlok módosulásához szerkesztői felülvizsgálat, a nyilvános kiadáshoz külön emberi jóváhagyás és később a célhelyen lefuttatott olvasó teszt szükséges.

Ezek a felhasználói/intézményi feltételek **nem** jelentenek alkalmazáshibát, és a kiadási kapu nem minősíti őket automatikusan teljesítettnek.

## 6. Kiadási és feltöltési állapot

**Sem GitHub-, sem FTP-, sem más szerveres publikálás nem történt.** A ZIP önálló projekt, az `index.html` a gyökerében van. A működtetéshez statikus HTTP(S) tárhely kell; a `file://` megnyitás a JSON-lekérések miatt nem megfelelő. A `tools/index.html` az összes új segédoldal felé navigál, a helyi importok és exportok továbbra is a felhasználó böngészőjében történnek.

Új kiadás kézi előellenőrzési sorrendje:

1. `node tools/build-release-manifest.js`
2. `node tools/build-release-diff-v1-40-7.mjs`
3. `node tools/build-readiness-report-v1-40-7.mjs`
4. `node tools/run-full-regression-v1-40-7.mjs`
5. Helyi böngészős QA, intézményi jogosultsági ellenőrzés, majd **külön** kiadási döntés.
6. Csak kézi publikálás után: `node tools/check-release-target-v1-40-7.mjs https://a-tarhely-gyoker-cime/`

**A v1.40.7-es csomag így átadható, technikai integritása tesztelhető, de a hiányzó Q/R-bizonyítékok és a külön publikálási jóváhagyás miatt nem tekinthető automatikusan nyilvános kiadásra engedélyezettnek.**
