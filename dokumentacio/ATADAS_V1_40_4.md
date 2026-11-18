# Csanádi Sportiskola – v1.40.4 átadási és tesztelési beszámoló

**Dátum:** 2026. november 18.  
**Kiindulási alap:** a v1.40.3 teljes állománykészlete  
**Fejlesztési csomag:** E + F + G + H  
**Publikálás:** **nem történt**, sem GitHubra, sem FTP-tárhelyre, sem más nyilvános helyre.

## 1. A kért változtatások és a tényleges teljesítés

### E – Mobilnézet és kis kijelzős finomítás

- Az új `css/accessibility-v1-40-4.css` a 420 CSS-pixel alatti fejlécvezérlők minimum 40 × 40 pixeles érintési területét, a vezérlők közötti hézagot és a hero jelölés méretét szabályozza.
- 350 CSS-pixel alatt külön kisebb címer- és márkafelirat-szabály érvényesül, hogy a keskeny fejléc kevesebb helyet használjon.
- A meglévő 768 pixeles reszponzív navigáció, a korábbi szélességszabályok, a mobil almenük és a képváltó érintéses kezelése érintetlenül megmaradt.
- **Korlát:** a pontos **320 / 390 / 768 CSS-pixeles élő böngészős megjelenítési teszt** ebben a futtatási környezetben **nem zárult le**: a rendelkezésre álló vezérelt böngésző nem tudott kapcsolódni a friss projekt helyi kiszolgálójához. A megfelelő CSS-szabályokat és az érintett kódútvonalakat automata, állományalapú tesztek ellenőrizték, de ez **nem helyettesíti** a valós renderelési tesztet. Publikálás előtt telefonon és tableten külön ellenőrzés javasolt.

### F – Valós iskolai képek, illusztrációk és felhasználási jogok

- Elkészült a teljes médiatárra kiterjedő, megismételhető jogtisztázási munkalap:
  - `dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.json`
  - `dokumentacio/KEP_ES_MEDIA_JOGTISZTAZAS_V1_40_4.csv`
  - Újragenerálás: `node tools/build-photo-rights-worklist-v1-40-4.mjs`.
- A munkalap **174 médiatételt** tartalmaz; mind a **174 tétel** intézményi, jogi vagy adatvédelmi ellenőrzést igényel az elérhető nyilvántartás alapján. A nyilvántartás szerinti státuszok: **80 generált**, **89 tisztázatlan**, **4 csak előnézetre szánt**, **1 felhasználó által biztosított**.
- A **30 kezdőképet** külön, sorrendhelyesen kiemeli a munkalap; mind a harminc státusza további ellenőrzést igényel. A 30 forrásfájl továbbra is különböző SHA-256 hashű és megfelelő méretű.
- A hero képváltó **látható „Illusztráció · nem hitelesített iskolai fotó”** címkét kap, amíg az adott médiatételhez nincs megfelelő jóváhagyási bizonyíték. A link felolvasóbarát neve is egyértelműen közli, hogy a kép nem igazolt intézményi eseményfotó.
- A meglévő `tools/tartalmi-hitelesites.html` helyi tartalomellenőrző az elavult, rögzített „69 médiatétel” helyett az aktuális teljes médiatárból dolgozik. Külön szűrhető a **30 kezdőkép**; az összesített CSV- és JSON-export a tényleges elemszámhoz igazodik.
- **Nem történt** olyan automatikus kijelentés, hogy a képek ténylegesen a Csanádi Sportiskolában készültek, illetve hogy intézményi felhasználási engedéllyel rendelkeznek. **Nem cseréltem ki** őket nem igazolt, nyilvánosan talált intézményi fotókra. A hiteles képek kiválasztása, a fotós/jogtulajdonos hozzájárulása, valamint az érintettek – különösen kiskorúak – adatvédelmi jogalapja intézményi feladat marad.

### G – Akadálymentesség és billentyűzetes használat

- Új, jól elkülönülő, hárompixeles `:focus-visible` fókuszkeret világos és sötét témában, a menü- és keresőpanelen is.
- A fő tartalom korábbi teljes `aria-live` megjelölése helyett **külön, vizuálisan rejtett, udvarias élő státuszmező** jelzi a képernyőolvasónak az új oldal betöltését. Ez elkerülheti a teljes aloldali tartalom ismételt felolvasását.
- A főmenü, a kereső, a fókusz visszaadása, a billentyűzetes fókuszcsapda és az Escape-kezelés meglévő működését megőriztem; a regressziós tesztek ezeket az útvonalakat is ellenőrzik.
- Szabályok készültek a kényszerített színpalettához (`forced-colors`) és a csökkentett mozgáshoz (`prefers-reduced-motion`).
- **Korlát:** dedikált, valódi NVDA/JAWS/VoiceOver képernyőolvasós végigjárás és fizikai billentyűzetes eszközteszt nem volt elérhető. Ezt a statikus kódszintű és korábbi modális tesztek nem minősítik teljes WCAG-megfelelőségi tanúsítvánnyá.

### H – Korábbi tesztek frissítése és egyesített regresszió

- A korábbi, elavult 65/71 oldalas, 628/748 állományos, 69 médiatételes és v1.39/v1.40.3 belépőverziós feltevésekből a továbbra is érvényes tesztek aktuális vagy dinamikus ellenőrzésekre álltak át.
- Új, részletes statikus regresszió: `tools/test-v1404-static.mjs` (**12/12** ellenőrzés).
- Új, egyesített regresszió: `tools/run-full-regression-v1-40-4.mjs` (**14/14 tesztcsomag sikeres**). A régebbi fejléckép-, hero-, kártya-, mobilfelépítés-, témaváltás-, modális- és intézményi hitelesítési követelményeket is lefedi.
- Géppel feldolgozható futási eredmény: `dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_4.json`.
- A kiadási cél ellenőrzője: `tools/check-release-target-v1-40-4.mjs`, a kiadásra váró célt **kizárólag HTTP GET/HEAD** műveletekkel olvassa; a mennyiségeket a jelenlegi nyilvántartásokból számolja, és az SHA-256 ellenőrzést is elvégzi. Az ellenőrző **nem publikál**.
- A teljes kiadási állományjegyzéket a `release-manifest.json` tartalmazza; az összes szereplő fájl méretét és SHA-256 értékét a helyben végzett kiadási audit ellenőrzi.

## 2. Megőrzött működési és telepítési alapelvek

| Terület | Átadott állapot |
|---|---|
| Oldalszerkezet | 71 regisztrált, érvényes JSON-oldal |
| Assetleltár | 769 meglévő, ellenőrzött útvonal |
| Médiatár | 174 rekord, az eredeti metaadatokkal |
| Kezdőlapi képváltó | 30 különböző kép és a meglévő takarékos képelőtöltés |
| Navigáció | Mobil/asztali menü, belső hash-útvonalak, megközelítési aloldalak |
| Funkciók | Keresés, háromállapotú témaváltás, magyar/angol beállítások, helyi tools-oldalak, exportok |
| Megjelenés | Korábbi prémium fejléc, címer, hero kétoldali feliratai, kártyaelrendezés |
| Tárhely | Statikus HTML/CSS/JS/JSON, FTP-kompatibilis; GitHub Pages alútvonalon is használható |
| Bootstrap | Kizárólag verzióhoz kötött `bootstrap@5.3.9` CDN, helyi Bootstrap-másolat nélkül |
| Publikálás | **Nem történt**; a ZIP csak átadásra készült |

## 3. Teszteredmények és bizonyítékok

| Vizsgálat | Eredmény | Mire terjed ki? |
|---|---|---|
| v1.40.4 új statikus kapu | **12/12 sikeres** | Oldalindex, média, jogi állapot, hozzáférhetőség, verzió, statikus tárhely |
| Egyesített visszamenőleges regresszió | **14/14 tesztcsomag sikeres** | v1.37–v1.40.4 megőrzési és funkcionális állományellenőrzések |
| v1.40.3 képaudit | **Sikeres** | 30 egyedi kép, felbontások, metaadat és fájlhash-egyezés |
| v1.40.4 kiadási manifest | **Helyi SHA-256 integritás** | A csomag minden felsorolt állománya |
| ZIP tömörítési integritás | **Sikeres: nincs sérült ZIP-bejegyzés** | `unzip -tq csanadi-website-v1.40.4.zip` |
| Valós 320/390/768 pixeles böngészővizsgálat | **Nem végrehajtott – nyitott** | A helyi tesztoldal vezérelt böngészőből nem volt elérhető |
| Valódi képernyőolvasó / fizikai eszköz | **Nem végrehajtott – nyitott** | NVDA/JAWS/VoiceOver, kézi fókuszsorrend |
| Nyilvános FTP/GitHub céloldal vizsgálata | **Nem végrehajtott – szándékosan** | A felhasználó kérésére semmit nem publikáltunk |

**Újrafuttatás:**

```bash
node tools/build-photo-rights-worklist-v1-40-4.mjs
node tools/build-release-manifest.js
node tools/run-full-regression-v1-40-4.mjs
```

Figyelem: ha az állományok vagy a tesztjegyzőkönyv az ellenőrzés után megváltoznak, a kiadási manifestet ismét frissíteni kell. A regressziós futtató a saját JSON-jegyzőkönyvét írja, de semmilyen kiszolgálóra nem küld adatot.

## 4. Nyitott feladatok és külső feltételek

1. **Intézményi fotóhitelesítés:** a médiák jogalapját és hozzájárulásait a jogosult/intézményi felelős erősítse meg; a munkalap nem engedély.
2. **Hiteles iskolai fényképek:** szükség esetén a jóváhagyott valódi képeket külön kell átadni, és a megfelelő médiatári bejegyzésekben regisztrálni.
3. **Valódi mobil QA:** 320, 390, 768 CSS-pixeles és lehetőleg fizikai telefon/tablet teszt, különös tekintettel a fejléc zsúfoltságára, a menüre, képváltásra és vízszintes túlcsordulásra.
4. **Valódi akadálymentességi ellenőrzés:** billentyűzet-only végigjárás és legalább egy képernyőolvasó tesztje.
5. **CDN-hozzáférés:** a Bootstrap megjelenéséhez a kliens böngészőnek el kell érnie a verziózott külső CDN-t; ezt a korábbi döntés alapján nem helyettesíti helyi csomag.
6. **Közzététel:** a csomag csak kézi felülvizsgálat és külön felhasználói döntés után kerülhet a `csanadi-website` GitHub-repozitóriumba vagy az iskola FTP-tárhelyére.

## 5. A következő fejlesztési kör lehetőségei

A következő körben az alábbi elemek külön-külön vagy együtt kérhetők:

- **I – Valódi iskolai fotók regisztrálása**, ha a jóváhagyott képfájlok és az engedélyezési adatok rendelkezésre állnak.
- **J – A mobil- és képernyőolvasós kézi QA eredményeinek feldolgozása**, célzott hibajavításokkal.
- **K – A tools/ felületek további egységesítése és adminisztrátori munkafolyamatok finomítása**, a meglévő funkciók megtartásával.
- **L – Tartalmi és keresési minőségjavítás** a 71 oldalon, külön jóváhagyási listával.

**Átadási szabály:** a v1.40.4 ZIP-et ellenőrzésre adjuk át. Nem jelent intézményi hitelesítést, nem jelent teljes körű akadálymentességi megfelelést, és nem jelent éles publikálást.
