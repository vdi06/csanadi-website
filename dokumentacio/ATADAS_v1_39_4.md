# Csanádi Sportiskola – v1.39.4 alverzió átadása

**Kiadás:** v1.39.4 · **Dátum:** 2026. november 17. · **Feladat:** a `tools/` segédoldalak egységes prémium megjelenése és az `assets/` média- és dokumentumkezelő működő, ellenőrizhető CRUD-folyamatának befejezése.

## 1. A kért munkák sorrendje

1. A tizenhat `tools/` HTML-segédoldal egységes, navigálható, sötétkék–arany munkakörnyezete.
2. A meglévő, 628 fájlt kezelő böngészős média- és dokumentumkezelő javítása és biztonsági kapuinak megerősítése.
3. Automatikus vizsgálatok, a teljes statikus állománykészlet ellenőrzése, a teljes honlapot tartalmazó ZIP összeállítása.

**Nem része ennek az alverziónak** a médiaállományok körülbelül hatszoros bővítése. Az eredeti 628 assets-fájl érintetlen maradt. A bővítés kizárólag egy következő, külön jóváhagyott munkafázis lehet.

## 2. Segédoldalak: mi készült el?

- Minden segédoldalon ugyanaz a hatpontos **Munkaközpont / Média és fájlok / Dokumentumadatok / Oldalszerkesztő / Minőségkapu / FTP-kiadás** navigáció jelenik meg, egyértelmű aktív állapottal.
- A korábban eltérő admin- (`round17`), szerkesztői (`tools-2026`) és különálló (`round16`) alrendszerek közös prémium megjelenítési réteget kaptak: sötétkék fejléc és navigáció, arany kiemelések, kártyák, gombok, jól elkülönülő ellenőrzési üzenetek.
- A mobilnavigáció keskeny kijelzőn vízszintesen görgethető, a menüpontok legalább 44 px magasak. Fókuszjelzés, aktív navigáció, csökkentett mozgás és nagy kontraszt kezelés szerepel a közös stílusban.
- A három korábban külön sötét próbafelület (a mobilos előnézet és a két SPA-útvonalpróba) is megkapta a közös szerkesztői fejlécrészt és a gyorsnavigációt. A tesztlogika és a belső iframe nézet megmaradt.
- A közös téma- és színpaletta-kezelés továbbra is natív JavaScriptből működik, külső szerveroldali függőség nélkül; a `tools/tool-ui-2026.js` `v1.39.4` cache-jelöléssel tölti be a közös stílust.

## 3. `assets/` CRUD és ellenőrzés: mi készült el?

**Már a korábbi változatban rendelkezésre álló, megőrzött funkciók:**

- **Létrehozás:** egy vagy több helyi kép, videó, PDF, dokumentum vagy támogatott egyéb fájl hozzáadása; mappaimport, méret- és kiterjesztéskorlát, automatikus egyedi fájlnév.
- **Olvasás:** a 628 fájlos jegyzék, szűrők, kereső, előnézet, típusok, fájlméret, hivatkozások, jogosultsági figyelmeztetések, SHA-256 státusz és duplikátumkimutatás.
- **Módosítás:** cím, útvonal, leírás, alt-szöveg, kategória, címkék, közzétételi állapot, fájlcsere, csoportos metaadat-szerkesztés, csoportos azonos nevű csere, visszavonás.
- **Törlés:** törlésre jelölés megerősítéssel, közvetlenül a kódból hivatkozott fájlok védelme, kapcsolatellenőrzés, törlési jegyzék.
- **Kiadás:** csak változásokat tartalmazó ZIP, teljes `assets/`-pillanatkép ZIP, felhasználó által kiválasztott helyi projektmappa frissítése támogatott böngészőben, CSV-munkalapok és ellenőrzési jegyzék.

**A v1.39.4 konkrét javításai:**

1. Új, külön **intézményi közzétételi jóváhagyás** jelölő. Új tartalom publikálásához a felhasználási jog ellenőrzése, minden bizonyítékmező kitöltése és az intézményi jóváhagyás együtt szükséges. A művelet az export kapujában is újra ellenőrzött.
2. A jóváhagyás állapota a fájlkezelő jegyzékébe és új médiatári elem esetén a jogkezelési nyilvántartásba kerül. A szerkesztői önigazolás önmagában továbbra sem intézményi döntés.
3. A JSON-alapú átnevezés már az objektumkulcsokban és a beágyazott értékekben is lecseréli a fájlhivatkozásokat; az ütköző kulcsok leállítják az exportot.
4. Törlésnél a kapcsolódó médiaazonosítókat is eltávolítja a megfelelő listákból, a megmaradt hivatkozásokat (JSON-kulcsokat is) felismeri és a sérült kiadást blokkolja.
5. A kódfájlokban történő útvonalcsere a `tools/` állományaira is kiterjed; a közvetlen kódbeli hivatkozással rendelkező állomány véletlen törlése továbbra is blokkolt.
6. Az új médiatári, galéria-, videó- és dokumentumazonosítók a **teljes fájlútvonalból** képződnek, és ütközés esetén biztonságos sorszámot kapnak.
7. Képlistán a bélyegképek késleltetett, aszinkron dekódolással töltődnek be.
8. A fájlműveletek egy része új, külön tesztelhető, mellékhatásmentes modulba került: `tools/media-project-ops-v1-39-4.mjs`.

## 4. Sikeres ellenőrzések

| Ellenőrzés | Eredmény |
| --- | ---: |
| v1.39.4 célzott média-, CRUD-, JSON-hivatkozási és arculati szerkezeti tesztek | **11/11** |
| Beépített ZIP-motor: fájlok, állományjegyzék, veszélyes útvonal tiltása | **5/5** |
| v1.39.3 tartalmi és forrásvizsgálat | **16/16** |
| v1.39.0 alapfunkciók és 628 regisztrált állomány | **948/948** |
| v1.39.1 regresszió | **7/7** |
| v1.39.2 oldalsablonok, mobil és nyolc témasablon | **14/14** |
| Keresőindex-vizsgálat | **74/74** |
| Témaállapot-vizsgálat | **12/12** |
| Helyi HTTP-próba: oldalak, média, JSON/HTML/CSS/JS | **1294/1294** |
| Módosított JavaScript-fájlok szintaxisellenőrzése | **2/2** |

**Nem sikerült futtatni:** a valódi Chromium-alapú böngészős teszt nem a weboldalon bukott meg; a rendelkezésre álló futtatókörnyezet a böngészőfolyamat saját socketjének létrehozását megtagadta (`Operation not permitted`). Ezért az interaktív felület mobilos és teljes fájlfeltöltéses böngészőtesztje **nem tekinthető igazoltnak**. Az új `tools/test-tools-browser-v1-39-4.js` tesztet a ZIP tartalmazza, támogatott Chromium + Playwright környezetben újrafuttatható.

## 5. FTP, külső feltételek és nyitott munkák

- A honlap statikus FTP-kiszolgálóra másolható. **Nincs GitHub Actions-, GitHub Pages- vagy szerveroldali kódfüggőség** a megvalósított CRUD-folyamatban.
- Az `assets/` szerkesztő HTTP(S)-kiszolgálón működik; `file://` megnyitással a JSON `fetch()` korlátozások miatt nem megbízható.
- A böngészőben a fájlműveletek **nem írnak vissza az FTP-re**. A módosítások exportált ZIP-ben vagy támogatott böngészőben felhasználó által engedélyezett helyi mappában jelennek meg; a szerveren a ZIP feltöltése és a törlési jegyzék végrehajtása külön lépés.
- A helyi mappa írása `showDirectoryPicker` böngészőtámogatást és felhasználói engedélyt igényel; másutt a ZIP az alapmegoldás.
- A Bootstrap CDN verziója változatlanul 5.3.9, a korábbi helyi tartalékok működése nem változott.
- A valós iskolai képek és dokumentumok közzétételének jogi/adatvédelmi ellenőrzését, az intézményi jóváhagyást és az éles FTP-feltöltést az iskola felelősének kell elvégeznie.
- Az intézményi minőségkapu és az éles mobilos, képernyőolvasós/böngészős ellenőrzés külön, valódi telepítési környezetben még szükséges. Nem állítjuk, hogy a v1.39.4 teljes WCAG 2.2 AA tanúsítást jelent.
- Az `assets/` hatszoros bővítése **nem történt meg**; ez a következő fejlesztési választások között szerepelhet.

## 6. Futtatás és biztonságos átadás

1. A teljes ZIP-et bontsd ki egy üres helyi mappába; ne keverd össze más alverzióval.
2. Indíts helyi statikus HTTP-kiszolgálót vagy helyezd próba FTP-tárhelyre, és nyisd meg az `index.html`, majd a `tools/index.html` oldalt.
3. A médiakezelőben először próbafájlon ellenőrizd a létrehozás, szerkesztés, törlésre jelölés és ZIP-export folyamatát.
4. Közzététel előtt használd a minőség- és FTP-kiadási ellenőrzőt. Az éles szerverre kizárólag ellenőrzött teljes kiadást tölts fel.

## 7. További választható fejlesztések

- **A – Médiatár bővítése:** a korábban jóváhagyott, médiatípusonként körülbelül hatszoros bővítés külön alverzióban, jogosultsági és forrásellenőrzéssel.
- **B – Éles mobil- és akadálymentességi QA:** több eszközön, Safari/Chromium/Firefox, képernyőolvasó, felületi és közzétételi útvonalpróbák.
- **C – Szerkesztői munkafolyamatok:** diff-előnézet, szerkesztői jóváhagyási jegyzék és kiadási csomag részletes összevetése.
- **D – Egyéb fejlesztés:** a felhasználó által megadott, újonnan priorizált feladat.
