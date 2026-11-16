# Csanádi weboldal – v1.8.0 fejlesztési és tesztbeszámoló

**Alapverzió:** v1.7.0, módosítások megőrizve.  
**Kiadás:** `csanadi website v1.8.0.zip`  
**Dátum:** 2026. november 16.  
**Cél:** GitHub Pages tesztkörnyezet, később azonosan működő statikus FTP-tárhely; automatikus éles feltöltés nincs.

## Jóváhagyott feladatok

A felhasználó egyszerre választotta az **A+B+C+D** lehetőségeket:

- **A:** teljes és kompakt aloldalfejlécek, menü és görgetési állapot működése.
- **B:** a 31 szabály szerinti összes regisztrált aloldal tételes felülvizsgálata.
- **C:** médiaállományok jogállása, alternatív szövege és a közzétételi kapu további rendezése.
- **D:** a későbbi körülbelül hatszoros médiabővítés előkészítése, a korábbi szigorú sorrend és FTP-kompatibilitás megtartásával.

A fejlesztés közbeni új pontosítás: **az aloldalakon már görgetés előtt is a fejléc vízszintes közepén az iskola saját logója nyissa a menüt**. A „Menü”, valamint a „SPORT · TUDÁS · KÖZÖSSÉG” felirat ne jelenjen meg mellette. Görgetve ugyanaz a logó maradjon, kisebb fejlécben. A kezdőoldal működése változatlan.

## A – Fejléc és navigáció

1. A teljes és kompakt aloldalfejlécben **ugyanaz az eredeti Csanádi-címer** szerepel vízszintesen középen, akadálymentes megnyitó gombként. Kattintásra a közös főmenü nyílik meg.
2. Az aloldali fejlécből eltűnt a felesleges „Menü” gombfelirat és a „SPORT · TUDÁS · KÖZÖSSÉG” kísérőszöveg. A bal oldali duplikált logó a külön aloldali fejlécben rejtve van; a kezdőoldalon az eredeti márkaelem megmarad.
3. A fejléc **nem pusztán rögzített görgetési távolságnál** csukódik össze: megvárja, amíg a felső képváltó ténylegesen kikerül a látómezőből. Képváltó nélküli oldalakon külön görgetési küszöb működik.
4. A kétirányú állapotváltás holtsávot használ, hogy a fejléc a határ közelében ne villogjon.
5. A kereső és a témakapcsoló ikonja megmarad; az aloldali menü nyitott/csukott állapotát az `aria-expanded` jelzi. A kompakt fejléc a tartalmat nem fedheti el.
6. A logó menünyitó funkciója **csak az aloldalakra** vonatkozik. A kezdőoldal korábban jóváhagyott megjelenítése és navigációja nincs átírva.

## B – A 31 szabály és az aloldalak ellenőrzése

Az új `tools/build-rule31-worklist-v1-8.js` ellenőrzőprogram az eredeti, megőrzött szabálymátrixot egyenként veti össze a regisztrált 65 aloldal forrásával, útvonalával és hitelesítési jelzőjével.

| Státusz | Előfordulás | Értelmezés |
|---|---:|---|
| F | 260 | Forrásból igazolható feltétel |
| K | 260 | Közös implementáció; böngészőteszt még szükséges |
| V | 1241 | Vizuális, működésbeli vagy tartalmi ellenőrzés szükséges |
| N | 199 | Nem azonosítható releváns blokk; nem végleges mentesség |
| H | **55** | Forrásból látható hiány |
| **Összesen** | **2015** | **65 aloldal × 31 szabály** |

**Fontos megállapítás:** mind az **55 `H` státusz a 28. „Minőségellenőrzés” szabálynál van**, ahol az adott oldalon a `verifiedContent` jelző nincs hitelesítettre állítva. Ez **nem** jelenti azt, hogy az oldalak biztosan hibás tartalmat mutatnak, de intézményi szakmai hitelesítés nélkül nem minősíthetők igazoltnak. A jelzőket nem változtattuk át automatikusan.

Új, a ZIP-ben is szereplő fájlok:

- `dokumentacio/SZABALYOK_31_ALOLDAL_V1_8.json` – 65 oldal 31-31 státusszal, útvonallal és forrásfájllal.
- `dokumentacio/SZABALYOK_31_HIANYOK_V1_8.csv` – az 55 hiány tételes listája, kitölthető ellenőrző-, bizonyíték- és döntésmezőkkel.

Ez továbbra is **forrás- és szerkezetalapú ellenőrzés**, nem 65 oldal teljes vizuális megfelelőségének igazolása.

## C – Médiatár, jogállás és képleírás

1. A `tools/eszkoz-mediator.html` űrlapban új, elkülönített felhasználásijog-bizonyíték mezők szerepelnek: **jogosult**, **engedély/licenc**, **bizonyíték azonosítója**, **ellenőrző személy**.
2. Új fájl nyilvános közzétételét a szerkesztő **sem mentéskor, sem ZIP-előkészítéskor** nem engedi, ha a kifejezett jogellenőrzési nyilatkozat, valamely bizonyítékmező vagy a nyilvános kép alternatív szövege hiányzik.
3. Új, regisztrált médiatételnél a forrásadatait a médiatár JSON-ba írja. Az `institutionallyApproved:false` érték tudatosan jelzi: ez csak szerkesztői ellenőrzési nyilvántartás, nem intézményi jóváhagyás.
4. Az új **„Jog- és akadálymentességi munkalap CSV”** művelet fájlonként gyűjti a hiányos jogállásokat, alt-szövegeket és SHA-256 azonosítókat. A munkalapban üres mező várja az emberi ellenőrzőt, bizonyítékot, adatvédelmi alapot, javasolt alt-leírást és intézményi döntést.
5. A v1.7.0 korábbi QR-hivatkozásjavítása, 628 fájlos katalógusa, szerkesztési visszavonása, ZIP-exportja és tiltott régi domainre mutató linkek elleni ellenőrzése megmaradt.

A v1.8.0 audit változatlan, intézményi tisztázást igénylő kiinduló értékei:

| Felülvizsgálandó terület | Darab |
|---|---:|
| Fizikai assets-állomány | 628 |
| Médiatár-rekord | 114 |
| `pending` jogállás | 29 |
| `preview-only` jogállás | 4 |
| Publikáltnak jelölt, közvetlen jogállásregisztráció nélküli fájl | 35 |
| Hiányzó alt-szövegű kép/grafika | 233 |
| Auditjelzés (átfedő sorok lehetnek) | **301** |

A 233 képleírás-hiány között QR-kódok és esetleges dekoratív grafikák is szerepelnek. Ezeket nem szabad automatikusan tartalmi fényképnek tekinteni vagy valótlan képleírásokkal feltölteni.

## D – A médiatár-bővítés előkészítése

Részletesen frissült a `dokumentacio/MEDIA_BOVITESI_TERV_V1_8.md`:

- nem az összes képfájl számát kell automatikusan hatszorozni, mert jelenleg 353 reszponzív képváltozat is van;
- a 87 QR-kód nem önálló galériafotó;
- az új tartalmakhoz ellenőrzött eredet, jogalap, licenc, hozzájárulás, alt-szöveg, méret és hivatkozás szükséges;
- a bővítés **csak a tools/ és assets/ funkciók valós böngészős ellenőrzése és a külön intézményi jóváhagyás után** kezdhető;
- a v1.8.0 **nem** tartalmaz új tömeges médiabővítést.

## Végrehajtott tesztek

| Teszt | Eredmény |
|---|---|
| Teljes statikus kiadási ellenőrzés | **41/41 sikeres** |
| Fejléc állapotváltás külön regressziós esetei | **7/7 sikeres** |
| Médiakezelő jogosultsági/validációs tesztje | **8/8 sikeres** |
| Teljes projektadatú export- és QR-átnevezési próba | **6/6 sikeres** |
| 65×31 szabálymátrix feldolgozása | **2015/2015 tétel** |
| Nyilvántartott/fizikai médiaállomány | **628/628** |
| Régi iskolai honlapra mutató működő hivatkozás a statikusan vizsgált kódban/JSON-ban | **0** |
| ZIP sértetlenség | Ellenőrzés a csomagolás után |

## Ami nem készült el, és külső feltételek

1. **Valódi v1.8.0 böngészős vizuális teszt:** a helyi böngészőmotor a futtatási környezetben rendszerengedély miatt nem indítható. Ezért a középső logó pontos megjelenését és a menü minden mobil/asztali interakcióját a telepített tesztoldalon még ellenőrizni kell; a fenti sikeres tesztek forrás- és logikai tesztek.
2. **31 szabály emberi jóváhagyása:** az 55 hiányzó tartalmi hitelesítés és a többi vizuális feladat addig nyitott, amíg az illetékes személy nem vizsgálja meg.
3. **Médiák tényleges jogosultsága:** a 301 auditjelzés nem tüntethető el bizonyíték nélküli automatikus jóváhagyással; a CSV-munkalap az emberi felülvizsgálatot készíti elő.
4. **QR-kódok FTP-domainváltáskor:** a jelenlegi képek a GitHub Pages tesztcímeit tartalmazzák, ezért az éles intézményi domainre költözéskor QR-csere szükséges.
5. **Nagyarányú médiabővítés:** a korábban vállalt sorrend miatt még nem kezdhető meg automatikusan.

**Nincs GitHub Pages-, FTP- vagy más szerverre végrehajtott feltöltés.** A ZIP statikus környezetben használható, a Bootstrap továbbra is kizárólag verzióhoz kötött CDN-ről töltődik; nincs PHP-, Node- vagy GitHub Actions-függőség.
