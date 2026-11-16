# Csanádi weboldal – v1.2.0 fejlesztési és tesztbeszámoló

**Kiindulás:** a felhasználó által feltöltött `csanadi website v1.1.0(1).zip` csomag. Az élő GitHub Pages-oldalt és az iskolai FTP-tárhelyet nem módosítottuk.

## Kért fejlesztések és teljesítésük

1. **A térképet tartalmazó oldal teljes újratervezése:** a `megkozelites-es-tanulas.html` teljes megjelenési szerkezete új. Új fejléc, nyitóblokk, címinformáció, útvonaltervező felület, térképkártya, tartalmi kártyák és reszponzív elrendezés készült. A látványt az új `css/arrival-reimagined.css` kezeli. A működő funkciókhoz szükséges elemazonosítók megmaradtak.
2. **Az egész honlaphoz illeszkedő gombok:** új `css/unified-actions-v1.css` közös kezelőstílus az SPA-felületen és valamennyi önálló HTML-segédoldalon. A fő menüvezérlő és a képváltó nyilai megtartják saját funkcionális alakjukat. Egységesebb fókuszjelzés, érintési célterület és lekerekítés.
3. **Korábbi hibák javítása:** a verziófrissítési értesítés verziószámai összhangba kerültek. A „Később” gomb bezárja az értesítést; ugyanazt a verziót egy böngészőmunkameneten belül nem jelzi újra, és a jelzés 12 másodperc után önállóan eltűnik.
4. **Általános technikai rendbetétel:** a változtatott belépőfájlok friss verzióparamétert kaptak. Az előző kiadás többi működő funkcióját és tartalmát megőriztük.

## Az új megközelítési és tanulástámogatási oldal tartalma

Az előző elrendezést nem tartottuk meg. A teljesen újjáépített oldalon továbbra is elérhető a tíz tartalmi terület: térképes megközelítés, felvételi lépések, tanulási célok, sportmérföldkövek, diákmédia, fogadóórák, tanulási eszközök, akadálymentes út, zöld iskolába járás és változásnapló. A szakaszokra ugró tízlinkes blokk és a felesleges „Vissza a kezdőlapra” gomb nincs jelen. A térkép csak a látogató külön művelete után töltődik be. A beágyazott SPA-nézet használatához szükséges kommunikáció megmaradt.

## Automatikus ellenőrzés

Az új `tools/test-release-v1-2.js` vizsgálat eredménye a `dokumentacio/AUTOMATIKUS_TESZT_V1_2.json` állományban található.

| Vizsgálat | Eredmény |
|---|---|
| 95 JSON-fájl feldolgozható formátuma | Sikeres |
| 50 JavaScript-szintaxisvizsgálat | Sikeres |
| 65 regisztrált SPA-oldal belső útvonalainak ellenőrzése | Sikeres |
| Az új oldal 41, a vezérlőprogram által használt elemazonosítója | Hiánytalan |
| A tíz megközelítési/tanulási tartalmi modul | Megtalálható |
| Egységes gombstílus valamennyi önálló HTML-felületen | Megtalálható |
| Verzióparaméter és gyorsítótár-verzió egyezése | Sikeres |
| Korábbi intézményi domainre vezető hivatkozás az új aloldalban | Nem található |

## Mi nincs igazolva vagy maradt nyitva?

- **Böngészős, szemrevételezett vizuális ellenőrzés:** az elérhető tesztkörnyezetben nem sikerült megbízhatóan végrehajtani. A tényleges képernyős mobil-, tablet- és asztali ellenőrzés szükséges az élesítés előtt.
- **Külső térkép és szolgáltatások:** az OpenStreetMap és más külső szolgáltatások elérhetősége, betöltése és jogi megfelelősége külön ellenőrzendő.
- **A korábbi 31 szabály teljes körű igazolása:** a korábbi `ALOLDALAK_31_SZABALY_ELLENORZES.csv` és leírás érvényes nyitott ellenőrzési alap marad. Az új megjelenés önmagában nem bizonyítja, hogy minden szabály minden aloldalon hibátlan.
- **Tartalmi hitelesítés és médiák joga:** a korábban jelzett ellenőrizendő intézményi adatok és képjogok nem lettek automatikusan hitelesítve.
- **Kiadás:** az éles honlapra nem történt automatikus feltöltés; a ZIP a GitHub Pages-re vagy statikus FTP-tárhelyre külön helyezhető ki. A Bootstrap továbbra is verzióhoz kötött CDN-ről töltődik, nem része helyi csomagnak.

## Kiadási ellenőrzés

Kiadás előtt újra futtatandó: `node tools/test-release-v1-2.js`, majd `node tools/build-release-manifest.js`; ezt követi a ZIP sértetlenségi ellenőrzése. Az új verzió neve: `csanadi website v1.2.0.zip`.
