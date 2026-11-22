# Csanádi weboldal 1.51 – külön mobil és asztali futási környezet

## Egyetlen nyilvános belépési pont

Az FTP-kiszolgáló gyökerében lévő `index.html` csak minimális HTML-vázat és
`js/platform-router-v149.js` betöltőt tartalmaz. Nem tartalmaz iskolai
szöveget, menüt, képet, láblécet vagy tartalmi oldalt.

A platformválasztó **768 CSS-pixelig vagy elsődlegesen érintős,
hover nélküli kijelzőn `mobile/`**, egyébként **`desktop/`** modulokat
indít. Ez a fekvő telefonokat is a saját mobilos felületükön tartja.
A kiválasztott mappát állítja be az oldal relatív
erőforrás-bázisának. Képernyőosztály-váltáskor a teljes futási környezet
újraindul, ezért nem maradhatnak át a másik nézet JavaScript- és CSS-állapotai.

## Futás közbeni mappák

```text
index.html                 # egyetlen nyilvános indítólap
js/platform-router-v149.js # kizárólag mobil/asztali választás
service-worker.js          # a kiválasztott platform offline fájljai
mobile/
  index.html               # belső ellenőrzési/fallback belépő
  script.js                # kizárólag mobilos indítómodulok
  js/                      # teljes mobilos program és JSON-renderelés
  css/                     # közös alapstílusok saját mobilpéldánya
  json/                    # saját platform-JSON, 79 oldal
  assets/                  # saját képek, dokumentumok és betűk
  mobile/                  # kizárólag mobilos nézet és menü
  tools/                   # helyi JSON-szerkesztő eszközök
desktop/
  index.html               # belső ellenőrzési/fallback belépő
  script.js                # kizárólag asztali indítómodulok
  js/                      # teljes asztali program és JSON-renderelés
  css/                     # saját asztali CSS-példány
  json/                    # saját platform-JSON, 79 oldal
  assets/                  # saját képek, dokumentumok és betűk
  desktop/                 # kizárólag asztali menü
  tools/                   # helyi JSON-szerkesztő eszközök
source/                    # szerkesztési/kiadási forrás, a honlap nem tölti le
```

A `mobile/` nem tartalmaz `desktop/` modulkönyvtárat, és fordítva.
Az eszközfüggő modulok a másik futási környezetből nem importálhatók.

## Az adatok közös forrása – nincs két külön kézi karbantartás

A kanonikus adatok a `source/json/` könyvtárban találhatók. Ezekből a
kiadásépítő létrehozza a `mobile/json/` és `desktop/json/` példányokat.
Az oldaltartalom és a menüstruktúra **JSON-ban van**, nem a HTML-ben.

Fejlesztéshez a forrásfájlokat szerkeszd, majd futtasd a csomag gyökeréből:

```bash
node tools/build-platform-v149.mjs
node tools/verify-platform-v149.mjs
node tools/verify-regression-v151.mjs
node tools/verify-layout-contract-v151.mjs
```

**Ne szerkeszd kézzel a generált `mobile/` és `desktop/` fájlokat**, mert
újrageneráláskor a kanonikus forrás felülírja őket. A builder csak a saját
`.generated-v149` jelöléssel rendelkező mappákba ír.

## 1.51-es javítások és kódszintű ellenőrzések

- A mobil kezdőkép valóban önálló mobilkomponens marad; az asztali képsor
  nem épül bele. A nyitókép hibája után a rendszer beillesztéskor is
  megpróbál másik működő diára lépni.
- Az asztali hero első hibás képe után másik diát próbál; későbbi hiba
  esetén megőrzi az előző jó képet. Az automata képváltó visszatér az
  aloldalról a kezdőlapra történő navigáció után is.
- A közös belépési pont a fekvő érintős telefont sem indítja asztalinak.
  A mobil főmenü ehhez igazodva fekvő helyzetben rácsba rendeződik.
- A kapu mindkét platformon él. Fölötte a címer mögött **nincs ovális,
  kör, háttér vagy saját keret**. Maga a kapu sziluettje áttetsző,
  négyrétegű, árnyék–arany–fényél–illesztés 3D vonalrajzot kapott.
- Az iskolai címer helye a központi JSON `site.crestImagePath` mezőjéből
  származik. A mobil első festéséhez szükséges tartalékkép útvonala
  szintén JSON-ban van, nem CSS-be égetett fájlnévként.
- Külön statikus szerződésvizsgálat ellenőrzi a fejléc oszlopszámát,
  középre igazítását, ikonméretét, a mobil képrész vezérlőit és réseit,
  az asztali fejléc szimmetriáját, a kapu fémperemeit és az elsőképes
  helyreállítás kódját. **Ez nem egyenlő valódi iPhone/Android próbával.**

### Elrendezési alapképletek

Telefonon a fejléc 3 bal oldali ikonból (Facebook, Instagram, KRÉTA),
egyetlen középső címerből, majd 2 jobb oldali ikonból (keresés, téma)
áll. A középső oszlop 58–62 px; a két oldalsó oszlop egyformán
`minmax(0,1fr)`. A 320 px-es nézetnél a 3 bal ikon
elméleti oszlopszélessége `(320−16−58−2×3)/2/3−2 = 38 px`
körüli, a gombmagasság 44 px. A mobil filmes információs blokk
13 px-es függőleges közt tart, a két nyílgomb 52–52 px, köztük
10–10 px rés és rugalmas kijelzőszakasz van. Az asztali fejléc
szintén szimmetrikus `1fr / címer / 1fr` rácsot használ;
akciógombjai sorba törhetnek.

### Korlátok

A JSON adja az oldalkatalógust, a főmenüket, a 79 tartalmi oldalt,
a 9 nyitóképet és a legtöbb képi adatot. Egyes ismétlődő kezdőlapi
kiegészítések és statikus felületi feliratok azonban még JavaScriptben
vannak – ezért pontatlan lenne azt állítani, hogy **már minden**
szöveg kizárólag JSON-ból származik. A teljes kódszintű leltár
`csanadi-1.51-kodszintu-audit.md` külön mellékletben található.

### Előző, 1.50-es örökség megőrzése

- Az asztali körmenü helyettesítője most valamennyi alkalmazásszinten hívott
  metódust biztosítja, így a menü nyitása és az Escape nem dob hibát.
- A telefonos nyitókép vezérlőinek és a hibajelzésnek szövegei a
  `source/json/pages/home.json` `mobileUi` mezőjében szerkeszthetők.
- A kétplatformos kiadásban a böngészős műhely a helyi módosításokat
  **külön, nem telepíthető változáscsomagba** mentheti. A korábbi
  „teljes ZIP” gombot biztonsági okból letiltottuk, mert csak a megnyitott
  platformot csomagolta, és hiányzott a gyökér + másik platform.
- A valódi teljes telepítési ZIP a kanonikus `source/` könyvtárból,
  a fenti építőparanccsal és a teljes SHA-256 manifest újragenerálásával
  áll elő. A böngészős változáscsomag feltöltésre önmagában **nem alkalmas**.

## Üzembe helyezés és ellenőrzés

- Teljes ZIP-tartalom feltöltése a statikus HTTPS-kiszolgáló gyökerébe.
- Az oldalt a **gyökér `index.html`** címén nyisd meg.
- Ellenőrizd 320, 390, 768 és 769 CSS-pixelen, továbbá egy fekvő
  telefonon a kiválasztott platformot, és a
  keresést, aloldalakat, galériát, menüt, dokumentumokat is.
- A platformon belüli programfájlok, JSON és helyi médiaútvonalak a saját
  mappából töltődnek. A Bootstrap CDN kivétel, mint külső függőség.
- Az offline gyorsítótár a kiválasztott platform fájljait tárolja.
- Valódi iPhone Safari és Android Chrome vizuális próba szükséges; a jelen
  munkakörnyezetből a helyi kiszolgáló a tesztböngészőben nem elérhető.

Nem történt FTP- vagy GitHub-közzététel.
