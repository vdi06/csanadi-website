# Csanádi Sportiskola – v1.40.9 átadási jegyzőkönyv

**Kiadás:** 2026. november 18.  
**Kiindulás:** teljes v1.40.8 ZIP  
**Feladat:** AA + AB + AC + AD + AE + AF  
**Publikáció:** NEM TÖRTÉNT. Az alábbi csomag kizárólag átadásra és helyi ellenőrzésre készült.

## 1. Teljesített és korlátozott feladatok

| Kód | Kért fejlesztés | Megvalósult | Nem teljesült / szükséges külső feltétel |
| --- | --- | --- | --- |
| **AA** | Hivatalos intézményi fényképek előkészítése és beépítése | Megőrzött, engedélyhez kötött fotó- és elhelyezés-ellenőrzés; új audit és intézményi munkalap. | **0 új eredeti fotó, 0 engedély, 0 ténylegesen beépített fénykép.** A felhasználó nem adott ilyen állományt. Az illusztrációkat nem nevezzük intézményi fotónak. |
| **AB** | Valódi mobilos és akadálymentességi javítások | A 320/390/768 px-es ellenőrzésben új látható H1-, címsorszint-, ARIA-célpont- és külső link biztonsági audit, exportálható mérési eredmény. | **Valódi telefonos, billentyűzetes, NVDA/VoiceOver mérés nem történt; WCAG-tanúsítás nincs.** Beadott valós hibajegyzőkönyv hiányában hibát nem nyilvánítunk javítottnak. |
| **AC** | SEO-indexelés előkészítése | Mind a **71** publikált JSON-oldalra külön tartalomhitelesítési, metaadat- és robots-státusz; manuális aktiválási feltételek. | **0 indexeltetésre engedélyezett oldal**: mind a 71 `noindex,nofollow`, közülük **9** hitelesített tartalmú. Éles domain/canonical és indexelés intézményi jóváhagyást igényel. |
| **AD** | További teljesítményoptimalizálás | Feltételes reszponzív első hero-képelőtöltés, kizárólag a kezdőlapon, az első belépőkapu és adattakarékos kapcsolat tiszteletben tartásával. A 95→1 helyi CSS-kérés optimalizálás megmaradt. Hét képváltozat bájthash-e rögzítve. | **LCP, INP, CLS, Lighthouse, fizikai mobilsebesség nem mért.** A szükséges mérési módszer és célértékek dokumentálva. |
| **AE** | Összetett kapcsolódó tartalmak | Az új determinisztikus ajánlómotor **oldalt, hitelesített hírt, ellenőrzött eseményt és publikált dokumentumot** kapcsol össze címkék, témák és cím alapján. Típusonkénti limit; mintahírek, ellenőrizetlen események és önajánlás kizárása. | Az intézményi tartalomszerkesztés és jóváhagyás külön folyamat. A megjelenítés a meglévő JSON-adatokra épül; nincs profilozás. |
| **AF** | FTP-staging és rollback-próba | Az előző teljes ZIP SHA-256/CRC/manifest ellenőrzése; teljes előre- és visszafelé fájldifferencia, kézi staging és rollback forgatókönyv. | **Éles vagy staging FTP-feltöltés nem történt.** Éles aktiválás és esetleges állománytörlés csak a felhasználó külön döntésével. |

## 2. Megőrzött működő funkciók

- A **71** publikált oldal-JSON és a teljes menüszerkezet, hash-alapú SPA-navigáció, mobil/asztali menü.
- **769** nyilvántartott asset, **174** médiatári tétel, **30** kezdőoldali hero-dia és azok reszponzív képei.
- Keresés, szűrés, dokumentumtár, hír- és eseményközpont, sportközpont, galériák, adatkártyák, statisztikák, helyi CRUD- és eszközoldalak.
- A **71 statikus SEO-előnézet**, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`; noindex változatlan.
- A **Bootstrap 5.3.9 kizárólag verzióhoz kötött CDN-ről** érkezik, és a **95 helyi CSS-kérés helyett 1** a v1.40.8-ból örökölt bundle.
- A korábbi kiadások bemeneti munkalapjai, ellenőrző eszközei és tesztsorai, valamint a v1.40.8 visszaállításhoz szükséges manifest.
- A v1.40.9 SPA belépő-, modul- és eszközoldal-cache kulcsai megújultak.

## 3. Tényleges ellenőrzések és eredmények

| Ellenőrzés | Eredmény |
| --- | --- |
| v1.40.9 AA–AF funkcionális egységteszt | **12/12** megfelelt (lásd `tools/test-v1409-static.mjs`) |
| Teljes visszamenőleges regresszió | **23/23** tesztcsomag megfelelt (`dokumentacio/REGRESSZIOS_TESZTJEGYZOKONYV_V1_40_9.json`) |
| JavaScript és MJS szintaktikai ellenőrzés | **424/424** fájl hibátlan `node --check` |
| JSON szintaktikai ellenőrzés | **169/169** fájl beolvasható |
| SHA-256 kiadási manifest | **1672** fájl, megvizsgálva; **0 hiba** |
| Előző v1.40.8 ZIP hitelesítése | Az ismert SHA-256, belső manifest és ZIP-CRC ellenőrzése sikeres |
| Kiadási eltérés a v1.40.8-hoz képest | **14 új**, **42 módosult**, **0 eltűnt**; a különbség manuális tartalmi szemlét igényel |
| SEO-védelem | 71/71 noindex; 0 indexelési aktiválás |
| FTP/GitHub publikálás | 0 művelet |

Az ellenőrzések technikai, helyben futtatott vizsgálatok. **Valódi Chromium/Safari/Firefox, Android/iOS, képernyőolvasós és hálózati terepmérést nem igazolnak.** A csomag technikailag átadható, de a nyilvános élesítés tartalmi, fotójogi és manuális ellenőrzési kapui nyitottak.

## 4. Kiadási állományok

- `release-manifest.json`: a csomag tartalmi SHA-256 jegyzéke.
- `dokumentacio/BAZIS_MANIFEST_V1_40_8.json`: az ellenőrzött előző verzió forrásjegyzéke.
- `dokumentacio/KIADASI_ELTERESEK_V1_40_9.json`: előre mutató változások.
- `dokumentacio/FTP_STAGING_VISSZAALLITAS_V1_40_9.json`: SHA-256 alapú visszaállítási terv.
- `dokumentacio/KIADASI_KAPU_V1_40_9.json`: automatikus integritás, szándékosan zárt nyilvános kiadási kapu.
- `dokumentacio/SEO_AKTIVALASI_TERV_V1_40_9.json`: 71 oldal részletes indexelési feltételei.
- `dokumentacio/FOTO_STATUS_V1_40_9.json`, `MOBIL_AKADALYMENTESSEG_STATUS_V1_40_9.json`, `TELJESITMENY_TERV_V1_40_9.json`.
- `tools/v1409-kiadasi-munkalap.html`: egységes karbantartási összefoglaló.
- `tools/run-full-regression-v1-40-9.mjs`: újrafuttatható tesztparancs.

## 5. Statikus FTP-tárhely: kötelező kézi lépések

1. A korábbi v1.40.8 ZIP-et, SHA-ját és az aktuális FTP-tárhely teljes mentését külön őrizd meg.
2. A teljes v1.40.9 ZIP-et próbakönyvtárba bontsd ki; az eredeti relatív mappaszerkezetet változatlanul tartsd meg.
3. FTP-re való áttérésnél a `json/config.json` **`site.baseUrl`** értékét állítsd az aktuálisan jóváhagyott intézményi domainre. Ezt követően a 71 statikus SEO-előnézetet és a manifestet újra kell generálni. A `noindex` maradjon.
4. HTTP(S) címen ellenőrizd a keresést, mobilmenüt, dokumentumokat, JSON-betöltést és a teljes képtárat. A CDN eléréséhez internet szükséges.
5. Kézzel importálj valódi mobil/akadálymentességi tesztjegyzőkönyvet, és dokumentáld az intézményi fotók jogi jóváhagyását.
6. Élesítés vagy visszaállítás csak **külön, kifejezett felhasználói döntés** után. Ha a szerver nem támogat atomikus könyvtárváltást, karbantartási ablak és előzetes backup szükséges.

## 6. Következő lehetséges fejlesztések – több kiválasztható

- **AG:** tényleges intézményi fotóállományok és hozzájárulások biztonságos importja.
- **AH:** valós telefonos, billentyűzetes és képernyőolvasós hibajegyzőkönyvek célzott javítása.
- **AI:** intézményi tartalomhitelesítési és domainalapú SEO-indexelési munkafolyamat.
- **AJ:** tényleges Core Web Vitals tesztek alapján további LCP/INP/CLS-optimalizálás.
- **AK:** tartalomszerkesztői, kereszt-hivatkozásos hírek/események/dokumentumok kiemelési szabályai.
- **AL:** FTP-staging kézi próba végigvezetése és rollback-szimuláció helyi másolaton.

**Kiadási döntés:** a v1.40.9 teljes ZIP átadásra előkészítve; automatikus publikálás nem történt.
