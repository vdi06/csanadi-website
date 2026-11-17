# Csanádi Sportiskola – v1.39.1 javítási és tesztjegyzőkönyv

**Kiadás:** `csanadi_website_v1_39_1.zip`  
**Dátum:** 2026. november 17.  
**Állapot:** célzott, önállóan telepíthető **alverzió**, nem a 41 fejlesztési kérés lezárása.  
**Alap:** a v1.39.0 kiadás és a 41 kérés / 18 döntés utólagos felülvizsgálata.

## A felhasználó kérése

A v1.39.0 hiányos, részben tévesen megvalósított elemeit javítani kell. A munka
több önálló alverzióban haladhat; minden egyes alverzióban tételesen közölni
kell az elkészült, tesztelt, nem kész és külső feltételt igénylő funkciókat.

## Ténylegesen elkészült v1.39.1-javítások

1. **A 71 publikált oldal teljes törzsszövege belsőleg kereshető.** Az eredeti
   részleges `searchText` adatokat a `tools/build-search-index-v1-39-1.js`
   újraépíti a tényleges `json/oldalak/` fájlok `blocks` tartalmából. Az így
   előállított `json/oldalindex.json` 71 rekordot és 85 129 karakter
   indexszöveget tartalmaz. A böngészőben a korábban hiányzó „önfegyelmet”
   szóra már az „Iskolánk” oldal szerepel a találatok között. A keresőlogika
   az index szövegét nem tekinti a már megnyitott oldal blokkjainak
   kizárólagos helyettesítőjének. Nem publikált oldalt a keresés kizár.
2. **A kezdőlap teljes felső komponense egyben ragad a képernyő tetejéhez.**
   Az eredeti fejléc és a tényleges nagy képváltó közös `#cs39-home-shell`
   egységet képez. A görgetési küszöb felett a nagy képváltó animálva
   összecsukódik, helyette rövid kép/cím/hivatkozás és az eredeti képváltóhoz
   kötött előző–következő gombok, főmenü és vissza a tetejére gomb jelenik meg.
   Nem létesül második, egymástól független képtár. A nagy, vizuálisan rejtett
   képváltó billentyűzetes fókusza is inaktiválódik a kompakt állapotban.
   Aloldalakon a meglévő sticky fejléc továbbra is a dokumentumhoz tartozik.
3. **Mobilon az aloldali cím és sportanimáció már látható.** A korábbi,
   asztali animációból saját mobilos SVG-példány és cím/szakasz sáv készül;
   van szünet gomb, és érvényesül a csökkentett mozgás beállítás. A
   320 és 390 px-es próbákon a sáv megjelent és vízszintes kilógást nem
   okozott; az aloldali fejléc görgetés utáni rövid módját a CSS kezeli.
4. **Kiadási verziózás:** új `csanadi-r-v1.39.1` gyorsítótár-azonosító,
   frissített JavaScript-betöltés és SHA-256 fájljegyzék. Az eredeti
   v1.39.0 fájlok külön kiadásként változatlanul megmaradnak.

### Érintett fájlok

| Fájl | Változás |
|---|---|
| `json/oldalindex.json` | 71 teljes szöveges oldalbejegyzés |
| `js/search-j-2026.js` | publikált státusz szűrése; blokkszöveg-egyesítés |
| `js/release-v1-39-1.js` | közös főoldali felső rész, kompakt vezérlés, mobil aloldali sáv |
| `css/corrections-v1-39-1.css` | sticky/összehúzódó fejléc, mobil animáció és szöveg, kis képernyő |
| `js/release-v1-39-0.js`, `js/app.js` | stabil görgetési küszöb, menü inertségének illesztése |
| `index.html`, `script.js`, `json/config.json` | új réteg és v1.39.1-es betöltés/cache |
| `tools/build-search-index-v1-39-1.js` | ismételhető FTP-barát indexgenerálás |
| `tools/test-search-index-v1-39-1.js`, `tools/test-release-v1-39-1.js` | új regresszióellenőrzések |
| `tools/build-release-manifest.js`, `tools/verify-release-manifest-v1-39-0.js`, `release-manifest.json` | kiadási integritás |

## Teszteredmények

| Ellenőrzés | Eredmény | Korlát |
|---|---|---|
| `node tools/test-release-v1-39-0.js` | **947/947** | az alapoldalak, menü, JSON-ok, eszközök és linkek szerkezeti regressziója |
| `node tools/test-release-v1-39-1.js` | **7/7** | a javítások bekötési, a11y, verziózási és tartalmi statikus kapui |
| `node tools/test-search-index-v1-39-1.js` | **74/74** | 71 oldal teljes szövegének bájtpontos egyezése és három hiányzó szó |
| `node tools/test-theme-sync-v1-37.js` | **12/12** | korábbi témaszinkron-regresszió |
| `node tools/test-static-http-v1-39-0.js` | **1287/1287** | 71 oldal, 628 média és 585 további statikus fájl HTTP-ellenőrzése |
| Helyi Chrome, asztali kezdőlap | **sikeres** | a nagy hero 640 px-ről 0-ra csukódott, 134 px-es közös kompakt felső sáv maradt, címmel és linkkel |
| Helyi Chrome, 320/390 px-es aloldali nézet | **sikeres az ellenőrzött útvonalon** | animáció, cím, szünet gomb; vízszintes túlcsordulás 0 px |
| Keresés „önfegyelmet” | **1 releváns találat: Iskolánk** | manuális funkciópróba; nem teljes relevanciamérés |
| SHA-256 kiadási manifest | **1281/1281** | valamennyi kiadási állomány mérete és lenyomata egyezik; nem helyettesít vizuális minőségbiztosítást |
| ZIP integritás | **az átadáskor ellenőrzendő** | a kész teljes ZIP állomány- és CRC-ellenőrzése |

## Mi nincs még kész, és mi nem bizonyított?

- **Önálló, valóban eltérő oldaltípus-sablonok** (hír, sport, esemény, dokumentum,
  útmutató) és tényleges oldalspecifikus elrendezések: a v1.39.1 nem oldotta meg.
- **Mind a 66 eredeti JSON-oldal szerkesztői áttekintése, duplikációk megszüntetése,
  indokolt szétbontása:** nincs lezárva. A változtatás nem módosítja e 66 oldal
  szerkesztői tartalmát; csak a keresőindexüket.
- **Az összevont régi megközelítési/tanulási segédoldal funkcióinak teljes
  áthelyezése** az új érkezési és tanulási céloldalakba: nincs kész.
- **Témánként teljesen különböző humoros sportanimációs készlet:** mobilon
  megjelenik a meglévő témához igazított jelenet, de alapfigurája továbbra is
  közös. További grafikai és interakciós változatosság szükséges.
- **Teljes funkció- és mobilteszt:** csak a felsorolt útvonalak/nézetek kerültek
  célzott vizsgálat alá; nincs minden útvonalon, böngészőn és fizikai eszközön
  reprodukált billentyűzetes, tapintásos, kontrasztos, teljesítmény- és
  akadálymentességi audit.
- **Teljesítménykapu:** nincs friss, reprodukált FCP/LCP/CLS eredmény.
- **Más kereshető tartalomtípusok** (hírek, események, médiák, dokumentumok)
  korábbi indexelése megmaradt, de ebben az alverzióban nem történt teljes,
  újraszámolt rekord- és relevanciaellenőrzés ezekre a gyűjteményekre.

**Következtetés:** v1.39.1 az első célzott, mérhető javítóalverzió, nem
„41/41 kész” minősítés. Még nem javasolható a teljes jóváhagyott specifikáció
véglegesen teljesített kiadásaként.

## Telepítés, FTP és külső feltételek

1. A teljes ZIP tartalmát a statikus FTP-tárhely megfelelő gyökerébe kell
   másolni, megtartva a mappákat. Nem kell Node.js, PHP, adatbázis vagy GitHub
   Actions az oldal megjelenítéséhez.
2. A fejlesztői `tools/build-search-index-v1-39-1.js` Node.js-es **kiadási
   eszköz**, nem a szerveren fut: ha oldal-JSON-tartalom változik, új
   feltöltés előtt helyben újra kell építeni az indexet, majd a manifestet.
   A jelen ZIP az aktuális 71 oldal indexét már tartalmazza.
3. Az eredeti CDN-alapú Bootstrap továbbra is külső hálózati forrás; a
   Google-térképes és KRÉTA hivatkozások külső oldalakat nyitnak. Az új
   keresési és fejlécfunkciókhoz nem kell ilyen külső szolgáltatás.
4. Közzététel után érdemes a gyorsítótárat és a service workert frissíteni:
   a konfigurációban a verzió az előző kiadáshoz képest változott.
5. Visszaállításkor az előző teljes ZIP (v1.39.0) visszatölthető.

## Következő javasolt alverzió

**v1.39.2:** a valóban eltérő oldaltípusok és az oldalankénti szerkesztői
duplikációvizsgálat első, dokumentált része, különös tekintettel az egyesített
megközelítési/tanulási funkciókra. A teljes 41 pontos zárás későbbi
alverziók feladata.
