# Csanádi Sportiskola – 1.46 fejlesztési és ellenőrzési jelentés

**Dátum:** 2026. november 22.  
**Állapot:** elkészült, kiadás előtti jóváhagyásra és valódi eszközös ellenőrzésre vár.  
**Származás:** a jóváhagyott, változatlanul megőrzött 1.45 munkapéldányából létrehozott **külön 1.46** kiadás.  
**Közzététel:** FTP-re, GitHubra vagy élő szerverre nem történt feltöltés.

## Megvalósult átalakítás

1. **A futó HTML-ek teljes tartalommentesítése:** az `index.html` és `offline.html` törzse üres; csak szükséges HTML-dokumentumváz, karakterkódolás és modul-betöltő maradt.
2. **JSON-ból létrehozott teljes oldalkeret:** `json/site-shell.json` tartalmazza a fejlécet, akadálymentes átugró linket, navigációt, keresést, képernyőrétegeket, láblécet, metaadatokat, 31 CSS-hivatkozást, három korábbi szkript függőségét, megjelenési módot és nyitóképre vonatkozó beállításokat.
3. **JSON-ból létrehozott offline oldal:** `json/offline-shell.json` tartalmazza az offline tájékoztatást, újrapróbálkozás-gombot és stílusfüggőségeket.
4. **Biztonságos JSON-renderelés:** a `js/json-dom-v146.js` csak engedélyezett elemeket és attribútumokat alakít böngészős DOM-má; az adatokba helyezett futtatható szkripteket és `javascript:` linkeket elutasítja.
5. **Kompatibilitás és javítás:** a késve induló képoptimalizáló most már a DOM betöltése után is elindul; a kiemelt kapukép áthelyezett CSS-ben lévő fájlhivatkozását javítottuk; a JSON-fájlok az 1.46-os szolgáltatási gyorsítótárba kerültek.
6. **HTML-archívum átalakítása:** egy korábbi, kizárólag szemléltető HTML-jelentés pontos forrását JSON-archívum őrzi. A csomagban így **csak két, üres törzsű HTML-fájl** található.
7. **Oldaladattár megtartása:** a 79 korábbi aloldal tartalma a meglévő `json/pages` adatmodellben maradt; az adatok felülírása nem történt.

## Tényleges ellenőrzések

| Ellenőrzés | Eredmény |
| --- | --- |
| Régi és új statikus oldalkeret összehasonlítása | **124/124 látható elem azonos sorrendben**, az attribútumok az SVG `viewBox` írásmódját kivéve azonosak |
| HTML-ben nem szerepel megjelenő tartalom, CSS vagy beégetett felület | **Sikeres – két minimális belépőfájl** |
| JSON renderelése próbafában; veszélyes elem, URL tiltása | **Sikeres** |
| JSON-os CSS-/JS-függőségek és képútvonalak ellenőrzése | **Sikeres** |
| 79 aloldal útvonalainak, hivatkozásainak és indexeinek statikus ellenőrzése | **Sikeres** |
| Médiafájlok mérete és SHA-256 integritása | **819 médiaállomány ellenőrizve, 0 hiba** |
| JavaScript szintaktika a nem gyártói programfájlokban | **Sikeres** |
| Képteljesítmény-kezelő korai/késői betöltéskor | **3/3 szimulált DOM-állapot sikeres** |
| 1.46 verzió felismerése és 1.45/1.43.33 frissítési összehasonlítása | **Sikeres** |
| Mobilmenü, mobil nyitóképek, mobil minőségkapu, PDF/képnéző DOM-regressziói | **4/4 sikeres** |
| Valódi böngészőben teljes új indítás, érintések, vizuális teszt | **Nem sikerült ebben a környezetben végigfuttatni** |
| Fizikai iPhone és Android | **Nem tesztelt** |
| Minden aloldal valamennyi gombja és szövege | **Nem teljes körű** |

A `json/page-index.json` jelenlegi tartalmi ellenőrzési jelzői alapján **20 oldal ellenőrzött**, **59 oldal további szerkesztőségi forrásellenőrzést igényel**. Ez nem jelenti azt, hogy mind az 59 hibás, csak azt, hogy a forrásellenőrzési állapotuk nincs igazolva.

## Használat

A JSON-fájlok közvetlen szerkesztésekor a HTML-t nem kell módosítani. Részletes táblázat és mintapélda: `reports/csanadi-1.46-json-szerkesztes.md`.

**Fontos:** a JSON-betöltéshez HTTP(S) kiszolgálás szükséges. A dupla kattintással, `file://` útvonalon megnyitott `index.html` nem indítja el a honlapot. FTP-tárhelyen a teljes ZIP-et ki kell csomagolni és a helyes gyökérkönyvtárba feltölteni. A HTML nem tartalmaz sem oldalszöveget, sem láblécet, sem navigációt; a CSS továbbra is a stílusokat, a JavaScript a működést tartalmazza.

## Következő fejlesztések – javasolt sorrend

1. **Valódi böngészős és mobilos füstteszt:** indítás, menü, 79 útvonal, kereső, nyitókép, PDF-/galérianéző, offline visszatérés.
2. **59 aloldal tartalmi forrásellenőrzése:** egyértelmű publikálási állapot, szerkesztői munkalista és hiányok javítása.
3. **JSON-séma és szerkesztői validátor:** megmondja, pontosan melyik fájlban hiányzik egy kötelező mező vagy hivatkozás.
4. **Teljesítményjavítás:** 31 oldalstílus összevonása, CDN-függőség kiváltása helyi példánnyal, mérés valódi eszközön.
5. **Szerkesztői felület:** fejléc, menü, lábléc és aloldalak JSON-jainak vizuális módosítása naplózható verziókkal.

**Az 1.46 nem kapott végső élesítési jóváhagyást.** Az 1.45 külön megmaradt; nincs közzététel.
