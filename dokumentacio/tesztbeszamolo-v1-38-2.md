# Csanádi weboldal v1.38.2 – játékos sportanimációk az aloldali fejlécben

Kiadás: 2026. november 16.  
Kiinduló teljes projekt: v1.38.1.  
Állapot: kipróbált, önálló, statikus FTP-tárhelyre feltölthető ZIP-csomag; **nem történt éles közzététel**.

## A kért változás

A felhasználó az aloldali, lefelé görgetve összecsúszó **asztali** fejléc bal oldalát szerette volna tartalommal kitölteni. A kezdeti képsorozatos elképzelést végül felváltotta egy oldalhoz igazodó, könnyed és kissé vicces **sportmozgás**. A jóváhagyott elv szerint görgetéskor az új elem eltűnik, és ugyanoda visszakerül a korábban megtervezett oldalcím; az eredeti menü, a középső iskolai címer és a telefonos változat megmarad.

## Mi készült el?

1. A 76 px-es asztali fejléc eredeti magasságán **belül** egy 56 px magas, bal oldali kártya. Nem nyújtja meg az oldalt, nem foglalja el a középső címer helyét.
2. **Helyi SVG/CSS sportolófigura**, futó és ugró kar-/láblengéssel, a jelenethez illő labdával, könyvvel, akadállyal, célkapuval, éremmel, újsággal, naptárral, dokumentummal, digitális pixelekkel, zöld levéllel, síppal, stafétával vagy üzenettel.
3. Összesen **14 előre meghatározott jelenettípus**; az `json/config.json` fájlban **23 útvonalprofil** adja meg, melyik aloldalcsoport melyik jelenetet, rövid címkét és feliratot kapja. Például: Könyvtár – könyv átugrása; Vizsgák – gátugrás; Sporteredmények – érmes győzelmi tánc; Digitális kultúra – pixelakadályok; Hírek – újságot hozó sportoló. A többi, regisztrált aloldal biztonságos alapmozgást kap.
4. **Indítás/szüneteltetés** saját gombbal, felolvasást segítő felirattal és állapotjelzéssel. A gomb a teljes futóábra helyett egy adott jelenet animációit vezérli, és a felhasználó szüneteltetési döntését megtartja aloldalváltáskor.
5. Az animáció automatikusan megáll: összecsúszott fejlécnél, háttérben lévő böngészőlapnál és `prefers-reduced-motion` rendszerbeállítás esetén. Ez utóbbinál a díszítő mozgás kikapcsolva marad.
6. **Lefelé görgetve** a kártya elhalványul, az eddig is meglévő oldalcím és olvasási folyamatjelző jelenik meg. Felfelé görgetéskor a teljes fejléc és a sportjelenet visszatérhet.
7. **Telefonon** a kártya teljesen rejtett: a külön telefonos körmenü, az oldalszakaszok elérése és az előzőleg jóváhagyott mobil-elrendezés változatlan.
8. A kezdőlapon nem jelenik meg az aloldali díszítő kártya.
9. A `script.js`/`js/app.js`/`js/subpages-v1.js` modulhivatkozásai és a teljesítmény-gyorsítótár verziójelzése `1.38.2`-re frissült. A Bootstrap-verzió és a statikus adatarchitektúra változatlan.

## Megőrzött funkciók és adatok

- **Hat főmenü, összesen 28 közvetlen almenü; nincs harmadik szint** a látható menüben.
- Az eredeti **65 tartalmi aloldal**, az elrejtett részletező oldalak, a tartalmi csempék és a keresés megmaradnak.
- A telefonos, kör alakú sportos menü és annak második szintje nem módosult.
- Az `assets/` mappában **628 nyilvántartott médiaelem** szerepel, ezekhez nem nyúltunk.
- A `tools/` segédoldalak és a média-/dokumentumkezelő eredeti állományai változatlanul részei a teljes csomagnak.
- A korábbi lábléc, diagnosztika, szolgáltatás- és tartalmi modulok a kiinduló v1.38.1-es állapot szerint megmaradtak.

## Automatizált tesztek

| Vizsgálat | Eredmény |
|---|---:|
| v1.38.2 – témaválasztás, SVG-jelenetek, vezérlés, mozgáscsökkentés, route-váltás, menümegőrzés | **32 / 32** sikeres |
| v1.38.1-ből örökölt kétszintű menü- és reszponzív regresszió, a friss v1.38.2-es teljes fájlkészleten | **35 / 35** sikeres |
| v1.38.2 statikus HTTP HEAD/GET és médiakiszolgálás | **1201 / 1201** sikeres |
| A nyilvántartásból elérhető különálló tartalmi oldalak | **65** |
| A média- és dokumentumleltár ellenőrzött elemei | **628** |
| JSON- és JavaScript-szintaxis az örökölt regresszióban | **sikeres** |

A részletes gépi eredmények külön fájlban: `dokumentacio/sportanimacio-tesztnaplo-v1-38-2.json`, `dokumentacio/static-http-tesztnaplo-v1-38-2.json`, valamint a változatlan, örökölt regressziós napló `dokumentacio/menu-es-mobilkor-tesztnaplo-v1-38-1.json`.

## Valódi grafikus böngészőben ellenőrizve

- **Asztali Chromium, kb. 1050 px szélesség:** `#/iskolank/bemutatkozas` aloldalon bal oldalt a játékos SVG sportjelenet, a középen lévő iskolai címer és a jobb oldali vezérlők együtt látszottak, egymást nem takarták.
- **Lefelé görgetés:** az animációs kártya eltűnt, helyén megjelent a „Bemutatkozás” oldalcím és a vékony arany olvasási előrehaladás-jelző. A középső címer megmaradt.
- **Más témájú aloldalak:** a Könyvtárhoz a könyves jelenet és a „Könyv fölött, cél felé”, a Sporteredményekhez az érmes jelenet és az „Egy kis győzelmi tánc” jelent meg.
- **Kezdőoldal:** a bal oldali új kártya nem látszott; a megszokott kezdőlapi nagy képek és navigáció megmaradtak.
- **Szűkített CSS-szélesség Chromium böngészőnagyítással:** a díszítő kártya rejtett, a külön mobilos kezelőszervek látszanak.

## Mi nem készült el / további ellenőrzés

- Ezek **rajzolt, stilizált mikroanimációk**, nem az iskola valódi diákjairól készült videók és nem fotókból generált klippek.
- A 23 részletes tematika aloldalcsoportonként ad más mozdulatot/kelléket; nem minden egyes oldalfájl kap teljesen egyedi, külön grafikát. A nem nevesített oldalak is kapnak sportmozgást.
- Valódi Android Chrome, iOS Safari, képernyőolvasóval végigvitt akadálymentességi ellenőrzés és gyengébb készülékeken mért energiafogyasztás nem történt.
- Az iskola saját éles FTP-kiszolgálójára való feltöltés és éles ellenőrzés külön, a megrendelői környezetben végrehajtandó lépés.
- A már meglévő felületek minden korábbi képességének teljes újratesztelését ez a kiadás **nem** állítja; a 35 strukturális regresszió és az 1201 HTTP-vizsgálat bizonyítja az érintetlen szerkezet működését a vizsgált körben.

## FTP-telepítés és külső feltételek

A ZIP a teljes webhelyet tartalmazza a statikus állománystruktúrában. Az új animációhoz **nem kell szerveroldali komponens, adatbázis, GitHub Actions vagy külső ütemező**. A telepítéskor az állományokat az iskola FTP-kiszolgálóján a webgyökérbe kell másolni. A meglévő Bootstrap CDN és más korábban használt külső források továbbra is az előző projektből öröklődnek; új külső függőség nem keletkezett.
