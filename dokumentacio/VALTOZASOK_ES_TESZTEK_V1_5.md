# Csanádi weboldal – v1.5.0: átfogó javítás és a 31 aloldali szempont felülvizsgálata

**Dátum:** 2026. november 16.  
**Kiinduló csomag:** a helyi v1.4.0 teljes állománya  
**Átadott eredmény:** `csanadi website v1.5.0.zip`  
**Közzététel:** nem történt; a GitHub Pages és az intézmény FTP-tárhelye változatlan.

## 1. Mi készült el?

1. **Aloldali főmenü:** a fejléc `Menü` gombja most közvetlen eseménnyel hívja a főmenüt. Nem függ a kezdőoldali vizuális indítógomb DOM-helyétől. Megmaradt a v1.4.0 oldalváltás közbeni indítómegőrzése, a teljes/kompakt fejléc, az ARIA-állapotkövetés és a mobilos keresőgomb.
2. **Kompakt fejléc:** a ragadós felső sáv aloldalon továbbra is megőrzi a kezdőoldalra vezető iskolai logót, a menünyitást, a keresést és a témaváltást. Mobilon csökken a magassága, a tartalom szakaszai scroll-margint kapnak.
3. **Térképes oldal üres fejlécének javítása:** a beágyazott térképes/tanulási oldalon az üres `global-hero` eddig akár 458 pixel magas sötét üres sávot hagyhatott. Az üres elem most nem foglal helyet; az érdemi tartalom közvetlenül az iskolai fejléc után kezdődik.
4. **Teljes oldalon következetesebb középvonal:** az aloldali címek, szakaszfejlécek, bevezetők, vezérlő- és gombcsoportok, gyorselérések és kártyarácsok vízszintes igazítását közös szabályok egységesítik. A lábléc csoportjai is középre rendeződnek.
5. **Újratervezett térképes oldal finomhangolása:** középre kerül a hero főtartalma és a címkék, a címkártya, a térképes útvonalválasztó gombok, a modulcímek, a szűrősorok, az eszközök és az állapotsorok. A kétoszlopos, aszimmetrikus hero helyett középtengelyes, függőleges bevezető működik.
6. **Olvashatóság megőrzése:** a hosszú leíró bekezdéseket, felsorolásokat, táblázatokat és az űrlapok mezőcímkéit **nem** igazítottuk kényszeresen középre. Ezek balra zártak maradnak, de a befoglaló tartalmi egység középen helyezkedik el. A logó–kereső–menü fejlécben szándékosan két oldalra rendeződik, hogy a navigáció egyértelmű maradjon.
7. **Felvételi ellenőrzőlista:** a jelölőnégyzetet a `change` esemény alatt már nem távolítja el és építi fel újra a program. A jelölés azonnal látszik, helyileg mentődik, az állapotszöveg frissül. A „Pipák törlése” továbbra is működik.
8. **Tanulási célok:** ugyanezt a stabil jelölésfrissítést alkalmaztuk az egyéni tanulási célok teljesítettségére. A cél hozzáadása és törlése megmaradt.
9. **Frissítési értesítés:** az új verziót jelző banner csak akkor jelenhet meg, ha a szerver által adott **valóban magasabb** számozott kiadás. Egy régebbi, köztes vagy eltérő gyorsítótári konfiguráció önmagában nem vált ki értesítést. A „Később” és „Frissítés” műveletek változatlanok.
10. **Frissített fájlverziók:** a kezdőoldali és térképes erőforrások v1.5.0 azonosítót kaptak. A szolgáltatásmunkás a központi `cacheVersion` alapján külön gyorsítótárat használ.

## 2. A 31 aloldali felülvizsgálati terület – elvárt és megfigyelt működés

Az alábbi lista a projektben megőrzött **31 ellenőrzési témát** követi. Nem áll rendelkezésünkre mind a 31 eredeti C-opció teljes, szó szerinti megfogalmazása. Ezért az alábbi megállapításokat nem szabad mindegyik szabály végleges teljesítési igazolásának tekinteni. Az egyes oldalak 65×31 mezős vizsgálati táblázata: `dokumentacio/ALOLDALAK_31_SZABALY_ELLENORZES.csv`.

| # | Vizsgált terület | Elvárt működés | Eredmény és nyitott ellenőrzés |
|---:|---|---|---|
| 1 | Általános elrendezés | Középre rendezett, túlcsordulásmentes tartalmi egységek | **Javítva a CSS-ben.** Telefonos/asztali vizuális jóváhagyás még szükséges. |
| 2 | Oldalbevezető | Rövid, informatív cím és megfelelő hero | Korábbi képes bevezető megtartva, felirata v1.5-ben középre igazítva. |
| 3 | Tartalmi szerkezet | Minden regisztrált oldal beolvasható, jól tagolt | **65/65 oldal, 108 JSON állomány szintaktikailag érvényes** a teszt pillanatában. |
| 4 | Szakasznavigáció | Hosszú oldalon használható, de nem erőltetett navigáció | Szakaszpozíciók figyelembe veszik a fejlécet; a korábban kifogásolt 1–10-es ugrólinksort nem állítottuk vissza. |
| 5 | Kártyák és panelek | Egységes térközök, kiegyensúlyozott rács | Közös középvonal és max. szélesség; minden kártya végső képi ellenőrzése nyitott. |
| 6 | Képek és videók | Helyes képarány és kezelhető galéria | A publikus korábbi verzió galéria-kattintása működött; a médiahasználati jogok nem igazoltak automatikusan. |
| 7 | Szöveges tartalom | Jól olvasható, tagolt szöveg | Címek középre, hosszú szövegtörzsek balra. **55 oldal tartalmilag még nem hitelesített.** |
| 8 | Gombok és linkek | Valódi, arculatos, működő vezérlők | Egységes prémium gombszabályok. **0 régi honlapra mutató kattintható URL**, **0 hiányzó helyi HTML-fájlhivatkozás** a statikus audit szerint. |
| 9 | Animációk | Képváltás szabályozható, csökkentett mozgás tiszteletben tartva | A régi élő verzión a képváltó tovább- és szünetgombja működött; a CSS tartalmaz `prefers-reduced-motion` szabályokat. |
| 10 | Mobilos elrendezés | Kisebb fejléc, érintésbarát gombok, oldalirányú scroll nélkül | Reszponzív szabályok javítva; **v1.5-ös telefonos böngészőteszt még nem történt**. |
| 11 | Kapcsolódó tartalmak | Csak feloldható belső útvonalak | A bejegyzett oldalak közötti hivatkozások statikus ellenőrzése sikeres. |
| 12 | Keresés és szűrés | Gyors, releváns keresés | A régi élő verzión a globális keresés `felvételi` kifejezésre 11 találatot, a dokumentumszűrő 2-t adott. |
| 13 | Oldalak felosztása | Ne legyen végtelen üres tér vagy indokolatlan szekció | A térképes beágyazás **458 px-es üres sávja megszüntetve**; a tényleges oldal 10 hosszabb modulja további szerkesztői felülvizsgálatot kívánhat. |
| 14 | Aloldalak közötti navigáció | Főmenü, logó, útvonaljelző és böngésző Vissza | A publikus régi menü hibáját azonosítottuk; a v1.5 önálló `menu-toggle` eseménye statikusan ellenőrzött, éles böngészőben még nem. |
| 15 | Oldalváltás | Hash-SPA útvonalak, visszalépés, pozíciókezelés | Az útvonalváltás élő mintája működött; az új menü- és hero-kezelő kód beépítve. Teljes navigációs teszt nyitott. |
| 16 | Dokumentumok | Megtalálhatók, szűrhetők, előnézetük elérhető | A publikus szűrés működött; **összes PDF képi és megnyithatósági tesztje nyitott**. |
| 17 | Események | Naptárnézetek és események kezelhetők | A nyilvános naptár hónap/hét váltása működött; ICS-exportot nem próbáltuk. |
| 18 | Táblázatok | Keskeny képernyőn sem törjenek szét | Van reszponzív túlcsordulás-kezelés; az összes speciális rendező/lapozó nem került élő próbára. |
| 19 | Közlemények | A közzétételi időszak és relevancia helyes | JSON-források feldolgozhatók; a dátumfüggő megjelenítés valamennyi esete külön tesztelendő. |
| 20 | Hosszú listák | Szűrés, keresés és lapozás megőrzése | Publikus galéria 138 képről 69-re szűrt egy kategóriával; a megnyitott kép bezárható volt. |
| 21 | Hiányzó tartalom | Kulturált üres állapot és hibás blokkok elszigetelése | Vannak üresállapot-szövegek; 55 tartalmi hitelesítési hiány nem tekinthető megoldottnak. |
| 22 | Frissítések | Valós új kiadásra figyelmeztessen, magától ne ragadjon be | A verzióösszehasonlítás javítva. Az új kiadás utáni valós frissítési ciklus külön ellenőrizendő. |
| 23 | Részletes tartalmak | Mélyebb oldalak, hosszabb leírások működnek | 65 oldal szerkezete ellenőrizve, a szövegek szakmai aktualitása külön feladat. |
| 24 | Külső tartalmak | Engedélyezett és egyértelműen jelzett szolgáltatások | A térkép csak gombra indul; külső OpenStreetMap/BKK/Google elérhetősége a szolgáltatótól függ. |
| 25 | Űrlapok | Beviteli hibák kezelése, helyi adatok megőrzése | **Felvételi pipa, mentés, törlés, cél hozzáadása és cél kipipálása** helyi DOM-próbán sikeres. Más űrlapok valós próbája nyitott. |
| 26 | Oldalműveletek | Minden látható gomb valódi műveletet végez | Élő minta alapján keresés, témaváltás, képváltó, galéria és szűrők működtek; teljes gombonkénti bizonyítás még nincs. |
| 27 | Tanévek és archívumok | Aktuális és korábbi adatok elkülönülnek | Az adatfájlok szintaktikailag rendben; tanévenkénti intézményi hitelesítés nyitott. |
| 28 | Minőségellenőrzés | Hibák automatizált felismerése | **25/25 statikus és egységszintű teszt sikeres**. A vizuális regresszió más kategória. |
| 29 | Rövid áttekintés és teljes dokumentumnézet | Ne ismételjen feleslegesen tartalmat | Közös oldalszerkezet megtartva; valamennyi részletes dokumentumnézet képi ellenőrzése nyitott. |
| 30 | Intelligens felső képváltó | Képek, lapozás és szüneteltetés | Élő régi oldalon működött. A v1.5 hero-felirat középre rendezve. |
| 31 | Összecsukódó fejléc | Görgetéskor kompakt, menü és keresés használható | A publikus régi változatban hiba volt; az új eseménykezelés és CSS javított, **v1.5 valós kattintási próbája feltöltés után szükséges**. |

## 3. Reprodukálható tesztek és darabszámok

Futtatási mód: `node tools/test-release-v1-5.js` a honlap gyökeréből.

- **25/25 sikeres** statikus/egységszintű ellenőrzés, **0 teszthiba**.
- **65** érvényes és külön útvonallal regisztrált JSON-tartalmi oldal.
- **23 HTML-fájl**, **72 JavaScript-fájl**, **108 JSON-fájl** a teszt pillanatában (a vizsgálat saját JSON-jelentése is beleszámít).
- **0** régi `csanadi-bp.edu.hu` címre mutató HTML-hivatkozás vagy tartalmi URL.
- **0** nem létező regisztrált belső útvonal és **0** hiányzó helyi HTML-erőforrás az ellenőrzött `src` és `href` attribútumok között.
- **Minden JavaScript** szintaktikailag ellenőrizve; a JSON-állományok megnyithatók.
- A 65×31 szempontrács aktuális, korábbi állapota: **F=260, K=260, V=1241, N=199, H=55**. Ezek **nem 2015 sikeres működési próbát jelentenek**. A V és K státuszok még vizuális/viselkedési ellenőrzést igényelnek.

Az eredmény géppel feldolgozható formában: `dokumentacio/AUDIT_V1_5.json`.

## 4. Böngészőben ténylegesen látott eredmények – fontos verziókülönbség

A jelenlegi GitHub Pages-kiszolgálás a böngészős ellenőrzéskor még `script.js?v=1.2.0` állományt töltött be. **Az alábbiak ezért a nyilvános, régebbi verzió megfigyelései**, nem az új ZIP átfogó éles tesztjei:

- Hibás: aloldali `Menü` kattintása nem nyitotta meg a főmenüt; a valódi menüindító hiányzott a DOM-ból.
- Hibás: a térképes beágyazás felett **458 px** üres hero-terület jelent meg.
- Hibás: a felvételi ellenőrzőlista első pipájára kattintva az állapot **0 / 5** maradt.
- Működött: globális keresés, dokumentumszűrő, témaváltás, sportkártya-szűrés, galériaszűrés és képnézegető, eseménynaptár nézetváltása, felső képváltó következő/szüneteltető vezérlője.
- A térképes oldalon a 10 funkció kerete betöltődött; a külső térkép tényleges hálózati megjelenését nem próbáltuk ki.

## 5. Mi maradt nyitott, mihez szükséges külső feltétel?

1. A **v1.5.0 csomagot nem telepítettük** sem a GitHub Pages-re, sem a statikus iskolai FTP-re. Emiatt az új CSS és JavaScript **valódi mobilos és asztali kattintási / képi eredményét nem állítjuk bizonyítottnak**.
2. Az összes aloldal teljes képi áttekintése különböző képernyőszélességeken, a billentyűzetes fókuszrend, a kontrasztértékek és a WCAG 2.2 AA megfelelés részletes mérése még nyitott.
3. **55 tartalmi oldal** nincs intézményi hitelesítésként megjelölve; az eredeti kép- és dokumentumjogosultságok nem ellenőrizhetők pusztán kóddal.
4. Külső szolgáltatások: a **Bootstrap 5.3.9 CSS és JavaScript verzióhoz kötött CDN**-ről érkezik, helyi Bootstrap-példány nincs. Az OpenStreetMap és a külső hivatalos oldalak működéséhez internet kell.
5. A 31 eredeti C opció szó szerinti, teljes listája hiányzik; a témakategóriákra épülő audit nem helyettesíti a specifikáció egyenkénti jogerős ellenőrzését.
6. A `tools/` segédoldalak teljes prémium-arculati és az `assets/` média-/dokumentumkezelési, korábban megkezdett nagy fejlesztési csomagjának maradéktalan lezárását ez a vizsgálat **nem bizonyítja**. Az assets állományának hatszoros bővítését nem kezdtük meg.

## 6. Feltöltés és visszaállás

1. Mentsd meg a most élő ZIP-et külön biztonsági példányként.
2. A ZIP **tartalmát** bontsd ki a `csanadi-website` repository gyökerébe (ne egy további névvel ellátott almappába). Az iskolai FTP-t egyelőre ne írd felül.
3. A GitHub Pages közzététel után végezd el a teljes és kompakt aloldali Menü, a kereső, a logós visszajutás, a felvételi pipák, az űrlapok, a térképes blokk és a többféle képernyőszélesség próbáját. A cache-váltás után frissíts teljesen.
4. Ha a végfelhasználói próba hibát mutat, állítsd vissza a külön megőrzött előző kiadást.

**Végső megállapítás:** a v1.5.0 forrás- és helyi interakciótesztjei sikeresek, a két böngészőben reprodukált hiba és a középre igazítás célzott javítást kapott, de a teljes 31 szabály **nem nyilvánítható még minden aloldalon bizonyítottan teljesültnek**. Ez a különbségtétel része a minőségellenőrzésnek.
