# Csanádi Sportiskola — v1.40.10 részletes átadási jegyzőkönyv

**Dátum:** 2026. november 18.  
**Kiindulás:** a teljes `csanadi-website-v1.40.9.zip`, SHA-256: `d141a477aeb7e1621d813ecb84870f9916162a939c3a9ae31c2e1e2a2f1c3eac`.  
**Új verzió:** v1.40.10.  
**Kért hat terület:** AG + AH + AI + AJ + AK + AL.  
**Közzététel:** sem GitHubra, sem FTP-re nem történt; az éles indexelést sem aktiváltuk.

## 1. Eredmények, feladatonként

| Betű | Kérés és megvalósítás | Ellenőrzött eredmény | Nyitott külső feltétel |
| --- | --- | --- | --- |
| **AG** | Eredeti intézményi fényképek biztonságos beépítésének előkészítése: eredeti bájthash, MIME, fájlnév, méret, képleírás, duplikáció, intézményi jog- és adatvédelmi bizonyíték, külön kiskorúi hozzájárulásvizsgálat. | `tools/official-photo-validation-v1-40-10.mjs`, `FOTO_ELLENORZES_V1_40_10.json`; pozitív és elutasító tesztek. **0 új eredeti fénykép és 0 képtármódosítás.** | A tényleges, jogszerűen közzétehető képfájlok és intézményi döntések még hiányoznak. A helyes fejléc és állított engedélymezők nem tanúsítják önmagukban a jogot. |
| **AH** | Korábbi és új mobilos/billentyűzetes/akadálymentességi QA-jelentések összevetésére, hibák súlyosság szerinti javítási sorára szolgáló motor és böngészős import-export felület. | `qa-remediation-core-v1-40-10.mjs`, `v14010-bizonyitek-kapu.html`, `MOBIL_HIBAJAVITASI_TERV_V1_40_10.json`; kitalált próbaadattal tesztelt hibalista. **0 valós jegyzőkönyv, 0 igazolt célzott hibajavítás.** | Fizikai telefon/tablet, billentyűzet és képernyőolvasó előtte/utána vizsgálat, konkrét reprodukálható hibalista szükséges. Automatikus WCAG-tanúsítás nincs. |
| **AI** | Oldalankénti SEO-jóváhagyási kapu, külön domain-, tartalom-, adatvédelmi és SEO-felelősi jóváhagyással; a korábbi 71 oldal változatlanul noindex. | `seo-consent-core-v1-40-10.mjs`, `SEO_ENGEDELYEZES_V1_40_10.json`, böngészős előnézet; a 71 oldalból jelenleg **0** teljesen jóváhagyott, **0** indexelhető. | Hivatalos HTTPS-domain, ellenőrzött metaadat és oldalanként dokumentált intézményi jóváhagyás; külön kézi SEO-újragenerálás. A kapu nem változtatja meg a robotdirektívákat. |
| **AJ** | Core Web Vitals p75 alapú LCP, INP és CLS kiértékelése, forrástípus (terep/labor), mintaszám, hibás adatok és küszöbök ellenőrzése. | `vitals-review-core-v1-40-10.mjs`, `WEB_VITALS_TERV_V1_40_10.json`, böngészős import-export; próbaméréseken a jó, rossz és hiányos adatok tesztje sikeres. **0 tényleges terepmérés**. | Hiteles p75 mintasorok oldalanként és eszközönként, időszak- és hálózati környezettel. Adat nélkül nem állítható LCP/INP/CLS gyorsulás. |
| **AK** | Kapcsolódó tartalmak szerkesztői súlyozása és kizárása a közzétett oldalak, hírek, események és dokumentumok között, személyes profil nélkül. | `js/search-recommendations-v1-40-9.js` bővítése, `js/search-j-2026.js` bekötése, `ajanlasok-szerkeszto-v1-40-10.html` és `.js`, `json/adatok/ajanlasi-szabalyok-v1-40-10.json`. Pozitív/negatív szűrés és kiemelés tesztelve. Az induló szabálylista **üres**, tehát a korábbi automatikus ajánlások élnek. | Új intézményi szerkesztői kapcsolatok és jóváhagyás hiányoznak; az exportált szabály-JSON kézi feltöltése szükséges. A pipálható „approved” mező nem szerveres jogosultságkezelés. |
| **AL** | A teljes v1.40.10 kiadás és a hiteles korábbi v1.40.9 ZIP helyi staging/rollback próbája, mindkét irányban SHA-256 validálással, külön manuális FTP-listával. | `rehearse-local-release-v1-40-10.mjs`, `FTP_HELYI_PROBA_V1_40_10.json`: **1 695/1 695** új és **1 672/1 672** régi fájl hibátlanul újraellenőrizve. A régi ZIP SHA-ja egyezik. | Valódi FTP-próbatárhelyre feltöltést, szerveroldali átállást és tényleges éles visszaállítást csak jogosult személy végezhet. Az offline próba nem bizonyítja az adott tárhely atomikus átállíthatóságát. |

## 2. Megőrzött működő funkciók és állományok

- **71** regisztrált JSON-tartalmi oldal; a menü, aloldalak és SPA-navigáció változatlanul a meglévő rendszeren alapul.
- **769** nyilvántartott asset, **174** médiatári tétel, **30** kezdőlap-hero dia; nem töröltünk meglevő tartalmi állományt.
- Bootstrap CSS/JS csak a rögzített **5.3.9 CDN**-változatból; a helyi CSS-bundle és a natív JavaScript-megoldások megmaradtak.
- A kereső, előző többféle kapcsolódó tartalom, témaállapotok, mobil menük, a `tools/` szerkesztők és a `assets/` média-/dokumentumkezelés regressziós ellenőrzése eredményes.
- A `json/config.json` gyorsítótár-verziója `csanadi-r-v1.40.10`; a belépő és alkalmazásmodulok cache-busting jelölései `1.40.10` értékűek.
- A teljes csomag **statikus HTML/CSS/JS/JSON** alapú, FTP-kompatibilis; új Node- vagy PHP-szerverfüggés nem keletkezett. A helyi `tools/*.mjs` segédparancsok nem webtárhelyen futó szolgáltatások.
- Az éles honlap menüjében a segédeszközök továbbra sincsenek publikusan belinkelve; a statikus tárhelyre feltöltött közvetlen URL-ek azonban nem jelszóvédettek.

## 3. Tételes teszt- és integritási eredmények

| Ellenőrzés | Eredmény |
| --- | --- |
| AG–AL új célzott funkciótesztek | **18/18 sikeres** |
| Teljes régi és új regressziós suite | **24/24 sikeres**, 0 hibás |
| JavaScript/ES-modul szintaxis | **437/437** fájl `node --check` sikeres |
| JSON-szintaxis | **180/180** fájl `JSON.parse` sikeres |
| Új csomag SHA-256 állományjegyzéke | **1 695/1 695** fájl pass |
| Helyi staging-telepítés szimuláció | **1 695/1 695** fájl pass |
| Korábbi ZIP teljes helyi visszabontása és SHA-ellenőrzése | **1 672/1 672** fájl pass |
| Helyi HTTP oldalak | **71/71** elérhető |
| Helyi HTTP assetek | **769/769** elérhető |
| Helyi HTTP kritikus állományok | **42/42** SHA-256 egyező |
| Helyi HTTP mintavett JSON-oldalak | **11/11** parse-olható |
| Belépő HTML és távoli manifest | **v1.40.10, 1 695** egyező fájl |
| ZIP újrakitömörítési és CRC-teszt | A lezárt átadás részeként ellenőrizve |

Az HTTP-ellenőrzés **a helyben indított `127.0.0.1` webkiszolgálón** történt. Nem jelent intézményi tárhelyen végzett éles próbát vagy eszközös, képernyőolvasós vizsgálatot.

### Változások a v1.40.9 kiadáshoz képest

Az új manifest szerint: **23** új hash-elt állomány, **44** megváltozott, **0** eltávolított, **1 628** változatlan; az új és a régi kiadás összehasonlítása a `dokumentacio/KIADASI_ELTERESEK_V1_40_10.json` fájlban található. A megváltozott fájlok közé tartoznak a cache-verzióra frissített HTML-fájlok, a keresőlogika és a verziófüggetlenített regressziós tesztek. Az integritásmanifest szándékosan nem hash-eli önmagát és a saját tartalmára építő öt kiadási összefoglalót.

## 4. Kiadás és FTP-kompatibilis, kézi visszaállítás

1. Őrizd meg külön, változatlanul a v1.40.9 teljes ZIP-et és az éles tárhely aktuális mentését.
2. Az új ZIP teljes tartalmát egy próbakönyvtárba bontsd ki. A `release-manifest.json` fájljai és SHA-256 azonosítói alapján ellenőrizd az állományokat.
3. Csak intézményi jóváhagyás után, kézzel módosítsd a `json/config.json` `site.baseUrl` értékét a végleges, megfelelő HTTPS-domainre. A metaadat-, sitemap- és indexelőfájlokat külön vizsgáld újra; a jelenlegi noindex ne oldódjon fel véletlenül.
4. A kívánt `json/adatok/ajanlasi-szabalyok-v1-40-10.json` állományt csak ellenőrzött tartalmakkal és jóváhagyással cseréld ki.
5. A próbatárhelyen ellenőrizd az útvonalakat, menüket, médiákat, dokumentumokat, keresőt, mobil és akadálymentes használatot; a csak olvasó `node tools/check-release-target-v1-40-10.mjs <URL>` fejlesztői ellenőrző is használható, ha rendelkezésre áll Node a karbantartó gépen.
6. Külön kézi engedéllyel és megfelelő mentéssel aktiválj; a statikus FTP-feltöltés nem szükségszerűen atomikus.
7. Hiba esetén a megőrzött v1.40.9 ZIP-et külön mappába bontsd, SHA alapján ellenőrizd, és kézzel állítsd vissza a kiinduló állapotot. A törlendő, már nem hivatkozott fájlokról tételesen dönts.

**Nem történt automatikus feltöltés, FTP-aktiválás, GitHub-commit, GitHub Pages-publikálás, domainek átállítása vagy noindex-feloldás.**

## 5. Nyitott feladatok és külső körülmények

- Tényleges jogtiszta intézményi fényképek és a képviselő által jóváhagyott adatvédelmi/hozzájárulási iratok még nem állnak rendelkezésre.
- Valódi mobilos, billentyűzetes és képernyőolvasós hibajegyzőkönyv nélkül a bizonyítékvezérelt célzott hibajavítások nem tekinthetők elvégzettnek.
- A 71 oldal teljes intézményi tartalmi, jogi és SEO-jóváhagyása nincs kész; mind noindex.
- Tényleges p75 teljesítménymérések nélkül sem numerikus gyorsulást, sem Core Web Vitals minősítést nem állítunk.
- Tényleges intézményi FTP staging és éles rollback-próba nem volt; a v1.40.10-ben teljes **helyi** szimuláció sikeres.
- Az **v1.41** külön következő verzióra marad a másik beszélgetésből érkező, a felhasználó által előre jelzett arculati/kinezet-leírás átnézése és megvalósítása. Ez nem része a v1.40.10-nek.

## 6. Következő, választható fejlesztések

- **AM:** hitelesített eredeti fotók beépítése megfelelő média- és hozzájárulási állománnyal.
- **AN:** konkrét, valós készülékes akadálymentességi hibák célzott javítása és visszamérése.
- **AO:** jóváhagyott éles domain és 71 oldal SEO-indexelésének tételes aktiválási előkészítése.
- **AP:** valódi Web Vitals mérésből levezetett, útvonalanként célzott gyorsítás.
- **AQ:** jóváhagyott szerkesztői kapcsolati térkép és kiemelt hír/esemény/dokumentum-javaslatok felvétele.
- **AR:** jogosult személy által végzett FTP-próbatárhelyi ellenőrzés támogatása, kiadási és visszaállítási jegyzőkönyvvel.

A fenti lehetőségek tetszőleges kombinációban választhatók; a külső engedélyeket és bemenő fájlokat a megvalósítás előtt külön ellenőrizni kell.
