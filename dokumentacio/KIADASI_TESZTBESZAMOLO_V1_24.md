# Csanádi Sportiskola – v1.24.0 teljes kiadási és tesztbeszámoló

**Dátum:** 2026. november 16.  
**Projekt:** Csanádi Sportiskola, statikus FTP-kompatibilis JSON-alapú SPA  
**Kiindulópont:** a korábbi teljes v1.21.0 kiadás  
**Fejlesztési sorrend:** v1.22.0 → v1.23.0 → v1.24.0  
**Átadott fájl:** `csanadi website v1.24.0.zip` (teljes kiadás, nem részleges javítócsomag)

## 1. Megrendelés és teljesítés

A teljes meglévő honlap, annak menü- és aloldalrendszere, médiaállománya, szerkesztői segédoldalai, dokumentumai és korábbi funkciói megmaradtak. Az A–J választások valamennyi verzióban együttesen szerepeltek, és a következő két kör az előző teljes kiadására épült. **Új önálló funkció nem készült**; a meglévő funkciók javultak és gyorsultak. A statikus HTML/CSS/JavaScript/JSON működés, a kötelező `json/structure.json` és `json/config.json`, valamint a hash-alapú útvonalak megmaradtak.

| Betű | A felhasználó által kiválasztott meglévő funkció | Elvégzett javítás/optimalizálás |
|---|---|---|
| A | Mobilos szakaszmenü | Álló/fekvő nézet és képernyőméret váltásakor frissülő pozicionálás és görgetési távolság; az összes megfelelő aloldalon működő meglévő megjelenítés megtartása. |
| B | Szakaszhivatkozások görgetése | Változó magasságú, rögzített fejlécet figyelembe vevő célpozíció; a fejezetcím nem bújik a fejléc alá. |
| C | Részletek kinyitása/becsukása | Az olvasási hely megőrzése a szövegmagasság változásakor. |
| D | Térképes aloldal | A beágyazott térkép magasságának és a szakaszok célpozíciójának összehangolása, indokolatlan magasságüzenetek visszafogása. |
| E | Mobilos sötét/világos téma | A rendszerpreferencia és a kézi választás újraértékelése az oldalra visszatéréskor; véletlen világos módra ugrás elleni védelem. |
| F | Ismétlődő szakaszcímek | A szakaszmenü azonos címeinél szülőszakasz szerinti, megkülönböztethető feliratok. |
| G | JSON-tartalom frissülése | Szakaszmenü újraszámítása; lehetőség szerint a kijelölt/aktív rész, a fókusz és az olvasási hely megőrzése. |
| H | Billentyűzet és képernyőolvasó | Fel/le/elejére/végére navigáció meglévő szakaszmenükben, hozzáférhető állapotjelzés, fókuszhelyreállítás. |
| I | Médiák betöltése | Az első képernyős fő kép előnyben részesítése, a további média késleltetett betöltése, korlátozott és adatforgalom-kímélő előtöltés. |
| J | Meglévő diagnosztika | Kiadási manifest- és cache-verzióeltérés jelzése a már meglévő diagnosztikában. |

Korábbról külön jelezett követelmények, amelyeket a módosítások tiszteletben tartanak: nem jelenhet meg önálló lebegő „Lap tetejére” gomb; mobilon egyetlen, lent elhelyezett logó marad; a nyitott és összecsukott menü használata logóval történik, nem külön hamburgerikonnal; a `SPORT · TUDÁS · KÖZÖSSÉG` szöveg igazítása és a menü eltűnése utáni elrendezés nem romolhat. Ezek a korábban kialakított fejléc működésének regressziós követelményei, nem új funkciók.

## 2. Három egymásra épülő teljes verzió

| Verzió | Állapot | Kiemelt fejlesztési mélység | Ellenőrzések |
|---|---|---|---|
| **v1.22.0** | Teljes A–J első javítási kör | A mobil szakaszmenü, dinamikus görgetés, témaszinkron, térképes magasság, médialusta betöltés és diagnosztika alapjavításai | 194 programozott funkcióellenőrzés; 1081/1081 helyi HTTP-ellenőrzés. |
| **v1.23.0** | A v1.22.0 teljes tartalmára épül | Szakaszmenü-kezelés és fókuszhelyzet további stabilizálása, hatékonyabb eseménykezelés | 197 programozott funkcióellenőrzés; 1088/1088 helyi HTTP-ellenőrzés. |
| **v1.24.0** | A v1.23.0 teljes tartalmára épül | Élő JSON-újrarajzolásnál olvasási hely/fókusz visszaállítása és végső regresszióellenőrzés | 199 programozott funkcióellenőrzés, 13/13 sikeres futtatóprogram, 1096/1096 helyi HTTP-ellenőrzés. |

A ZIP kizárólag a **legutolsó teljes v1.24.0** verziót tartalmazza. Ennek része mindhárom fejlesztési kör minden megőrzött és javított eleme.

## 3. Teljes forrás- és állományellenőrzés

- **65/65** regisztrált tartalmi oldal meglétét és JSON-útvonalát ellenőriztük.
- **628/628** tényleges médiaállomány egyezik a médiakatalógussal; **87** QR-állomány.
- Hiányzó média: **0**; árva katalógusbejegyzés: **0**; katalogizálatlan állomány: **0**; integritási eltérés: **0**.
- A v1.24.0 kiadási teszt **46/46** részellenőrzésen átment; köztük 23 HTML-, 124 JSON- és 154 JavaScript-fájl leltározása a teszt pillanatában.
- A v1.24.0 célzott szakaszmenü-teszt **46/46**, térképes integrációs teszt **13/13**, témaszinkronteszt **12/12**, meglévő funkciók tesztje **22/22**, navigációs fa ellenőrzése **8/8**: mind sikeres.
- A v1.9–v1.11 korábbi mobilnavigációs, regressziós, fejléc-, munkalista-, médiakezelő- és exporttesztjeit ismét lefuttattuk. Egyikben sem keletkezett új hiba.
- A három változat statikus HTTP-kiszolgálóról is elérhető volt: v1.22 **1081/1081**, v1.23 **1088/1088**, v1.24 **1096/1096** sikeres lekérés.
- A pontos programonkénti parancsok, futásidők és kimenetek: `dokumentacio/TESZTNAPLO_V1_24.md`.

## 4. Hibakeresés és javítási napló

1. A mobilos szakaszmenü korábbi megvalósításában a fejléc magasságának és a készülék tájolásának változása rossz célgörgetést okozhatott. Dinamikus fejléc-offset és újraszámított szakaszpozíció került be; célzott teszt sikeres.
2. A kinyíló tartalmi panelek, az élő JSON-újrarajzolás és a mobil szakaszlista megváltozása elveszíthette az olvasási helyet/fókuszt. Állapotmegőrzés és fókuszvisszaállítás készült; célzott teszt sikeres.
3. A térkép iframe korábban akkor is továbbíthatott magassági adatot, ha a magasság ténylegesen nem változott. Változásfüggő üzenetküldés és méretfrissítés készült; térképes teszt sikeres.
4. A mobilról visszatérésnél a témaválasztás újraértékelése javult; témaszinkronteszt sikeres. Tényleges, többféle mobilkészüléken végzett kézi próba még nincs igazolva.
5. A v1.24 HTTP-tesztkliens 12 párhuzamos kérésnél Node.js `undici` belső állapothibával megszakadt. A **tesztkliens** párhuzamosságát 4-re csökkentettük, majd ugyanaz a teljes ellenőrzés **1096/1096** sikerrel lefutott. Ezt nem minősítjük honlaphibának.

## 5. Éles weboldal külön vizsgálata

Az éles `https://vdi06.github.io/csanadi-website/` oldalt böngészőből megnyitottuk 2026. november 16-án. A ténylegesen betöltött állomány a **v1.18.0** verziót jelezte; tehát **nem ez a v1.24.0 kiadás van még publikálva**. A nyitóképernyő, a logóvezérelt főmenü és a térképes aloldal megnyílt. A régi térképes nézetben az önálló „Vissza az oldal tetejére” gomb még jelen volt. A v1.24.0 helyi forrásban a korábbi eltávolítás megmaradt; az éles felületen az új ZIP feltöltése után ellenőrizhető.

**Nem elvégzett ellenőrzések:** a v1.24.0 teljes, tényleges mobilböngészős érintés-, képernyőolvasó- és többeszközös vizuális tesztje; a publikált v1.24.0 éles végpont tesztje (mert a ZIP-et nem töltöttük fel). Ezekről nem állítunk sikert.

## 6. Ütemezett, élő webhelyteszt

A külön automatizálás minden nap **06:00-kor, Europe/Budapest időzónában** vizsgálja a ténylegesen közzétett webhely aktuális állapotát, minden funkcióra kiterjedően; nem feltételezi, hogy a legújabb helyi ZIP van kint. A következő futás 2026. november 17-én 06:00-kor várható. **A csomag készítésekor nem volt befejezett ütemezett futás**, ezért az automatikus futás eredményét nem találtuk csatolhatónak, és sem üres fájlt, sem kitalált eredményt nem építettünk a kiadás diagnosztikájába. A következő kiadásnál a legfrissebb valós futás beszámolója csatolható, ha addig elkészül.

## 7. Statikus FTP-kompatibilitás, megőrzés, külső feltételek

- A teljes oldal továbbra is kizárólag statikus állományokból működik; nincs szüksége PHP-ra vagy Node.js-re a célkiszolgálón.
- A felhasználói oldal nem épít kizárólag GitHub Actionsre vagy GitHub Pagesre; a hash-útvonalak statikus FTP-tárhelyen is működhetnek.
- A Bootstrap csak **verziórögzített CDN**-ről töltődik, nincs helyi Bootstrap-csomag. Ehhez hálózati/CDN-elérés szükséges.
- A külső térkép, videó vagy más beágyazás hálózati szolgáltatását a webhely nem tudja garantálni.
- A `tools/` segédoldalak, a teljes `assets/` állomány és a működő JSON-tartalmak a kiadásban megmaradnak.
- Az új ZIP nem lett automatikusan publikálva, a használó jóváhagyásáig az éles honlap változatlan.

## 8. Következő körre pontosan tíz választható javaslat – csak meglévő funkciókhoz

A. A meglévő mobilos szakaszmenü nyitási/bezárási átmeneteinek simítása gyengébb készülékeken.  
B. A meglévő szakaszokra ugrás pontosságának összevetése különböző méretű mobilfejlécekkel.  
C. Részletek megnyitásakor a meglévő görgetési állapot tesztelése nagyon hosszú aloldalakon.  
D. A meglévő térképes aloldal betöltési és magasságfrissítési műveleteinek további visszafogása.  
E. A meglévő világos/sötét témaváltás egységesítése Android- és iOS-böngészőkben.  
F. Azonos című, meglévő szakaszok képernyőolvasós megkülönböztetésének finomítása.  
G. A meglévő JSON-időzített frissítés görgetési és fókuszállapotának stressztesztje.  
H. A meglévő asztali és mobil menük billentyűzettel történő teljes körbejárhatóságának javítása.  
I. A meglévő képgalériák és dokumentumelőnézetek betöltésének további adatforgalom-kímélése.  
J. A meglévő diagnosztika verzió-, média- és cache-ellenőrzési hibajelzéseinek egyértelműsítése.

**Választható együtt: A+B+C+D+E+F+G+H+I+J.** A következő alkalommal is három, egymásra épülő, egyenként teljes megőrzött kiadás és tételes tesztnapló készíthető.
