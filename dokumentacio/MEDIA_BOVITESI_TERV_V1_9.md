# Csanádi Sportiskola – médiabővítési kapu és tervezési keret (v1.9.0)

**Kiadási státusz: TERV. Nincs automatikusan átvett, megtöbbszörözött vagy publikált új médiaállomány.**

A képek, filmek, dokumentumok és grafikák hatszorosra bővítését csak akkor lehet biztonságosan vállalni, ha az egyedi, jogtisztán felhasználható tartalmakat számoljuk; a generált fájlváltozatok száma ezt torzíthatja. A tervezett keret a tényleges `json/assets-inventory.json` leltárából újragenerálható a `tools/build-media-expansion-plan-v1-9.js` paranccsal. CSV-kimenete szerkeszthető ellenőrzési sablon, JSON-kimenete géppel vizsgálható.

| Tartalmi kategória | Jelenlegi alapállomány | Feltételes 6× irányszám | Ehhez szükséges további egyedi tétel |
|---|---:|---:|---:|
| Egyedi képek a reszponzív változatok nélkül | 147 | 882 | 735 |
| Videók | 12 | 72 | 60 |
| Dokumentumok | 19 | 114 | 95 |
| QR-en kívüli grafikák | 10 | 60 | 50 |
| **Összes egyedi fájl-jelölt** | **188** | **1128** | **940** |

Továbbra is van **353 reszponzív képfájl-változat** és **87 QR-kód**. Ezeket az előző sorokhoz hozzáadni hibás lenne, és a fizikai fájlok megsokszorozása sem jelent új tartalmat. Az itt „egyedinek” tekintett 188 alapállomány az útvonalak alapján becsült, nem azonos egy lektorált, duplikációmentes médiatétel-nyilvántartással.

## Kötelező, egymás utáni jóváhagyási kapuk

1. **A meglévő munka lezárása:** minden `tools/` adminfelület egységes megjelenésének és az `assets/` teljes CRUD-útvonalának tényleges, célböngészős ellenőrzése. A v1.9.0 jelenlegi kód- és eseményszimulációi ezt nem váltják ki.
2. **Korábbi tartalom tisztázása:** a 65×31 követelmény 55 nyitott hitelesítési tételének forrásokkal és valódi intézményi döntéssel való rendezése.
3. **Médiahasználati jogok:** legalább a 29 `pending`, 4 `preview-only`, 35 közvetlen jogállás nélküli publikált és 233 hiányos alt-eset tételes felülvizsgálata. A 87 QR-t külön vizsgáljuk: funkciójuk szerint lehet szükség szöveges alternatívára, de nem töltünk be kitalált leírást.
4. **Próbacsomag:** csak jogosult és ellenőrzött új eredetikből, kis tételben. A szükséges képvariánsokat forrás–variáns kapcsolattal, mobil betöltési és összesített tárhelyteszttel készítjük.
5. **Intézményi kiadási kapu:** aláírt vagy nyilvántartott döntés, hozzájárulás (ha szükséges), ismert forrás, aktualitás és akadálymentességi felülvizsgálat után adható át telepíthető médiacsomag.

## Technikai és szervezeti korlátok

- A kiadási kör végig statikus HTML/CSS/JavaScript/JSON és FTP-kompatibilis marad; GitHub Actions vagy szerveroldali alkalmazás nem kell.
- Nem adunk új hivatkozást a régi iskolai domainre; QR-célok változását külön ellenőrizni szükséges.
- A médiaimportból származó szerkesztői „ellenőriztem” kijelentés **nem** intézményi engedély. Az új médiák metaadataiban az intézményi jóváhagyás jelzője továbbra is hamis.
- Az egyedi cím, alt és eredet nem készíthető el automatikusan tényként, ha a tényleges forrásfotó vagy engedély nincs átadva.
- A korábbi 628 fizikai fájlt az új v1.9.0 csomag változatlanul tartalmazza; tömeges médiahozzáadás nem történt.

## Következő, végrehajtható lépés

A `tools/tartalmi-hitelesites.html` oldalon a 55 szabálytétel helyi munkalapja exportálható és JSON-ból folytatható. A `tools/eszkoz-mediator.html` felület jogállás-szűrője a hiányzó, de publikált státuszú elemeket is megmutatja. Ezekből a kimenetekből, tényleges intézményi döntésekből és egy első, engedélyezett médiaforráscsomagból indítható a következő, immár valós médiabővítés.
