# Csanádi Sportiskola – v1.40.6 átadási jegyzőkönyv

**Kiadás:** `csanadi-website-v1.40.6`  
**Alap:** v1.40.5 teljes statikus projekt  
**Dátum:** 2026. november 18.  
**Megrendelés:** M + N + O + P; a korábban működő funkciók megőrzése, teljes tesztelt ZIP, tételes beszámoló, automatikus publikálás nélkül.

## 1. Az igények teljesülése

| Tétel | Kérés | Elkészült | Valós korlát |
|---|---|---|---|
| **M** | Jóváhagyott, valódi iskolai fotók beépítése | Kibővült a fotó-hitelesítő: az eredeti helyi fájlok és az importált jóváhagyási munkalap SHA-256-lenyomatát, nevét, méretét, felbontását és képtípusát veti össze; duplikált, hiányos és megváltozott képeket jelöl. | **Nem érkezett új iskolai fotófájl vagy tényleges írásos jóváhagyás.** Nem történt képbeszúrás, csere vagy automatikus jogi jóváhagyás. |
| **N** | Mobilos QA-jegyzőkönyv alapján célzott hibajavítás | A 320/390/768 px QA-eszközben a túlcsordulás, apró célfelület és ARIA mellett a fejlécben látható különálló vezérlők geometriai átfedését is méri. Korábban exportált JSON-jegyzőkönyvet is fogad, ellenőrzi a mérési szélességeket és a kézi képernyőolvasós igazolást. | **Nem érkezett valódi mobilos hibajegyzék vagy képernyőolvasós teszt.** Nincs igazolt, konkrét fizikai eszközön mért hiba, ezért nem végeztünk feltételezett vizuális javítást. |
| **O** | Kereső relevanciája, kiemelése, szűrés/rendezés | Meglévő forrásokból előállított kereső: duplikátumszűrés, releváns kiemelt oldal a `json/config.json` kulcsszó–útvonal-szabályai alapján, továbbra is tartalomtípus- és témakörszűrés, új magyar betűrendes A–Z és Z–A rendezés. A rendezés a kereső megnyitásánál/bezárásánál megőrizhető, visszaállításkor alaphelyzetbe tér. | A kiemelt találat nem szerkesztői hitelesítési tanúsítvány; csak létező közzétett oldal címkéje. |
| **P** | Publikálás előtti kiadási ellenőrzőkapu | Új `tools/kiadasi-kapu-v1-40-6.html` + `.js`, helyi SHA-256-ellenőrző CLI, JSON-kiadási jelentés és v1.40.6-ra állított, kizárólag HTTP(S)-olvasó célhely-ellenőrző. Elkülöníti a technikai csomag-integritást az intézményi jóváhagyástól és a kézi QA-tól. | A nyilvános kiadás **szándékosan nyitott/tiltott**, amíg külön jóváhagyás és bizonyíték nem érkezik. Egyik eszköz sem publikál. |

## 2. Új és módosított lényeges elemek

### Keresés

- `js/search-policies-v1-40-6.js`: tiszta függvények, biztonságos hash-útvonalak, kulcsszóhoz kötött kiemelés, pontos duplikációszűrés és stabil, magyar nyelvű címrendezés.
- `js/search-j-2026.js`: harmadik rendezőmező, kiemelt találatjelölés és a kijelölt sorrend megőrzése.
- `css/search-polish-v1-40-6.css`: reszponzív rendező- és kiemelésmegjelenés.
- `json/config.json`: hat keresési kiemelési szabály (felvételi, sporteredmények, eseménynaptár, dokumentumtár, képgaléria, kapcsolat), a meglévő keresési funkciók megőrzésével.

### Fotók és mobileszközök

- `tools/photo-approval-core-v1-40-6.mjs`: fotófájl–jóváhagyási jegyzék összevetése; a valós intézményi felhatalmazást nem tekinti igazoltnak.
- `tools/iskolai-fotok-jovahagyasa.html` és `.js`: helyi JSON-import és eltérésjelzés, friss 1.40.6-os JSON/CSV-export.
- `tools/qa-import-core-v1-40-6.mjs`: mobil QA-jegyzőkönyv következetességi és teljességi ellenőrzése.
- `tools/mobil-akadalymentesseg-qa.html` és `.js`: fejlécátfedés, új JSON-import és nyolcoszlopos CSV-export, új 1.40.6-os jegyzőkönyv.

### Kiadás és megtartott szerkezet

- `tools/build-readiness-report-v1-40-6.mjs`: állományok tényleges SHA-256 összevetése a kiadási manifesttel, 71 oldal-JSON, médiakészlet és keresési kiemelt útvonalak ellenőrzése.
- `tools/kiadasi-kapu-v1-40-6.html` és `.js`: áttekinthető, exportálható helyi kiadáskapu, publikálási művelet nélkül.
- `tools/check-release-target-v1-40-6.mjs`: kizárólag olvasó, tényleges HTTP(S) célhelyre futtatható ellenőrző, valamennyi új kritikus modullal.
- `tools/index.html`, `tools/tool-ui-2026.js`: közös navigációban új kiadási kapu.
- `index.html`, `script.js`, `js/app.js`, `js/blocks.js`, `json/config.json`: v1.40.6 böngészőcache- és forrásverziók.
- `tools/test-v1406-static.mjs`, `tools/run-full-regression-v1-40-6.mjs`, `dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_6.json` és `release-manifest.json`: újrafuttatható tesztek és kiadási bizonyítékok.

## 3. Ellenőrzés és eredmény

1. **20 korábbi és új automatizált regressziós tesztcsomag**: az összes állományalapú és tiszta logikai teszt sikeres futtatását a `dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_6.json` rögzíti.
2. **M+N+O+P önálló tesztje:** 12/12 ellenőrzés, beleértve a SHA-256 jegyzékeltéréseket, a mobilos jegyzőkönyv hiányosságait, az új keresési rendezéseket és a kiadási blokkolófeltételeket.
3. **Tartalom megőrzése:** 71 JSON-oldal, 769 médiaszerű állomány az eszközleltárban, 174 médiatári rekord, a kezdőoldalon 30 képes képsáv; a régi navigációs, szerkesztői és média-CRUD regressziós tesztek is részei a futtatásnak.
4. **Kiadási manifest:** több mint 1500 állomány SHA-256 nyilvántartása; a helyi kiadási kapu a manifesttel való bájtazonosságot külön vizsgálja.
5. **Böngészőszintű vizuális ellenőrzés:** ebben a futtatókörnyezetben a Chromium indítását egy operációsrendszer-szintű `socket() Operation not permitted` korlátozás blokkolta. Így **nem állítható**, hogy valódi Chrome-ban végigkattintottuk a keresőt vagy a 320/390/768 px nézeteket. Ezekhez később a mellékelt QA-eszköz és a valós böngészős jegyzőkönyv használható.
6. **Külső HTTP célhely-vizsgálat:** a mellékelt parancssori célhely-ellenőrző elkészült, de éles célhelyen nem futott (nem történt publikálás). Teljes end-to-end FTP/GitHub Pages próba nincs igazolva.
7. **ZIP-sérülésellenőrzés:** a csomag összeállítása után az archívum integritását az `unzip -tq` paranccsal külön ellenőriztük.

## 4. Nyitott intézményi és kézi feltételek

**Nem készült el, mert külső bizonyíték kell hozzá:**

- az iskolai fényképek tényleges kiválasztása és jogtisztázott beépítése a médiatárba és a kezdőoldalra;
- valós telefonon, tableten és képernyőolvasóval elvégzett mobil/akadálymentességi vizsgálat és annak dokumentált, konkrét hibajavítása;
- az intézményi felelős külön közzétételi jóváhagyása;
- publikus tárhelyre történő feltöltés és éles HTTP(S)-ellenőrzés.

Az új segédoldalak statikus fájlok, az iskolai FTP-tárhelyen is működhetnek. A Bootstrap-t kizárólag verziózott `bootstrap@5.3.9` CDN-ről töltik; annak használatához internetkapcsolat szükséges. A statikus FTP nem tud jogosultság-ellenőrzést biztosítani, ezért az engedélyek eredeti bizonyítékát nem szabad a nyilvános tárhelyre feltölteni. A JSON-munkalap csak biztonságosan kezelhető belső azonosítókat tartalmazzon.

## 5. Publikálási állapot és kézi átadás

**GitHub: NEM publikáltuk. FTP: NEM publikáltuk. Egyéb szerver: NEM módosult.**

A ZIP saját `index.html` fájlját és az összes szükséges `js/`, `css/`, `json/`, `assets/`, `tools/` és `dokumentacio/` állományt a gyökerében tartalmazza. Kézi próba esetén az egész tartalmat egy statikus HTTP(S) tárhely gyökerébe kell tenni, nem megnyitni `file://` útvonalról. A `tools/index.html` az új kiadási kaput is tartalmazza.

Javasolt következő sorrend: (1) intézményileg jóváhagyott eredeti fotók és belső jogi jegyzék, (2) valós mobil- és segédtechnológiás QA, (3) javítás után regresszió, (4) külön jóváhagyással kézi publikálás, (5) az éles címen `node tools/check-release-target-v1-40-6.mjs https://.../` futtatása.
