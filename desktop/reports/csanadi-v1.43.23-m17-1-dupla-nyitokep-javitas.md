# Csanádi weboldal – v1.43.23 / M17.1 célzott dupla nyitókép-javítás

**Dátum:** 2026. november 20.  
**Állapot:** helyi előnézet, külön végső jóváhagyásra vár.  
**Alap:** a jóváhagyott v1.43.22 változatlanul megőrzött állapota.  
**Hatókör:** a képernyőképen jelzett **P0** probléma célzott javítása a mobilos modulban. Az M17.2–M17.4 fejlesztése **nem** része ennek a kiadásnak.  
**Közzététel:** FTP, GitHub és élő szerver: **nem történt**.

## A jelzett hiba

A felhasználó asztali szélességű képernyőképet küldött, amelyen az **eredeti asztali képváltó felett** egy második, mobilra tervezett filmes képváltó is megjelent. A mobilos komponens képléptető nyilai, szünetgombja és feliratai formázatlanul, egymás alá rendeződve látszódtak. A helyes asztali komponens az extra blokk alatt már megtalálható volt; **az eredeti asztali képváltó átalakítása nem volt cél**.

## Forrásalapú hibamegállapítás

- A kezdőlap közös JavaScriptje minden nézetben meghívja a mobilos filmes komponens készítőjét.
- A mobilos stíluslap kizárólag legfeljebb 768 CSS-pixel szélességen töltődik be.
- A v1.43.22 a mobilos komponenst desktopon `hidden` attribútummal rejtette, de a komponens maga továbbra is létrejött, és bekerült a közös kezdőlap DOM-fájába. A `hidden` megjelenítési garanciája a későbbi CSS-szabályoktól is függhet.

**A képen látható hiba teljes futásidejű oka és az ott ténylegesen futó verzió nem bizonyított** a böngészős környezet korlátai miatt. A célzott javítás a dupla DOM-jelenlét lehetőségét szerkezetileg kizárja.

## Végrehajtott javítás

**Egyetlen mobilos működési modul** változott érdemben: `mobile/reboot-hero-v1-43-23.js`.

1. A készítő már nem adja vissza közvetlenül a mobilos filmes HTML-szekciót, hanem `DocumentFragment`-et hoz létre.
2. **769 CSS px-től** a fragmentben csak egy láthatatlan komment-horgony van. A mobilos képváltó tényleges HTML-szekciója nincs a kezdőlaphoz csatolva, ezért sem látszani, sem helyet foglalni, sem fókuszba kerülni nem tud.
3. **768 CSS px-ig** a meglévő filmes mobilos komponens ugyanazzal a tartalommal és működéssel a horgony után az oldalhoz kapcsolódik.
4. A 768 → 769 → 768 irányú méretváltásokkor a mobilos szekció lecsatlakozik, illetve visszacsatlakozik.
5. A meglévő asztali képváltó nem változott. A közös `js/hero-2026.js` az eddigi módon helyezi be a mobil modul visszatérési értékét; a közös fájlban csak a szükséges verzióhivatkozás változott.

## Ellenőrzések és bizonyítékok

| Ellenőrzés | Eredmény | Megjegyzés |
|---|---|---|
| Asztali indulás | **DOM PASS** | A mobilos blokk nincs az asztali hero gyermekei között |
| Eredeti asztali képváltó megőrzése | **DOM PASS** | A próba ugyanazt az objektumot és azonos DOM-sorrendet kapja vissza |
| Mobilos indulás | **DOM PASS** | A filmes komponens és funkciói csatlakoznak |
| Desktop → mobil → desktop | **DOM PASS** | A mobilos szekciót ténylegesen eltávolítjuk, nem pusztán elrejtjük |
| Korábbi mobilos képváltó tesztek | **PASS** | Bejárati nyitókép, nyilak, swipe, reduced-motion, folytatás |
| Fejléc és régi desktop DOM | **PASS** | M16.1 ellenőrzés változatlan |
| Korábbi M11–M16 mobilregressziók | **PASS** | Teljes automatikus regresszió |
| Valódi Chromium vizuális próba | **NYITOTT** | A böngésző indítása `socket() failed: Operation not permitted` hibával megállt |
| iOS Safari / Android Chrome | **NYITOTT** | Fizikai készülékhez nem volt hozzáférés |

Az M17.1 célzott kapuja a `tools/verify-m17-desktop-hero-isolation.mjs` ellenőrzővel külön is futtatható. A teljes kiadásellenőrzés összeveti az asztali CSS, JS, média, tartalmi JSON és hét közös runtime állomány változatlanságát a korábbi védett referenciával.

## ZIP-kiadás és helyi visszaállítás

Az átadás tartalmazza a teljes statikus weboldalt, az öt aktuális mobilmodult, az ellenőrző eszközöket, a jelentést és a `release-manifest.json` fájlt, amely **1324 leltározott fájl** méretét és SHA-256 lenyomatát tartalmazza. A ZIP-et hibamentesen ellenőriztük, majd elkülönített könyvtárba kibontottuk; **a kicsomagolt példány mind a 20 ellenőrzése sikeres**. A v1.43.22 jóváhagyott eredeti csomagját szintén újraellenőriztük: változatlanul megfelel a kiadási leltárnak. A helyi próba nem szerveroldali éles visszaállítás.

## Nyitott elfogadási pont

Mivel a Chromium ebben a környezetben nem indítható megbízhatóan a megjelenés ellenőrzésére, a felhasználó által jelzett képernyőkép **valódi asztali böngészőben történő megismétlése** szükséges. A javítás forrás- és DOM-alapon igazolt, de a vizuális hiba megszűnését nem jelentjük valós képernyőn bizonyítottnak.

**Kötelező manuális ellenőrzés:** 768, 769, 1024, 1280 és 1440 px-en, kezdőlapon és aloldalra visszatérve, világos/sötét témában. Asztalon csak az eredeti képváltó, telefonon csak a filmes mobilos blokk jelenhet meg.

## Külön végső jóváhagyás

**A – Jóváhagyom a v1.43.23 M17.1 célzott javítási előnézetét** a dokumentált nyitott valós böngészős vizsgálat tudomásulvételével. Közzététel nincs; az M17.2–M17.4 külön jóváhagyást igényel.

**B – Valós asztali böngészőben ellenőrzöm a dupla képváltót**, és csak utána hagyom jóvá.

**C – További hibajavítást kérek**, kiadás és közzététel nélkül.
