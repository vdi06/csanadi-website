# Csanádi Sportiskola – 1.47 javítási és fejlesztési jelentés

**Dátum:** 2026. november 22.  
**Kiinduló verzió:** 1.46 – megőrizve, változatlanul.  
**Új verzió:** 1.47 – elkészült, külön ZIP-csomagban.  
**Közzététel:** nem került sem FTP-re, sem GitHubra, és nem kapott élesítési jóváhagyást.

## Kijavított hibák

1. **Ütköző blokkok:** 15 JSON-oldalon két, korábban újrahasznált azonosító tartalomtól függetlenül ugyanaz volt. A 30 érintett blokknak oldalazonosítóval egyedivé tett ID-ja lett; a `json/page-index.json` másolatait is átvezettem.
2. **Lassú betöltés CDN-kieséskor:** a Bootstrap CDN JavaScriptje nem tarthatja fel a helyi indulást a korábbi hosszú várakozásig. A betöltési időkorlát a JSON-ból állítható; alapértéke külső CDN-nél 4 másodperc, helyi szkriptnél 6,5 másodperc. Offline állapotban a külső CDN-kérést a weboldal kihagyja. Ez nem telepít helyi Bootstrapet.
3. **Sérült JSON-nál kevés tájékoztatás:** a weboldal most már ellenőrzi a JSON-ból épülő teljes felület struktúráját, hivatkozásait, attribútumait, azonosítóit és a veszélyes URL-eket, és biztonságos hibaoldalt jelenít meg újrapróbálkozási gombbal.
4. **Vegyes verziójú belső importok:** a belső JS- és CSS-hivatkozások, a szolgáltatásmunkás és a kiadási konfiguráció 1.47-re frissült, nem hivatkozik véletlenül a korábbi 1.46-os modul-URL-ekre.

## Új fejlesztés – automatikus JSON-minőségellenőrzés

Készült egy új, újrafuttatható, részletes ellenőrző:

```bash
node tools/validate-json-project-v147.mjs
```

Igény esetén szerkesztői, géppel feldolgozható jelentést is készít:

```bash
node tools/validate-json-project-v147.mjs --write-report
```

A jelentés az `reports/csanadi-1.47-json-audit.json` fájlban található, benne a tartalmi forrásellenőrzésre váró oldalak pontos útvonalával. A használat részletes leírása a `reports/csanadi-1.47-json-kezikonyv.md` fájlban van.

## Tényleges eredmények

| Vizsgálat | Eredmény |
| --- | --- |
| JSON-alapú oldalkeret és offline keret | Sikeres, a futó HTML-ek üres törzsűek |
| Látható felületelemek sértetlensége | 124 JSON-ból előállított elem, 12 fő elemcsoport |
| Oldalak és útvonalak | 79 oldal, 79 egyedi útvonal |
| Menüstruktúra | 78 menüoldal, a kezdőlap külön kezelve |
| Blokkazonosítók | 507 egyedi azonosító, 0 ütközés |
| JSON-adatok egymás közötti egyezése | 0 szerkezeti hiba, 0 figyelmeztetés |
| Tartalmi forrásellenőrzés | 20 igazolt oldal; 59 további szerkesztőségi ellenőrzésre vár |
| JSON biztonsági tesztek | Érvénytelen elem, eseményattribútum, veszélyes URL és dupla ID elutasítva |
| CDN-szkript betöltés | Időtúllépés, offline kihagyás és helyi szkript sikeres szimulációja |
| 1.47 frissítési logika | 1.46 és 1.43.33 korábbi kiadáshoz viszonyítva sikeres |
| Mobilmenü, nyitóképek, galéria, PDF-néző | Meglévő célzott DOM-tesztek sikeresek |
| 819 médiaállomány integritása | SHA-256 és méretellenőrzés sikeres |

**Nem tekinthető késznek a teljes platformteszt:** valós iPhone/Android, valódi asztali böngészős indítás, minden aloldal összes gombja, valamint az összes vizuális elrendezés ellenőrzése ebben a környezetben nem történt meg. Az automatizált DOM- és fájlellenőrzés ezeket nem helyettesíti.

## Következő ajánlott fejlesztés

1. **Valódi böngészős teszt és eszközmátrix** – mobilfejléc, navigáció, 79 oldal, kereső, offline újratöltés.
2. **59 oldal szerkesztői forrásellenőrzése** – az audit listája alapján, csak hiteles intézményi forrásból.
3. **JSON vizuális szerkesztő** – biztonságos mezőmódosítás, előnézet, javítási napló, validálás mentés előtt.
4. **További teljesítmény-optimalizálás** – több tucat helyi CSS egyszerűsítése, a CDN-előírás megtartásával.

Az 1.45-ös jóváhagyott és az 1.46-os JSON-átalakított csomag érintetlenül megmaradt.
