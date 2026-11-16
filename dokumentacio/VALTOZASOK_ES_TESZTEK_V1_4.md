# Csanádi weboldal – v1.4.0: aloldali fejléc és menüjavítás

**Kiindulás:** v1.3.0. **Kérés:** az aloldalakon nem megfelelő a menü megjelenése, sem teljes, sem görgetéskor kompakt fejlécben. Az élő honlapot és az iskolai FTP-tárhelyet nem módosítottuk.

## A hiba ténylegesen azonosított oka

Az eredeti főmenü-indító gomb (`orbit-open`) a kezdőoldal képes nyitófelületébe került. Az aloldal megnyitásakor a képes nyitófelület tartalmát lecserélő `replaceChildren` a gombot is eltávolíthatta. Az aloldali fejléc új menügombja azonban éppen erre a már nem létező elemre próbált kattintást továbbítani. Emiatt a főmenü nem nyílt meg. Ezzel párhuzamosan egy korábbi mobilos CSS a fejléc keresőgombját is elrejtette, és több megjelenési szabály versengett a mobilmenü láthatóságáért.

## Elkészült módosítások

1. Az `js/app.js` oldalváltáskor az eredeti menüindítót a nyitófelület cseréje **előtt biztonságos DOM-helyre mozgatja**. Kezdőoldalra visszatérve a nyitókép megfelelő helyére állítja vissza.
2. Ha nyitott főmenü mellett történik oldalváltás, a menügomb visszahelyezése az aktuális, élő DOM-szerkezetet veszi alapul, nem egy eltávolított képváltóelemre hivatkozik.
3. A `js/subpages-v1.js` aloldali Menü gombja szöveges címkét, `aria-haspopup` és naprakész `aria-expanded` állapotot kapott.
4. Az új `css/subpage-header-fix.css` a teljes és kompakt aloldali fejlécet egyformán kezeli; biztosítja a **Menü** és **Keresés** megjelenését, elrejti a kettős mobilmenü-indítót, és csökkenti a fejléc túlzsúfoltságát a kisebb képernyőkön.
5. A v1.4.0-hoz igazított JavaScript-, stílus- és gyorsítótár-verziók csökkentik a régi kód böngészőben maradásának kockázatát.
6. A kezdőoldal korábban jóváhagyott vizuális navigációjának funkcionális felépítése változatlan; az új CSS az aloldali `cs-inner-page` állapothoz kötött.

## Tesztek

- `tools/test-subpage-menu-v1-4.js`: **13/13 sikeres** statikus regressziós ellenőrzés – JS-szintaxis, a menügomb megőrzése oldalváltáskor, visszahelyezés, fejléci Menü/Keresés, reszponzív stílusbetöltés és gyorsítótár-verzió.
- `tools/audit-all-pages-v1-3.js` ismételt futtatása: 65 oldal, 193 belső útvonalhivatkozás, 0 régi domaines hivatkozás az ellenőrzött forrásokban.
- A ZIP integritását átadás előtt külön ellenőriztük.

## Nyitott ellenőrzések és külső feltételek

- **A böngészős vizuális és kattintási teszt nem volt végrehajtható a helyi Chromium indítási hibája miatt.** A 13 sikeres forráskód-ellenőrzés nem helyettesíti a valós telefonos/asztali próbát.
- A menü tényleges nyitását, zárását, fókuszvisszaadását, görgetését és a kezdőoldal–aloldal–kezdőoldal útvonalváltást az élesítés előtt külön ellenőrizni kell.
- A korábbi 31 aloldali szabály és 55 intézményi tartalom hitelesítési feladata nem lett lezártnak nyilvánítva.
- A honlap Bootstrap 5.3.9 CSS/JavaScriptet továbbra is verzióhoz kötött külső CDN-ről tölti. Saját PHP- vagy Node.js-szerver nem szükséges; a rendszer statikus FTP-tárhelyre továbbra is alkalmas.

**Új csomagnév:** `csanadi website v1.4.0.zip`. Éles feltöltés nem történt.
